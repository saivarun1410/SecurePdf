"use client";

import { useCallback, useEffect, useState } from "react";

export type ColorTheme = "light" | "dark";

const THEME_KEY = "realsecurepdf:theme";

function preferredTheme(): ColorTheme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ColorTheme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState<ColorTheme>("light");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const initial = preferredTheme();
      setTheme(initial);
      applyTheme(initial);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
