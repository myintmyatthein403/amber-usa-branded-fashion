import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "my"] as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];

  if (LOCALES.includes(segment as (typeof LOCALES)[number])) {
    const stripped = pathname.replace(new RegExp(`^/${segment}`), "") || "/";
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    const response = NextResponse.rewrite(url);
    response.cookies.set("locale", segment, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
