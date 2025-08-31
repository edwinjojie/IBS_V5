"use client"

import { useEffect } from 'react'
import { useTheme } from './theme-provider'

export function ThemeSync() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Listen for theme changes from other windows
    const handleThemeMessage = (event: MessageEvent) => {
      if (event.data.type === 'THEME_CHANGE' && event.data.theme !== theme) {
        setTheme(event.data.theme)
      }
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newTheme = e.matches ? 'dark' : 'light'
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(newTheme)
      }
    }

    // Set up event listeners
    window.addEventListener('message', handleThemeMessage)
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    // Broadcast current theme to other windows
    const broadcastTheme = () => {
      window.postMessage({
        type: 'THEME_CHANGE',
        theme: theme
      }, '*')
    }

    // Broadcast theme on mount
    broadcastTheme()

    return () => {
      window.removeEventListener('message', handleThemeMessage)
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [theme, setTheme])

  // This component doesn't render anything, it just handles theme synchronization
  return null
}
