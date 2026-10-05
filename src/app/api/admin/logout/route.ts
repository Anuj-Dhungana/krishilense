import { NextResponse } from "next/server";
import { getAdminSessionCookieName, getAdminSessionCookieOptions } from "../../../../lib/admin-auth";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.set(getAdminSessionCookieName(), "", {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
