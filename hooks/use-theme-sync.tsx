"use client"

import { useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'

export function useThemeSync() {
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

    return () => {
      window.removeEventListener('message', handleThemeMessage)
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [theme, setTheme])

  return { theme, setTheme }
}
