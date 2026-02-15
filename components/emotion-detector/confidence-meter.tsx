'use client'

import { useMemo } from 'react'
import { EmotionResult, formatConfidence } from '@/lib/emotion-utils'

interface ConfidenceMeterProps {
  emotionResult: EmotionResult | null
}

export default function ConfidenceMeter({ emotionResult }: ConfidenceMeterProps) {
  const displayConfidence = useMemo(() => {
    return emotionResult ? formatConfidence(emotionResult.confidence) : 0
  }, [emotionResult])

  return (
    <div className="rounded-xl bg-card border border-border/40 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Detection Confidence</h3>
        <div className="text-2xl font-bold text-accent">
          {displayConfidence}%
        </div>
      </div>

      {/* Animated Circular Progress */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${Math.PI * 100}`}
              strokeDashoffset={`${Math.PI * 100 * (1 - emotionResult?.confidence || 0)}`}
              strokeLinecap="round"
              className="text-accent transition-all duration-500 ease-out"
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '60px 60px',
              }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {displayConfidence}
              </div>
              <div className="text-xs text-muted-foreground">confident</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="space-y-2">
        {!emotionResult && (
          <div className="text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              Waiting for face detection...
            </div>
          </div>
        )}

        {emotionResult && (
          <>
            {emotionResult.confidence > 0.8 && (
              <div className="text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
                  ✓ High confidence
                </div>
              </div>
            )}
            {emotionResult.confidence > 0.6 && emotionResult.confidence <= 0.8 && (
              <div className="text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium">
                  ≈ Good confidence
                </div>
              </div>
            )}
            {emotionResult.confidence <= 0.6 && (
              <div className="text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium">
                  ↻ Stabilizing...
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
