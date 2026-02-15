'use client'

import { RefObject } from 'react'
import { EmotionResult, getEmotionLabel, formatConfidence } from '@/lib/emotion-utils'

interface CameraPanelProps {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
  emotionResult: EmotionResult | null
  detectorState: {
    faceDetected: boolean
    lowLight: boolean
  }
  showAdvancedStats: boolean
}

export default function CameraPanel({
  videoRef,
  canvasRef,
  emotionResult,
  detectorState,
  showAdvancedStats,
}: CameraPanelProps) {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border/40 shadow-sm">
      {/* Video Container */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {/* Video Element - Hidden, only used for inference */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover hidden"
          playsInline
          muted
        />

        {/* Canvas Overlay - Shows video and detection box */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Status Overlay */}
        <div className="absolute inset-0 flex items-end p-4 pointer-events-none">
          <div className="w-full flex items-end justify-between gap-4">
            {/* Emotion Label */}
            {emotionResult && detectorState.faceDetected && (
              <div className="backdrop-blur-sm bg-background/80 border border-border/40 rounded-lg px-4 py-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Current Emotion
                </div>
                <div className="text-2xl font-bold mt-1">
                  {getEmotionLabel(emotionResult.emotion)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatConfidence(emotionResult.confidence)}% confident
                </div>
              </div>
            )}

            {/* Status Messages */}
            {!detectorState.faceDetected && (
              <div className="backdrop-blur-sm bg-muted/80 border border-border/40 rounded-lg px-4 py-3 text-sm text-muted-foreground">
                No face detected in frame
              </div>
            )}

            {detectorState.lowLight && (
              <div className="backdrop-blur-sm bg-amber-900/20 border border-amber-700/40 rounded-lg px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                💡 Better lighting will improve accuracy
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Stats Panel */}
      {showAdvancedStats && emotionResult && (
        <div className="border-t border-border/40 bg-muted/50 p-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Raw Probabilities
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(emotionResult.probabilities).map(([emotion, prob]) => (
              <div key={emotion} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground capitalize">{emotion}</span>
                <span className="font-mono font-semibold">{Math.round(prob * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
