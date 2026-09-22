import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../db";
import * as schema from "../../../db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export interface RecommendedCrop {
  cropNameEn: string;
  cropNameNe: string;
  varietyNameNe: string;
  commodityCode: string;
  canonicalUnit: string;
  maturityDaysRange: [number, number];
  expectedHarvestMonth: number;
  historicalMedianPrice: number;
  seasonalAdvantagePct: number | null;
  dailyVolatilityPct: number | null;
  annualVariabilityPct: number | null;
  confidenceScore: number;
  confidenceTierNe: string;
  isOptimalAgronomy: boolean;
  explanationNe: string;
}

export interface InsufficientDataCrop {
  cropNameNe: string;
  varietyNameNe: string;
  commodityCode: string;
  reason: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { district_slug, irrigation_status, planting_month } = body;

    const selectedDistrictSlug = district_slug || "jhapa";
    const selectedIrrigation = irrigation_status || "IRRIGATED";
    const selectedMonth = parseInt(planting_month) || 6;

    // 1. Get District Context
    const district = await db
      .select()
      .from(schema.administrativeDistricts)
      .where(eq(schema.administrativeDistricts.slug, selectedDistrictSlug))
      .limit(1);

    if (!district.length) {
      return NextResponse.json({ success: false, error: "District not found" }, { status: 404 });
    }

    const currentDistrict = district[0];
    const agroZone = currentDistrict.defaultAgroZone;
    const elevation = currentDistrict.averageElevationMeters;

    // 2. Query All Crop Calendars matching this Agro-Zone
    const rawCandidates = await db
      .select({
        calendarId: schema.cropCalendars.id,
        agroZone: schema.cropCalendars.agroZone,
        altMin: schema.cropCalendars.altitudeMinMeters,
        altMax: schema.cropCalendars.altitudeMaxMeters,
        sowStart: schema.cropCalendars.sowBsOptimalStartMonth,
        sowEnd: schema.cropCalendars.sowBsOptimalEndMonth,
        lateGraceDays: schema.cropCalendars.sowBsLateGraceDays,
        varietySlug: schema.cropVarieties.slug,
        varietyNameEn: schema.cropVarieties.nameEn,
        varietyNameNe: schema.cropVarieties.nameNe,
        maturityMin: schema.cropVarieties.maturityDaysMin,
        maturityMax: schema.cropVarieties.maturityDaysMax,
        cropSlug: schema.canonicalCrops.slug,
        cropNameEn: schema.canonicalCrops.nameEn,
        cropNameNe: schema.canonicalCrops.nameNe,
        baseWater: schema.canonicalCrops.baseWaterRequirement,
        commodityCode: schema.ampisCommodities.code,
        commodityId: schema.ampisCommodities.id,
        canonicalUnit: schema.ampisCommodities.canonicalUnit,
      })
      .from(schema.cropCalendars)
      .innerJoin(schema.cropVarietySystems, eq(schema.cropCalendars.varietySystemId, schema.cropVarietySystems.id))
      .innerJoin(schema.cropVarieties, eq(schema.cropVarietySystems.varietyId, schema.cropVarieties.id))
      .innerJoin(schema.canonicalCrops, eq(schema.cropVarieties.cropId, schema.canonicalCrops.id))
      .innerJoin(schema.ampisCommodities, eq(schema.cropVarietySystems.ampisCommodityId, schema.ampisCommodities.id))
      .where(eq(schema.cropCalendars.agroZone, agroZone));

    // DEDUPLICATE CANDIDATES: Ensure each unique variety is only evaluated once
    const seenVarieties = new Set<string>();
    const candidates = rawCandidates.filter((c) => {
      if (seenVarieties.has(c.varietySlug)) return false;
      seenVarieties.add(c.varietySlug);
      return true;
    });

    const cohortA: RecommendedCrop[] = [];
    const cohortB: RecommendedCrop[] = [];
    const cohortC: RecommendedCrop[] = [];
    const cohortD: InsufficientDataCrop[] = [];
    const diagnostics: string[] = [];

    // Benchmark Market (Kalimati)
    const market = await db
      .select()
      .from(schema.markets)
      .where(eq(schema.markets.publicSlug, "kalimati"))
      .limit(1);

    if (!market.length) {
      return NextResponse.json({ success: false, error: "Market not found" }, { status: 404 });
    }

    const marketId = market[0].id;
    const altitudeBuffer = 150;

    // ⚡ PERFORMANCE BOOST: Fetch ALL baselines for Kalimati in ONE query (Avoids N+1 loop queries!)
    const allBaselines = await db
      .select()
      .from(schema.seasonalBaselines)
      .where(eq(schema.seasonalBaselines.marketId, marketId));

    // Map: key = `${commodityId}-${bsMonth}`
    const baselineMap = new Map(
      allBaselines.map((b) => [`${b.ampisCommodityId}-${b.bsMonth}`, b])
    );

    for (const crop of candidates) {
      // -------------------------------------------------------------
      // GATE 1: 3-Tier Agronomic Viability
      // -------------------------------------------------------------
      let fitZone: 0 | 1 | 2 = 0;
      if (elevation >= crop.altMin && elevation <= crop.altMax) {
        fitZone = 2;
      } else if (
        elevation >= crop.altMin - altitudeBuffer &&
        elevation <= crop.altMax + altitudeBuffer
      ) {
        fitZone = 1;
      } else {
        fitZone = 0;
      }
      
      let fitWater: 0 | 1 | 2 = 2;
      if (crop.baseWater === "HIGH_IRRIGATED" && selectedIrrigation === "RAINFED") {
        fitWater = 0;
      } else if (crop.baseWater === "HIGH_IRRIGATED" && selectedIrrigation === "SEMI_IRRIGATED") {
        fitWater = 1;
      }

      let fitTiming: 0 | 1 | 2 = 0;
      if (selectedMonth >= crop.sowStart && selectedMonth <= crop.sowEnd) {
        fitTiming = 2;
      } else if (selectedMonth === crop.sowEnd + 1) {
        fitTiming = 1;
      }

      if (fitZone === 0 || fitWater === 0 || fitTiming === 0) {
        if (fitTiming === 0) {
          diagnostics.push(`${crop.cropNameNe} (${crop.varietyNameNe}) सिजन बाहिर पर्छ।`);
        }
        continue;
      }

      const isOptimalAgronomy = fitZone === 2 && fitWater === 2 && fitTiming === 2;

      // -------------------------------------------------------------
      // EXPECTED HARVEST WINDOW CALCULATION
      // -------------------------------------------------------------
      const avgMaturityDays = (crop.maturityMin + crop.maturityMax) / 2;
      const maturityMonthsOffset = Math.round(avgMaturityDays / 30);
      let harvestMonth = selectedMonth + maturityMonthsOffset;
      if (harvestMonth > 12) harvestMonth -= 12;

      // -------------------------------------------------------------
      // GATE 2: Historical Market Evidence Lookup (Instant Memory Map!)
      // -------------------------------------------------------------
      const b = baselineMap.get(`${crop.commodityId}-${harvestMonth}`);

      if (!b) {
        cohortD.push({
          cropNameNe: crop.cropNameNe,
          varietyNameNe: crop.varietyNameNe,
          commodityCode: crop.commodityCode,
          reason: "कृषि रूपमा उपयुक्त तर यस बजारमा ऐतिहासिक मूल्य तथ्याङ्क उपलब्ध छैन।",
        });
        continue;
      }

      const deltaSpi = b.deltaSpiPct ? parseFloat(b.deltaSpiPct) : null;
      const hcs = parseFloat(b.historicalConfidenceScore);
      const isHighConfidence = hcs >= 75.0 && b.validYearsCount >= 4;

      const candidateCard: RecommendedCrop = {
        cropNameEn: crop.cropNameEn,
        cropNameNe: crop.cropNameNe,
        varietyNameNe: crop.varietyNameNe,
        commodityCode: crop.commodityCode,
        canonicalUnit: crop.canonicalUnit,
        maturityDaysRange: [crop.maturityMin, crop.maturityMax],
        expectedHarvestMonth: harvestMonth,
        historicalMedianPrice: parseFloat(b.baselineMonthlyMedian),
        seasonalAdvantagePct: deltaSpi,
        dailyVolatilityPct: b.cvDaily ? parseFloat(b.cvDaily) : null,
        annualVariabilityPct: b.cvAnnual ? parseFloat(b.cvAnnual) : null,
        confidenceScore: hcs,
        confidenceTierNe: isHighConfidence ? "उच्च ऐतिहासिक तथ्याङ्क" : "मध्यम ऐतिहासिक तथ्याङ्क",
        isOptimalAgronomy,
        explanationNe: `तपाईंको क्षेत्रको लागि यो बाली उपयुक्त छ। यस समयमा लगाउँदा करिब ${crop.maturityMin}–${crop.maturityMax} दिनपछि बजारमा पुग्छ जहाँ ऐतिहासिक रूपमा राम्रो मौसमी मूल्य प्राप्त हुने गरेको देखिन्छ।`,
      };

      // -------------------------------------------------------------
      // COHORT CLASSIFICATION
      // -------------------------------------------------------------
      if (isOptimalAgronomy) {
        if (isHighConfidence) {
          cohortA.push(candidateCard);
        } else {
          cohortB.push(candidateCard);
        }
      } else {
        cohortC.push(candidateCard);
      }
    }

    cohortA.sort((a, b) => (b.seasonalAdvantagePct ?? -99) - (a.seasonalAdvantagePct ?? -99));
    cohortB.sort((a, b) => (b.seasonalAdvantagePct ?? -99) - (a.seasonalAdvantagePct ?? -99));

    return NextResponse.json({
      success: true,
      context: {
        district: currentDistrict.nameNe,
        agroZone: currentDistrict.defaultAgroZone,
        elevationMeters: currentDistrict.averageElevationMeters,
        irrigationStatus: selectedIrrigation,
        plantingMonth: selectedMonth,
      },
      cohort_a: cohortA,
      cohort_b: cohortB,
      cohort_c: cohortC,
      cohort_d: cohortD,
      diagnostics,
      hasRecommendations: cohortA.length > 0 || cohortB.length > 0 || cohortC.length > 0,
    });
  } catch (error: unknown) {
    console.error("❌ Recommendation API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}