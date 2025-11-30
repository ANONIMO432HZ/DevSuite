import React, { useState, useCallback, useRef } from 'react';

const TextareaGroup: React.FC<TextareaGroupProps> = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  error, 
  rows = 6, 
  disabled = false, 
  readOnly = false,
  onPaste 
}) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = useCallback(() => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [value]);

  const handlePasteClick = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const event = {
          target: { value: text },
          currentTarget: { value: text }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(event);
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  }, [onChange]);

  const handleClear = useCallback(() => {
    const event = {
      target: { value: '' },
      currentTarget: { value: '' }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);
  }, [onChange]);
  
  const borderColor = error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-accent';
  const ringColor = error ? 'focus:ring-red-500' : 'focus:ring-accent';

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </label>
      </div>
      <div className="relative group">
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={onChange}
          onPaste={onPaste}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full bg-slate-100 dark:bg-slate-900 border text-slate-900 dark:text-slate-200 rounded-md py-3 pl-4 pr-10 focus:ring-2 transition font-mono text-base sm:text-lg resize-y ${borderColor} ${ringColor} disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed read-only:bg-slate-200 dark:read-only:bg-slate-800 read-only:cursor-default`}
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1 bg-slate-100/80 dark:bg-slate-900/80 rounded backdrop-blur-sm p-0.5">
            {!disabled && !readOnly && value && (
                <button
                    onClick={handleClear}
                    className="p-1.5 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Limpiar"
                    type="button"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            )}
            {!disabled && !readOnly && (
                <button
                    onClick={handlePasteClick}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-accent dark:hover:text-accent transition-colors rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Pegar (Si falla, usa Ctrl+V)"
                    type="button"
                >
                    <PasteIcon className="w-4 h-4" />
                </button>
            )}
            <button
                onClick={handleCopy}
                disabled={!value}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-accent dark:hover:text-accent disabled:text-slate-300 dark:disabled:text-slate-700 disabled:cursor-not-allowed transition-colors rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                aria-label={`Copiar ${label}`}
                type="button"
            >
                {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
            </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

interface TextareaGroupProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  error?: string | null;
  rows?: number;
  disabled?: boolean;
  readOnly?: boolean;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const PasteIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);

export default TextareaGroup;