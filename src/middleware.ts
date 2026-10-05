import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionCookieName, isValidAdminSession } from "./lib/admin-auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getAdminSessionCookieName())?.value;
  if (await isValidAdminSession(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}
