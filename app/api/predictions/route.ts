import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Test database connection
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.error("Database connection error during fetch:", dbError)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")

    // Build where clause
    const where: { userId: string; city?: string } = {
      userId: session.user.id
    }

    if (city && city !== "all") {
      where.city = city
    }

    // Fetch predictions from database
    const predictions = await prisma.prediction.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(predictions)

  } catch (error: any) {
    console.error("Fetch predictions error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch predictions" },
      { status: 500 }
    )
  }
}
