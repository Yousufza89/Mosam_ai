import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Get user with detailed prediction information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        predictions: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Get last 10 predictions
          select: {
            id: true,
            city: true,
            predictionDate: true,
            confidenceScore: true,
            accuracy: true,
            createdAt: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Calculate user statistics
    const totalPredictions = await prisma.prediction.count({
      where: { userId }
    })

    const accuratePredictions = await prisma.prediction.count({
      where: { 
        userId,
        accuracy: { not: null }
      }
    })

    const avgAccuracy = accuratePredictions > 0 
      ? await prisma.prediction.aggregate({
          where: { 
            userId,
            accuracy: { not: null }
          },
          _avg: { accuracy: true }
        })
      : null

    const userDetail = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      joinedDate: user.createdAt.toISOString(),
      totalPredictions,
      accuracy: avgAccuracy?._avg.accuracy || null,
      lastLogin: user.updatedAt.toISOString(), // Using updatedAt as last login approximation
      predictions: user.predictions.map(p => ({
        ...p,
        predictionDate: p.predictionDate.toISOString(),
        createdAt: p.createdAt.toISOString()
      }))
    }

    return NextResponse.json(userDetail)

  } catch (error) {
    console.error("User detail fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    )
  }
}
