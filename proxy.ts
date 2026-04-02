import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token
    const isUser = token?.role === "USER"
    const isAdmin = token?.role === "ADMIN"

    if (req.nextUrl.pathname.startsWith("/user") && !isUser && !isAdmin) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

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
