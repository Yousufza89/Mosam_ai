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
    
    // Support both camelCase and snake_case field names from frontend
    const city = body.city
    const date = body.date
    const baselineTemp = body.baselineTemp ?? body.baseline_prediction
    const rlCorrectedTemp = body.rlCorrectedTemp ?? body.prediction_value ?? body.final_prediction
    const confidence = body.confidence
    const modelVersion = body.modelVersion ?? "AI-v2.1"

    // Validate required fields
    if (!city || !date || baselineTemp === undefined || rlCorrectedTemp === undefined || confidence === undefined) {
      console.error("Missing required fields in save API:", { city, date, baselineTemp, rlCorrectedTemp, confidence })
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
        baselineTemp: parseFloat(String(baselineTemp)),
        rlCorrectedTemp: parseFloat(String(rlCorrectedTemp)),
        confidenceScore: parseFloat(String(confidence)),
        modelVersion: modelVersion,
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
