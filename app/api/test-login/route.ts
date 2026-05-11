import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log("Login attempt:", { email, passwordLength: password?.length })

    // Test database connection
    await prisma.$connect()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true
      }
    })

    if (!user) {
      console.log("User not found:", email)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("User found:", { email: user.email, role: user.role })

    // Test password comparison
    const bcrypt = require('bcryptjs')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    console.log("Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Test NextAuth session creation
    const session = await getServerSession(authOptions)
    console.log("Current session:", session)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      message: "Login test successful"
    })

  } catch (error) {
    console.error("Login test error:", error)
    return NextResponse.json(
      { 
        error: "Login test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
