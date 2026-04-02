import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get prediction data
    const {
      city,
      date,
      baselineTemp,
      rlCorrectedTemp,
      confidence,
      modelVersion
    } = await request.json()

    // Validate required fields
    if (!city || !date || !baselineTemp || !rlCorrectedTemp || !confidence) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Save to database
    const savedPrediction = await prisma.prediction.create({
      data: {
        userId: session.user.id,
        city,
        predictionDate: new Date(date),
        baselineTemp,
        rlCorrectedTemp,
        confidenceScore: confidence,
        modelVersion: modelVersion || `${city.toLowerCase()}_v1`,
        // actualTemp and accuracy will be filled later
      }
    })

    return NextResponse.json({
      message: "Prediction saved successfully",
      id: savedPrediction.id
    })

  } catch (error) {
    console.error("Save prediction error:", error)
    return NextResponse.json(
      { error: "Failed to save prediction" },
      { status: 500 }
    )
  }
}