'use client'

// Machine learning utilities for face detection and emotion classification
// Using @vladmandic/face-api for both face detection and emotion detection
import { EmotionProbabilities, Emotion } from './emotion-utils'

export type FaceDetectionResult = {
  detection: any | null
  expressions: Record<string, number>
  error?: string
}

// Track if models are loaded
let modelsLoaded = false
let modelsLoading = false
let faceapi: any = null

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model/'

/**
 * Dynamically load face-api only in the browser
 */
async function loadFaceApi(): Promise<any> {
  if (faceapi) return faceapi

  try {
    // Dynamic require for browser-only code
    const module = await import('@vladmandic/face-api')
    faceapi = module.default || module
    console.log('[v0] Face API loaded')
    return faceapi
  } catch (error) {
    console.error('[v0] Failed to load face-api:', error)
    throw new Error('Failed to load Face API. Please refresh the page.')
  }
}

/**
 * Load face-api models from CDN
 * This happens asynchronously and is called once on app start
 */
export async function loadModels(): Promise<void> {
  if (modelsLoaded || modelsLoading) return

  modelsLoading = true

  try {
    const api = await loadFaceApi()

    // Load all required models
    await Promise.all([
      api.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      api.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      api.nets.faceDetectionNet.loadFromUri(MODEL_URL),
    ])

    modelsLoaded = true
    console.log('[v0] Face API models loaded successfully')
  } catch (error) {
    console.error('[v0] Error loading face API models:', error)
    modelsLoading = false
    throw error
  }
}

/**
 * Check if models are ready for inference
 */
export function areModelsLoaded(): boolean {
  return modelsLoaded
}

/**
 * Detects faces in a video element and returns the largest face with emotion expressions
 *
 * - Handles multiple faces by selecting the largest bounding box
 * - Returns null if no face is detected
 * - Throttled via calling code (every 200ms)
 */
export async function detectFaceAndExpressions(
  videoElement: HTMLVideoElement
): Promise<FaceDetectionResult> {
  if (!modelsLoaded) {
    return {
      detection: null,
      expressions: {},
      error: 'Models not loaded',
    }
  }

  try {
    const api = await loadFaceApi()

    // Detect all faces with landmarks and expressions
    const detections = await api
      .detectAllFaces(videoElement)
      .withFaceLandmarks()
      .withFaceExpressions()

    if (detections.length === 0) {
      return {
        detection: null,
        expressions: {},
      }
    }

    // Select the largest face (primary face for analysis)
    let largestFace = detections[0]
    let largestArea = largestFace.detection.box.width * largestFace.detection.box.height

    for (let i = 1; i < detections.length; i++) {
      const area = detections[i].detection.box.width * detections[i].detection.box.height
      if (area > largestArea) {
        largestArea = area
        largestFace = detections[i]
      }
    }

    return {
      detection: largestFace.detection,
      expressions: largestFace.expressions,
    }
  } catch (error) {
    console.error('[v0] Face detection error:', error)
    return {
      detection: null,
      expressions: {},
      error: error instanceof Error ? error.message : 'Detection failed',
    }
  }
}

/**
 * Normalizes raw emotion expressions to 0-1 range
 * Handles cases where expressions might be undefined or missing
 */
export function normalizeExpressions(expressions: Record<string, number>): EmotionProbabilities {
  const emotions: Emotion[] = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised']

  const normalized: EmotionProbabilities = {
    happy: 0,
    sad: 0,
    neutral: 0,
    angry: 0,
    surprised: 0,
    fearful: 0,
    disgusted: 0
  }

  for (const emotion of emotions) {
    const value = expressions[emotion] ?? 0
    normalized[emotion] = Math.max(0, Math.min(1, value))
  }

  return normalized
}

/**
 * Draws a subtle bounding box around detected face
 * Uses a thin gray border for minimalist aesthetic
 */
export function drawDetectionBox(
  canvas: HTMLCanvasElement,
  detection: any,
  isDark: boolean = false
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const box = detection.box
  const borderColor = isDark ? 'rgba(229, 231, 235, 0.6)' : 'rgba(75, 85, 99, 0.4)'
  const borderWidth = 2

  ctx.strokeStyle = borderColor
  ctx.lineWidth = borderWidth
  ctx.strokeRect(box.x, box.y, box.width, box.height)
}

/**
 * Clears the canvas for the next frame
 */
export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

/**
 * Setup canvas to match video dimensions
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement
): void {
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
}

/**
 * Cleanup and dispose of resources
 */
export function disposeResources(): void {
  // Face-api uses TensorFlow.js internally
  // Cleanup is handled automatically, but we can manually dispose if needed
  try {
    if (faceapi?.tf?.memory) {
      console.log('[v0] TensorFlow.js memory:', faceapi.tf.memory())
    }
  } catch (error) {
    // Ignore if TensorFlow.js is not available
  }
}
