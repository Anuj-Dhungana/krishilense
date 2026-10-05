import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../db";
import * as schema from "../../../../db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db
      .select({
        id: schema.ampisCommodities.id,
        code: schema.ampisCommodities.code,
        nameNe: schema.ampisCommodities.nameNe,
        nameEn: schema.ampisCommodities.nameEn,
        categoryNe: schema.ampisCommodities.categoryNe,
        canonicalUnit: schema.ampisCommodities.canonicalUnit,
        imageUrl: schema.ampisCommodities.imageUrl,
      })
      .from(schema.ampisCommodities)
      .orderBy(
        asc(schema.ampisCommodities.categoryNe),
        asc(schema.ampisCommodities.code)
      );

    return NextResponse.json({ success: true, data: list });
  } catch (error: unknown) {
    console.error("Failed to fetch commodities for admin:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, imageUrl } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Commodity code is required" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(schema.ampisCommodities)
      .set({ imageUrl: imageUrl ? imageUrl.trim() : null })
      .where(eq(schema.ampisCommodities.code, code))
      .returning({
        code: schema.ampisCommodities.code,
        imageUrl: schema.ampisCommodities.imageUrl,
      });

    return NextResponse.json({ success: true, updated: updated[0] });
  } catch (error: unknown) {
    console.error("Failed to update image:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
