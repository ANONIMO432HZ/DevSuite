
import React, { useState, useEffect, useRef } from 'react';
import { useTheme, ACCENT_PRESETS, AccentPreset } from '../contexts/ThemeContext';
import { useHistory } from '../contexts/HistoryContext';
import { useLanguage } from '../contexts/LanguageContext';
import SettingsModal from './SettingsModal';

const CodeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>);
const SunIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /> </svg> );
const MoonIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /> </svg> );
const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const CogIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> </svg> );
const PaletteIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> );
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> </svg> );

const Header: React.FC = () => {
  const { themeMode, toggleTheme, accentPreset, setAccentPreset, customAccentColor, setCustomAccentColor } = useTheme();
  const { toggleHistory, history } = useHistory();
  const { t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomAccentColor(color);
    if (accentPreset !== 'custom') {
        setAccentPreset('custom');
    }
  };

  return (
    <header className="relative py-6 text-center z-40">
        <div className="flex flex-col items-center justify-center">
             <div className="inline-flex items-center gap-3">
                <CodeIcon className="w-10 h-10 text-accent transition-colors duration-300"/>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Dev<span className="text-accent transition-colors duration-300">Suite</span>
                </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{t('app.subtitle')}</p>
        </div>
      
       <div className="absolute top-4 right-4 sm:top-1/2 sm:-translate-y-1/2 sm:right-8 flex items-center gap-2 sm:gap-3">
            <button
                onClick={toggleHistory}
                className="relative p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-accent transition-all"
                aria-label={t('header.history')}
                title={t('header.history')}
            >
                <HistoryIcon className="w-6 h-6" />
                {history.length > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                    {history.length > 9 ? '9+' : history.length}
                  </span>
                )}
            </button>

            <div className="relative" ref={colorPickerRef}>
                <button
                    onClick={() => setIsColorPickerOpen(p => !p)}
                    className={`p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 ${
                        isColorPickerOpen 
                        ? 'bg-slate-300 dark:bg-slate-600 ring-2 ring-accent text-accent' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 focus:ring-accent'
                    }`}
                    aria-label={t('header.color')}
                    title={t('header.color')}
                >
                    <PaletteIcon className={`w-6 h-6 transition-colors duration-300 ${isColorPickerOpen ? 'text-accent' : 'text-accent'}`} />
                </button>
                {isColorPickerOpen && (
                    <div className="absolute top-full right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-3 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 p-3 animate-fadeIn cursor-default">
                        {/* Flecha decorativa */}
                        <div className="absolute -top-1.5 right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-t border-l border-slate-200 dark:border-slate-700 transform rotate-45"></div>
                        
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-wider px-1">Presets</p>
                            <div className="grid grid-cols-6 gap-2 mb-4">
                                {Object.entries(ACCENT_PRESETS).map(([key, { color }]) => (
                                    <button
                                        key={key}
                                        onClick={() => { setAccentPreset(key as AccentPreset); }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ring-2 transition-all shadow-sm ${
                                            accentPreset === key 
                                            ? `ring-offset-2 dark:ring-offset-slate-800 scale-110 ${key === 'tools' ? 'ring-slate-400 dark:ring-slate-500' : 'ring-accent'}` 
                                            : 'ring-transparent hover:scale-110'
                                        }`}
                                        style={{ background: color === 'tools' ? 'linear-gradient(to right, #84cc16, #3b82f6, #ef4444)' : color }}
                                        title={key}
                                    >
                                        {accentPreset === key && <CheckIcon className="w-4 h-4 text-white drop-shadow-md" />}
                                    </button>
                                ))}
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-wider px-1">Personalizado</p>
                                <div className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${accentPreset === 'custom' ? 'border-accent bg-slate-50 dark:bg-slate-900 ring-1 ring-accent' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-600">
                                        <input 
                                            type="color" 
                                            value={customAccentColor} 
                                            onChange={handleCustomColorChange}
                                            className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer" 
                                        />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={customAccentColor} 
                                        onChange={handleCustomColorChange}
                                        className="w-full bg-transparent border-none text-xs font-mono text-slate-700 dark:text-slate-200 focus:ring-0 uppercase p-0"
                                        placeholder="#000000"
                                    />
                                    {accentPreset === 'custom' && <CheckIcon className="w-4 h-4 text-accent" />}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-accent transition-all"
                aria-label={t('header.theme')}
                title={t('header.theme')}
            >
                {themeMode === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>

            <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-accent transition-all"
                aria-label={t('header.settings')}
                title={t('header.settings')}
            >
                <CogIcon className="w-6 h-6" />
            </button>
        </div>

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};

export default Header;
