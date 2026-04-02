import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const userId = searchParams.get("userId")

    const where: { city?: string; userId?: string } = {}

    if (city && city !== "all") {
      where.city = city
    }

    if (userId) {
      where.userId = userId
    }

    const predictions = await prisma.prediction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      take: 100
    })

    return NextResponse.json(predictions)
  } catch (error) {
    console.error("Get all predictions error:", error)
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    )
  }
}
