"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  // Broadcast theme changes to all windows
  useEffect(() => {
    const broadcastTheme = () => {
      // Broadcast to all other windows/tabs
      if (typeof window !== 'undefined') {
        window.postMessage({
          type: 'THEME_CHANGE',
          theme: theme
        }, '*')
      }
    }

    // Listen for theme changes from other windows
    const handleThemeMessage = (event: MessageEvent) => {
      if (event.data.type === 'THEME_CHANGE' && event.data.theme !== theme) {
        setTheme(event.data.theme)
        localStorage.setItem(storageKey, event.data.theme)
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

    // Broadcast initial theme
    broadcastTheme()

    return () => {
      window.removeEventListener('message', handleThemeMessage)
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
      
      // Broadcast theme change immediately
      if (typeof window !== 'undefined') {
        window.postMessage({
          type: 'THEME_CHANGE',
          theme: theme
        }, '*')
      }
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
