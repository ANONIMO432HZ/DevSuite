
import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CalculatorType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 mt-4 first:mt-0 px-1">
        {children}
    </h4>
);

const SettingRow: React.FC<{ 
    label: string; 
    desc?: string; 
    children: React.ReactNode 
}> = ({ label, desc, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
        <div className="flex flex-col pr-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
            {desc && <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</span>}
        </div>
        <div className="flex-shrink-0">
            {children}
        </div>
    </div>
);

const Switch: React.FC<{ checked: boolean; onChange: (val: boolean) => void }> = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`${
        checked ? 'bg-accent' : 'bg-slate-200 dark:bg-slate-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-slate-800`}
        role="switch"
        aria-checked={checked}
    >
        <span
        aria-hidden="true"
        className={`${
            checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSetting, resetAllData } = useSettings();
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-500/75 dark:bg-black/80 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-slate-200 dark:border-slate-700">
          
          <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-bold text-slate-800 dark:text-white" id="modal-title">
              {t('settings.title')}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            
            {/* --- INTERFAZ --- */}
            <SectionTitle>{t('settings.general')}</SectionTitle>
            
            <SettingRow 
                label={t('settings.language')} 
            >
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    <button 
                        onClick={() => setLanguage('es')}
                        className={`px-3 py-1 text-xs font-bold rounded ${language === 'es' ? 'bg-white dark:bg-slate-600 shadow text-accent' : 'text-slate-500'}`}
                    >
                        Español
                    </button>
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-white dark:bg-slate-600 shadow text-accent' : 'text-slate-500'}`}
                    >
                        English
                    </button>
                </div>
            </SettingRow>

            <SettingRow 
                label={t('settings.defaultTool')}
            >
                <select 
                    value={settings.defaultTool}
                    onChange={(e) => updateSetting('defaultTool', e.target.value as CalculatorType)}
                    className="bg-slate-100 dark:bg-slate-700 border-none text-sm rounded-md py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-accent text-slate-700 dark:text-slate-200"
                >
                    <option value={CalculatorType.Welcome}>{t('menu.welcome')}</option>
                    <option value={CalculatorType.UnitConverter}>{t('menu.unitConverter')}</option>
                    <option value={CalculatorType.NumberBase}>{t('menu.numberBase')}</option>
                    <option value={CalculatorType.JSON}>{t('menu.json')}</option>
                    <option value={CalculatorType.HashGenerator}>{t('menu.hashGenerator')}</option>
                    <option value={CalculatorType.BitwiseCalculator}>{t('menu.bitwiseCalculator')}</option>
                </select>
            </SettingRow>

            <SettingRow 
                label={t('settings.compactMode')}
            >
                <Switch checked={settings.compactMode} onChange={(v) => updateSetting('compactMode', v)} />
            </SettingRow>

            <SettingRow 
                label={t('settings.protect')}
            >
                <Switch checked={settings.enableUnsavedWarning} onChange={(v) => updateSetting('enableUnsavedWarning', v)} />
            </SettingRow>


            {/* --- FORMATOS Y DATOS --- */}
            <SectionTitle>{t('settings.formats')}</SectionTitle>

            <SettingRow 
                label={t('settings.hexUpper')}
            >
                <Switch checked={settings.hexUpperCase} onChange={(v) => updateSetting('hexUpperCase', v)} />
            </SettingRow>

            <SettingRow 
                label={t('settings.jsonIndent')}
            >
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    <button 
                        onClick={() => updateSetting('jsonIndent', 2)}
                        className={`px-3 py-1 text-xs font-bold rounded ${settings.jsonIndent === 2 ? 'bg-white dark:bg-slate-600 shadow text-accent' : 'text-slate-500'}`}
                    >
                        2 Sp
                    </button>
                    <button 
                        onClick={() => updateSetting('jsonIndent', 4)}
                        className={`px-3 py-1 text-xs font-bold rounded ${settings.jsonIndent === 4 ? 'bg-white dark:bg-slate-600 shadow text-accent' : 'text-slate-500'}`}
                    >
                        4 Sp
                    </button>
                </div>
            </SettingRow>

            <SettingRow 
                label={t('settings.historyLimit')}
            >
                <input 
                    type="number" 
                    min="10" 
                    max="500" 
                    value={settings.historyLimit}
                    onChange={(e) => updateSetting('historyLimit', Math.max(10, parseInt(e.target.value) || 10))}
                    className="w-20 bg-slate-100 dark:bg-slate-700 border-none rounded-md py-1 px-2 text-center text-sm font-mono focus:ring-2 focus:ring-accent"
                />
            </SettingRow>

            {/* --- ZONA DE PELIGRO --- */}
            <SectionTitle>{t('settings.danger')}</SectionTitle>
            
            <div className="mt-2 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                <button
                    onClick={resetAllData}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 font-semibold py-2 px-4 rounded-md transition-colors text-sm"
                >
                    <TrashIcon className="w-4 h-4" /> {t('settings.reset')}
                </button>
            </div>

          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-accent text-base font-bold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:text-sm transition-all"
              onClick={onClose}
            >
              {t('settings.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
