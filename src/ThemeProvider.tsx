import React, { createContext, FC, useEffect, useMemo, useState } from "react"
import { ThemeProvider as BaseThemeProvider } from "styled-components"

import { darkTheme, lightTheme } from "./design/themes"
import { useLocalStorage } from "./hooks/useLocalStorage"

type ThemeType = "dark" | "light"

export interface IThemeContext {
  theme: ThemeType
  toggleTheme: () => void
}

interface IScopedDownChildren {
  children: JSX.Element
}

export const ThemeContext = createContext<IThemeContext | null>(null)

const ThemeProvider: FC<IScopedDownChildren> = ({ children }) => {
  // User's explicitly set theme
  const [localTheme, setLocalTheme] = useLocalStorage<ThemeType | "unset">(
    "theme",
    "unset"
  )

  // App's current theme
  const [theme, setTheme] = useState<ThemeType>(
    typeof document !== "undefined"
      ? (document.documentElement.style.getPropertyValue(
          "--initial-theme"
        ) as ThemeType)
      : "dark"
  )

  const themeObject = useMemo(
    () => (theme === "dark" ? darkTheme : lightTheme),
    [theme]
  )

  useEffect(() => {
    if (localTheme === "unset") {
      const prefersLightTheme = window.matchMedia(
        "(prefers-color-scheme: light)"
      )

      prefersLightTheme.onchange = ({ matches }) =>
        setTheme(matches ? "light" : "dark")

      return () => {
        prefersLightTheme.onchange = null
      }
    }
  }, [localTheme])

  const contextValue = useMemo(
    () => ({
      theme,

      toggleTheme: () => {
        const newTheme = theme === "light" ? "dark" : "light"
        setTheme(newTheme)
        setLocalTheme(newTheme)
      },
    }),
    [theme, setTheme, setLocalTheme]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <BaseThemeProvider theme={themeObject}>{children}</BaseThemeProvider>
    </ThemeContext.Provider>
  )
}

export { ThemeProvider }
