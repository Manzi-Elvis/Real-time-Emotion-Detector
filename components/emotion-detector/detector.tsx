'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { loadModels, areModelsLoaded, detectFaceAndExpressions, normalizeExpressions, drawDetectionBox, clearCanvas, setupCanvas, disposeResources } from '@/lib/ml-utils'
import { getDominantEmotion, smoothEmotionResult, EmotionResult, formatConfidence } from '@/lib/emotion-utils'
import CameraPanel from './camera-panel'
import ConfidenceMeter from './confidence-meter'
import EmotionChart from './emotion-chart'
import MoodInterpreter from './mood-interpreter'
import SettingsPanel from './settings-panel'
import PrivacySection from './privacy-section'

export type SmoothingLevel = 'low' | 'medium' | 'high'

interface DetectorSettings {
  showOverlay: boolean
  smoothingLevel: SmoothingLevel
  showAdvancedStats: boolean
  isDark: boolean
}

interface DetectorState {
  isLoading: boolean
  error: string | null
  permission: 'granted' | 'denied' | 'pending'
  isRunning: boolean
  faceDetected: boolean
  multipleFaces: boolean
  lowLight: boolean
}

export default function EmotionDetector() {
  // Refs for video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null!)
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const predictionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // State for UI
  const [detectorState, setDetectorState] = useState<DetectorState>({
    isLoading: true,
    error: null,
    permission: 'pending',
    isRunning: false,
    faceDetected: false,
    multipleFaces: false,
    lowLight: false,
  })

  const [settings, setSettings] = useState<DetectorSettings>({
    showOverlay: true,
    smoothingLevel: 'medium',
    showAdvancedStats: false,
    isDark: false,
  })

  // State for emotion results
  const [emotionResult, setEmotionResult] = useState<EmotionResult | null>(null)
  const emotionHistoryRef = useRef<EmotionResult | null>(null)

  // Convert smoothing level to factor (0.3 = low/responsive, 0.95 = high/smooth)
  const smoothingFactor = {
    low: 0.3,
    medium: 0.7,
    high: 0.95,
  }[settings.smoothingLevel]

  // Request camera permission and initialize
  const initializeCamera = useCallback(async () => {
    setDetectorState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play()
              resolve()
            }
          }
        })
      }

      setDetectorState(prev => ({
        ...prev,
        permission: 'granted',
        isRunning: true,
        isLoading: false,
      }))

      // Load ML models
      try {
        await loadModels()
      } catch (modelError) {
        console.error('[v0] Model loading error:', modelError)
        setDetectorState(prev => ({
          ...prev,
          error: 'Failed to load AI models. Please refresh the page.',
        }))
      }
    } catch (error: unknown) {
      let errorMessage = 'Failed to access camera'
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please enable it in your browser settings.'
          setDetectorState(prev => ({ ...prev, permission: 'denied' }))
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera device.'
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is in use by another application.'
        }
      }
      setDetectorState(prev => ({
        ...prev,
        error: errorMessage,
        permission: error instanceof DOMException && error.name === 'NotAllowedError' ? 'denied' : 'pending',
        isLoading: false,
      }))
    }
  }, [])

  // Main emotion detection loop
  const detectLoop = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !detectorState.isRunning) {
      return
    }

    // Throttle predictions to every 200ms for performance
    predictionTimeoutRef.current = setTimeout(async () => {
      try {
        // Ensure models are loaded
        if (!areModelsLoaded()) {
          console.log('[v0] Models still loading...')
          animationFrameRef.current = requestAnimationFrame(detectLoop)
          return
        }

        // Setup canvas dimensions
        setupCanvas(canvasRef.current!, videoRef.current!)

        // Detect face and emotions
        const result = await detectFaceAndExpressions(videoRef.current!)

        if (result.error) {
          console.error('[v0] Detection error:', result.error)
        }

        // Clear canvas and redraw
        clearCanvas(canvasRef.current!)

        if (result.detection) {
          // Face detected
          const probabilities = normalizeExpressions(result.expressions)
          const newResult = getDominantEmotion(probabilities)

          // Apply temporal smoothing
          const smoothed = smoothEmotionResult(
            newResult,
            emotionHistoryRef.current,
            smoothingFactor
          )

          emotionHistoryRef.current = smoothed
          setEmotionResult(smoothed)

          // Draw bounding box if enabled
          if (settings.showOverlay) {
            drawDetectionBox(canvasRef.current!, result.detection, settings.isDark)
          }

          // Update detection status
          setDetectorState(prev => ({
            ...prev,
            faceDetected: true,
            multipleFaces: false, // face-api returns largest face, so we know single
            lowLight: false, // Could add luminosity check here
          }))
        } else {
          // No face detected
          setDetectorState(prev => ({
            ...prev,
            faceDetected: false,
          }))
          setEmotionResult(null)
        }
      } catch (error) {
        console.error('[v0] Emotion detection error:', error)
      }

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(detectLoop)
    }, 200) // 200ms throttle
  }, [detectorState.isRunning, settings.showOverlay, settings.isDark, smoothingFactor])

  // Start detection loop when ready
  useEffect(() => {
    if (detectorState.isRunning && videoRef.current?.readyState === videoRef.current?.HAVE_FUTURE_DATA) {
      animationFrameRef.current = requestAnimationFrame(detectLoop)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (predictionTimeoutRef.current) {
          clearTimeout(predictionTimeoutRef.current)
        }
      }
    }
  }, [detectorState.isRunning, detectLoop])

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera()

    return () => {
      // Cleanup: stop stream and dispose resources
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (predictionTimeoutRef.current) {
        clearTimeout(predictionTimeoutRef.current)
      }
      disposeResources()
    }
  }, [initializeCamera])

  // Handle permission retry
  const handleRetryPermission = () => {
    initializeCamera()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Emotion Detector</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time emotion analysis • 100% private • No data stored
              </p>
            </div>
            <SettingsPanel settings={settings} onSettingsChange={setSettings} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {detectorState.error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
            <p className="font-medium">{detectorState.error}</p>
            {detectorState.permission === 'denied' && (
              <button
                onClick={handleRetryPermission}
                className="mt-3 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {detectorState.isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-border rounded-full border-t-accent animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading AI models...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a moment on first load</p>
            </div>
          </div>
        )}

        {/* Permission Denied State */}
        {detectorState.permission === 'denied' && !detectorState.isLoading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">Camera Permission Required</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Please enable camera access in your browser settings to use the emotion detector.
            </p>
            <button
              onClick={handleRetryPermission}
              className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
            >
              Enable Camera
            </button>
          </div>
        )}

        {/* Main App Content */}
        {detectorState.permission === 'granted' && !detectorState.isLoading && (
          <>
            {/* Two-column layout: Camera and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Camera Panel - Takes up 2 columns on desktop */}
              <div className="lg:col-span-2">
                <CameraPanel
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  emotionResult={emotionResult}
                  detectorState={detectorState}
                  showAdvancedStats={settings.showAdvancedStats}
                />
              </div>

              {/* Insights Sidebar */}
              <div className="space-y-6">
                <ConfidenceMeter emotionResult={emotionResult} />
                <MoodInterpreter emotionResult={emotionResult} detectorState={detectorState} />
              </div>
            </div>

            {/* Emotion Probabilities Chart - Full Width */}
            <div className="mb-8">
              <EmotionChart emotionResult={emotionResult} />
            </div>

            {/* Privacy Section */}
            <PrivacySection />
          </>
        )}
      </main>
    </div>
  )
}
