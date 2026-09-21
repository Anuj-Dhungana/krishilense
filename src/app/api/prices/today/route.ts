import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../db";
import { canonicalDailyMarketPrices, ampisCommodities, markets } from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketSlug = searchParams.get("market") || "kalimati";

    // 1. Get market details
    const market = await db
      .select()
      .from(markets)
      .where(eq(markets.publicSlug, marketSlug))
      .limit(1);

    if (!market.length) {
      return NextResponse.json({ success: false, error: "Market not found" }, { status: 404 });
    }

    const marketId = market[0].id;

    // 2. Fetch the latest active canonical prices for this market
    const prices = await db
      .select({
        id: canonicalDailyMarketPrices.id,
        commodity_code: ampisCommodities.code,
        commodity_name_en: ampisCommodities.nameEn,
        commodity_name_ne: ampisCommodities.nameNe,
        category_en: ampisCommodities.categoryEn,
        category_ne: ampisCommodities.categoryNe,
        canonical_unit: canonicalDailyMarketPrices.canonicalUnit,
        date_ad: canonicalDailyMarketPrices.dateAd,
        bs_year: canonicalDailyMarketPrices.bsYear,
        bs_month: canonicalDailyMarketPrices.bsMonth,
        bs_day: canonicalDailyMarketPrices.bsDay,
        min_price: canonicalDailyMarketPrices.minPrice,
        max_price: canonicalDailyMarketPrices.maxPrice,
        representative_price: canonicalDailyMarketPrices.representativePrice,
        price_measure_type: canonicalDailyMarketPrices.priceMeasureType,
      })
      .from(canonicalDailyMarketPrices)
      .innerJoin(ampisCommodities, eq(canonicalDailyMarketPrices.ampisCommodityId, ampisCommodities.id))
      .where(eq(canonicalDailyMarketPrices.marketId, marketId))
      .orderBy(desc(canonicalDailyMarketPrices.dateAd), ampisCommodities.code);

    return NextResponse.json({
      success: true,
      market: {
        slug: market[0].publicSlug,
        name_en: market[0].nameEn,
        name_ne: market[0].nameNe,
      },
      date: prices[0] ? {
        date_ad: prices[0].date_ad,
        bs_date: `${prices[0].bs_year}-${prices[0].bs_month}-${prices[0].bs_day}`,
      } : null,
      total_commodities: prices.length,
      data: prices,
    });
  } catch (error) {
    console.error("❌ Failed to fetch today's prices:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}