'use client'

import { EmotionResult, getMoodLabel, getMoodColor } from '@/lib/emotion-utils'

interface MoodInterpreterProps {
  emotionResult: EmotionResult | null
  detectorState: {
    faceDetected: boolean
  }
}

const moodInterpretations: Record<string, string> = {
  positive: 'You appear to be in a positive, uplifted mood. Great energy detected!',
  negative: 'Your expression suggests a more thoughtful or concerned emotional state.',
  neutral: 'Your expression appears calm and neutral. A balanced emotional baseline.',
  alert: 'Your expression shows heightened alertness or intensity.',
}

export default function MoodInterpreter({ emotionResult, detectorState }: MoodInterpreterProps) {
  if (!emotionResult || !detectorState.faceDetected) {
    return (
      <div className="rounded-xl bg-card border border-border/40 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Mood Interpretation</h3>
        <div className="text-sm text-muted-foreground">
          Position your face in the camera to see mood analysis.
        </div>
      </div>
    )
  }

  const moodColor = getMoodColor(emotionResult.mood)
  const moodLabel = getMoodLabel(emotionResult.mood)

  return (
    <div className="rounded-xl bg-card border border-border/40 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Mood Interpretation</h3>

      {/* Mood Badge */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: moodColor }}
        />
        <span className="font-semibold text-lg">{moodLabel}</span>
      </div>

      {/* Interpretation Text */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {moodInterpretations[emotionResult.mood]}
      </p>

      {/* Top Emotions */}
      <div className="border-t border-border/40 pt-4">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Dominant Emotions
        </div>

        {/* Get top 3 emotions */}
        {(() => {
          const sorted = Object.entries(emotionResult.probabilities)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)

          return (
            <div className="space-y-2">
              {sorted.map(([emotion, prob], idx) => (
                <div key={emotion} className="flex items-center gap-2">
                  <div className="text-xs font-medium w-16">{idx + 1}. {emotion}</div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                  <div className="text-xs font-mono text-muted-foreground w-8 text-right">
                    {Math.round(prob * 100)}%
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
