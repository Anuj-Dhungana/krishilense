import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../db";
import { canonicalDailyMarketPrices, ampisCommodities, markets } from "../../../../db/schema";
import { eq, and, desc } from "drizzle-orm";

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

    // 2. Find the latest available date for this market
    const latestDateRow = await db
      .select({ date: canonicalDailyMarketPrices.dateAd })
      .from(canonicalDailyMarketPrices)
      .where(and(
        eq(canonicalDailyMarketPrices.marketId, marketId),
        eq(canonicalDailyMarketPrices.isCurrent, true)
      ))
      .orderBy(desc(canonicalDailyMarketPrices.dateAd))
      .limit(1);

    const latestDate = latestDateRow[0]?.date;

    // 3. Fetch only that date's active canonical prices
    const prices = latestDate
      ? await db
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
          .where(and(
            eq(canonicalDailyMarketPrices.marketId, marketId),
            eq(canonicalDailyMarketPrices.isCurrent, true),
            eq(canonicalDailyMarketPrices.dateAd, latestDate)
          ))
          .orderBy(ampisCommodities.code)
      : [];

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("❌ Failed to fetch today's prices:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}