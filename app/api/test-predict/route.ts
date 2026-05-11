import { NextResponse } from "next/server"
import { llmService } from "@/lib/llm-service"

export async function POST() {
  try {
    console.log("Testing LLM service...")
    
    // Test LLM service directly
    const testMessage = await llmService.generatePredictionMessage({
      city: "Karachi",
      baselineTemp: 32,
      rlCorrectedTemp: 34.5,
      confidenceScore: 87,
      userName: "Test User",
      previousPredictions: 5
    })

    console.log("LLM message generated:", testMessage)

    return NextResponse.json({
      success: true,
      llmMessage: testMessage,
      message: "LLM service test completed"
    })

  } catch (error) {
    console.error("LLM service test error:", error)
    return NextResponse.json(
      { 
        error: "LLM service test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
