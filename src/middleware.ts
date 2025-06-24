import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const newHeaders = new Headers(req.headers);
  newHeaders.set("x-original-url", req.nextUrl.toString());

  const basicAuth = req.headers.get("authorization")?.split(" ")[1];

  if (basicAuth) {
    const [username, password] = atob(basicAuth).split(":");

    if (
      username === process.env.BASIC_AUTH_USERNAME &&
      password === process.env.BASIC_AUTH_PASSWORD
    ) {
      return NextResponse.next();
    }
  }

  return NextResponse.rewrite(new URL("/api/auth", req.nextUrl), {
    headers: newHeaders,
  });
}

export const config = {
  matcher: ["/playground"],
};
