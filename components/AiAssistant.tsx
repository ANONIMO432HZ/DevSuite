
import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import TextareaGroup from './TextareaGroup';
import { useLanguage } from '../contexts/LanguageContext';
import { useHistory } from '../contexts/HistoryContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import Mermaid from './Mermaid';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 6h12v12H6z" />
    </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423 1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

type Mode = 'chat' | 'diagram';

const DIAGRAM_PRESETS = [
    { label: 'Flowchart (Simple)', code: 'graph TD\n    A[Start] --> B{Is it?}\n    B -- Yes --> C[OK]\n    C --> D[Rethink]\n    D --> B\n    B -- No --> E[End]' },
    { label: 'Flowchart (Complex)', code: 'graph TB\n    sq[Square Rect] -- Link text --> ci((Circle))\n    au2([Stadium]) -- Link text --> ro([Rounded Square])\n    di{Diamond} -- Link text --> ro\n    di -- Link text --> cy((Cylinder))\n    cy -- Link text --> di' },
    { label: 'Sequence Diagram', code: 'sequenceDiagram\n    Alice->>John: Hello John, how are you?\n    John-->>Alice: Great!\n    Alice-)John: See you later!' },
    { label: 'Class Diagram', code: 'classDiagram\n    Animal <|-- Duck\n    Animal <|-- Fish\n    Animal <|-- Zebra\n    class Animal{\n        +int age\n        +String gender\n        +isMammal()\n        +mate()\n    }\n    class Duck{\n        +String beakColor\n        +swim()\n        +quack()\n    }' },
    { label: 'State Diagram', code: 'stateDiagram-v2\n    [*] --> Still\n    Still --> [*]\n    Still --> Moving\n    Moving --> Still\n    Moving --> Crash\n    Crash --> [*]' },
    { label: 'Gantt Chart', code: 'gantt\n    title A Gantt Diagram\n    dateFormat  YYYY-MM-DD\n    section Section\n    A task           :a1, 2014-01-01, 30d\n    Another task     :after a1  , 20d\n    section Another\n    Task in sec      :2014-01-12  , 12d\n    another task      : 24d' },
    { label: 'ER Diagram', code: 'erDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains\n    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses' },
];

const AiAssistant: React.FC = () => {
  const { t } = useLanguage();
  const { addToHistory } = useHistory();
  const [mode, setMode] = useState<Mode>('chat');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [diagramCode, setDiagramCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useUnsavedChanges(loading || (mode === 'diagram' && diagramCode.length > 0));

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

  const handleSend = useCallback(async (manualPrompt?: string, targetStateSetter?: (val: string) => void) => {
    const promptToSend = typeof manualPrompt === 'string' ? manualPrompt : prompt;
    const setter = targetStateSetter || setResponse;
    
    if (!promptToSend.trim()) return;
    
    if (!process.env.API_KEY) {
        setError(t('ai.error.key'));
        return;
    }

    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    if (!targetStateSetter) setResponse('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-2.5-flash';

        const resultStream = await ai.models.generateContentStream({
            model: model,
            contents: promptToSend,
            config: {
                 systemInstruction: `Actúa como un Ingeniero de Visualización de Diagramas y Experto en Sintaxis de Mermaid, además de un Desarrollador Senior experto en código.

### Reglas de Calidad Estrictas para Diagramas (Mermaid):

1.  **Validación de Sintaxis:** Tu objetivo es generar código Mermaid impecable y listo para renderizar.
2.  **Nodos de Decisión:** NUNCA uses comillas dobles (") para etiquetar el texto dentro de los nodos de decisión (rombos).
    *   INCORRECTO: id{"¿Es válido?"}
    *   CORRECTO: id{¿Es válido?}
3.  **Nodos Estándar:** Para nodos que NO son de decisión (rectángulos, redondos, etc.), SIEMPRE encierra el texto en comillas dobles para evitar errores con caracteres especiales o paréntesis.
    *   CORRECTO: A["Ingresar datos (kg)"]
    *   INCORRECTO: A[Ingresar datos (kg)]
4.  **Identificadores (IDs):** Los IDs de los nodos deben empezar por una letra y contener solo caracteres alfanuméricos.
    *   CORRECTO: Step1, NodeA
    *   INCORRECTO: 1, 1stStep, Node-1
5.  **Etiquetas de Enlace:** Las etiquetas en los enlaces (-- Texto -->) deben ser concisas.
6.  **Formato:** Asegúrate de que el bloque de código final esté envuelto correctamente en el bloque de lenguaje 'mermaid'.

Para cualquier otra solicitud (Explicar código, Regex, SQL, etc.), actúa como un Desarrollador Senior conciso y técnico. Usa formato Markdown rico (listas, negritas, tablas) para estructurar tus respuestas.`,
            }
        });

        let fullResponse = '';
        if (targetStateSetter) setter('');

        for await (const chunk of resultStream) {
            if (controller.signal.aborted) break;
            const text = chunk.text || '';
            fullResponse += text;
            if (targetStateSetter) {
                setter(prev => prev + text);
            } else {
                setResponse(prev => prev + text);
            }
        }

        if (targetStateSetter && !controller.signal.aborted) {
             const cleanCode = fullResponse.replace(/```mermaid\n|\n```|```/g, '').trim();
             setter(cleanCode);
        }

        if (!controller.signal.aborted && !targetStateSetter) {
            addToHistory({
                tool: t('menu.aiAssistant'),
                details: promptToSend.length > 30 ? promptToSend.substring(0, 30) + '...' : promptToSend,
                input: promptToSend,
                output: fullResponse
            });
        }

    } catch (err: any) {
        if (err.name !== 'AbortError') {
            console.error(err);
            setError(err.message || "Error connecting to Gemini API");
        }
    } finally {
        if (abortControllerRef.current === controller) {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }
  }, [prompt, addToHistory, t]);

  const handleEnhancePrompt = useCallback(async () => {
      if (!prompt.trim()) return;
      if (!process.env.API_KEY) {
          setError(t('ai.error.key'));
          return;
      }

      setEnhancing(true);
      setError(null);

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const model = 'gemini-2.5-flash';
          
          const result = await ai.models.generateContent({
              model: model,
              contents: `Prompt original del usuario: "${prompt}"`,
              config: {
                  systemInstruction: `Actúa como un experto Ingeniero de Prompts. Reescribe la solicitud del usuario para obtener la mejor respuesta posible de un LLM. IMPORTANTE: Devuelve SOLAMENTE el prompt mejorado en texto plano.`,
              }
          });

          const enhancedText = result.text;
          
          if (enhancedText) {
              setPrompt(enhancedText.trim());
          }

      } catch (err: any) {
          console.error(err);
          setError(err.message || "Error enhancing prompt");
      } finally {
          setEnhancing(false);
      }
  }, [prompt, t]);

  const handleFixCode = useCallback((code: string, errorMsg: string) => {
      const fixPrompt = `Actúa como Experto en Sintaxis Mermaid. Corrige el siguiente código que generó un error de renderizado. Contexto del Error: "${errorMsg}". Código Inválido:\n\`\`\`mermaid\n${code}\n\`\`\`\n\nDevuelve SOLO el bloque de código Markdown corregido.`;
      
      if (mode === 'diagram') {
          handleSend(fixPrompt, setDiagramCode);
      } else {
          setPrompt(fixPrompt);
          handleSend(fixPrompt);
      }
  }, [handleSend, mode]);

  const handleAiDiagramEdit = useCallback((action: 'improve' | 'fix' | 'explain') => {
      if (!diagramCode.trim()) return;
      
      let instruction = '';
      let targetSetter = setDiagramCode;

      if (action === 'improve') {
          instruction = `Mejora el diseño, la claridad y la estética del siguiente diagrama Mermaid. Usa mejores formas de nodos, colores si aplica, y organiza el flujo:\n\`\`\`mermaid\n${diagramCode}\n\`\`\`\nDevuelve SOLO el bloque de código Mermaid.`;
      } else if (action === 'fix') {
          instruction = `Corrige cualquier error de sintaxis en este código Mermaid:\n\`\`\`mermaid\n${diagramCode}\n\`\`\`\nDevuelve SOLO el bloque de código Mermaid.`;
      } else if (action === 'explain') {
          instruction = `Explica detalladamente qué hace este diagrama Mermaid:\n\`\`\`mermaid\n${diagramCode}\n\`\`\``;
          targetSetter = setResponse;
          setMode('chat');
      }

      handleSend(instruction, targetSetter);
  }, [diagramCode, handleSend]);

  const handleClear = () => {
    setPrompt('');
    setResponse('');
    setError(null);
    if (mode === 'diagram') setDiagramCode('');
  };

  const handleLoadPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const code = e.target.value;
      if (code) {
          setDiagramCode(code);
      }
      e.target.value = '';
  };

  return (
    <div className="space-y-6">
      
      {/* Mode Switcher */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl inline-flex gap-1 border border-slate-200 dark:border-slate-700 shadow-sm">
            <button onClick={() => setMode('chat')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'chat' ? 'bg-white dark:bg-slate-600 text-accent dark:text-white shadow-md transform scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><ChatBubbleIcon className="w-4 h-4" />{t('ai.mode.chat')}</button>
            <button onClick={() => setMode('diagram')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'diagram' ? 'bg-white dark:bg-slate-600 text-accent dark:text-white shadow-md transform scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><ChartBarIcon className="w-4 h-4" />{t('ai.mode.diagram')}</button>
        </div>
      </div>

      {mode === 'chat' ? (
          <>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block px-1">{t('ai.quick_suggestions')}</span>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleAction("Genera una Regex para")} className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:border-accent hover:text-accent transition-colors shadow-sm">{t('ai.btn.regex')}</button>
                    <button onClick={() => handleAction("Explica este código")} className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:border-accent hover:text-accent transition-colors shadow-sm">{t('ai.btn.explain')}</button>
                    <button onClick={() => handleAction("Encuentra errores en")} className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:border-accent hover:text-accent transition-colors shadow-sm">{t('ai.btn.fix')}</button>
                    <button onClick={() => handleAction("Crea un diagrama de flujo sobre")} className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:border-accent hover:text-accent transition-colors shadow-sm">{t('ai.btn.flowchart')}</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <div className="flex flex-col h-full">
                    <TextareaGroup id="ai-prompt" label={t('ai.label.prompt')} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t('ai.ph.prompt')} rows={12} disabled={loading || enhancing} />
                    <div className="mt-4 flex flex-wrap gap-3">
                        {loading || enhancing ? (
                            <button onClick={handleStop} className="flex-grow flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-md transition-all shadow-md animate-pulse"><StopIcon className="w-5 h-5" />{t('action.stop')}</button>
                        ) : (
                            <>
                                <button onClick={() => handleSend()} disabled={!prompt.trim()} className="flex-grow flex items-center justify-center gap-2 bg-accent hover:opacity-90 text-white font-bold py-3 px-6 rounded-md transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"><SparklesIcon className="w-5 h-5" />{t('action.ask')}</button>
                                <button onClick={handleEnhancePrompt} disabled={!prompt.trim()} className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold py-3 px-4 rounded-md transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/20" title={t('ai.btn.enhance')}><MagicWandIcon className="w-5 h-5" /><span className="hidden sm:inline">{t('ai.btn.enhance')}</span></button>
                            </>
                        )}
                        <button onClick={handleClear} disabled={loading || enhancing} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 px-6 rounded-md transition-colors">{t('action.clear')}</button>
                    </div>
                    {error && (<div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-start gap-3 shadow-sm animate-fadeIn"><AlertIcon className="w-5 h-5 flex-shrink-0 mt-0.5" /><div className="flex flex-col gap-1"><span className="font-bold">Error</span><span className="opacity-90">{error}</span></div></div>)}
                </div>

                <div className="flex flex-col h-full min-h-[300px]">
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('ai.label.response')}</label>
                    <div className="flex-grow w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-4 overflow-y-auto prose dark:prose-invert prose-sm max-w-none shadow-inner">
                        {response ? (
                            <ReactMarkdown
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-slate-800 dark:text-white" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-slate-800 dark:text-white" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 mb-4 space-y-1 text-slate-700 dark:text-slate-300" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 mb-4 space-y-1 text-slate-700 dark:text-slate-300" {...props} />,
                                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-accent pl-4 py-1 my-4 italic bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-r" {...props} />,
                                    a: ({node, ...props}) => <a className="text-accent hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300" {...props} />,
                                    table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-lg border border-slate-200 dark:border-slate-700"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props} /></div>,
                                    thead: ({node, ...props}) => <thead className="bg-slate-100 dark:bg-slate-800" {...props} />,
                                    th: ({node, ...props}) => <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" {...props} />,
                                    td: ({node, ...props}) => <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700" {...props} />,
                                    code({node, inline, className, children, ...props}: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const language = match ? match[1] : '';
                                        const codeContent = String(children).replace(/\n$/, '');

                                        if (!inline && language === 'mermaid') {
                                            return (
                                                <Mermaid 
                                                    chart={codeContent} 
                                                    onFix={handleFixCode}
                                                />
                                            );
                                        }
                                        
                                        if (!inline) {
                                            return (
                                                <div className="relative group my-4 rounded-lg bg-slate-900 border border-slate-700/50 overflow-hidden shadow-sm">
                                                    <div className="flex justify-between items-center px-3 py-1.5 bg-slate-800/50 border-b border-slate-700/50">
                                                        <span className="text-[10px] uppercase text-slate-500 font-mono">{language || 'text'}</span>
                                                        <button 
                                                            onClick={() => navigator.clipboard.writeText(codeContent)}
                                                            className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                                                            title="Copiar código"
                                                        >
                                                            <CopyIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <div className="p-3 overflow-x-auto">
                                                        <code className={`font-mono text-xs sm:text-sm text-slate-300 ${className}`} {...props}>
                                                            {children}
                                                        </code>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <code className={`${className} bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono text-accent dark:text-accent`} {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
                                {response}
                            </ReactMarkdown>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 opacity-50">{enhancing ? (<><MagicWandIcon className="w-12 h-12 mb-2 animate-pulse text-amber-500" /><span className="text-sm font-medium text-amber-500">{t('ai.status.enhancing')}</span></>) : (<><SparklesIcon className="w-12 h-12 mb-2" /><span className="text-sm">Gemini AI Ready</span></>)}</div>
                        )}
                    </div>
                </div>
            </div>
          </>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full animate-fadeIn">
              <div className="flex flex-col h-full">
                  <TextareaGroup id="diagram-editor" label={t('ai.label.editor')} value={diagramCode} onChange={(e) => setDiagramCode(e.target.value)} placeholder={t('ai.ph.editor')} rows={20} disabled={loading} />
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                        <select 
                            onChange={handleLoadPreset} 
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-2.5 px-3 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-accent outline-none shadow-sm cursor-pointer"
                            defaultValue=""
                        >
                            <option value="" disabled>{t('ai.diagram.presets')}</option>
                            {DIAGRAM_PRESETS.map((p, i) => (
                                <option key={i} value={p.code}>{p.label}</option>
                            ))}
                        </select>

                        {loading ? (
                            <button onClick={handleStop} className="flex-grow flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-all shadow-md animate-pulse"><StopIcon className="w-4 h-4" />{t('action.stop')}</button>
                        ) : (
                            <>
                                <button onClick={() => handleAiDiagramEdit('improve')} disabled={!diagramCode.trim()} className="bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 font-semibold py-2 px-4 rounded-md transition-all text-sm flex items-center gap-2 disabled:opacity-50"><MagicWandIcon className="w-4 h-4" />{t('ai.btn.improve_diagram')}</button>
                                <button onClick={() => handleAiDiagramEdit('fix')} disabled={!diagramCode.trim()} className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 font-semibold py-2 px-4 rounded-md transition-all text-sm flex items-center gap-2 disabled:opacity-50"><AlertIcon className="w-4 h-4" />{t('ai.btn.autofix')}</button>
                                <button onClick={() => handleAiDiagramEdit('explain')} disabled={!diagramCode.trim()} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-md transition-all text-sm flex items-center gap-2 disabled:opacity-50"><ChatBubbleIcon className="w-4 h-4" />{t('ai.btn.explain')}</button>
                            </>
                        )}
                        <button onClick={handleClear} disabled={loading} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-md transition-colors text-sm">{t('action.clear')}</button>
                  </div>
                  {error && (<div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-start gap-2"><AlertIcon className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span></div>)}
              </div>
              <div className="flex flex-col h-full min-h-[400px]">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('ai.label.preview')}</label>
                  <div className="flex-grow w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-4 overflow-auto shadow-inner flex items-center justify-center">
                        {diagramCode.trim() ? (
                            <div className="w-full">
                                <Mermaid chart={diagramCode} onFix={(code, err) => handleFixCode(code, err)} />
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 dark:text-slate-600 opacity-50">
                                <ChartBarIcon className="w-16 h-16 mb-2 mx-auto" />
                                <span className="text-sm">Live Preview</span>
                            </div>
                        )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AiAssistant;
