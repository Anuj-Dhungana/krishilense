import { NextResponse } from "next/server";
// Use direct relative imports so TypeScript never gets confused
import { db } from "../../../db";
import { markets, municipalities, administrativeDistricts, provinces } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await db
      .select({
        id: markets.id,
        public_slug: markets.publicSlug,
        name_en: markets.nameEn,
        name_ne: markets.nameNe,
        elevation_meters: markets.elevationMeters,
        latitude: markets.latitude,
        longitude: markets.longitude,
        is_federal_hub: markets.isFederalHub,
        municipality: {
          slug: municipalities.slug,
          name_en: municipalities.nameEn,
          name_ne: municipalities.nameNe,
        },
        district: {
          slug: administrativeDistricts.slug,
          name_en: administrativeDistricts.nameEn,
          name_ne: administrativeDistricts.nameNe,
          agro_zone: administrativeDistricts.defaultAgroZone,
        },
        province: {
          slug: provinces.slug,
          name_en: provinces.nameEn,
          name_ne: provinces.nameNe,
        },
      })
      .from(markets)
      .innerJoin(municipalities, eq(markets.municipalityId, municipalities.id))
      .innerJoin(administrativeDistricts, eq(municipalities.districtId, administrativeDistricts.id))
      .innerJoin(provinces, eq(administrativeDistricts.provinceId, provinces.id))
      .orderBy(markets.id);

    return NextResponse.json(
      {
        success: true,
        count: data.length,
        data,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("❌ Failed to fetch markets from Neon:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}