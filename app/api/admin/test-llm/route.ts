import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      )
    }

    let testResult

    if (provider === 'gemini') {
      // Test Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Say 'API test successful' in one word."
              }]
            }],
            generationConfig: { maxOutputTokens: 10 }
          })
        }
      )

      if (response.ok) {
        const result = await response.json()
        testResult = {
          success: true,
          message: "Gemini API connection successful",
          model: result.model || "gemini-1.5-flash-latest"
        }
      } else {
        testResult = {
          success: false,
          message: `Gemini API error: ${response.status}`,
          error: await response.text().catch(() => 'Unknown error')
        }
      }
    } else if (provider === 'claude') {
      // Test Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{
            role: 'user',
            content: "Say 'API test successful' in one word."
          }]
        })
      })

      if (response.ok) {
        const result = await response.json()
        testResult = {
          success: true,
          message: "Claude API connection successful",
          model: result.model || "claude-3-haiku-20240307"
        }
      } else {
        testResult = {
          success: false,
          message: `Claude API error: ${response.status}`,
          error: await response.text().catch(() => 'Unknown error')
        }
      }
    } else {
      return NextResponse.json(
        { error: "Invalid provider. Use 'gemini' or 'claude'" },
        { status: 400 }
      )
    }

    return NextResponse.json(testResult)

  } catch (error) {
    console.error("LLM API test error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to test API connection",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
