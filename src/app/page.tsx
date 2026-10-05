import HomeClient from "./home-client";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Nepali category names as stored in the DB — used for URL params and server-side filtering
const CATEGORIES_NE = [
  "तरकारी",
  "खाद्यान्न बाली",
  "दुग्धजन्य",
  "मासु",
  "फलफूल",
  "मसला बाली",
  "सागपात",
  "च्याउ खेती",
  "कन्दमुल बाली",
  "कोसे / दाल बाली",
  "माछा",
];

// The "all" sentinel stored in URLs
const ALL_SENTINEL = "all";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ market?: string; category?: string; date?: string }>;
}) {
  const { market: urlMarket, category: urlCategory, date: urlDate } = await searchParams;
  const activeMarketSlug = urlMarket || "kalimati";
  // Category param in URL is either "all" or a Nepali category string
  const activeCategory = urlCategory || ALL_SENTINEL;

  // 1. Get All Markets
  const marketsList = await db
    .select({
      id: schema.markets.id,
      public_slug: schema.markets.publicSlug,
      name_ne: schema.markets.nameNe,
      name_en: schema.markets.nameEn,
      district: {
        name_ne: schema.administrativeDistricts.nameNe,
        name_en: schema.administrativeDistricts.nameEn,
      },
    })
    .from(schema.markets)
    .innerJoin(schema.municipalities, eq(schema.markets.municipalityId, schema.municipalities.id))
    .innerJoin(schema.administrativeDistricts, eq(schema.municipalities.districtId, schema.administrativeDistricts.id))
    .orderBy(schema.markets.id);

  // 2. Identify active market
  const currentMarket = marketsList.find((m) => m.public_slug === activeMarketSlug) || marketsList[0];
  const marketId = currentMarket?.id || 1;

  // 3. Find the single latest available date for this market
  const dateQuery = await db
    .select({
      dateAd: schema.canonicalDailyMarketPrices.dateAd,
      bsYear: schema.canonicalDailyMarketPrices.bsYear,
      bsMonth: schema.canonicalDailyMarketPrices.bsMonth,
      bsDay: schema.canonicalDailyMarketPrices.bsDay,
      createdAt: schema.canonicalDailyMarketPrices.createdAt,
    })
    .from(schema.canonicalDailyMarketPrices)
    .where(
      urlDate
        ? and(
            eq(schema.canonicalDailyMarketPrices.marketId, marketId),
            eq(schema.canonicalDailyMarketPrices.dateAd, urlDate),
            eq(schema.canonicalDailyMarketPrices.isCurrent, true)
          )
        : and(
            eq(schema.canonicalDailyMarketPrices.marketId, marketId),
            eq(schema.canonicalDailyMarketPrices.isCurrent, true)
          )
    )
    .orderBy(
      desc(schema.canonicalDailyMarketPrices.dateAd),
      desc(schema.canonicalDailyMarketPrices.createdAt)
    )
    .limit(1);

  const latestDateAd = dateQuery[0]?.dateAd;
  const dateInfo = dateQuery[0] ? {
    date_ad: dateQuery[0].dateAd,
    bs_date: `${dateQuery[0].bsYear}-${String(dateQuery[0].bsMonth).padStart(2, "0")}-${String(dateQuery[0].bsDay).padStart(2, "0")}`,
    updated_at: dateQuery[0].createdAt.toISOString(),
  } : null;

  // 4. Query commodities for this market and this specific latest date
  type PriceRow = {
    id: number;
    commodity_code: string;
    commodity_name_en: string;
    commodity_name_ne: string;
    category_ne: string;
    canonical_unit: string;
    image_url: string | null;
    min_price: string;
    max_price: string;
    representative_price: string;
  };

  let rawPrices: PriceRow[] = [];
  if (latestDateAd) {
    rawPrices = await db
      .select({
        id: schema.canonicalDailyMarketPrices.id,
        commodity_code: schema.ampisCommodities.code,
        commodity_name_en: schema.ampisCommodities.nameEn,
        commodity_name_ne: schema.ampisCommodities.nameNe,
        category_ne: schema.ampisCommodities.categoryNe,
        canonical_unit: schema.canonicalDailyMarketPrices.canonicalUnit,
        image_url: schema.ampisCommodities.imageUrl,
        min_price: schema.canonicalDailyMarketPrices.minPrice,
        max_price: schema.canonicalDailyMarketPrices.maxPrice,
        representative_price: schema.canonicalDailyMarketPrices.representativePrice,
      })
      .from(schema.canonicalDailyMarketPrices)
      .innerJoin(schema.ampisCommodities, eq(schema.canonicalDailyMarketPrices.ampisCommodityId, schema.ampisCommodities.id))
      .where(and(
        eq(schema.canonicalDailyMarketPrices.marketId, marketId),
        eq(schema.canonicalDailyMarketPrices.dateAd, latestDateAd),
        eq(schema.canonicalDailyMarketPrices.isCurrent, true)
      ))
      .orderBy(schema.ampisCommodities.categoryNe, schema.ampisCommodities.code);
  }

  // 5. Compute category counts
  const categoryCounts = new Map<string, number>();
  for (const item of rawPrices) {
    const cat = item.category_ne?.trim();
    if (cat) categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
  }

  // Build category pills — labelNe is the raw DB category string used in URL params
  const categoryPills = [
    { labelNe: ALL_SENTINEL, count: rawPrices.length },
    ...CATEGORIES_NE
      .filter((cat) => categoryCounts.has(cat))
      .map((cat) => ({ labelNe: cat, count: categoryCounts.get(cat)! })),
    // Any categories in DB not in our known list
    ...Array.from(categoryCounts.keys())
      .filter((cat) => !CATEGORIES_NE.includes(cat))
      .map((cat) => ({ labelNe: cat, count: categoryCounts.get(cat)! })),
  ];

  // 6. Filter prices by category
  const filteredPrices =
    activeCategory === ALL_SENTINEL
      ? rawPrices
      : rawPrices.filter(
          (p) => p.category_ne?.trim() === activeCategory || p.category_ne?.includes(activeCategory)
        );

  return (
    <HomeClient
      marketsList={marketsList}
      activeMarketSlug={activeMarketSlug}
      activeCategory={activeCategory}
      currentMarket={currentMarket ?? null}
      dateInfo={dateInfo}
      categoryPills={categoryPills}
      filteredPrices={filteredPrices}
    />
  );
}