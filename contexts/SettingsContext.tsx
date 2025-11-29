
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalculatorType } from '../types';

export interface Settings {
  // General / UI
  defaultTool: CalculatorType;
  compactMode: boolean;
  enableUnsavedWarning: boolean;
  
  // Workflow
  autoCopy: boolean; // Copiar automáticamente resultados al generarlos
  hexUpperCase: boolean; // 0xFF vs 0xff
  
  // Editor / Datos
  jsonIndent: 2 | 4;
  historyLimit: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetAllData: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'devsuite_settings';

const DEFAULT_SETTINGS: Settings = {
  defaultTool: CalculatorType.Welcome,
  compactMode: false,
  enableUnsavedWarning: false,
  autoCopy: false,
  hexUpperCase: true,
  jsonIndent: 2,
  historyLimit: 50,
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        } catch (e) {
          console.error("Error parsing settings", e);
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetAllData = () => {
    if (confirm("⚠️ ¿Estás seguro? Esto borrará TODO: Historial, Configuraciones y Caché. La aplicación se reiniciará.")) {
        localStorage.clear();
        // Intentar limpiar cachés de Service Worker si existen
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        window.location.reload();
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetAllData }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
