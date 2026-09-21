import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../db";
import * as schema from "../../../../db/schema";
import { eq,  desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commodityCode = searchParams.get("commodity") || "101.1";
    const baseMarketSlug = searchParams.get("base") || "kalimati";

    // 1. Get commodity
    const commodity = await db
      .select()
      .from(schema.ampisCommodities)
      .where(eq(schema.ampisCommodities.code, commodityCode))
      .limit(1);

    if (!commodity.length) {
      return NextResponse.json({ success: false, error: "Commodity not found" }, { status: 404 });
    }

    const commId = commodity[0].id;

    // 2. Fetch all current prices for this commodity across all markets
    const allPrices = await db
      .select({
        marketId: schema.markets.id,
        marketSlug: schema.markets.publicSlug,
        marketNameNe: schema.markets.nameNe,
        marketNameEn: schema.markets.nameEn,
        minPrice: schema.canonicalDailyMarketPrices.minPrice,
        maxPrice: schema.canonicalDailyMarketPrices.maxPrice,
        repPrice: schema.canonicalDailyMarketPrices.representativePrice,
        priceMethod: schema.canonicalDailyMarketPrices.priceMeasureType,
        dateAd: schema.canonicalDailyMarketPrices.dateAd,
      })
      .from(schema.canonicalDailyMarketPrices)
      .innerJoin(schema.markets, eq(schema.canonicalDailyMarketPrices.marketId, schema.markets.id))
      .where(eq(schema.canonicalDailyMarketPrices.ampisCommodityId, commId))
      .orderBy(desc(schema.canonicalDailyMarketPrices.representativePrice));

    // 3. Identify base market price
    const baseRecord = allPrices.find((p) => p.marketSlug === baseMarketSlug);
    const basePrice = baseRecord ? parseFloat(baseRecord.repPrice) : null;

    const comparison = allPrices.map((p) => {
      const currentRep = parseFloat(p.repPrice);
      const spread = basePrice !== null ? currentRep - basePrice : 0;
      return {
        market_slug: p.marketSlug,
        market_name_ne: p.marketNameNe,
        market_name_en: p.marketNameEn,
        min_price: parseFloat(p.minPrice),
        max_price: parseFloat(p.maxPrice),
        representative_price: currentRep,
        price_method: p.priceMethod,
        gross_spread_rs: Number(spread.toFixed(2)),
        is_base: p.marketSlug === baseMarketSlug,
      };
    });

    return NextResponse.json({
      success: true,
      commodity: commodity[0],
      base_market_slug: baseMarketSlug,
      base_price: basePrice,
      total_markets: comparison.length,
      data: comparison,
      mandatory_disclaimer_ne: "यो तालिकाले बजारहरूमा संकलित थोक मूल्य मात्र देखाउँछ। बजार बीचको मूल्य फरकमा ढुवानी तथा अन्य खर्च जोडिएको छैन।",
    });
  } catch (error: unknown) {
    console.error("❌ Comparison API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}