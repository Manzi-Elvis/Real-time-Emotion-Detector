'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { EmotionResult, getEmotionColor, getEmotionLabel } from '@/lib/emotion-utils'

interface EmotionChartProps {
  emotionResult: EmotionResult | null
}

export default function EmotionChart({ emotionResult }: EmotionChartProps) {
  const chartData = useMemo(() => {
    if (!emotionResult) {
      return []
    }

    return [
      { name: 'Happy', value: Math.round(emotionResult.probabilities.happy * 100) },
      { name: 'Sad', value: Math.round(emotionResult.probabilities.sad * 100) },
      { name: 'Neutral', value: Math.round(emotionResult.probabilities.neutral * 100) },
      { name: 'Angry', value: Math.round(emotionResult.probabilities.angry * 100) },
      { name: 'Surprised', value: Math.round(emotionResult.probabilities.surprised * 100) },
      { name: 'Fearful', value: Math.round(emotionResult.probabilities.fearful * 100) },
      { name: 'Disgusted', value: Math.round(emotionResult.probabilities.disgusted * 100) },
    ]
  }, [emotionResult])

  const colors = useMemo(() => {
    return [
      getEmotionColor('happy'),
      getEmotionColor('sad'),
      getEmotionColor('neutral'),
      getEmotionColor('angry'),
      getEmotionColor('surprised'),
      getEmotionColor('fearful'),
      getEmotionColor('disgusted'),
    ]
  }, [])

  return (
    <div className="rounded-xl bg-card border border-border/40 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Emotion Probabilities</h3>

      {emotionResult ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              label={{ value: 'Confidence %', angle: -90, position: 'insideLeft', fill: 'var(--muted-foreground)' }}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border)' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              formatter={(value) => `${value}%`}
              cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
            />
            <Bar dataKey="value" fill="var(--accent)" isAnimationActive={true} animationDuration={500}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
          Emotion probabilities will appear here once a face is detected
        </div>
      )}
    </div>
  )
}
