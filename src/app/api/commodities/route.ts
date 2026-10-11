import { NextResponse } from "next/server";
import { db } from "../../../db";
import { ampisCommodities } from "../../../db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db
      .select({
        code: ampisCommodities.code,
        nameNe: ampisCommodities.nameNe,
        nameEn: ampisCommodities.nameEn,
        categoryNe: ampisCommodities.categoryNe,
        canonicalUnit: ampisCommodities.canonicalUnit,
      })
      .from(ampisCommodities)
      .orderBy(asc(ampisCommodities.categoryNe), asc(ampisCommodities.nameNe));

    return NextResponse.json(
      {
        success: true,
        count: list.length,
        data: list,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error: unknown) {
    console.error("❌ Failed to fetch commodities:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}