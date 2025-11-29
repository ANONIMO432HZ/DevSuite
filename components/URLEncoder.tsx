
import React, { useState, useCallback } from 'react';
import TextareaGroup from './TextareaGroup';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

const URLEncoder: React.FC = () => {
  const [decoded, setDecoded] = useState('');
  const [encoded, setEncoded] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Protección contra pérdida de datos
  useUnsavedChanges(decoded.length > 0 || encoded.length > 0);

  const clearAll = useCallback(() => {
    setDecoded('');
    setEncoded('');
    setError(null);
  }, []);

  const handleDecodedChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDecoded(value);
    if (value.trim() === '') {
      setEncoded('');
      setError(null);
    } else {
      setEncoded(encodeURIComponent(value));
      setError(null);
    }
  }, []);

  const handleEncodedChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setEncoded(value);
    if (value.trim() === '') {
      setDecoded('');
      setError(null);
      return;
    }

    try {
      setDecoded(decodeURIComponent(value.replace(/\+/g, ' ')));
      setError(null);
    } catch (e) {
      setError("La cadena codificada no es una URI válida.");
    }
  }, []);

  return (
    <div>
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          <TextareaGroup
            id="decoded-text"
            label="Texto Decodificado"
            value={decoded}
            onChange={handleDecodedChange}
            placeholder="Escribe algo aquí..."
            rows={12}
          />
          <TextareaGroup
            id="encoded-text"
            label="Texto Codificado (URL)"
            value={encoded}
            onChange={handleEncodedChange}
            placeholder="El texto codificado aparecerá aquí..."
            error={error}
            rows={12}
          />
        </div>
        <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
            <ArrowRightIcon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </div>
      </div>
      <div className="mt-8 text-right">
        <button
          onClick={clearAll}
          className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default URLEncoder;
