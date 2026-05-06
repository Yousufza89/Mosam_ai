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
              <h3 className="font-bold text-gray-800">AI Weather Insight</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {message.type === 'completion' ? 'Prediction Analysis' : 
                 message.type === 'insight' ? 'Weather Insight' : 'Encouragement'}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {message.message}
            </p>
          </div>
        </div>

        {/* Suggestions Section */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setExpandedSection(expandedSection === 'suggestions' ? null : 'suggestions')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm mb-2"
            >
              <Lightbulb className="w-4 h-4" />
              {expandedSection === 'suggestions' ? 'Hide' : 'Show'} Suggestions
              <ArrowRight className={`w-3 h-3 transition-transform ${expandedSection === 'suggestions' ? 'rotate-90' : ''}`} />
            </button>
            
            <AnimatePresence>
              {expandedSection === 'suggestions' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {message.suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => onSuggestionClick?.(suggestion)}
                      className="w-full text-left p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 group-hover:text-purple-700">
                          📍 {suggestion}
                        </span>
                        <ArrowRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Follow-up Questions Section */}
        {message.followUpQuestions && message.followUpQuestions.length > 0 && (
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'questions' ? null : 'questions')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mb-2"
            >
              <MessageCircle className="w-4 h-4" />
              {expandedSection === 'questions' ? 'Hide' : 'Show'} Questions
              <ArrowRight className={`w-3 h-3 transition-transform ${expandedSection === 'questions' ? 'rotate-90' : ''}`} />
            </button>
            
            <AnimatePresence>
              {expandedSection === 'questions' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {message.followUpQuestions.map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                        <p className="text-gray-700 text-sm">{question}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg">
              Make Another Prediction
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium">
              View My History
            </button>
          </div>
        </div>
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
