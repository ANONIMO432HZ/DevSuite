
import React, { useState, useCallback, useEffect } from 'react';
import TextareaGroup from './TextareaGroup';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useHistory } from '../contexts/HistoryContext';
import { useLanguage } from '../contexts/LanguageContext';

type ToolMode = 'url' | 'html' | 'rot13';
type Action = 'encode' | 'decode';

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

const TextTools: React.FC = () => {
  const [mode, setMode] = useState<ToolMode>('url');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [action, setAction] = useState<Action>('encode');
  const [error, setError] = useState<string | null>(null);
  
  const { addToHistory } = useHistory();
  const { t } = useLanguage();

  useUnsavedChanges(input.length > 0);

  const processText = useCallback(() => {
    setError(null);
    if (!input) { setOutput(''); return; }

    try {
        let result = '';
        switch (mode) {
            case 'url':
                result = action === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input.replace(/\+/g, ' '));
                break;
            case 'html':
                if (action === 'encode') {
                    // Browser native safe encoding
                    result = new Option(input).innerHTML;
                } else {
                    // Browser native safe decoding
                    const doc = new DOMParser().parseFromString(input, 'text/html');
                    result = doc.documentElement.textContent || '';
                }
                break;
            case 'rot13':
                result = input.replace(/[a-zA-Z]/g, (c) => {
                    const base = c <= 'Z' ? 90 : 122;
                    return String.fromCharCode(base >= (c.charCodeAt(0) + 13) ? c.charCodeAt(0) + 13 : c.charCodeAt(0) + 13 - 26);
                });
                break;
        }
        setOutput(result);
    } catch (e) {
        setOutput('');
        setError("Error al procesar el texto.");
    }
  }, [input, mode, action]);

  useEffect(() => { processText(); }, [processText]);

  const handleClear = useCallback(() => { setInput(''); setOutput(''); setError(null); }, []);

  const handleSave = () => {
      if (!input || !output) return;
      addToHistory({
          tool: t('menu.numberBase'), // As part of Base & Encoding
          details: `${t(getModeLabelKey(mode))} (${action === 'encode' ? 'Enc' : 'Dec'})`,
          input: input,
          output: output
      });
  };

  const getModeLabelKey = (m: ToolMode) => {
      switch(m) {
          case 'url': return 'text.mode.url';
          case 'html': return 'text.mode.html';
          case 'rot13': return 'text.mode.rot13';
      }
  };

  return (
    <div className="space-y-6">
      
      {/* Selector de Herramienta */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm overflow-x-auto w-full sm:w-auto">
            {(['url', 'html', 'rot13'] as ToolMode[]).map((m) => (
                <button
                    key={m}
                    onClick={() => { setMode(m); if(m==='rot13') setAction('encode'); }}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                        mode === m 
                        ? 'bg-accent text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    {t(getModeLabelKey(m))}
                </button>
            ))}
          </div>

          {mode !== 'rot13' && (
              <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setAction('encode')}
                    className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${action === 'encode' ? 'bg-white dark:bg-slate-600 text-accent shadow' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                      {t('text.action.encode')}
                  </button>
                  <button
                    onClick={() => setAction('decode')}
                    className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${action === 'decode' ? 'bg-white dark:bg-slate-600 text-accent shadow' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                      {t('text.action.decode')}
                  </button>
              </div>
          )}
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          <TextareaGroup id="input-text" label={t('text.label.input')} value={input} onChange={(e) => setInput(e.target.value)} placeholder="..." rows={12}/>
          <TextareaGroup id="output-text" label={t('text.label.result')} value={output} onChange={() => {}} placeholder="..." error={error} rows={12} disabled={true}/>
        </div>
        
        <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-accent">
                <ArrowRightIcon className="w-6 h-6" />
            </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-4">
        <button onClick={handleSave} disabled={!output} className="bg-accent hover:opacity-90 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
          {t('action.save')}
        </button>
        <button onClick={handleClear} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-6 rounded-md transition-colors duration-200">
          {t('action.clear')}
        </button>
      </div>
    </div>
  );
};

export default TextTools;