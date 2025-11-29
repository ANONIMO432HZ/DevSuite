
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CalculatorType } from '../types';

type ThemeMode = 'light' | 'dark';
export type AccentPreset = 'lime' | 'purple' | 'blue' | 'rose' | 'orange' | 'tools' | 'custom';

export const TOOL_COLORS: Record<string, string> = {
  [CalculatorType.Welcome]: '#84cc16',
  [CalculatorType.AiAssistant]: '#6366f1',
  [CalculatorType.UnitConverter]: '#3b82f6',
  [CalculatorType.NumberBase]: '#a855f7',
  [CalculatorType.BitwiseCalculator]: '#14b8a6',
  [CalculatorType.NetworkTools]: '#22c55e',
  [CalculatorType.JSON]: '#eab308',
  [CalculatorType.HashGenerator]: '#ef4444',
  [CalculatorType.PaletteGenerator]: '#ec4899',
  [CalculatorType.UUIDGenerator]: '#8b5cf6',
  [CalculatorType.UnixTimestamp]: '#06b6d4',
  [CalculatorType.BMI]: '#f43f5e',
};

export const ACCENT_PRESETS: Record<string, { name: string, color: string }> = {
    tools: { name: 'Multicolor', color: 'tools' }, // First place
    lime: { name: 'Lima', color: '#84cc16' },
    purple: { name: 'Morado', color: '#a855f7' },
    blue: { name: 'Azul', color: '#3b82f6' },
    rose: { name: 'Rosa', color: '#f43f5e' },
    orange: { name: 'Naranja', color: '#f97316' },
};

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  accentPreset: AccentPreset;
  setAccentPreset: (preset: AccentPreset) => void;
  customAccentColor: string;
  setCustomAccentColor: (color: string) => void;
  effectiveAccentColor: string;
  setOverrideAccentColor: (color: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper para convertir HEX a RGB "r g b" para Tailwind
const hexToRgbString = (hex: string): string => {
    // Expandir shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '132 204 22'; // Default Lime fallback
    
    return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  // Default to 'tools' (Multicolor)
  const [accentPreset, setAccentPreset] = useState<AccentPreset>('tools');
  const [customAccentColor, setCustomAccentColor] = useState<string>('#6366f1'); // Default Indigo
  const [overrideAccentColor, setOverrideAccentColor] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme_mode') as ThemeMode;
    const storedAccent = localStorage.getItem('theme_accent') as AccentPreset;
    const storedCustomColor = localStorage.getItem('theme_custom_color');
    
    // Default to 'dark' if no storage, instead of system preference or light
    const initialTheme = storedTheme || 'dark';
    setThemeMode(initialTheme);
    
    if (storedAccent) {
      setAccentPreset(storedAccent);
    }
    if (storedCustomColor) {
        setCustomAccentColor(storedCustomColor);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeMode);
    localStorage.setItem('theme_mode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('theme_accent', accentPreset);
  }, [accentPreset]);

  useEffect(() => {
    localStorage.setItem('theme_custom_color', customAccentColor);
  }, [customAccentColor]);

  const effectiveAccentColor = useMemo(() => {
    if (overrideAccentColor) return overrideAccentColor;
    if (accentPreset === 'custom') return customAccentColor;
    if (accentPreset === 'tools') return ACCENT_PRESETS.lime.color; // Base fallback for tools if override fails
    
    return ACCENT_PRESETS[accentPreset]?.color || ACCENT_PRESETS.lime.color;
  }, [overrideAccentColor, accentPreset, customAccentColor]);
  
  useEffect(() => {
    // Si accentPreset es 'tools', el override se encarga.
    // Si no, convertimos el effectiveAccentColor a RGB y lo seteamos.
    // Ignoramos gradientes complejos, asumimos colores sólidos para la variable CSS principal.
    
    let colorToConvert = effectiveAccentColor;
    if (colorToConvert === 'tools') colorToConvert = '#84cc16'; // Fallback
    
    const rgbString = hexToRgbString(colorToConvert);
    document.documentElement.style.setProperty('--color-accent', rgbString);
  }, [effectiveAccentColor]);

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({
    themeMode,
    toggleTheme,
    accentPreset,
    setAccentPreset,
    customAccentColor,
    setCustomAccentColor,
    effectiveAccentColor,
    setOverrideAccentColor,
  }), [themeMode, accentPreset, customAccentColor, effectiveAccentColor]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
