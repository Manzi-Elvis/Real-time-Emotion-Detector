'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SmoothingLevel } from './detector'

interface DetectorSettings {
  showOverlay: boolean
  smoothingLevel: SmoothingLevel
  showAdvancedStats: boolean
  isDark: boolean
}

interface SettingsPanelProps {
  settings: DetectorSettings
  onSettingsChange: (settings: DetectorSettings) => void
}

export default function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = (key: keyof DetectorSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    })
  }

  const handleSmoothingChange = (level: SmoothingLevel) => {
    onSettingsChange({
      ...settings,
      smoothingLevel: level,
    })
  }

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-72 bg-card border border-border/40 rounded-lg shadow-lg z-50 backdrop-blur-sm">
            <div className="p-4 border-b border-border/40">
              <h3 className="font-semibold text-sm">Settings</h3>
            </div>

            <div className="p-4 space-y-6">
              {/* Overlay Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Detection Overlay</label>
                  <p className="text-xs text-muted-foreground mt-1">Show face bounding box</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showOverlay}
                    onChange={() => handleToggle('showOverlay')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                </label>
              </div>

              {/* Smoothing Level */}
              <div>
                <label className="text-sm font-medium block mb-3">Confidence Smoothing</label>
                <div className="space-y-2">
                  {['low', 'medium', 'high'].map((level) => (
                    <label key={level} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="smoothing"
                        value={level}
                        checked={settings.smoothingLevel === level}
                        onChange={() => handleSmoothingChange(level as SmoothingLevel)}
                        className="w-4 h-4 text-accent"
                      />
                      <span className="ml-3 text-sm capitalize">
                        {level}
                        <span className="text-muted-foreground ml-2">
                          {level === 'low' && '(responsive)'}
                          {level === 'medium' && '(balanced)'}
                          {level === 'high' && '(stable)'}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Higher smoothing reduces flickering but lags behind real emotion changes
                </p>
              </div>

              {/* Advanced Stats Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Raw Probabilities</label>
                  <p className="text-xs text-muted-foreground mt-1">Show emotion percentages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showAdvancedStats}
                    onChange={() => handleToggle('showAdvancedStats')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                </label>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div>
                  <label className="text-sm font-medium">Dark Mode</label>
                  <p className="text-xs text-muted-foreground mt-1">Toggle theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.isDark}
                    onChange={() => handleToggle('isDark')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                </label>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
