import { NextRequest, NextResponse } from "next/server";

function applyCorsHeaders(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin");
  const requestedHeaders = request.headers.get("access-control-request-headers");

  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }

  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    requestedHeaders || "Content-Type, Authorization",
  );

  return response;
}

export function withCors(request: NextRequest, response: NextResponse) {
  return applyCorsHeaders(request, response);
}

export function optionsResponse(request: NextRequest) {
  return applyCorsHeaders(request, new NextResponse(null, { status: 204 }));
}
