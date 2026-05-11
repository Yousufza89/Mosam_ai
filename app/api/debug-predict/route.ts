import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { llmService } from "@/lib/llm-service"

export async function POST() {
  try {
    console.log("=== DEBUG PREDICTION START ===")
    
    // Mock session for testing
    const mockSession = {
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com"
      }
    }

    // Mock prediction data
    const city = "Karachi"
    const date = "2026-05-12"
    const baselineTemp = 32
    const rlCorrectedTemp = 34.5
    const confidence = 87

    console.log("1. Creating prediction in database...")
    
    // Save prediction to database
    const savedPrediction = await prisma.prediction.create({
      data: {
        userId: mockSession.user.id,
        city,
        predictionDate: new Date(date),
        baselineTemp,
        rlCorrectedTemp,
        confidenceScore: confidence,
        modelVersion: "AI-v3.0"
      }
    })

    console.log("2. Prediction saved:", savedPrediction.id)
    
    console.log("3. Generating LLM message...")
    
    // Generate LLM message
    const llmMessage = await llmService.generatePredictionMessage({
      city,
      baselineTemp,
      rlCorrectedTemp,
      confidenceScore: confidence,
      userName: mockSession.user.name,
      previousPredictions: 5
    })

    console.log("4. LLM message generated:", JSON.stringify(llmMessage, null, 2))
    
    const response = {
      city,
      feature: "temperature_max",
      date,
      baselineTemp: baselineTemp.toFixed(2),
      rlCorrection: "+2.50",
      prediction_value: Number(rlCorrectedTemp.toFixed(2)),
      confidence: confidence.toFixed(1),
      modelVersion: "AI-v3.0",
      steps: [],
      featureSummary: { using_trained_models: false },
      usingRealModel: false,
      llmMessage,
      predictionId: savedPrediction.id
    }

    console.log("5. Full response:", JSON.stringify(response, null, 2))

    return NextResponse.json(response)

  } catch (error) {
    console.error("=== DEBUG PREDICTION ERROR ===")
    console.error("Error:", error)
    return NextResponse.json(
      { 
        error: "Debug prediction failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
