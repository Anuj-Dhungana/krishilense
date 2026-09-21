import { NextResponse, NextRequest } from "next/server";
// Use direct relative imports to avoid path alias type errors
import { db } from "../../../../../db";
import { ampisCommodities, seasonalBaselines, canonicalDailyMarketPrices, markets } from "../../../../../db/schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const BS_MONTH_NAMES = [
  "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(request.url);
    const marketSlug = searchParams.get("market") || "kalimati";

    // 1. Get commodity details
    const commodity = await db
      .select()
      .from(ampisCommodities)
      .where(eq(ampisCommodities.code, code))
      .limit(1);

    if (!commodity.length) {
      return NextResponse.json({ success: false, error: "Commodity not found" }, { status: 404 });
    }

    // 2. Get market details
    const market = await db
      .select()
      .from(markets)
      .where(eq(markets.publicSlug, marketSlug))
      .limit(1);

    if (!market.length) {
      return NextResponse.json({ success: false, error: "Market not found" }, { status: 404 });
    }

    const marketId = market[0].id;
    const commId = commodity[0].id;

    // 3. Get latest price
    const latestPrice = await db
      .select()
      .from(canonicalDailyMarketPrices)
      .where(and(
        eq(canonicalDailyMarketPrices.marketId, marketId),
        eq(canonicalDailyMarketPrices.ampisCommodityId, commId)
      ))
      .orderBy(desc(canonicalDailyMarketPrices.dateAd))
      .limit(1);

    // 4. Get 12-month seasonal baselines
    const baselines = await db
      .select()
      .from(seasonalBaselines)
      .where(and(
        eq(seasonalBaselines.marketId, marketId),
        eq(seasonalBaselines.ampisCommodityId, commId)
      ))
      .orderBy(seasonalBaselines.bsMonth);

    const seasonalCurve = baselines.map((b) => ({
      bs_month: b.bsMonth,
      month_name_ne: BS_MONTH_NAMES[b.bsMonth - 1],
      median_price: parseFloat(b.baselineMonthlyMedian),
      spi: b.spi ? parseFloat(b.spi) : null,
      delta_spi_pct: b.deltaSpiPct ? parseFloat(b.deltaSpiPct) : null,
    }));

    const sample = baselines[0];

    return NextResponse.json({
      success: true,
      commodity: commodity[0],
      market: market[0],
      today: latestPrice[0] || null,
      seasonal_curve: seasonalCurve,
      risk_profile: sample ? {
        daily_cv: sample.cvDaily ? parseFloat(sample.cvDaily) : null,
        annual_cv: sample.cvAnnual ? parseFloat(sample.cvAnnual) : null,
        hcs: parseFloat(sample.historicalConfidenceScore),
        confidence_label: "उच्च ऐतिहासिक तथ्याङ्क विश्वसनीयता (High Confidence)",
      } : null,
    });
  } catch (error: unknown) {
    console.error("❌ Intelligence API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}