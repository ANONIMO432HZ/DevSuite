
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  isDirty: boolean;
  setIsDirty: (value: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDirty, setIsDirty] = useState(false);

  return (
    <NavigationContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
