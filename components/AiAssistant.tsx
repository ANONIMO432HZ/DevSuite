
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
// Eliminamos import estático de react-markdown
import TextareaGroup from './TextareaGroup';
import { useLanguage } from '../contexts/LanguageContext';
import { useHistory } from '../contexts/HistoryContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useApiKey } from '../contexts/ApiKeyContext';
import Mermaid from './Mermaid';

// Icons
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>);
const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>);
const StopIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>);
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423 1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>);
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const CloudOffIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-1.5-1.5" /></svg>);
const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>);

const AiAssistant: React.FC = () => {
  const { t } = useLanguage();
  const { addToHistory } = useHistory();
  const { apiKey: userApiKey } = useApiKey();
  
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Estado para la librería Markdown dinámica
  const [MarkdownComponent, setMarkdownComponent] = useState<any>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useUnsavedChanges(loading);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Carga dinámica de React Markdown
    import('react-markdown')
      .then(module => setMarkdownComponent(() => module.default))
      .catch(err => console.warn("Markdown lib not available offline", err));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAction = useCallback((actionPrompt: string) => {
    setPrompt(prev => prev ? `${actionPrompt}:\n\n${prev}` : actionPrompt);
  }, []);

  const handleStop = useCallback(() => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
          setLoading(false);
          setEnhancing(false);
      }
  }, []);

  const handleSend = useCallback(async (manualPrompt?: string) => {
    const promptToSend = typeof manualPrompt === 'string' ? manualPrompt : prompt;
    if (!promptToSend.trim()) return;
    if (!userApiKey) { setError("Se requiere una API Key."); return; }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true); setError(null); setResponse('');

    try {
        const ai = new GoogleGenAI({ apiKey: userApiKey });
        const resultStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: promptToSend,
            config: { systemInstruction: `Actúa como un Desarrollador Senior. Respuestas técnicas y concisas. Markdown rico.` }
        });

        let fullResponse = '';
        for await (const chunk of resultStream) {
            if (controller.signal.aborted) break;
            const text = chunk.text || '';
            fullResponse += text;
            setResponse(prev => prev + text);
        }

        if (!controller.signal.aborted) {
            addToHistory({ tool: t('menu.aiAssistant'), details: promptToSend.substring(0, 30), input: promptToSend, output: fullResponse });
        }
    } catch (err: any) {
        if (err.name !== 'AbortError') setError(err.message || "Error Gemini API");
    } finally {
        if (abortControllerRef.current === controller) { setLoading(false); abortControllerRef.current = null; }
    }
  }, [prompt, addToHistory, t, userApiKey]);

  const handleEnhancePrompt = useCallback(async () => {
      if (!prompt.trim() || !userApiKey) { setError("Falta Prompt o API Key"); return; }
      setEnhancing(true); setError(null);
      try {
          const ai = new GoogleGenAI({ apiKey: userApiKey });
          const result = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Prompt original: "${prompt}". Mejóralo para un LLM.`,
          });
          if (result.text) setPrompt(result.text.trim());
      } catch (err: any) { setError(err.message); } finally { setEnhancing(false); }
  }, [prompt, userApiKey]);

  const handleClear = () => { setPrompt(''); setResponse(''); setError(null); };
  const handleCopyResponse = () => { if (!response) return; navigator.clipboard.writeText(response); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (!isOnline) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fadeIn p-6">
              <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6 text-slate-400 dark:text-slate-500"><CloudOffIcon className="w-16 h-16" /></div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('ai.offline.title')}</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">{t('ai.offline.desc')}</p>
          </div>
      );
  }

  const hasKey = !!userApiKey;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <div className="flex flex-col items-center gap-4">
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/50 uppercase tracking-widest shadow-sm">{t('ai.beta.badge')}</span>
            <div className="bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap justify-center gap-2">
                    <button onClick={() => handleAction("Genera una Regex para")} className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all hover:scale-105 shadow-sm">{t('ai.btn.regex')}</button>
                    <button onClick={() => handleAction("Explica este código")} className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all hover:scale-105 shadow-sm">{t('ai.btn.explain')}</button>
                    <button onClick={() => handleAction("Crea un diagrama de flujo sobre")} className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all hover:scale-105 shadow-sm">{t('ai.btn.flowchart')}</button>
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-1">
                <TextareaGroup id="ai-prompt" label="" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={hasKey ? t('ai.ph.prompt') : "Configura tu API Key..."} rows={6} disabled={loading || enhancing || !hasKey} />
                {error && <div className="mx-2 mb-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2 animate-fadeIn"><AlertIcon className="w-5 h-5 flex-shrink-0" /><span className="font-medium">{error}</span></div>}
                {!hasKey && !error && <div className="mx-2 mb-2 p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm flex items-center gap-2"><KeyIcon className="w-5 h-5 flex-shrink-0" /><span className="font-medium">Falta API Key. Ve a Ajustes (⚙️).</span></div>}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
                <button onClick={handleEnhancePrompt} disabled={loading || enhancing || !prompt.trim() || !hasKey} className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"><MagicWandIcon className={`w-5 h-5 ${enhancing ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">{t('ai.btn.enhance')}</span></button>
                {loading || enhancing ? (
                    <button onClick={handleStop} className="flex-grow sm:flex-grow-0 sm:w-48 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-red-500/30 active:scale-95"><StopIcon className="w-6 h-6 animate-pulse" />{t('action.stop')}</button>
                ) : (
                    <button onClick={() => handleSend()} disabled={!prompt.trim() || !hasKey} className="flex-grow sm:flex-grow-0 sm:w-48 flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-indigo-600 hover:to-indigo-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-accent/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"><SparklesIcon className="w-6 h-6" />{t('action.ask')}</button>
                )}
                <button onClick={handleClear} disabled={loading || enhancing} className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md">{t('action.clear')}</button>
            </div>
        </div>

        <div className="flex flex-col min-h-[400px] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-inner transition-all">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2"><div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm"><DocumentTextIcon className="w-4 h-4 text-accent" /></div><label className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{t('ai.label.response')}</label></div>
                <div className="flex items-center gap-3">
                    {response && !loading && !enhancing && (
                        <>
                            <span className="text-xs font-mono text-slate-400 hidden sm:inline">MARKDOWN</span>
                            <div className="hidden sm:block h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
                            <button onClick={handleCopyResponse} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-accent dark:text-slate-400 dark:hover:text-accent transition-colors" title={t('action.copy')}>{copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}<span className={copied ? "text-green-500" : ""}>{copied ? t('action.saved') : t('action.copy')}</span></button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="flex-grow p-6 sm:p-8 overflow-y-auto prose dark:prose-invert prose-sm sm:prose-base max-w-none scrollbar-custom">
                {response ? (
                    MarkdownComponent ? (
                        <MarkdownComponent
                            components={{
                                code({node, inline, className, children, ...props}: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const language = match ? match[1] : '';
                                    const codeContent = String(children).replace(/\n$/, '');
                                    if (!inline && language === 'mermaid') { return (<div className="my-6"><Mermaid chart={codeContent} showTools={true} /></div>); }
                                    if (!inline) {
                                        return (
                                            <div className="relative group my-6 rounded-xl bg-[#1e293b] border border-slate-700 shadow-lg overflow-hidden">
                                                <div className="flex justify-between items-center px-4 py-2 bg-[#0f172a]/50 border-b border-slate-700/50"><span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{language || 'text'}</span><button onClick={() => navigator.clipboard.writeText(codeContent)} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10" title="Copiar"><CopyIcon className="w-4 h-4" /></button></div>
                                                <div className="p-4 overflow-x-auto"><code className={`font-mono text-sm text-slate-300 ${className}`} {...props}>{children}</code></div>
                                            </div>
                                        )
                                    }
                                    return (<code className={`${className} bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-accent dark:text-accent font-semibold`} {...props}>{children}</code>);
                                }
                            }}
                        >
                            {response}
                        </MarkdownComponent>
                    ) : (
                        <div className="whitespace-pre-wrap font-mono text-sm">{response}</div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 dark:text-slate-600 transition-opacity duration-500">
                        {enhancing ? (
                            <div className="flex flex-col items-center animate-pulse"><MagicWandIcon className="w-16 h-16 mb-4 text-amber-500 opacity-80" /><span className="text-lg font-medium text-amber-600 dark:text-amber-500">{t('ai.status.enhancing')}</span></div>
                        ) : loading ? (
                            <div className="flex flex-col items-center animate-pulse"><SparklesIcon className="w-16 h-16 mb-4 text-accent opacity-80" /><span className="text-lg font-medium text-accent">{t('ai.status.thinking')}</span></div>
                        ) : (
                            <div className="flex flex-col items-center opacity-40"><SparklesIcon className="w-20 h-20 mb-4" /><span className="text-lg font-medium">Gemini AI Ready</span><span className="text-sm mt-1">Escribe tu prompt arriba para comenzar</span></div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default AiAssistant;
