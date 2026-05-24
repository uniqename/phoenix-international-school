"use client";
import { useTheme } from "@/context/ThemeContext";

export function useThemeColors() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return {
    // Backgrounds
    bgPrimary: isDark ? "#0F0F1E" : "#FFFFFF",
    bgSecondary: isDark ? "#1A1A2E" : "#F9FAFB",
    bgHero: isDark ? "#0C0A1E" : "#FFFFFF",

    // Text
    textPrimary: isDark ? "#FFFFFF" : "#000000",
    textSecondary: isDark ? "#AAAAAA" : "#666666",
    textMuted: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",

    // Glass surfaces
    glassBg: isDark ? "rgba(22, 13, 48, 0.82)" : "rgba(255, 255, 255, 0.97)",
    glassBorder: isDark ? "rgba(255,255,255,0.12)" : "rgba(107, 33, 168, 0.18)",

    // Accents
    purple: "#A855F7",
    purpleMuted: isDark ? "rgba(147,51,234,0.3)" : "rgba(147,51,234,0.15)",
    gold: "#FFD700",

    // Borders
    border: isDark ? "rgba(255, 255, 255, 0.12)" : "#E5E7EB",

    // Forms
    inputBg: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.12)",
    inputBorder: isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)",
    inputText: isDark ? "#FFFFFF" : "#FFFFFF",
    inputPlaceholder: isDark ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.55)",

    // Labels/Help text
    labelColor: isDark ? "rgba(196,181,253,0.85)" : "rgba(147,51,234,0.95)",
    helpText: isDark ? "rgba(196,181,253,0.6)" : "rgba(147,51,234,0.8)",
  };
}
