import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup");
  const isProtectedPage = req.nextUrl.pathname.startsWith("/session");

  // Logged in users shouldn't see login/signup again
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Session rooms require login
  if (!isLoggedIn && isProtectedPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/session/:path*", "/login", "/signup"],
};