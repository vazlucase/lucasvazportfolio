import { useState, useCallback } from 'react';

interface ColorValues {
  bg: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  divider: string;
}

export function useThemeTransition(
  darkTheme: ColorValues,
  lightTheme: ColorValues,
  duration: number = 400,
  initialDark: boolean = true,
) {
  const [isDark, setIsDark] = useState(initialDark);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsTransitioning(true);
    setIsDark((prev) => !prev);

    setTimeout(() => {
      setIsTransitioning(false);
    }, duration);
  }, [duration]);

  const currentColors = isDark ? darkTheme : lightTheme;

  return {
    isDark,
    toggleTheme,
    currentColors,
    isTransitioning,
  };
}
