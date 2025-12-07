
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import Mermaid, { MermaidHandle } from './Mermaid';
import { useHistory } from '../contexts/HistoryContext';
import { useApiKey } from '../contexts/ApiKeyContext';
import CodeEditor from './CodeEditor';

// Icons
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>);
const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>);
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const ZoomInIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>);
const ZoomOutIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM7.5 10.5h6" /></svg>);
const ResetZoomIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>);
const WrenchScrewdriverIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M15.932 4.134a.75.75 0 0 1 .955 1.22l-4.14 3.22a.75.75 0 0 1-1.026-.062L3.83 2.121a1.5 1.5 0 0 0-2.121 0l-.707.707a1.5 1.5 0 0 0 0 2.121l5.383 5.383a.75.75 0 0 1-.223 1.256l-3.22 4.14a.75.75 0 0 1-1.22-.955l4.14-3.22a.75.75 0 0 1 1.026.062l7.89 6.393a1.5 1.5 0 0 0 2.121 0l.707-.707a1.5 1.5 0 0 0 0-2.121L14.71 10.043a.75.75 0 0 1 .223-1.256l3.22-4.14a.75.75 0 0 1-.22-1.22Z" /><path d="M11.625 18.75a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" /><path d="m15.54 13.62-5.012 5.012a1.125 1.125 0 1 0 1.59 1.59l5.013-5.012a2.625 2.625 0 1 0-1.59-1.59Z" /></svg>);
const ChatBubbleLeftRightIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M4.804 21.644a.75.75 0 0 0 .996-.996l-.785-1.785A7.5 7.5 0 0 1 2.25 12c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5c0 1.96-.757 3.75-2 5.122l-1.632 1.632a.75.75 0 0 0 1.06 1.06l1.633-1.632A9 9 0 1 0 9.75 3a9 9 0 0 0-7.23 14.44l2.284 4.204Z" clipRule="evenodd" /></svg>);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>);
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const PasteIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const HandIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>);

const DIAGRAM_PRESETS = [
    { label: 'Flowchart (Simple)', code: 'graph TD\n    A[Start] --> B{Is it?}\n    B -- Yes --> C[OK]\n    C --> D[Rethink]\n    D --> B\n    B -- No --> E[End]' },
    { label: 'Sequence Diagram', code: 'sequenceDiagram\n    Alice->>John: Hello John, how are you?\n    John-->>Alice: Great!\n    Alice-)John: See you later!' },
    { label: 'Class Diagram', code: 'classDiagram\n    Animal <|-- Duck\n    Animal <|-- Fish\n    Animal <|-- Zebra\n    class Animal{\n        +int age\n        +String gender\n        +isMammal()\n        +mate()\n    }\n    class Duck{\n        +String beakColor\n        +swim()\n        +quack()\n    }' },
    { label: 'State Diagram', code: 'stateDiagram-v2\n    [*] --> Still\n    Still --> [*]\n    Still --> Moving\n    Moving --> Still\n    Moving --> Crash\n    Crash --> [*]' },
];

const ZoomControls: React.FC<{ zoomLevel: number; onZoom: (level: number, center?: { x: number, y: number }) => void }> = ({ zoomLevel, onZoom }) => (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 rounded-lg flex-shrink-0">
        <button onClick={() => onZoom(Math.max(zoomLevel - 0.1, 0.5))} className="p-1 text-slate-500 hover:text-accent rounded"><ZoomOutIcon className="w-4 h-4" /></button>
        <span className="text-xs font-mono font-bold w-10 text-center text-slate-600 dark:text-slate-300 hidden sm:inline-block">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={() => onZoom(Math.min(zoomLevel + 0.1, 2.5))} className="p-1 text-slate-500 hover:text-accent rounded"><ZoomInIcon className="w-4 h-4" /></button>
        <button onClick={() => onZoom(1.0)} className="p-1 text-slate-500 hover:text-accent rounded"><ResetZoomIcon className="w-4 h-4" /></button>
    </div>
);

const DiagramEditor: React.FC = () => {
    const { t } = useLanguage();
    const { addToHistory } = useHistory();
    const { apiKey: userApiKey } = useApiKey();
    
    const [diagramCode, setDiagramCode] = useState(DIAGRAM_PRESETS[0].code);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [editorPanelHeight, setEditorPanelHeight] = useState<number | null>(320);
    const [isBasicEditor, setIsBasicEditor] = useState(true);

    // State for Pan and Zoom
    const [view, setView] = useState({ x: 0, y: 0, zoom: 1.0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [isInteractionEnabled, setIsInteractionEnabled] = useState(true);
    
    const abortControllerRef = useRef<AbortController | null>(null);
    const mermaidRef = useRef<MermaidHandle>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    useUnsavedChanges(diagramCode !== DIAGRAM_PRESETS[0].code && !loading);

    useEffect(() => {
        const handleMouseUp = () => setIsResizing(false);
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const newHeight = e.clientY - containerRect.top;
            const minHeight = 100;
            const maxHeight = containerRect.height - minHeight - 8;
            setEditorPanelHeight(Math.max(minHeight, Math.min(newHeight, maxHeight)));
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleSendAi = useCallback(async (instruction: string) => {
        const activeKey = userApiKey;
        if (!activeKey) {
            alert("Se requiere una API Key para usar la IA. Por favor, configúrala en Ajustes.");
            return;
        }

        if (abortControllerRef.current) abortControllerRef.current.abort();
        
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: activeKey });
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: instruction,
                config: { systemInstruction: `Actúa como un Ingeniero de Visualización de Diagramas y Experto en Sintaxis de Mermaid. Tu única tarea es generar o modificar código Mermaid. Devuelve SIEMPRE y ÚNICAMENTE el bloque de código Mermaid corregido o mejorado, sin explicaciones adicionales.` }
            });

            let fullResponse = '';
            for await (const chunk of resultStream) {
                if (controller.signal.aborted) break;
                fullResponse += chunk.text || '';
                const cleanCode = fullResponse.replace(/```mermaid\n|\n```|```/g, '').trim();
                setDiagramCode(cleanCode);
            }

            if (!controller.signal.aborted) {
                addToHistory({ tool: t('menu.diagramEditor'), details: 'AI Action', input: instruction, output: fullResponse });
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') setError(err.message || "API Error");
        } finally {
            if (abortControllerRef.current === controller) {
                setLoading(false);
                abortControllerRef.current = null;
            }
        }
    }, [addToHistory, t, userApiKey]);

    const handleFixCode = useCallback((code: string, errorMsg: string) => {
        const fixPrompt = `Actúa como Experto en Sintaxis Mermaid. Corrige el siguiente código que generó un error de renderizado. Contexto del Error: "${errorMsg}". Código Inválido:\n\`\`\`mermaid\n${code}\n\`\`\``;
        handleSendAi(fixPrompt);
    }, [handleSendAi]);

    const handleClear = () => setDiagramCode('');
    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        if (code) setDiagramCode(code);
        e.target.value = "";
    };
    
    const handleCopyCode = useCallback(() => {
        navigator.clipboard.writeText(diagramCode);
    }, [diagramCode]);

    const handlePasteCode = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            setDiagramCode(text);
        } catch (err) {
            console.error('Failed to read clipboard');
        }
    }, []);

    const handleDownload = useCallback(() => {
        const svgContent = mermaidRef.current?.getSvg();
        if (svgContent) {
            const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `diagram-${Date.now()}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }, []);

    const handleImprove = () => handleSendAi(`Mejora y optimiza el siguiente diagrama Mermaid, añadiendo más detalles o un mejor estilo:\n\n${diagramCode}`);
    const handleAutocorrect = () => handleSendAi(`El siguiente código Mermaid puede tener errores. Por favor, corrígelo y devuelve solo el código válido:\n\n${diagramCode}`);
    const handleExplain = () => handleSendAi(`Explica este código Mermaid en detalle, línea por línea:\n\n${diagramCode}`);

    // Pan & Zoom handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isInteractionEnabled) return;
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - view.x, y: e.clientY - view.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning || !isInteractionEnabled) return;
        setView(prev => ({
            ...prev,
            x: e.clientX - panStart.x,
            y: e.clientY - panStart.y,
        }));
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!isInteractionEnabled) return;
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        const newZoom = Math.max(0.1, Math.min(view.zoom + delta, 5));
        
        const canvasRect = canvasRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;

        const newX = mouseX - (mouseX - view.x) * (newZoom / view.zoom);
        const newY = mouseY - (mouseY - view.y) * (newZoom / view.zoom);

        setView({ zoom: newZoom, x: newX, y: newY });
    };
    
    const handleZoomButtons = (newZoomLevel: number) => {
        if (newZoomLevel === 1.0) {
            setView({ x: 0, y: 0, zoom: 1.0 });
        } else {
            const canvasRect = canvasRef.current!.getBoundingClientRect();
            const centerX = canvasRect.width / 2;
            const centerY = canvasRect.height / 2;

            const newX = centerX - (centerX - view.x) * (newZoomLevel / view.zoom);
            const newY = centerY - (centerY - view.y) * (newZoomLevel / view.zoom);

            setView({ zoom: newZoomLevel, x: newX, y: newY });
        }
    };


    return (
        <div ref={containerRef} className="flex flex-col animate-fadeIn border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg h-full" style={{ minHeight: '600px' }}>
            {/* Editor Panel */}
            <div className={`flex flex-col min-h-0 flex-shrink-0 ${!editorPanelHeight ? 'h-full' : ''}`} style={{ height: editorPanelHeight ? `${editorPanelHeight}px` : undefined }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 gap-2">
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <DocumentTextIcon className="w-4 h-4"/> {t('diagram.label.editor')}
                        </label>
                        <div className="flex items-center gap-2 pr-3 sm:border-r border-slate-300 dark:border-slate-600">
                             <label className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden xs:inline">Editor Básico</label>
                             <button
                               type="button"
                               onClick={() => setIsBasicEditor(!isBasicEditor)}
                               className={`${isBasicEditor ? 'bg-accent' : 'bg-slate-200 dark:bg-slate-600'} relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-accent`}
                               role="switch"
                               aria-checked={isBasicEditor}
                             >
                               <span
                                 aria-hidden="true"
                                 className={`${isBasicEditor ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                               />
                             </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                        <div className="relative min-w-[140px] flex-shrink-0">
                            <select onChange={handlePresetChange} defaultValue="" className="w-full appearance-none cursor-pointer bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 py-1 pl-3 pr-8 rounded-md hover:bg-slate-50 transition-colors shadow-sm text-xs focus:outline-none focus:ring-1 focus:ring-accent">
                                <option value="" disabled>{t('diagram.presets')}</option>
                                {DIAGRAM_PRESETS.map(p => <option key={p.label} value={p.code}>{p.label}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500"><ChevronDownIcon className="w-4 h-4" /></div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={handleClear} className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title={t('action.clear')}><TrashIcon className="w-4 h-4" /></button>
                            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                            <button onClick={handlePasteCode} className="p-1.5 text-slate-400 hover:text-accent rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title={t('action.paste')}><PasteIcon className="w-4 h-4" /></button>
                            <button onClick={handleCopyCode} className="p-1.5 text-slate-400 hover:text-accent rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title={t('action.copy')}><CopyIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
                <div className="relative flex-grow bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
                    {isBasicEditor ? (
                        <textarea
                            value={diagramCode}
                            onChange={(e) => setDiagramCode(e.target.value)}
                            placeholder={t('diagram.ph.editor')}
                            className="w-full h-full p-4 bg-transparent border-none focus:ring-0 resize-none scrollbar-custom 
                                       text-slate-300 caret-slate-300 selection:bg-slate-300/30
                                       font-mono text-sm leading-relaxed whitespace-pre"
                            spellCheck={false}
                        />
                    ) : (
                        <CodeEditor
                            value={diagramCode}
                            onChange={setDiagramCode}
                            placeholder={t('diagram.ph.editor')}
                        />
                    )}
                </div>
            </div>

            <div onMouseDown={() => setIsResizing(true)} className="h-2 bg-slate-100 dark:bg-slate-800 hover:bg-accent/20 cursor-row-resize flex items-center justify-center group flex-shrink-0">
                 <div className="w-8 h-1 bg-slate-300 dark:bg-slate-600 rounded-full group-hover:bg-accent transition-colors"></div>
            </div>

            {/* Preview Panel */}
            <div className="relative flex flex-col flex-grow min-h-0">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1 sm:mb-0">
                        <ChartBarIcon className="w-4 h-4"/> {t('diagram.label.preview')}
                        <span className="ml-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800/50 uppercase tracking-widest">
                            MODO BETA
                        </span>
                    </label>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                        <button onClick={handleImprove} disabled={loading} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded-md transition-all shadow-sm text-xs disabled:opacity-60 flex-shrink-0 whitespace-nowrap">
                            <SparklesIcon className="w-3 h-3" /> <span className="hidden sm:inline">{t('diagram.btn.enhance')}</span> <span className="sm:hidden">Mejorar</span>
                        </button>
                        <button onClick={handleAutocorrect} disabled={loading} title={t('diagram.btn.autofix')} className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-all shadow-sm disabled:opacity-60 flex-shrink-0">
                            <WrenchScrewdriverIcon className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handleExplain} disabled={loading} title={t('diagram.btn.explain')} className="p-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-all shadow-sm disabled:opacity-60 flex-shrink-0">
                            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 flex-shrink-0"></div>
                        <button
                            onClick={() => setIsInteractionEnabled(!isInteractionEnabled)}
                            className={`p-1.5 rounded transition-colors flex-shrink-0 ${isInteractionEnabled ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            title={t('diagram.interactiveNav')}
                        >
                            <HandIcon className="w-4 h-4" />
                        </button>
                        <ZoomControls zoomLevel={view.zoom} onZoom={handleZoomButtons} />
                         <button onClick={handleDownload} className="p-1.5 text-slate-500 hover:text-accent rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex-shrink-0" title={t('diagram.export.btn')}>
                            <DownloadIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div 
                    ref={canvasRef}
                    className={`flex-grow overflow-hidden flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/60 bg-dot-pattern ${isInteractionEnabled ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <div
                        style={{
                            transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
                            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
                        }}
                    >
                        {diagramCode.trim() ? (
                            <Mermaid chart={diagramCode} onFix={handleFixCode} ref={mermaidRef} showTools={false}/>
                        ) : (
                            <div className="text-center text-slate-400 dark:text-slate-600 opacity-50 flex flex-col items-center select-none">
                                <ChartBarIcon className="w-20 h-20 mb-4 stroke-1" />
                                <span className="text-lg font-medium">Canvas Vacío</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiagramEditor;
