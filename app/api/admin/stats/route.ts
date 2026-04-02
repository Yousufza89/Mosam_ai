import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
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

    const [
      totalUsers,
      totalPredictions,
      totalAdmins,
      predictionsToday,
      predictionsThisWeek,
      predictionsThisMonth,
      cityStats,
      recentPredictions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.prediction.count(),
      prisma.user.count({
        where: { role: "ADMIN" }
      }),
      prisma.prediction.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.prediction.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.prediction.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.prediction.groupBy({
        by: ["city"],
        _count: { city: true },
        orderBy: { _count: { city: "desc" } }
      }),
      prisma.prediction.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ])

    const avgConfidence = await prisma.prediction.aggregate({
      _avg: { confidenceScore: true }
    })

    const mostActiveCity = cityStats[0] || { city: "N/A", _count: { city: 0 } }

    return NextResponse.json({
      users: {
        total: totalUsers,
        admins: totalAdmins,
        regularUsers: totalUsers - totalAdmins
      },
      predictions: {
        total: totalPredictions,
        today: predictionsToday,
        thisWeek: predictionsThisWeek,
        thisMonth: predictionsThisMonth
      },
      analytics: {
        mostActiveCity: mostActiveCity.city,
        mostActiveCityCount: mostActiveCity._count.city,
        averageConfidence: avgConfidence._avg.confidenceScore || 0,
        cityBreakdown: cityStats.map(stat => ({
          city: stat.city,
          count: stat._count.city
        }))
      },
      recentActivity: recentPredictions.map(pred => ({
        id: pred.id,
        city: pred.city,
        user: pred.user.name || pred.user.email,
        createdAt: pred.createdAt,
        confidence: pred.confidenceScore
      }))
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
