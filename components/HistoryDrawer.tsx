
import React from 'react';
import { useHistory } from '../contexts/HistoryContext';
import { useLanguage } from '../contexts/LanguageContext';

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

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const HistoryDrawer: React.FC = () => {
  const { history, isOpen, toggleHistory, clearHistory, deleteItem } = useHistory();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Background overlay */}
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={toggleHistory}
          aria-hidden="true"
        ></div>

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md">
            <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-slate-900 shadow-xl">
              
              {/* Header */}
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-6 sm:px-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white" id="slide-over-title">
                    {t('history.title')}
                  </h2>
                  <div className="ml-3 flex h-7 items-center">
                    <button
                      type="button"
                      className="rounded-md bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
                      onClick={toggleHistory}
                    >
                      <span className="sr-only">{t('settings.close')}</span>
                      <XIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                   {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                      >
                        <TrashIcon className="w-4 h-4" /> {t('action.clearAll')}
                      </button>
                   )}
                </div>
              </div>

              {/* Content */}
              <div className="relative flex-1 px-4 py-6 sm:px-6">
                {history.length === 0 ? (
                  <div className="text-center text-slate-500 dark:text-slate-400 mt-10">
                    <p>{t('history.empty')}</p>
                    <p className="text-sm mt-2">{t('history.emptyDesc')}</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {history.map((item) => (
                      <li key={item.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 relative group">
                         <button 
                            onClick={() => deleteItem(item.id)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title={t('history.delete')}
                         >
                             <XIcon className="w-4 h-4" />
                         </button>
                         
                         <div className="mb-1 flex justify-between items-baseline pr-6">
                             <span className="text-xs font-bold uppercase tracking-wider text-accent">
                                {item.tool}
                             </span>
                             <span className="text-[10px] text-slate-400">
                                {formatDate(item.timestamp)}
                             </span>
                         </div>
                         <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{item.details}</p>
                         
                         <div className="space-y-2 text-sm font-mono">
                            <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 flex justify-between items-center gap-2">
                                <span className="truncate text-slate-700 dark:text-slate-300">{item.input}</span>
                                <button onClick={() => handleCopy(item.input)} className="text-slate-400 hover:text-accent" title={t('history.copyInput')}>
                                    <CopyIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex justify-center text-slate-400">↓</div>
                            <div className="bg-accent/10 p-2 rounded border border-accent/20 flex justify-between items-center gap-2">
                                <span className="text-slate-800 dark:text-slate-200 break-all line-clamp-4" title={item.output}>
                                    {item.output}
                                </span>
                                <button onClick={() => handleCopy(item.output)} className="text-slate-400 hover:text-accent flex-shrink-0" title={t('history.copyOutput')}>
                                    <CopyIcon className="w-4 h-4" />
                                </button>
                            </div>
                         </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryDrawer;
