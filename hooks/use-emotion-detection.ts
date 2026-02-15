/**
 * Custom hook for managing emotion detection state and lifecycle
 * Encapsulates the core detection logic and provides a clean interface
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { detectFaceAndExpressions, normalizeExpressions, loadModels, areModelsLoaded } from '@/lib/ml-utils'
import { getDominantEmotion, smoothEmotionResult, EmotionResult } from '@/lib/emotion-utils'

interface UseEmotionDetectionOptions {
  videoElement: HTMLVideoElement | null
  isRunning: boolean
  smoothingFactor: number
  throttleMs?: number
}

interface UseEmotionDetectionResult {
  emotionResult: EmotionResult | null
  faceDetected: boolean
  isModelReady: boolean
  error: string | null
  initializeModels: () => Promise<void>
}

/**
 * Hook to handle real-time emotion detection
 * Manages model loading, inference, and state updates
 */
export function useEmotionDetection({
  videoElement,
  isRunning,
  smoothingFactor,
  throttleMs = 200,
}: UseEmotionDetectionOptions): UseEmotionDetectionResult {
  const [emotionResult, setEmotionResult] = useState<EmotionResult | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [isModelReady, setIsModelReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emotionHistoryRef = useRef<EmotionResult | null>(null)
  const lastPredictionRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)

  // Initialize ML models
  const initializeModels = useCallback(async () => {
    try {
      await loadModels()
      setIsModelReady(true)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load models'
      setError(message)
      console.error('[v0] Model initialization error:', err)
    }
  }, [])

  // Main detection loop
  const runDetectionLoop = useCallback(async () => {
    if (!videoElement || !isRunning || !isModelReady) {
      animationFrameRef.current = requestAnimationFrame(runDetectionLoop)
      return
    }

    const now = Date.now()
    if (now - lastPredictionRef.current < throttleMs) {
      animationFrameRef.current = requestAnimationFrame(runDetectionLoop)
      return
    }

    lastPredictionRef.current = now

    try {
      const result = await detectFaceAndExpressions(videoElement)

      if (result.detection) {
        const probabilities = normalizeExpressions(result.expressions)
        const newResult = getDominantEmotion(probabilities)

        const smoothed = smoothEmotionResult(
          newResult,
          emotionHistoryRef.current,
          smoothingFactor
        )

        emotionHistoryRef.current = smoothed
        setEmotionResult(smoothed)
        setFaceDetected(true)
      } else {
        setEmotionResult(null)
        setFaceDetected(false)
      }

      setError(null)
    } catch (err) {
      console.error('[v0] Detection loop error:', err)
      setError(err instanceof Error ? err.message : 'Detection failed')
    }

    animationFrameRef.current = requestAnimationFrame(runDetectionLoop)
  }, [videoElement, isRunning, isModelReady, throttleMs, smoothingFactor])

  // Start detection loop when ready
  useEffect(() => {
    if (isRunning && isModelReady && videoElement?.readyState === videoElement?.HAVE_FUTURE_DATA) {
      animationFrameRef.current = requestAnimationFrame(runDetectionLoop)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRunning, isModelReady, videoElement, runDetectionLoop])

  return {
    emotionResult,
    faceDetected,
    isModelReady,
    error,
    initializeModels,
  }
}
