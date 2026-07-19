// Next.js 16: use proxy.ts instead of middleware.ts.
// middleware.ts runs on the Edge Runtime, which breaks Prisma/pg and
// some Node-only packages we'll pull in later (NextAuth adapters, etc).
// proxy.ts runs on the Node runtime instead, avoiding that class of bug.
//
// This stub currently does nothing. It will grow route-protection logic
// in Phase 6 (recruiter vs candidate dashboard access).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};