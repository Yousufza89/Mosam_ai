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
    this.geminiApiKey = process.env.GEMINI_API_KEY || ''
    this.claudeApiKey = process.env.CLAUDE_API_KEY || undefined
  }

  async generatePredictionMessage(data: PredictionData): Promise<LLMMessage> {
    try {
      // Try Gemini first (free tier is generous)
      if (this.geminiApiKey) {
        return await this.generateGeminiMessage(data)
      }
      
      // Fallback to Claude if available
      if (this.claudeApiKey) {
        return await this.generateClaudeMessage(data)
      }

      // Fallback to template messages if no API keys
      return this.generateTemplateMessage(data)
    } catch (error) {
      console.error('LLM Service Error:', error)
      return this.generateTemplateMessage(data)
    }
  }

  private async generateGeminiMessage(data: PredictionData): Promise<LLMMessage> {
    const prompt = this.createPredictionPrompt(data)
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`,
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
    const userName = data.userName || 'Weather Enthusiast'
    const tempDiff = data.rlCorrectedTemp - data.baselineTemp
    const direction = tempDiff > 0 ? 'warmer' : 'cooler'
    
    const templates = [
      {
        message: `🌟 Amazing prediction, ${userName}! Our AI adjusted the temperature for ${data.city} to be ${direction} by ${Math.abs(tempDiff).toFixed(1)}°. With ${data.confidenceScore}% confidence, you're really getting the hang of this! Want to try predicting for another major city?`,
        suggestions: ['Try Mumbai', 'Check Delhi', 'Predict for Bangalore'],
        followUpQuestions: ['What weather patterns interest you most?', 'Which city would you like to master predictions for?']
      },
      {
        message: `🎯 Excellent work, ${userName}! Your ${data.city} prediction shows our AI thinks it'll be ${direction} than expected. At ${data.confidenceScore}% confidence, you're becoming quite the weather forecaster! Ready to challenge another city's weather?`,
        suggestions: ['Test Chennai', 'Try Kolkata', 'Predict for Pune'],
        followUpQuestions: ['How accurate have your predictions been so far?', 'What\'s your favorite city to predict for?']
      },
      {
        message: `⚡ Impressive, ${userName}! The AI correction for ${data.city} suggests ${direction} temperatures (${Math.abs(tempDiff).toFixed(1)}° difference). Your ${data.confidenceScore}% confidence score shows you're learning fast! Which city will you predict next?`,
        suggestions: ['Challenge Hyderabad', 'Try Ahmedabad', 'Predict for Jaipur'],
        followUpQuestions: ['Are you surprised by the AI adjustment?', 'What city\'s weather puzzles you most?']
      }
    ]
    
    return templates[Math.floor(Math.random() * templates.length)]
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
