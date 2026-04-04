import { useState, useCallback } from 'react';

interface ColorValues {
  bg: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  buttonPrimaryBg: string;
  buttonPrimaryColor: string;
  buttonSecondaryColor: string;
  buttonSecondaryBorder: string;
  divider: string;
}

export function useThemeTransition(
  darkTheme: ColorValues,
  lightTheme: ColorValues,
  duration: number = 400
) {
  const [isDark, setIsDark] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsTransitioning(true);
    
    // Muda o tema imediatamente, mas a transição CSS cuida da animação
    setIsDark(prev => !prev);
    
    // Remove o estado de transição após a duração
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