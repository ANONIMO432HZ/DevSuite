
import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface MermaidProps {
  chart: string;
  onFix?: (code: string, error: string) => void;
}

const CodeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423 1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const EditExternalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

const Mermaid: React.FC<MermaidProps> = ({ chart, onFix }) => {
  const { themeMode } = useTheme();
  const { t } = useLanguage();
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const uniqueIdRef = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      suppressErrorRendering: true,
      theme: themeMode === 'dark' ? 'dark' : 'base',
      securityLevel: 'strict', // Modificado a 'strict' para mayor seguridad
      flowchart: { htmlLabels: false },
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      themeVariables: themeMode === 'dark' ? {
        primaryColor: '#6366f1',
        primaryTextColor: '#f1f5f9',
        primaryBorderColor: '#818cf8',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
      } : {
        primaryColor: '#6366f1',
        primaryTextColor: '#1e293b',
        primaryBorderColor: '#4338ca',
        lineColor: '#64748b',
        secondaryColor: '#f1f5f9',
        tertiaryColor: '#ffffff',
      }
    });

    let isMounted = true;
    const currentId = uniqueIdRef.current;

    const renderChart = async () => {
      if (!chart) return;
      
      const cleanChart = chart
        .replace(/(\w+)\s*\{\s*"((?:[^"\\]|\\.)*)"\s*\}/g, '$1{$2}')
        .replace(/(\w+)\s*\{\s*[“"]((?:[^”"\\]|\\.)*)[”"]\s*\}/g, '$1{$2}');

      if (isMounted) {
        setError(null);
        setIsRendering(true);
      }

      try {
        await mermaid.parse(cleanChart);
        const { svg: svgContent } = await mermaid.render(currentId, cleanChart);
        
        if (isMounted) {
          setSvg(svgContent);
          setIsRendering(false);
        }
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        if (isMounted) {
          let msg = 'Error desconocido en el diagrama';
          if (err instanceof Error) {
             msg = err.message;
             if (msg.includes('Parse error')) msg = 'Error de Sintaxis (Parse Error). Posiblemente caracteres inválidos en el diagrama.';
          } else if (typeof err === 'string') {
             msg = err;
          }
          
          setError(msg);
          setIsRendering(false);
        }
      }
    };

    const timeoutId = setTimeout(() => { renderChart(); }, 200);
    return () => { isMounted = false; clearTimeout(timeoutId); };
  }, [chart, themeMode]);

  const handleDownloadSVG = () => {
      const originalSvg = containerRef.current?.querySelector('.mermaid-wrapper svg') as SVGSVGElement;
      
      if (!originalSvg) {
          console.error("No se encontró el SVG del gráfico");
          return;
      }

      const clonedSvg = originalSvg.cloneNode(true) as SVGSVGElement;
      const box = originalSvg.getBoundingClientRect();
      const width = box.width;
      const height = box.height;

      clonedSvg.setAttribute('width', `${width}`);
      clonedSvg.setAttribute('height', `${height}`);
      clonedSvg.setAttribute('viewBox', originalSvg.getAttribute('viewBox') || `0 0 ${width} ${height}`);
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.style.backgroundColor = 'transparent';

      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagram-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleOpenExternal = () => {
      const state = {
          code: chart,
          mermaid: { theme: themeMode === 'dark' ? 'dark' : 'default' },
          autoSync: true,
          rough: false
      };
      const json = JSON.stringify(state);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      window.open(`https://mermaid.live/edit#base64:${b64}`, '_blank');
  };

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden shadow-sm animate-fadeIn transition-all">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
           <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm font-semibold">
              <CodeIcon className="w-5 h-5 text-slate-500" />
              <span>Código del Diagrama</span>
           </div>
           <div className="flex items-center gap-2">
                <button 
                    onClick={handleOpenExternal}
                    className="p-1.5 text-slate-500 hover:text-accent transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                    title={t('ai.btn.external')}
                >
                    <EditExternalIcon className="w-4 h-4" />
                </button>
                {onFix && (
                    <button 
                        onClick={() => onFix(chart, error || '')}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-accent hover:opacity-90 px-3 py-1 rounded-full transition-all shadow-sm active:scale-95"
                    >
                        <MagicWandIcon className="w-3 h-3" />
                        {t('ai.btn.autofix')}
                    </button>
                )}
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                    Vista de Código
                </span>
           </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900 relative group">
            <pre className="font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words leading-relaxed select-all">
                {chart}
            </pre>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700">
            <button 
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
                <span>{showErrorDetails ? 'Ocultar detalles técnicos' : 'Ver por qué falló el renderizado gráfico'}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${showErrorDetails ? 'rotate-180' : ''}`} />
            </button>
            {showErrorDetails && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/10 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-mono text-red-600 dark:text-red-300 break-words">
                        {error}
                    </p>
                </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group my-6" ref={containerRef}>
        {!isRendering && svg && (
            <div className="absolute top-2 right-2 z-20 flex gap-2">
                <button 
                    onClick={handleOpenExternal}
                    className="p-1.5 bg-white dark:bg-slate-700 rounded-md shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-accent dark:hover:text-accent transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title={t('ai.btn.external')}
                >
                    <EditExternalIcon className="w-4 h-4" />
                </button>
                <button 
                    onClick={handleDownloadSVG}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-md shadow-sm border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-accent dark:hover:text-accent transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title={t('ai.export.btn')}
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">SVG</span>
                </button>
            </div>
        )}

        <div 
            className={`mermaid-wrapper flex justify-center bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-sm transition-opacity duration-300 ${isRendering ? 'opacity-50' : 'opacity-100'}`}
        >
            {isRendering && !svg && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            )}
            <div 
                dangerouslySetInnerHTML={{ __html: svg }} 
                className="w-full flex justify-center"
            />
        </div>
    </div>
  );
};

export default Mermaid;