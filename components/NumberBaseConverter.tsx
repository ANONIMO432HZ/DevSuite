
import React, { useState, useCallback } from 'react';
import InputGroup from './InputGroup';
import TextareaGroup from './TextareaGroup';
import { useHistory } from '../contexts/HistoryContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import TextTools from './TextTools';
import { useLanguage } from '../contexts/LanguageContext';

const NumberBaseConverter: React.FC = () => {
  const { t } = useLanguage();
  // --- Estados de Modo Texto/Bytes ---
  const [text, setText] = useState('');
  const [base64Text, setBase64Text] = useState('');
  const [hexBytes, setHexBytes] = useState('');
  const [binaryStream, setBinaryStream] = useState(''); // Estado dedicado para la vista de Bytes
  
  const [textError, setTextError] = useState<{ field: 'base64' | 'hex' | 'binary' | null; message: string | null }>({ field: null, message: null });
  const [numericError, setNumericError] = useState<{ field: 'decimal' | 'binary' | 'hex' | null; message: string | null }>({ field: null, message: null });
  
  // --- Estados de Modo Numérico ---
  const [decimal, setDecimal] = useState('');
  const [binary, setBinary] = useState(''); // Estado dedicado para el input numérico
  const [hex, setHex] = useState('');

  const { addToHistory } = useHistory();

  // Protección contra pérdida de datos
  useUnsavedChanges(text.length > 0 || base64Text.length > 0 || hexBytes.length > 0 || decimal.length > 0);

  // Detectar si estamos en modo texto basado en si hay contenido en los campos de arriba
  const isTextMode = !!text || !!base64Text || !!hexBytes || !!binaryStream;
  
  const updateAllFromBytes = useCallback((bytes: Uint8Array | null, sourceField: 'text' | 'base64' | 'hex' | 'binaryStream') => {
    setTextError({ field: null, message: null });
    
    if (!bytes || bytes.length === 0) {
      if (sourceField !== 'text') setText('');
      if (sourceField !== 'base64') setBase64Text('');
      if (sourceField !== 'hex') setHexBytes('');
      if (sourceField !== 'binaryStream') setBinaryStream('');
      setDecimal('');
      setBinary('');
      setHex('');
      return;
    }

    if (sourceField !== 'text') {
      try {
        const decodedString = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        setText(decodedString);
      } catch (e) {
        setText(''); 
      }
    }
    if (sourceField !== 'base64') {
      const base64String = btoa(String.fromCharCode(...bytes));
      setBase64Text(base64String);
    }
    if (sourceField !== 'hex') {
      const hexString = Array.from(bytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
      setHexBytes(hexString);
    }
    if (sourceField !== 'binaryStream') {
        const binString = Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join(' ');
        setBinaryStream(binString);
    }

    try {
        const hexStr = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        if (hexStr) {
            const num = BigInt('0x' + hexStr);
            setDecimal(num.toString(10));
            setBinary(num.toString(2));
            setHex(num.toString(16).toUpperCase());
        }
    } catch (e) {
        setDecimal('...');
        setBinary('...');
        setHex('...');
    }

  }, []);

  const clearAllText = () => {
    setText('');
    setBase64Text('');
    setHexBytes('');
    setBinaryStream('');
    setTextError({ field: null, message: null });
    setDecimal('');
    setBinary('');
    setHex('');
  };

  const clearAll = useCallback(() => {
    clearAllText();
    setDecimal('');
    setBinary('');
    setHex('');
    setNumericError({ field: null, message: null });
  }, []);
  
  // --- Handlers ---
  // (Mantienen la lógica igual, solo renderizado cambia)
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    const bytes = value ? new TextEncoder().encode(value) : null;
    updateAllFromBytes(bytes, 'text');
  }, [updateAllFromBytes]);

  const handleBase64Change = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.trim();
    setBase64Text(e.target.value); 
    if (!value) { clearAllText(); return; }
    try {
      if (!/^[A-Za-z0-9+/]*=?=?$/.test(value) || value.length % 4 !== 0) throw new Error("Invalid");
      const binaryString = atob(value);
      const bytes = new Uint8Array(binaryString.length).map((_, i) => binaryString.charCodeAt(i));
      updateAllFromBytes(bytes, 'base64');
    } catch (err) { setTextError({ field: 'base64', message: 'Invalid Base64' }); }
  }, [updateAllFromBytes]);

  const handleHexBytesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value;
    setHexBytes(rawValue);
    const value = rawValue.replace(/\s+/g, '');
    if (!value) { clearAllText(); return; }
    if (!/^[0-9a-fA-F]*$/.test(value)) { setTextError({ field: 'hex', message: 'Hex only' }); return; }
    try {
      const bytes = new Uint8Array(value.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      updateAllFromBytes(bytes, 'hex');
    } catch (err) { setTextError({ field: 'hex', message: 'Error' }); }
  }, [updateAllFromBytes]);

  const handleBinaryStreamChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value;
    setBinaryStream(rawValue);
    const cleanValue = rawValue.replace(/\s+/g, '');
    if (!cleanValue) { clearAllText(); return; }
    if (!/^[01]*$/.test(cleanValue)) { setTextError({ field: 'binary', message: '0/1 only' }); return; }
    try {
      const bytes = new Uint8Array(cleanValue.match(/.{1,8}/g)!.map(byte => parseInt(byte, 2)));
      updateAllFromBytes(bytes, 'binaryStream');
    } catch (err) { setTextError({ field: 'binary', message: 'Error' }); }
  }, [updateAllFromBytes]);
  
  const handleNumericWrapper = (handler: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTextMode) {
        setText(''); setBase64Text(''); setHexBytes(''); setBinaryStream(''); setTextError({ field: null, message: null });
    }
    setNumericError({ field: null, message: null });
    handler(e.target.value);
  };

  const handleDecimalChange = useCallback((value: string) => {
    const trimmedValue = value.trim();
    setDecimal(value);
    if (trimmedValue === '') { setBinary(''); setHex(''); return; }
    if (!/^\d+$/.test(trimmedValue)) { setNumericError({ field: 'decimal', message: 'Num only' }); return; }
    try { const num = BigInt(trimmedValue); setBinary(num.toString(2)); setHex(num.toString(16).toUpperCase()); } catch (e) { setNumericError({ field: 'decimal', message: 'Too big' }); }
  }, []);

  const handleBinaryChange = useCallback((value: string) => {
    const trimmedValue = value.trim();
    setBinary(value);
    if (trimmedValue === '') { setDecimal(''); setHex(''); return; }
    if (!/^[01]+$/.test(trimmedValue)) { setNumericError({ field: 'binary', message: '0/1 only' }); return; }
    try { const num = BigInt(`0b${trimmedValue}`); setDecimal(num.toString(10)); setHex(num.toString(16).toUpperCase()); } catch (e) { setNumericError({ field: 'binary', message: 'Too big' }); }
  }, []);

  const handleHexChange = useCallback((value: string) => {
    const trimmedValue = value.trim();
    setHex(value);
    if (trimmedValue === '') { setDecimal(''); setBinary(''); return; }
    if (!/^[0-9a-fA-F]+$/.test(trimmedValue)) { setNumericError({ field: 'hex', message: 'Hex only' }); return; }
    try { const num = BigInt(`0x${trimmedValue}`); setDecimal(num.toString(10)); setBinary(num.toString(2)); } catch (e) { setNumericError({ field: 'hex', message: 'Too big' }); }
  }, []);

  const saveToHistory = () => {
    if (isTextMode) {
        addToHistory({
            tool: t('menu.numberBase'),
            details: 'Text/Bytes',
            input: text || base64Text,
            output: `Hex: ${hexBytes} | Bin: ${binaryStream}`
        });
    } else if (decimal || binary || hex) {
         addToHistory({
            tool: t('menu.numberBase'),
            details: 'Numeric',
            input: decimal ? `Dec: ${decimal}` : (binary ? `Bin: ${binary}` : `Hex: ${hex}`),
            output: `Dec: ${decimal} | Hex: ${hex} | Bin: ${binary}`
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextareaGroup id="text-input" label={t('base.label.text')} value={text} onChange={handleTextChange} placeholder={t('base.ph.text')} rows={6}/>
        <TextareaGroup id="base64" label={t('base.label.base64')} value={base64Text} onChange={handleBase64Change} placeholder={t('base.ph.base64')} error={textError.field === 'base64' ? textError.message : null} rows={6}/>
        <TextareaGroup id="binary-bytes" label={t('base.label.binaryBytes')} value={binaryStream} onChange={handleBinaryStreamChange} placeholder={t('base.ph.binaryBytes')} error={textError.field === 'binary' ? textError.message : null} rows={6}/>
        <TextareaGroup id="hex-bytes" label={t('base.label.hexBytes')} value={hexBytes} onChange={handleHexBytesChange} placeholder={t('base.ph.hexBytes')} error={textError.field === 'hex' ? textError.message : null} rows={6}/>
      </div>
      
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
        <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-sm tracking-wider">{t('base.title.numeric')}</span>
        <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <InputGroup id="decimal" label={t('base.label.decimal')} value={decimal} onChange={handleNumericWrapper(handleDecimalChange)} placeholder="10" readOnly={isTextMode} error={numericError.field === 'decimal' ? numericError.message : null} />
        <InputGroup id="binary" label={t('base.label.binaryNum')} value={binary} onChange={handleNumericWrapper(handleBinaryChange)} placeholder="1010" readOnly={isTextMode} error={numericError.field === 'binary' ? numericError.message : null} />
        <InputGroup id="hex" label={t('base.label.hexNum')} value={hex} onChange={handleNumericWrapper(handleHexChange)} placeholder="A" readOnly={isTextMode} error={numericError.field === 'hex' ? numericError.message : null} />
      </div>

      <div className="text-right pt-2 flex justify-end gap-3">
        <button onClick={saveToHistory} className="bg-accent hover:opacity-90 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
          {t('action.save')}
        </button>
        <button onClick={clearAll} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-md transition-colors duration-200">
          {t('action.clearAll')}
        </button>
      </div>

      <div className="mt-8 pt-4">
          <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
              <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-sm tracking-wider">{t('base.title.encoding')}</span>
              <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
          </div>
          <TextTools />
      </div>

    </div>
  );
};

export default NumberBaseConverter;