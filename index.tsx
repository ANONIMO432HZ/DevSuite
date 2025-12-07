import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { ApiKeyProvider } from './contexts/ApiKeyContext';

// TypeScript declaration to fix red lines in editor
declare global {
  interface Window {
    process: any;
  }
}

// Polyfill for process.env if it doesn't exist (prevents crash in browser)
const win = window as any;
if (typeof win.process === 'undefined') {
  win.process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <SettingsProvider>
          <ApiKeyProvider>
            <NavigationProvider>
              <HistoryProvider>
                <App />
              </HistoryProvider>
            </NavigationProvider>
          </ApiKeyProvider>
        </SettingsProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
);