interface PredictionData {
  city: string
  baselineTemp: number
  rlCorrectedTemp: number
  confidenceScore: number
  userName?: string
  previousPredictions?: number
}

interface LLMMessage {
  type: 'completion' | 'insight' | 'encouragement'
  message: string
  suggestions?: string[]
  followUpQuestions?: string[]
}

class LLMService {
  private geminiApiKey: string
  private claudeApiKey?: string

  constructor() {
    this.geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
    this.claudeApiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY || undefined
  }

  async generatePredictionMessage(data: PredictionData): Promise<LLMMessage> {
    try {
      console.log("LLM Service: Generating message for", data.city, "confidence:", data.confidenceScore)
      
      // Try Gemini first (free tier is generous)
      if (this.geminiApiKey) {
        console.log("LLM Service: Using Gemini API")
        return await this.generateGeminiMessage(data)
      }
      
      // Fallback to Claude if available
      if (this.claudeApiKey) {
        console.log("LLM Service: Using Claude API")
        return await this.generateClaudeMessage(data)
      }

      // Fallback to template messages if no API keys
      console.log("LLM Service: Using template fallback")
      return this.generateTemplateMessage(data)
    } catch (error) {
      console.error('LLM Service Error:', error)
      console.log("LLM Service: Falling back to template")
      return this.generateTemplateMessage(data)
    }
  }

  private async generateGeminiMessage(data: PredictionData): Promise<LLMMessage> {
    const prompt = this.createPredictionPrompt(data)
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const result = await response.json()
    const message = result.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    return this.parseLLMResponse(message, data)
  }

  private async generateClaudeMessage(data: PredictionData): Promise<LLMMessage> {
    const prompt = this.createPredictionPrompt(data)
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.claudeApiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const result = await response.json()
    const message = result.content?.[0]?.text || ''
    
    return this.parseLLMResponse(message, data)
  }

  private createPredictionPrompt(data: PredictionData): string {
    const userName = data.userName || 'Weather Enthusiast'
    const tempDiff = data.rlCorrectedTemp - data.baselineTemp
    const direction = tempDiff > 0 ? 'warmer' : 'cooler'
    
    return `You are an enthusiastic weather prediction assistant for Mosam.ai. 

User ${userName} just made a weather prediction for ${data.city}:
- Baseline temperature: ${data.baselineTemp}°C
- AI corrected temperature: ${data.rlCorrectedTemp}°C (${direction} by ${Math.abs(tempDiff).toFixed(1)}°)
- Confidence: ${data.confidenceScore}%
- Previous predictions: ${data.previousPredictions || 0}

Generate an exciting, engaging message that:
1. Congratulates them on their prediction
2. Explains the temperature adjustment in simple terms
3. Encourages them to make another prediction
4. Asks an engaging follow-up question about weather
5. Suggests other cities they might want to predict

Keep it under 150 words, friendly and enthusiastic. Use emojis if appropriate. Make them feel like a weather expert!`

  }

  private parseLLMResponse(message: string, data: PredictionData): LLMMessage {
    // Parse the response to extract different components
    const lines = message.split('\n').filter(line => line.trim())
    
    const suggestions = this.extractSuggestions(message)
    const followUpQuestions = this.extractQuestions(message)
    
    return {
      type: 'completion',
      message: message.trim(),
      suggestions,
      followUpQuestions
    }
  }

  private extractSuggestions(message: string): string[] {
    const suggestions: string[] = []
    
    // Look for suggestion patterns
    const suggestionPatterns = [
      /try predicting:?\s*([^.]+)/gi,
      /consider:?\s*([^.]+)/gi,
      /how about:?\s*([^.]+)/gi,
      /suggestion:?\s*([^.]+)/gi
    ]
    
    suggestionPatterns.forEach(pattern => {
      const matches = message.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const suggestion = match.replace(/.*?[:]\s*/, '').trim()
          if (suggestion && !suggestions.includes(suggestion)) {
            suggestions.push(suggestion)
          }
        })
      }
    })
    
    return suggestions.slice(0, 3) // Limit to 3 suggestions
  }

  private extractQuestions(message: string): string[] {
    const questions: string[] = []
    
    // Extract questions from the message
    const questionPattern = /[^.!?]*\?/g
    const matches = message.match(questionPattern)
    
    if (matches) {
      matches.forEach(question => {
        const cleanQuestion = question.trim()
        if (cleanQuestion.length > 10 && !questions.includes(cleanQuestion)) {
          questions.push(cleanQuestion)
        }
      })
    }
    
    return questions.slice(0, 2) // Limit to 2 questions
  }

  private generateTemplateMessage(data: PredictionData): LLMMessage {
    const temp = data.rlCorrectedTemp
    const tempDiff = Math.abs(data.rlCorrectedTemp - data.baselineTemp)
    const isHot = temp > 30
    const isCold = temp < 15
    const isVeryHot = temp > 35
    const isVeryCold = temp < 10
    
    let message = ""
    let suggestions: string[] = []

    // Create engaging, weather-specific messages
    if (isVeryHot) {
      message = `🔥 **EXTREME HEAT ALERT!** Temperature soaring to ${temp.toFixed(1)}°C in ${data.city}! Stay indoors, drink lots of water, and avoid outdoor activities. This is scorching hot weather!`
    } else if (isHot) {
      message = `☀️ **Hot day ahead!** Expect ${temp.toFixed(1)}°C in ${data.city}. Perfect for the pool but stay hydrated! Don't forget your sunscreen.`
    } else if (isVeryCold) {
      message = `🥶 **FREEZING COLD!** Bundle up! Temperature dropping to ${temp.toFixed(1)}°C in ${data.city}. Heavy coats, hot coffee, and warm blankets recommended!`
    } else if (isCold) {
      message = `🧥 **Chilly weather!** Pack a jacket for ${temp.toFixed(1)}°C in ${data.city}. Perfect weather for hot tea and cozy sweaters.`
    } else if (temp >= 20 && temp <= 25) {
      message = `🌤️ **PERFECT WEATHER!** Beautiful ${temp.toFixed(1)}°C in ${data.city} today! Ideal for outdoor activities, picnics, and a morning walk.`
    } else if (temp > 25 && temp <= 30) {
      message = `� **Lovely warm day!** ${temp.toFixed(1)}°C in ${data.city}. Great for outdoor sports and beach activities!`
    } else {
      message = `🌈 **Pleasant weather!** ${temp.toFixed(1)}°C expected in ${data.city}. Comfortable and enjoyable day ahead!`
    }

    // Add weather-specific advice
    if (isHot || isVeryHot) {
      message += ` 💧 **GRAB WATER** - Stay hydrated!`
    } else if (isCold || isVeryCold) {
      message += ` 🧤 **WARM UP** - Hot drinks recommended!`
    } else if (temp >= 18 && temp <= 22) {
      message += ` 🌳 **PERFECT** - Great for outdoor activities!`
    }

    // Add AI adjustment info if significant
    if (tempDiff > 2) {
      message += ` 🤖 **AI Insight:** Our weather AI adjusted the forecast by ${tempDiff.toFixed(1)}°C from the baseline prediction.`
    }

    // Add confidence and encouragement
    message += ` 🎯 **${data.confidenceScore.toFixed(0)}% confidence** in this forecast. Great prediction, ${data.userName || 'weather enthusiast'}!`

    // Simple working suggestions
    const cities = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"]
    const otherCities = cities.filter(city => city !== data.city)
    suggestions = otherCities.slice(0, 2).map(city => `Try ${city}`)

    return {
      type: 'completion',
      message,
      suggestions,
      followUpQuestions: [] // Remove non-working feature
    }
  }

  async generateWeatherInsights(city: string, predictionsCount: number): Promise<LLMMessage> {
    const prompt = `Generate interesting weather insights about ${city} based on ${predictionsCount} recent predictions. 
    Provide fascinating weather facts, patterns, or tips about this city's climate. Keep it engaging and under 100 words.`

    try {
      if (this.geminiApiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 150 }
            })
          }
        )
        
        if (response.ok) {
          const result = await response.json()
          const message = result.candidates?.[0]?.content?.parts?.[0]?.text || ''
          return {
            type: 'insight',
            message: message.trim(),
            suggestions: [],
            followUpQuestions: []
          }
        }
      }
    } catch (error) {
      console.error('Insight generation error:', error)
    }

    // Fallback insights
    return {
      type: 'insight',
      message: `Did you know? ${city} has unique weather patterns that make it fascinating for predictions. Keep tracking to discover more insights!`,
      suggestions: [],
      followUpQuestions: []
    }
  }
}

export const llmService = new LLMService()
export type { LLMMessage, PredictionData }
