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
    const body = await request.json()
    const {
      city,
      date,
      baselineTemp,
      rlCorrectedTemp,
      confidence,
      modelVersion
    } = body

    // Validate required fields
    if (!city || !date || baselineTemp === undefined || rlCorrectedTemp === undefined || confidence === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Test database connection
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.error("Database connection error during save:", dbError)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      )
    }

    // Save to database
    const savedPrediction = await prisma.prediction.create({
      data: {
        userId: session.user.id,
        city,
        predictionDate: new Date(date),
        baselineTemp: parseFloat(baselineTemp),
        rlCorrectedTemp: parseFloat(rlCorrectedTemp),
        confidenceScore: parseFloat(confidence),
        modelVersion: modelVersion || `${city.toLowerCase()}_v1`,
      }
    })

    return NextResponse.json({
      message: "Prediction saved successfully",
      id: savedPrediction.id
    })

  } catch (error: any) {
    console.error("Save prediction error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to save prediction" },
      { status: 500 }
    )
  }
}
