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
  // Fix: Only access localStorage on the client
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme || "light";
    }
    return defaultTheme || "light";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Broadcast theme changes to all windows
  useEffect(() => {
    if (typeof window === "undefined") return;

    const broadcastTheme = () => {
      window.postMessage({
        type: "THEME_CHANGE",
        theme: theme,
      }, "*");
    };

    const handleThemeMessage = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === "THEME_CHANGE" &&
        event.data.theme !== theme
      ) {
        setTheme(event.data.theme);
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, event.data.theme);
        }
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const newTheme = e.matches ? "dark" : "light";
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
      }
    };

    window.addEventListener("message", handleThemeMessage);
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    broadcastTheme();

    return () => {
      window.removeEventListener("message", handleThemeMessage);
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, newTheme);
        window.postMessage(
          {
            type: "THEME_CHANGE",
            theme: newTheme,
          },
          "*"
        );
      }
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
