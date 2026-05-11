"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, MessageCircle, Lightbulb, ArrowRight, TrendingUp } from "lucide-react"

interface LLMMessage {
  type: 'completion' | 'insight' | 'encouragement'
  message: string
  suggestions?: string[]
  followUpQuestions?: string[]
}

interface LLMMessageDisplayProps {
  message: LLMMessage
  isVisible: boolean
  onSuggestionClick?: (suggestion: string) => void
}

export default function LLMMessageDisplay({ 
  message, 
  isVisible, 
  onSuggestionClick 
}: LLMMessageDisplayProps) {
  const [expandedSection, setExpandedSection] = useState<'suggestions' | 'questions' | null>(null)

  if (!isVisible || !message) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-blue-200 shadow-lg"
      >
        {/* Main Message */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-800">🌤️ AI Weather Insight</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {message.type === 'completion' ? 'Prediction Analysis' : 
                 message.type === 'insight' ? 'Weather Insight' : 'Encouragement'}
              </span>
            </div>
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: message.message }}
            />
          </div>
        </div>

        {/* Working Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="border-t border-blue-200 pt-4">
            <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Try These Cities:
            </h4>
            <div className="flex gap-2 flex-wrap">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="px-4 py-2 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Quick insight component for smaller displays
export function QuickLLMInsight({ message, isVisible }: { message: LLMMessage; isVisible: boolean }) {
  if (!isVisible || !message) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5" />
          <div>
            <p className="font-medium text-sm">AI Insight</p>
            <p className="text-xs opacity-90 line-clamp-2">{message.message}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
