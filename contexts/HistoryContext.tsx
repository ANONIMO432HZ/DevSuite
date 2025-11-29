
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HistoryItem } from '../types';
import { useSettings } from './SettingsContext';

interface HistoryContextType {
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  deleteItem: (id: string) => void;
  isOpen: boolean;
  toggleHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const STORAGE_KEY = 'devsuite_history';

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettings(); // Acceder a la configuración global

  // Cargar historial al inicio
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing history", e);
      }
    }
  }, []);

  // Guardar historial al cambiar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    // Usar el límite definido en settings (settings.historyLimit)
    setHistory(prev => [newItem, ...prev].slice(0, settings.historyLimit));
  }, [settings.historyLimit]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const deleteItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const toggleHistory = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory, deleteItem, isOpen, toggleHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
