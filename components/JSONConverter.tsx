
import React, { useState, useCallback, useRef } from 'react';
import TextareaGroup from './TextareaGroup';
import * as yaml from 'js-yaml';
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

type DataFormat = 'json' | 'yaml' | 'toml';

// ... Icons (Keep same) ...
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const MagicIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>);

const PRESETS = [
    { id: 'package', label: 'JSON: package.json', format: 'json' as DataFormat, content: `{\n  "name": "project",\n  "version": "1.0.0"\n}` },
    { id: 'docker', label: 'YAML: docker-compose', format: 'yaml' as DataFormat, content: `version: '3'\nservices:\n  web:\n    image: nginx` },
    { id: 'cargo', label: 'TOML: Cargo.toml', format: 'toml' as DataFormat, content: `[package]\nname = "my-crate"` }
];

const parseInput = (input: string): { data: any, format: DataFormat } => {
    input = input.trim();
    if (!input) throw new Error("Empty input");
    try { return { data: JSON.parse(input), format: 'json' }; } catch {}
    try { const data = yaml.load(input); if(typeof data === 'object' && data !== null) return { data, format: 'yaml' }; } catch {}
    try { return { data: parseToml(input), format: 'toml' }; } catch {}
    throw new Error("Invalid format");
};

const JSONConverter: React.FC = () => {
  const { t } = useLanguage();
  const [inputData, setInputData] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState('config');
  const [detectedFormat, setDetectedFormat] = useState<DataFormat | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings } = useSettings();

  useUnsavedChanges(inputData.trim().length > 0);

  const stringifyData = useCallback((data: any, format: DataFormat): string => {
    switch (format) {
        case 'json': return JSON.stringify(data, null, settings.jsonIndent);
        case 'yaml': return yaml.dump(data);
        case 'toml': try { return stringifyToml(data); } catch (e) { throw new Error((e as Error).message); }
        default: return "";
    }
  }, [settings.jsonIndent]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputData(e.target.value); setError(null); setSuccessMsg(null); setDetectedFormat(null);
  }, []);

  const handleConvert = useCallback((targetFormat: DataFormat) => {
    const trimmedInput = inputData.trim();
    if (!trimmedInput) return;
    try {
      const { data, format } = parseInput(trimmedInput);
      setDetectedFormat(format);
      const output = stringifyData(data, targetFormat);
      setInputData(output); setError(null);
    } catch (e: any) { setError(t('json.error.parse')); }
  }, [inputData, stringifyData, t]);

  const handleUnescape = useCallback(() => {
    const trimmedInput = inputData.trim();
    if (!trimmedInput) return;
    try {
        const firstPass = JSON.parse(trimmedInput);
        if (typeof firstPass === 'string' || typeof firstPass === 'object') {
             setInputData(typeof firstPass === 'string' ? firstPass : JSON.stringify(firstPass, null, settings.jsonIndent));
             setError(null); setDetectedFormat('json');
        }
    } catch (e) { setError(t('json.error.parse')); }
  }, [inputData, settings.jsonIndent, t]);

  const clearAll = useCallback(() => {
    setInputData(''); setError(null); setSuccessMsg(null); setFileName('config'); setDetectedFormat(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    const ext = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setInputData(content); setError(null);
        if (ext === 'json') setDetectedFormat('json');
        else if (ext === 'yaml' || ext === 'yml') setDetectedFormat('yaml');
        else if (ext === 'toml') setDetectedFormat('toml');
        else try { setDetectedFormat(parseInput(content).format); } catch { setDetectedFormat(null); }
      } catch { setError(t('json.error.parse')); }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const handleExportClick = () => {
    if (!inputData.trim()) { setError(t('json.error.empty')); return; }
    try {
        const { format } = parseInput(inputData);
        let ext = format === 'yaml' ? 'yaml' : format === 'toml' ? 'toml' : 'json';
        let mime = format === 'yaml' ? 'text/yaml' : format === 'toml' ? 'application/toml' : 'application/json';
        const blob = new Blob([inputData], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${fileName.trim() || 'config'}.${ext}`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        setError(null);
    } catch (err: any) { setError(t('json.error.parse')); }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const p = PRESETS.find(p => p.id === e.target.value);
      if (p) { setInputData(p.content); setFileName(p.id); setDetectedFormat(p.format); setError(null); }
      e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json,.yaml,.yml,.toml,.txt" className="hidden" />

      <div className="flex flex-col xl:flex-row gap-4 justify-between items-end xl:items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
         <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2 px-4 rounded-md transition-colors border border-slate-300 dark:border-slate-600 shadow-sm text-sm">
                <UploadIcon className="w-5 h-5" /> <span className="hidden sm:inline">{t('json.importBtn')}</span>
            </button>
            <div className="relative">
                <select onChange={handlePresetChange} defaultValue="" className="appearance-none cursor-pointer bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 py-2 pl-3 pr-8 rounded-md hover:bg-slate-50 transition-colors shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                    <option value="" disabled>{t('json.loadExample')}</option>
                    {PRESETS.map(preset => (<option key={preset.id} value={preset.id}>{preset.label}</option>))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500"><ChevronDownIcon className="w-4 h-4" /></div>
            </div>
            <div className="flex items-center relative flex-grow md:flex-grow-0">
                <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder={t('json.fileName')} className="w-full md:w-32 lg:w-40 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-l-md py-2 px-3 focus:ring-2 focus:ring-accent outline-none transition text-sm"/>
                <button onClick={handleExportClick} disabled={!inputData.trim()} className="bg-accent hover:opacity-90 text-white py-2 px-3 rounded-r-md transition-colors shadow-sm disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center">
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end w-full xl:w-auto items-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mr-1 hidden xl:inline">{t('json.convertPrefix')}</span>
            <div className="flex bg-slate-200 dark:bg-slate-700 rounded-md p-1 gap-1">
                {['json', 'yaml', 'toml'].map(fmt => (
                    <button key={fmt} onClick={() => handleConvert(fmt as DataFormat)} disabled={!inputData.trim()} className="px-3 py-1.5 text-sm font-medium rounded bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm hover:text-accent disabled:opacity-50 transition-all">
                        {fmt.toUpperCase()}
                    </button>
                ))}
            </div>
            <button onClick={handleUnescape} disabled={!inputData.trim()} className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md hover:bg-amber-200 transition-colors disabled:opacity-50"><MagicIcon className="w-5 h-5" /></button>
            <button onClick={clearAll} className="px-3 py-2 text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-md transition-colors">{t('action.clear')}</button>
        </div>
      </div>

      <div className="relative">
        {detectedFormat && (
            <div className="absolute top-0 right-0 transform -translate-y-full mb-1 mr-1">
                <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-t-md border-b-0">
                    {t('json.detected')}: {detectedFormat.toUpperCase()}
                </span>
            </div>
        )}
        <TextareaGroup id="data-editor" label={t('json.editorLabel')} value={inputData} onChange={handleInputChange} placeholder="..." error={error} rows={18}/>
      </div>
    </div>
  );
};

export default JSONConverter;