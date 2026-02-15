// Emotion classification and mood mapping utilities

export type Emotion = 
  | 'happy' 
  | 'sad' 
  | 'neutral' 
  | 'angry' 
  | 'surprised' 
  | 'fearful' 
  | 'disgusted'

export type Mood = 'positive' | 'negative' | 'neutral' | 'alert'

export type EmotionProbabilities = {
  happy: number
  sad: number
  neutral: number
  angry: number
  surprised: number
  fearful: number
  disgusted: number
}

export type EmotionResult = {
  emotion: Emotion
  confidence: number
  mood: Mood
  probabilities: EmotionProbabilities
}

/**
 * Maps individual emotions to simplified mood categories
 * 
 * Mapping Logic:
 * - Happy, Surprised → Positive (energetic, uplifted)
 * - Sad, Fearful, Disgusted → Negative (distressed, uncomfortable)
 * - Neutral → Neutral (baseline)
 * - Angry → Alert (high arousal, caution)
 */
export function mapEmotionToMood(emotion: Emotion): Mood {
  const moodMap: Record<Emotion, Mood> = {
    happy: 'positive',
    surprised: 'positive',
    sad: 'negative',
    fearful: 'negative',
    disgusted: 'negative',
    neutral: 'neutral',
    angry: 'alert',
  }
  return moodMap[emotion]
}

/**
 * Determines the dominant emotion from probability distribution
 * Returns the emotion with highest confidence and its associated mood
 */
export function getDominantEmotion(
  probabilities: EmotionProbabilities
): EmotionResult {
  const emotions: Emotion[] = [
    'happy',
    'sad',
    'neutral',
    'angry',
    'surprised',
    'fearful',
    'disgusted',
  ]

  let maxConfidence = 0
  let dominantEmotion: Emotion = 'neutral'

  for (const emotion of emotions) {
    const confidence = probabilities[emotion]
    if (confidence > maxConfidence) {
      maxConfidence = confidence
      dominantEmotion = emotion
    }
  }

  return {
    emotion: dominantEmotion,
    confidence: maxConfidence,
    mood: mapEmotionToMood(dominantEmotion),
    probabilities,
  }
}

/**
 * Applies temporal smoothing to emotion detection results
 * Reduces flickering by averaging across recent predictions
 */
export function smoothEmotionResult(
  current: EmotionResult,
  previous: EmotionResult | null,
  smoothingFactor: number = 0.7
): EmotionResult {
  if (!previous) {
    return current
  }

  // Smoothing factor: higher = more smoothing (less responsive)
  // Range: 0.3 (low), 0.7 (medium), 0.95 (high)
  const alpha = smoothingFactor

  const smoothedProbabilities: EmotionProbabilities = {
    happy: current.probabilities.happy * (1 - alpha) + previous.probabilities.happy * alpha,
    sad: current.probabilities.sad * (1 - alpha) + previous.probabilities.sad * alpha,
    neutral: current.probabilities.neutral * (1 - alpha) + previous.probabilities.neutral * alpha,
    angry: current.probabilities.angry * (1 - alpha) + previous.probabilities.angry * alpha,
    surprised: current.probabilities.surprised * (1 - alpha) + previous.probabilities.surprised * alpha,
    fearful: current.probabilities.fearful * (1 - alpha) + previous.probabilities.fearful * alpha,
    disgusted: current.probabilities.disgusted * (1 - alpha) + previous.probabilities.disgusted * alpha,
  }

  return getDominantEmotion(smoothedProbabilities)
}

/**
 * Formats confidence percentage for display (0-100)
 */
export function formatConfidence(confidence: number): number {
  return Math.round(confidence * 100)
}

/**
 * Gets display label for emotion with proper capitalization
 */
export function getEmotionLabel(emotion: Emotion): string {
  const labels: Record<Emotion, string> = {
    happy: 'Happy',
    sad: 'Sad',
    neutral: 'Neutral',
    angry: 'Angry',
    surprised: 'Surprised',
    fearful: 'Fearful',
    disgusted: 'Disgusted',
  }
  return labels[emotion]
}

/**
 * Gets display label for mood
 */
export function getMoodLabel(mood: Mood): string {
  const labels: Record<Mood, string> = {
    positive: 'Positive',
    negative: 'Negative',
    neutral: 'Neutral',
    alert: 'Alert',
  }
  return labels[mood]
}

/**
 * Gets color for emotion visualization
 */
export function getEmotionColor(emotion: Emotion): string {
  const colors: Record<Emotion, string> = {
    happy: '#10b981',      // Green
    sad: '#3b82f6',        // Blue
    neutral: '#6b7280',    // Gray
    angry: '#ef4444',      // Red
    surprised: '#f59e0b',  // Amber
    fearful: '#8b5cf6',    // Purple
    disgusted: '#ec4899',  // Pink
  }
  return colors[emotion]
}

/**
 * Gets color for mood visualization
 */
export function getMoodColor(mood: Mood): string {
  const colors: Record<Mood, string> = {
    positive: '#10b981',   // Green
    negative: '#3b82f6',   // Blue
    neutral: '#6b7280',    // Gray
    alert: '#ef4444',      // Red
  }
  return colors[mood]
}
