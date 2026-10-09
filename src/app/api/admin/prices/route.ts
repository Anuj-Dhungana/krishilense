import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import NepaliDate from "nepali-date-converter";
import { db } from "../../../../db";
import * as schema from "../../../../db/schema";

export const dynamic = "force-dynamic";

function getNepalDate() {
  const now = new Date();
  const dateAd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const bsDate = new NepaliDate(now);
  return {
    dateAd,
    bsYear: bsDate.getYear(),
    bsMonth: bsDate.getMonth() + 1,
    bsDay: bsDate.getDate(),
  };
}

export async function GET() {
  try {
    const today = getNepalDate();
    const [markets, commodities, prices] = await Promise.all([
      db.select({
        id: schema.markets.id,
        slug: schema.markets.publicSlug,
        nameNe: schema.markets.nameNe,
        nameEn: schema.markets.nameEn,
      }).from(schema.markets).orderBy(asc(schema.markets.nameEn)),
      db.select({
        id: schema.ampisCommodities.id,
        code: schema.ampisCommodities.code,
        nameNe: schema.ampisCommodities.nameNe,
        nameEn: schema.ampisCommodities.nameEn,
        categoryNe: schema.ampisCommodities.categoryNe,
        canonicalUnit: schema.ampisCommodities.canonicalUnit,
      }).from(schema.ampisCommodities).orderBy(
        asc(schema.ampisCommodities.categoryNe),
        asc(schema.ampisCommodities.nameEn)
      ),
      db.select({
        marketId: schema.canonicalDailyMarketPrices.marketId,
        commodityCode: schema.ampisCommodities.code,
        minPrice: schema.canonicalDailyMarketPrices.minPrice,
        maxPrice: schema.canonicalDailyMarketPrices.maxPrice,
        representativePrice: schema.canonicalDailyMarketPrices.representativePrice,
        sourceSystem: schema.canonicalDailyMarketPrices.sourceSystem,
        sourceLabel: schema.canonicalDailyMarketPrices.sourceLabel,
      }).from(schema.canonicalDailyMarketPrices)
        .innerJoin(schema.ampisCommodities, eq(
          schema.canonicalDailyMarketPrices.ampisCommodityId,
          schema.ampisCommodities.id
        ))
        .where(and(
          eq(schema.canonicalDailyMarketPrices.dateAd, today.dateAd),
          eq(schema.canonicalDailyMarketPrices.isCurrent, true)
        )),
    ]);

    return NextResponse.json({ success: true, data: { ...today, markets, commodities, prices } });
  } catch (error: unknown) {
    console.error("Failed to fetch admin prices:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const marketSlug = typeof input.marketSlug === "string" ? input.marketSlug.trim() : "";
    const commodityCode = typeof input.commodityCode === "string" ? input.commodityCode.trim() : "";
    const sourceLabel = typeof input.sourceLabel === "string" ? input.sourceLabel.trim() : null;
    const minPrice = Number(input.minPrice);
    const maxPrice = Number(input.maxPrice);
    const representativePrice = Number(input.representativePrice);

    if (!marketSlug || !commodityCode || ![minPrice, maxPrice, representativePrice].every(Number.isFinite) ||
      minPrice < 0 || maxPrice < minPrice || representativePrice < minPrice || representativePrice > maxPrice) {
      return NextResponse.json({ success: false, error: "Valid prices and market/commodity are required" }, { status: 400 });
    }

    const [market] = await db.select({ id: schema.markets.id })
      .from(schema.markets)
      .where(eq(schema.markets.publicSlug, marketSlug))
      .limit(1);
    const [commodity] = await db.select({
      id: schema.ampisCommodities.id,
      canonicalUnit: schema.ampisCommodities.canonicalUnit,
    }).from(schema.ampisCommodities)
      .where(eq(schema.ampisCommodities.code, commodityCode))
      .limit(1);
    const [observation] = await db.select({ id: schema.sourceObservations.id })
      .from(schema.sourceObservations)
      .limit(1);

    if (!market || !commodity) {
      return NextResponse.json({ success: false, error: "Market or commodity not found" }, { status: 404 });
    }
    if (!observation) {
      return NextResponse.json({ success: false, error: "No source observation is available" }, { status: 500 });
    }

    const today = getNepalDate();
    const [currentPrice] = await db.select({
      sourceSystem: schema.canonicalDailyMarketPrices.sourceSystem,
    }).from(schema.canonicalDailyMarketPrices)
      .where(and(
        eq(schema.canonicalDailyMarketPrices.marketId, market.id),
        eq(schema.canonicalDailyMarketPrices.ampisCommodityId, commodity.id),
        eq(schema.canonicalDailyMarketPrices.dateAd, today.dateAd),
        eq(schema.canonicalDailyMarketPrices.isCurrent, true)
      ))
      .limit(1);

    if (currentPrice?.sourceSystem === "AMPIS") {
      return NextResponse.json(
        { success: false, error: "AMPIS live price already exists; reference benchmark was not applied" },
        { status: 409 }
      );
    }

    const result = await db.execute(sql`
      INSERT INTO canonical_daily_market_prices (
        market_id, ampis_commodity_id, date_ad, bs_year, bs_month, bs_day,
        min_price, max_price, representative_price, price_measure_type,
        canonical_unit, source_system, source_label, version, is_current, source_observation_id
      ) VALUES (
        ${market.id}, ${commodity.id}, ${today.dateAd}, ${today.bsYear}, ${today.bsMonth}, ${today.bsDay},
        ${minPrice.toFixed(2)}, ${maxPrice.toFixed(2)}, ${representativePrice.toFixed(2)},
        'MIDPOINT', ${commodity.canonicalUnit}, 'ADMIN_BENCHMARK', ${sourceLabel},
        1, true, ${observation.id}
      )
      ON CONFLICT (market_id, ampis_commodity_id, date_ad) WHERE is_current = true
      DO UPDATE SET
        min_price = EXCLUDED.min_price,
        max_price = EXCLUDED.max_price,
        representative_price = EXCLUDED.representative_price,
        price_measure_type = EXCLUDED.price_measure_type,
        source_system = EXCLUDED.source_system,
        source_label = EXCLUDED.source_label,
        created_at = NOW()
      RETURNING id
    `);

    const rows = result as unknown as Array<{ id: number }>;
    return NextResponse.json({ success: true, id: rows[0]?.id, dateAd: today.dateAd });
  } catch (error: unknown) {
    console.error("Failed to save admin benchmark:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
