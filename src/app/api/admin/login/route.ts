import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminSessionCookieName,
  getAdminSessionCookieOptions,
} from "../../../../lib/admin-auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || !("username" in body) || !("password" in body)) {
      return NextResponse.json(
        { success: false, error: "गलत युजरनेम वा पासवर्ड (Invalid credentials)" },
        { status: 401 }
      );
    }

    const { username, password } = body;
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { success: false, error: "गलत युजरनेम वा पासवर्ड (Invalid credentials)" },
        { status: 401 }
      );
    }

    const token = await createAdminSessionToken();
    if (!token) {
      console.error("ADMIN_SESSION_SECRET is not configured");
      return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(getAdminSessionCookieName(), token, getAdminSessionCookieOptions());
    return response;
  } catch (error: unknown) {
    console.error("Admin login failed:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
