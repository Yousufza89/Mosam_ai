import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { WeatherService } from "@/lib/weather-service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const predictionId = resolvedParams?.id

    if (!predictionId) {
      return NextResponse.json(
        { error: "Prediction id is required" },
        { status: 400 }
      )
    }

    // Check if prediction exists and belongs to user
    const prediction = await prisma.prediction.findUnique({
      where: { id: predictionId }
    })

    if (!prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    if (prediction.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only update your own predictions" },
        { status: 403 }
      )
    }

    // Update accuracy using weather service
    const updated = await WeatherService.updatePredictionAccuracy(predictionId)

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update accuracy - prediction date may be in future" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "Accuracy updated successfully",
      accuracy: "Calculated based on actual weather data"
    })

  } catch (error: any) {
    console.error("Update accuracy error:", error)
    return NextResponse.json(
      { error: "Failed to update accuracy" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
