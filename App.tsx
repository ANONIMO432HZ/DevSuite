
import React, { useState, useCallback, useEffect } from 'react';
import { CalculatorType } from './types';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Welcome from './components/Welcome';
import NumberBaseConverter from './components/NumberBaseConverter';
import BitwiseCalculator from './components/BitwiseCalculator';
import JSONConverter from './components/JSONConverter';
import HashGenerator from './components/HashGenerator';
import UUIDGenerator from './components/UUIDGenerator';
import UnixTimestampConverter from './components/UnixTimestampConverter';
import UnitConverter from './components/UnitConverter';
import PaletteGenerator from './components/PaletteGenerator';
import NetworkTools from './components/NetworkTools';
import AiAssistant from './components/AiAssistant';
import Footer from './components/Footer';
import InstallButton from './components/InstallButton';
import { HistoryProvider } from './contexts/HistoryContext';
import HistoryDrawer from './components/HistoryDrawer';
import { useNavigation } from './contexts/NavigationContext';
import { useSettings } from './contexts/SettingsContext';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme, TOOL_COLORS } from './contexts/ThemeContext';

const App: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType | null>(null);
  const { isDirty, setIsDirty } = useNavigation();
  const { settings } = useSettings();
  const { t } = useLanguage(); 
  const { accentPreset, setOverrideAccentColor } = useTheme();

  const MAIN_TABS = [
    { id: CalculatorType.Welcome, label: t('menu.welcome') },
    { id: CalculatorType.AiAssistant, label: t('menu.aiAssistant') },
    { id: CalculatorType.UnitConverter, label: t('menu.unitConverter') },
    { id: CalculatorType.NumberBase, label: t('menu.numberBase') },
    { id: CalculatorType.BitwiseCalculator, label: t('menu.bitwiseCalculator') },
    { id: CalculatorType.NetworkTools, label: t('menu.networkTools') },
    { id: CalculatorType.JSON, label: t('menu.json') },
    { id: CalculatorType.HashGenerator, label: t('menu.hashGenerator') },
    { id: CalculatorType.PaletteGenerator, label: t('menu.paletteGenerator') },
    { id: CalculatorType.UUIDGenerator, label: t('menu.uuidGenerator') },
    { id: CalculatorType.UnixTimestamp, label: t('menu.unixTimestamp') },
  ];

  useEffect(() => {
    if (accentPreset === 'tools' && activeCalculator) {
      setOverrideAccentColor(TOOL_COLORS[activeCalculator] || null);
    } else {
      setOverrideAccentColor(null);
    }
  }, [activeCalculator, accentPreset, setOverrideAccentColor]);

  useEffect(() => {
    const handleNavigation = () => {
      const params = new URLSearchParams(window.location.search);
      const tool = params.get('tool');
      const isValidTool = tool && Object.values(CalculatorType).includes(tool as CalculatorType);
      
      const startupTool = settings.defaultTool || CalculatorType.Welcome;

      setActiveCalculator(isValidTool ? (tool as CalculatorType) : startupTool);
    };

    handleNavigation();
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, [settings.defaultTool]);

  const handleTabChange = useCallback((tab: CalculatorType) => {
    if (tab === activeCalculator) return;
    if (settings.enableUnsavedWarning && isDirty) {
        if (!window.confirm("Hay cambios sin guardar. ¿Seguro que quieres salir?")) return;
        setIsDirty(false);
    }
    setActiveCalculator(tab);
    window.history.pushState({}, '', tab === CalculatorType.Welcome ? '/' : `?tool=${tab}`);
  }, [activeCalculator, isDirty, setIsDirty, settings.enableUnsavedWarning]);

  if (!activeCalculator) return null;

  return (
    <HistoryProvider>
      <div className="flex flex-col min-h-screen font-sans">
        <Header />
        <HistoryDrawer />
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
            <Tabs 
                tabs={MAIN_TABS} 
                activeTab={activeCalculator} 
                onTabChange={handleTabChange} 
            />
            <div className={`${settings.compactMode ? 'p-4' : 'p-6 md:p-8'}`}>
              {activeCalculator === CalculatorType.Welcome && <Welcome onNavigate={handleTabChange} />}
              {activeCalculator === CalculatorType.AiAssistant && <AiAssistant />}
              {activeCalculator === CalculatorType.UnitConverter && <UnitConverter />}
              {activeCalculator === CalculatorType.NumberBase && <NumberBaseConverter />}
              {activeCalculator === CalculatorType.BitwiseCalculator && <BitwiseCalculator />}
              {activeCalculator === CalculatorType.NetworkTools && <NetworkTools />}
              {activeCalculator === CalculatorType.JSON && <JSONConverter />}
              {activeCalculator === CalculatorType.HashGenerator && <HashGenerator />}
              {activeCalculator === CalculatorType.PaletteGenerator && <PaletteGenerator />}
              {activeCalculator === CalculatorType.UUIDGenerator && <UUIDGenerator />}
              {activeCalculator === CalculatorType.UnixTimestamp && <UnixTimestampConverter />}
            </div>
          </div>
        </main>
        <Footer />
        <InstallButton />
      </div>
    </HistoryProvider>
  );
};

export default App;
