'use client'

export default function PrivacySection() {
  return (
    <div className="space-y-6 border-t border-border/40 pt-8">
      {/* Privacy Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Badge 1: Local Processing */}
        <div className="rounded-lg bg-muted/50 border border-border/40 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm">All Processing Local</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Every computation happens in your browser. No requests to external servers.
              </p>
            </div>
          </div>
        </div>

        {/* Badge 2: No Recording */}
        <div className="rounded-lg bg-muted/50 border border-border/40 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm">No Recording</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Your camera feed is never saved, stored, or transmitted anywhere.
              </p>
            </div>
          </div>
        </div>

        {/* Badge 3: Zero Analytics */}
        <div className="rounded-lg bg-muted/50 border border-border/40 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Zero Analytics</h4>
              <p className="text-xs text-muted-foreground mt-1">
                No tracking cookies, no telemetry, no data collection. Period.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Privacy Explanation */}
      <div className="rounded-lg bg-card border border-border/40 p-6">
        <h3 className="font-semibold text-sm mb-4">How Your Privacy is Protected</h3>

        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-medium text-foreground mb-1">✓ Your camera data never leaves your device</h4>
            <p>
              All video processing, face detection, and emotion analysis happens entirely in your browser using TensorFlow.js. No video frames are sent anywhere.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-1">✓ No images saved or stored</h4>
            <p>
              Once emotion detection is complete, the data is immediately discarded from memory. We don't store screenshots, frames, or any visual data.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-1">✓ No third-party servers involved</h4>
            <p>
              Machine learning models are downloaded directly from a CDN on your first use. All computation stays local—no cloud processing.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-1">✓ No cookies or analytics</h4>
            <p>
              This application doesn't use cookies, tracking pixels, or analytics services. We have no insight into your usage patterns.
            </p>
          </div>
        </div>
      </div>

      {/* Important Disclaimers */}
      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-6">
        <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-200 mb-4">Important Disclaimers</h3>

        <div className="space-y-3 text-sm text-amber-800 dark:text-amber-300">
          <div>
            <strong>Not a medical diagnostic tool.</strong> This application is for entertainment and UI research only. It cannot diagnose emotional disorders, depression, anxiety, or any medical condition.
          </div>

          <div>
            <strong>Accuracy varies.</strong> Emotion detection accuracy depends on lighting conditions, camera angle, facial visibility, and cultural expression differences. Use results as entertainment, not fact.
          </div>

          <div>
            <strong>No personalized advice.</strong> Results should never be used to make decisions about mental health care. If you're struggling emotionally, please consult a healthcare professional.
          </div>

          <div>
            <strong>Model limitations.</strong> AI emotion detection is an approximation based on facial features. It cannot capture the full complexity of human emotion.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground border-t border-border/40 pt-6">
        <p>
          This app uses{' '}
          <a
            href="https://github.com/vladmandic/face-api"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            face-api.js
          </a>
          {' '}powered by TensorFlow.js for privacy-preserving on-device inference.
        </p>
      </div>
    </div>
  )
}
