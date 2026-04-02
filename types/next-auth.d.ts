import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string  // Changed from "USER" | "ADMIN" to string
    } & DefaultSession["user"]
  }

  interface User {
    role: string  // Changed from "USER" | "ADMIN" to string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string  // Changed from "USER" | "ADMIN" to string
  }
}