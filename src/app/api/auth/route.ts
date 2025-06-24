import { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  if (!request.headers.has("x-original-url")) return new Response("ok");

  return new Response("auth required!", {
    status: 401,
    headers: {
      "WWW-Authenticate": "Basic",
    },
  });
}
