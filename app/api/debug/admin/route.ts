import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'yousuf@admin.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    // Get all users count
    const totalUsers = await prisma.user.count()
    
    // Get all admins
    const allAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      adminExists: !!adminUser,
      adminUser: adminUser || null,
      totalUsers,
      allAdmins,
      message: adminUser ? "Admin account exists" : "Admin account not found"
    })

  } catch (error) {
    console.error("Debug admin check error:", error)
    return NextResponse.json(
      { 
        error: "Failed to check admin status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
