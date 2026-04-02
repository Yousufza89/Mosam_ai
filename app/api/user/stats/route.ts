import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [
      user,
      totalPredictions,
      weekPredictions,
      monthPredictions,
      avgConfidence,
      topCity
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.prediction.count({
        where: { userId }
      }),
      prisma.prediction.count({
        where: {
          userId,
          createdAt: { gte: startOfWeek }
        }
      }),
      prisma.prediction.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.prediction.aggregate({
        where: { userId },
        _avg: { confidenceScore: true }
      }),
      prisma.prediction.groupBy({
        by: ["city"],
        where: { userId },
        _count: { city: true },
        orderBy: { _count: { city: "desc" } },
        take: 1
      })
    ])

    return NextResponse.json({
      user,
      stats: {
        totalPredictions,
        predictionsThisWeek: weekPredictions,
        predictionsThisMonth: monthPredictions,
        mostPredictedCity: topCity[0]?.city || null,
        mostPredictedCityCount: topCity[0]?._count.city || 0,
        averageConfidence: avgConfidence._avg.confidenceScore || 0
      }
    })
  } catch (error) {
    console.error("User stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    )
  }
}