
import React, { useState, useCallback, useEffect } from 'react';
import InputGroup from './InputGroup';
import TextareaGroup from './TextareaGroup';
import { useHistory } from '../contexts/HistoryContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useLanguage } from '../contexts/LanguageContext';

type UUIDVersion = 'v1' | 'v4' | 'v7';
type Mode = 'generate' | 'analyze';

const TrashIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);

const EXAMPLES = { v1: "2c1d4e80-3e21-11ee-be56-0242ac120002", v4: "f47ac10b-58cc-4372-a567-0e02b2c3d479", v7: "0189c8a0-2c1b-7fcd-a123-456789abcdef" };

const generateV4 = (): string => crypto.randomUUID();
const generateV1 = (): string => {
  const node = crypto.getRandomValues(new Uint8Array(6));
  const clockseq = crypto.getRandomValues(new Uint8Array(2)); clockseq[0] = (clockseq[0] & 0x3f) | 0x80;
  const msecs = Date.now() + 12219292800000;
  const timestamp = msecs * 10000;
  const timeLow = timestamp & 0xffffffff;
  const timeMid = (timestamp >> 32) & 0xffff;
  const timeHiAndVersion = ((timestamp >> 48) & 0x0fff) | 0x1000;
  const toHex = (byte: number) => byte.toString(16).padStart(2, '0');
  const parts = [(timeLow >>> 0).toString(16).padStart(8, '0'), timeMid.toString(16).padStart(4, '0'), timeHiAndVersion.toString(16).padStart(4, '0'), toHex(clockseq[0]) + toHex(clockseq[1]), Array.from(node).map(toHex).join('')];
  return parts.join('-');
};
const generateV7 = (): string => {
  const timestamp = Date.now(); const hexTs = timestamp.toString(16).padStart(12, '0');
  const randomValues = crypto.getRandomValues(new Uint8Array(10));
  const toHex = (byte: number) => byte.toString(16).padStart(2, '0'); const randHex = Array.from(randomValues).map(toHex).join('');
  const part1 = hexTs.substring(0, 8); const part2 = hexTs.substring(8, 12); const part3 = '7' + randHex.substring(0, 3);
  const variantByte = (parseInt(randHex.substring(3, 5), 16) & 0x3f) | 0x80; const part4 = variantByte.toString(16) + randHex.substring(5, 7); const part5 = randHex.substring(7, 19);
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
};

const UUIDGenerator: React.FC = () => {
  const { addToHistory } = useHistory();
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('generate');
  const [version, setVersion] = useState<UUIDVersion>('v4');
  const [quantity, setQuantity] = useState<number>(1);
  const [generatedList, setGeneratedList] = useState<string[]>([]);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);
  const [braces, setBraces] = useState(false);
  const [analysisInput, setAnalysisInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{valid: boolean, version?: string, variant?: string, date?: string, msg?: string} | null>(null);

  useUnsavedChanges(mode === 'analyze' && analysisInput.length > 0);

  const formatUUID = useCallback((uuid: string) => {
    let formatted = uuid; if (noDashes) formatted = formatted.replace(/-/g, ''); if (uppercase) formatted = formatted.toUpperCase(); if (braces) formatted = `{${formatted}}`;
    return formatted;
  }, [noDashes, uppercase, braces]);

  const handleGenerate = useCallback(() => {
    const newList: string[] = [];
    for (let i = 0; i < quantity; i++) { let uuid = ''; if (version === 'v1') uuid = generateV1(); else if (version === 'v7') uuid = generateV7(); else uuid = generateV4(); newList.push(uuid); }
    setGeneratedList(newList);
    const outputPreview = newList.map(u => formatUUID(u)).join('\n');
    addToHistory({ tool: `${t('menu.uuidGenerator')} (${version.toUpperCase()})`, details: `Qty: ${quantity}`, input: 'Random Gen', output: outputPreview.length > 100 ? outputPreview.substring(0, 100) + '...' : outputPreview });
  }, [quantity, version, addToHistory, formatUUID, noDashes, uppercase, t]);

  const handleClear = useCallback(() => { setGeneratedList([]); }, []);

  const analyzeUUID = useCallback((input: string) => {
      const cleanInput = input.trim().replace(/[{}]/g, '');
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const hasDashes = cleanInput.includes('-'); let normalized = cleanInput;
      if (!hasDashes) { if (cleanInput.length !== 32 || !/^[0-9a-f]+$/i.test(cleanInput)) { setAnalysisResult({ valid: false, msg: 'Invalid Length/Chars' }); return; } normalized = `${cleanInput.substring(0,8)}-${cleanInput.substring(8,12)}-${cleanInput.substring(12,16)}-${cleanInput.substring(16,20)}-${cleanInput.substring(20)}`; }
      if (!uuidRegex.test(normalized)) { if (!(normalized.length === 36 && normalized.split('-').length === 5)) { setAnalysisResult({ valid: false, msg: 'Invalid Format' }); return; } }
      const verChar = normalized.charAt(14); const varChar = normalized.charAt(19); let dateData = 'N/A (Random)';
      if (verChar === '1') { const parts = normalized.split('-'); const hexTimestamp = parts[2].substring(1) + parts[1] + parts[0]; const ticks = parseInt(hexTimestamp, 16); const msecs = (ticks / 10000) - 12219292800000; if (!isNaN(msecs)) dateData = new Date(msecs).toLocaleString(); }
      else if (verChar === '7') { const parts = normalized.split('-'); const hexTs = parts[0] + parts[1]; const msecs = parseInt(hexTs, 16); if (!isNaN(msecs)) dateData = new Date(msecs).toLocaleString(); }
      setAnalysisResult({ valid: true, version: `Version ${verChar}`, variant: `RFC 4122 (Var ${varChar})`, date: dateData, msg: 'Valid UUID' });
  }, []);

  useEffect(() => { if (analysisInput) analyzeUUID(analysisInput); else setAnalysisResult(null); }, [analysisInput, analyzeUUID]);

  const copyBulk = (format: 'text' | 'json' | 'csv') => { if (generatedList.length === 0) return; let content = ''; const formattedList = generatedList.map(formatUUID); if (format === 'json') content = JSON.stringify(formattedList, null, 2); else if (format === 'csv') content = 'uuid\n' + formattedList.join('\n'); else content = formattedList.join('\n'); navigator.clipboard.writeText(content); };
  const getExamplePlaceholder = () => `Example: ${formatUUID(EXAMPLES[version])}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex gap-1 border border-slate-200 dark:border-slate-700">
            <button onClick={() => setMode('generate')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'generate' ? 'bg-white dark:bg-slate-600 text-accent dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{t('action.generate')}</button>
            <button onClick={() => setMode('analyze')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'analyze' ? 'bg-white dark:bg-slate-600 text-accent dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{t('action.analyze')}</button>
        </div>
      </div>

      {mode === 'generate' && (
          <div className="animate-fadeIn space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t('uuid.version')}</label><div className="grid grid-cols-3 gap-2"><button onClick={() => { setVersion('v4'); setGeneratedList([]); }} className={`p-3 rounded-lg border text-sm font-medium transition-all ${version === 'v4' ? 'border-accent/50 bg-accent/10 text-accent' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>v4 (Random)</button><button onClick={() => { setVersion('v7'); setGeneratedList([]); }} className={`p-3 rounded-lg border text-sm font-medium transition-all ${version === 'v7' ? 'border-accent/50 bg-accent/10 text-accent' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>v7 (Time)</button><button onClick={() => { setVersion('v1'); setGeneratedList([]); }} className={`p-3 rounded-lg border text-sm font-medium transition-all ${version === 'v1' ? 'border-accent/50 bg-accent/10 text-accent' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>v1 (MAC)</button></div></div>
                        <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t('uuid.quantity')} <span className="text-accent font-mono">{quantity}</span></label><input type="range" min="1" max="100" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent"/></div>
                        <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t('uuid.format')}</label><div className="flex flex-wrap gap-3"><label className="inline-flex items-center cursor-pointer"><input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="form-checkbox h-5 w-5 text-accent rounded border-slate-300 focus:ring-accent dark:bg-slate-800 dark:border-slate-600" /><span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{t('uuid.opt.uppercase')}</span></label><label className="inline-flex items-center cursor-pointer"><input type="checkbox" checked={noDashes} onChange={(e) => setNoDashes(e.target.checked)} className="form-checkbox h-5 w-5 text-accent rounded border-slate-300 focus:ring-accent dark:bg-slate-800 dark:border-slate-600" /><span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{t('uuid.opt.nodashes')}</span></label><label className="inline-flex items-center cursor-pointer"><input type="checkbox" checked={braces} onChange={(e) => setBraces(e.target.checked)} className="form-checkbox h-5 w-5 text-accent rounded border-slate-300 focus:ring-accent dark:bg-slate-800 dark:border-slate-600" /><span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{t('uuid.opt.braces')}</span></label></div></div>
                        <button onClick={handleGenerate} className="w-full bg-accent hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all active:scale-95">{t('uuid.btn.generate')}</button>
                    </div>
                    <div className="space-y-4">
                        {quantity === 1 && generatedList.length > 0 && (<div className="flex justify-end mb-2"><button onClick={handleClear} className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"><TrashIcon className="w-4 h-4" /> {t('action.clear')}</button></div>)}
                        {quantity === 1 ? (<InputGroup id="uuid-single" label="UUID" value={generatedList.length > 0 ? formatUUID(generatedList[0]) : ''} onChange={() => {}} placeholder={getExamplePlaceholder()} readOnly />) : (
                            <div className="relative"><div className="absolute top-0 right-0 z-10 p-2 flex gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-bl-lg"><button onClick={handleClear} disabled={generatedList.length === 0} className="p-1.5 text-slate-500 hover:text-red-500 border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700 hover:bg-red-50 transition-colors disabled:opacity-50"><TrashIcon className="w-4 h-4" /></button><button onClick={() => copyBulk('text')} disabled={generatedList.length === 0} className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50">List</button><button onClick={() => copyBulk('json')} disabled={generatedList.length === 0} className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50">JSON</button><button onClick={() => copyBulk('csv')} disabled={generatedList.length === 0} className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50">CSV</button></div><TextareaGroup id="uuid-bulk" label={`Result (${generatedList.length > 0 ? quantity : 0})`} value={generatedList.map(formatUUID).join('\n')} onChange={() => {}} placeholder="..." rows={12} /></div>
                        )}
                    </div>
                </div>
            </div>
          </div>
      )}

      {mode === 'analyze' && (
          <div className="animate-fadeIn max-w-2xl mx-auto space-y-6">
              <TextareaGroup id="uuid-analyze" label={t('uuid.analyze.title')} value={analysisInput} onChange={(e) => setAnalysisInput(e.target.value)} placeholder="Ej: 550e8400-e29b-41d4-a716-446655440000" rows={2}/>
              {analysisResult && (<div className={`p-6 rounded-xl border ${analysisResult.valid ? 'bg-accent/10 border-accent/20' : 'bg-red-50 dark:bg-red-900/20 border-red-200'}`}><h4 className="text-lg font-bold mb-4">{analysisResult.msg}</h4>{analysisResult.valid && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700"><span className="block text-xs font-bold text-slate-400 uppercase">Version</span><span className="block text-slate-800 dark:text-slate-200 font-mono mt-1">{analysisResult.version}</span></div><div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700"><span className="block text-xs font-bold text-slate-400 uppercase">Variant</span><span className="block text-slate-800 dark:text-slate-200 font-mono mt-1">{analysisResult.variant}</span></div><div className="sm:col-span-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700"><span className="block text-xs font-bold text-slate-400 uppercase">Timestamp</span><span className="block text-slate-800 dark:text-slate-200 font-mono mt-1 text-lg">{analysisResult.date}</span></div></div>)}</div>)}
          </div>
      )}
    </div>
  );
};

export default UUIDGenerator;