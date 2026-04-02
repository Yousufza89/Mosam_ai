import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isUser = token?.role === "USER"
    const isAdmin = token?.role === "ADMIN"

    // Protect user routes - only users can access
    if (req.nextUrl.pathname.startsWith("/user") && !isUser && !isAdmin) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Protect admin routes - only admins can access
    if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
}