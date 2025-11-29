
import React, { useState, useEffect, useCallback, useRef } from 'react';
import CryptoJS from 'crypto-js';
import { blake2b, blake2s } from '@noble/hashes/blake2';
import { blake3 } from '@noble/hashes/blake3';
import { bytesToHex } from '@noble/hashes/utils';
import TextareaGroup from './TextareaGroup';
import { useHistory } from '../contexts/HistoryContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useLanguage } from '../contexts/LanguageContext';

type Mode = 'hash' | 'cipher' | 'pqc';
type CipherAction = 'encrypt' | 'decrypt';
type SecurityLevel = 'unsafe' | 'standard' | 'strong';

interface AlgoDef { id: string; name: string; security: SecurityLevel; }

const HASH_ALGOS: AlgoDef[] = [
    { id: 'MD5', name: 'MD5', security: 'unsafe' },
    { id: 'SHA1', name: 'SHA-1', security: 'unsafe' },
    { id: 'RIPEMD160', name: 'RIPEMD-160', security: 'standard' },
    { id: 'SHA256', name: 'SHA-256', security: 'standard' },
    { id: 'SHA512', name: 'SHA-512', security: 'strong' },
    { id: 'SHA3', name: 'SHA-3', security: 'strong' },
    { id: 'BLAKE2s', name: 'BLAKE2s', security: 'strong' },
    { id: 'BLAKE2b', name: 'BLAKE2b', security: 'strong' },
    { id: 'BLAKE3', name: 'BLAKE3', security: 'strong' },
];

const CIPHER_ALGOS = [
    { id: 'AES', name: 'AES (256-bit)' },
    { id: 'TripleDES', name: '3DES' },
    { id: 'DES', name: 'DES' },
    { id: 'Rabbit', name: 'Rabbit' },
    { id: 'RC4', name: 'RC4' },
];

const MAX_FILE_SIZE = 200 * 1024 * 1024;

// ... Icons ...
const CopyIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const CheckIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const EyeIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const EyeOffIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>);
const FileIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const TrashIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);

const bufferToHex = (buffer: ArrayBuffer): string => {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
};

const HashGenerator: React.FC = () => {
    const { t } = useLanguage();
    const [mode, setMode] = useState<Mode>('hash');
    const { addToHistory } = useHistory();

    const [hashInput, setHashInput] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [hashes, setHashes] = useState<Record<string, string>>({});
    const [isHashing, setIsHashing] = useState(false);
    const [hashError, setHashError] = useState<string | null>(null);
    const [isSecureContext, setIsSecureContext] = useState(true);
    const [copiedHash, setCopiedHash] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [useKdf, setUseKdf] = useState(false);
    const [kdfSalt, setKdfSalt] = useState('');
    const [kdfIter, setKdfIter] = useState(1000);

    const [cipherInput, setCipherInput] = useState('');
    const [cipherKey, setCipherKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [cipherAlgo, setCipherAlgo] = useState('AES');
    const [cipherOutput, setCipherOutput] = useState('');
    const [cipherError, setCipherError] = useState<string | null>(null);

    useUnsavedChanges(hashInput.length > 0 || !!file || cipherInput.length > 0);

    useEffect(() => { if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.subtle)) setIsSecureContext(false); }, []);
    useEffect(() => { if (file) setUseKdf(false); }, [file]);

    const calculateTextHashes = useCallback(async () => {
        if (!hashInput && !file) { setHashes({}); return; }
        setIsHashing(true); setHashError(null);
        const results: Record<string, string> = {};
        try {
            results['MD5'] = CryptoJS.MD5(hashInput).toString();
            results['SHA3'] = CryptoJS.SHA3(hashInput).toString();
            results['RIPEMD160'] = CryptoJS.RIPEMD160(hashInput).toString();
            const inputBytes = new TextEncoder().encode(hashInput);
            results['BLAKE2s'] = bytesToHex(blake2s(inputBytes));
            results['BLAKE2b'] = bytesToHex(blake2b(inputBytes));
            results['BLAKE3'] = bytesToHex(blake3(inputBytes));

            if (isSecureContext) {
                const [h1, h256, h512] = await Promise.all([
                    crypto.subtle.digest('SHA-1', inputBytes),
                    crypto.subtle.digest('SHA-256', inputBytes),
                    crypto.subtle.digest('SHA-512', inputBytes),
                ]);
                results['SHA1'] = bufferToHex(h1); results['SHA256'] = bufferToHex(h256); results['SHA512'] = bufferToHex(h512);
            } else {
                results['SHA1'] = CryptoJS.SHA1(hashInput).toString(); results['SHA256'] = CryptoJS.SHA256(hashInput).toString(); results['SHA512'] = CryptoJS.SHA512(hashInput).toString();
            }
            if (useKdf && !file) {
                results['PBKDF2'] = CryptoJS.PBKDF2(hashInput, kdfSalt, { keySize: 256 / 32, iterations: kdfIter }).toString();
            }
            setHashes(results);
        } catch (err) { setHashError('Error'); } finally { setIsHashing(false); }
    }, [hashInput, isSecureContext, file, useKdf, kdfSalt, kdfIter]);

    useEffect(() => { if (file) return; const handler = setTimeout(calculateTextHashes, 300); return () => clearTimeout(handler); }, [calculateTextHashes, file]);

    useEffect(() => {
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) { setHashError(`File > 200MB`); setHashes({}); return; }
        setIsHashing(true); setHashes({}); setHashError(null);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const buffer = e.target?.result as ArrayBuffer;
                const wordArray = CryptoJS.lib.WordArray.create(buffer as any); 
                const uint8Array = new Uint8Array(buffer);
                const res: Record<string, string> = {};
                res['MD5'] = CryptoJS.MD5(wordArray).toString();
                res['SHA3'] = CryptoJS.SHA3(wordArray).toString();
                res['RIPEMD160'] = CryptoJS.RIPEMD160(wordArray).toString();
                res['BLAKE2s'] = bytesToHex(blake2s(uint8Array));
                res['BLAKE2b'] = bytesToHex(blake2b(uint8Array));
                res['BLAKE3'] = bytesToHex(blake3(uint8Array));
                if (isSecureContext) {
                    const [h1, h256, h512] = await Promise.all([crypto.subtle.digest('SHA-1', buffer), crypto.subtle.digest('SHA-256', buffer), crypto.subtle.digest('SHA-512', buffer)]);
                    res['SHA1'] = bufferToHex(h1); res['SHA256'] = bufferToHex(h256); res['SHA512'] = bufferToHex(h512);
                } else {
                    res['SHA1'] = CryptoJS.SHA1(wordArray).toString(); res['SHA256'] = CryptoJS.SHA256(wordArray).toString(); res['SHA512'] = CryptoJS.SHA512(wordArray).toString();
                }
                setHashes(res);
            } catch (err) { setHashError("Error"); } finally { setIsHashing(false); }
        };
        reader.readAsArrayBuffer(file);
    }, [file, isSecureContext]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files?.[0]) { setFile(e.dataTransfer.files[0]); setHashInput(''); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        if (e.clipboardData.files?.[0]) { e.preventDefault(); setFile(e.clipboardData.files[0]); setHashInput(''); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    const handleCipher = (action: CipherAction) => {
        setCipherError(null); setCipherOutput('');
        if (!cipherInput || !cipherKey) { setCipherError("Input required"); return; }
        try {
            let result = '';
            const algoInterface = (CryptoJS as any)[cipherAlgo]; 
            if (!algoInterface) throw new Error("Algo error");
            if (action === 'encrypt') result = algoInterface.encrypt(cipherInput, cipherKey).toString();
            else {
                const decrypted = algoInterface.decrypt(cipherInput, cipherKey);
                try { result = decrypted.toString(CryptoJS.enc.Utf8); } catch(e) { result = ''; }
                if (!result) throw new Error("Error");
            }
            setCipherOutput(result);
            addToHistory({ tool: `${t('hash.tab.cipher')} (${cipherAlgo})`, details: action, input: cipherInput, output: result });
        } catch (e: any) { setCipherError("Error"); }
    };

    const clearCipher = () => { setCipherInput(''); setCipherKey(''); setCipherOutput(''); setCipherError(null); };
    const clearHash = () => { setHashInput(''); setFile(null); setHashes({}); setHashError(null); if (fileInputRef.current) fileInputRef.current.value = ''; };
    const handleCopyHash = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopiedHash(id); setTimeout(() => setCopiedHash(null), 1500); };

    const getSecurityBadge = (level: SecurityLevel) => {
        const colorClass = level === 'unsafe' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : level === 'standard' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colorClass} uppercase`}>{level}</span>;
    };

    const displayAlgos = useKdf && !file ? [...HASH_ALGOS, { id: 'PBKDF2', name: 'PBKDF2', security: 'strong' as SecurityLevel }] : HASH_ALGOS;

    return (
        <div className="space-y-6">
            <div className="flex justify-center mb-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex gap-1 border border-slate-200 dark:border-slate-700">
                    <button onClick={() => setMode('hash')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'hash' ? 'bg-white dark:bg-slate-600 text-accent dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{t('hash.tab.hash')}</button>
                    <button onClick={() => setMode('cipher')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'cipher' ? 'bg-white dark:bg-slate-600 text-accent dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{t('hash.tab.cipher')}</button>
                    <button onClick={() => setMode('pqc')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'pqc' ? 'bg-white dark:bg-slate-600 text-accent dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{t('hash.tab.pqc')}</button>
                </div>
            </div>

            {mode === 'hash' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('hash.label.input')}</label>
                        <div className="relative">
                            <TextareaGroup id="hash-input" label="" value={hashInput} onChange={(e) => { setHashInput(e.target.value); if(file) { setFile(null); if(fileInputRef.current) fileInputRef.current.value=''; } }} onPaste={handlePaste} placeholder={t('hash.ph.input')} disabled={!!file} rows={3} />
                            {!hashInput && (
                                <div className={`mt-3 border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${file ? 'border-accent bg-accent/5' : isDragging ? 'border-accent bg-accent/10' : 'border-slate-300 dark:border-slate-600'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                    <input type="file" ref={fileInputRef} onChange={(e) => { if(e.target.files?.[0]) { setFile(e.target.files[0]); setHashInput(''); } }} className="hidden" />
                                    {!file ? (
                                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-2 py-2">
                                            <FileIcon className="w-8 h-8" />
                                            <span className="text-sm font-medium">{isDragging ? t('hash.drop.active') : t('hash.drop.title')}</span>
                                            <span className="text-xs text-slate-400 opacity-70">{t('hash.drop.limit')}</span>
                                        </button>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 overflow-hidden"><div className="bg-accent/10 p-2 rounded text-accent"><FileIcon className="w-6 h-6" /></div><div className="flex flex-col min-w-0"><span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</span></div></div>
                                            <button onClick={clearHash} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col"><span className={`text-sm font-bold ${file ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{t('hash.kdf.enable')}</span><span className="text-[10px] text-slate-500 dark:text-slate-400">{t('hash.kdf.desc')}</span></div>
                            <button type="button" disabled={!!file} onClick={() => setUseKdf(!useKdf)} className={`${useKdf ? 'bg-accent' : 'bg-slate-200 dark:bg-slate-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}><span aria-hidden="true" className={`${useKdf ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} /></button>
                        </div>
                        {useKdf && !file && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700 animate-fadeIn">
                                <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('hash.kdf.salt')}</label><input type="text" value={kdfSalt} onChange={(e) => setKdfSalt(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-accent"/></div>
                                <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('hash.kdf.iter')}</label><input type="number" value={kdfIter} onChange={(e) => setKdfIter(parseInt(e.target.value) || 1000)} min="1" className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-accent"/></div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {displayAlgos.map(algo => (
                            <div key={algo.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="min-w-[120px] flex flex-col"><span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{algo.name}</span><div className="mt-1">{getSecurityBadge(algo.security)}</div></div>
                                <div className="flex-grow min-w-0 relative"><input type="text" value={hashes[algo.id] || ''} readOnly className="w-full bg-slate-50 dark:bg-slate-900 border-0 text-slate-600 dark:text-slate-300 text-xs font-mono py-2 pl-2 pr-8 rounded focus:ring-0 truncate" /></div>
                                <button onClick={() => handleCopyHash(hashes[algo.id], algo.id)} disabled={!hashes[algo.id]} className="p-2 text-slate-400 hover:text-accent">{copiedHash === algo.id ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}</button>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end pt-2"><button onClick={clearHash} className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 text-sm font-medium">{t('action.clearAll')}</button></div>
                </div>
            )}

            {mode === 'cipher' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
                        <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">{t('hash.cipher.msg')}</label><TextareaGroup id="cipher-input" label="" value={cipherInput} onChange={(e) => setCipherInput(e.target.value)} placeholder="..." rows={4} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
                            <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">{t('hash.cipher.key')}</label><div className="relative"><input type={showKey ? "text" : "password"} value={cipherKey} onChange={(e) => setCipherKey(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-2 pl-3 pr-10" /><button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">{showKey ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}</button></div></div>
                            <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">{t('hash.cipher.algo')}</label><select value={cipherAlgo} onChange={(e) => setCipherAlgo(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3">{CIPHER_ALGOS.map(algo => (<option key={algo.id} value={algo.id}>{algo.name}</option>))}</select></div>
                        </div>
                        <div className="flex gap-4 justify-center"><button onClick={() => handleCipher('encrypt')} className="flex-1 bg-accent hover:opacity-90 text-white py-2.5 rounded-lg font-bold">{t('hash.cipher.encrypt')}</button><button onClick={() => handleCipher('decrypt')} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-bold">{t('hash.cipher.decrypt')}</button></div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">{t('hash.cipher.res')}</label>
                            <div className="relative">
                                <textarea readOnly value={cipherOutput} className={`w-full bg-slate-50 dark:bg-slate-900 border ${cipherError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg py-3 px-4 font-mono text-sm min-h-[100px] outline-none`} />
                                {cipherOutput && !cipherError && (<div className="absolute top-2 right-2 flex gap-1"><button onClick={() => setCipherOutput('')} className="p-2 bg-white dark:bg-slate-800 rounded shadow-sm text-slate-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button><button onClick={() => handleCopyHash(cipherOutput, 'cipher-res')} className="p-2 bg-white dark:bg-slate-800 rounded shadow-sm text-slate-500 hover:text-accent">{copiedHash === 'cipher-res' ? <CheckIcon className="w-5 h-5 text-green-500"/> : <CopyIcon className="w-5 h-5"/>}</button></div>)}
                            </div>
                        </div>
                        <div className="flex justify-end pt-2"><button onClick={clearCipher} className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 text-sm font-medium">{t('action.clearAll')}</button></div>
                    </div>
                </div>
            )}

            {mode === 'pqc' && (
                <div className="space-y-8 animate-fadeIn pt-4">
                    <div className="text-center space-y-4 max-w-2xl mx-auto"><h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('hash.pqc.title')}</h3><p className="text-slate-600 dark:text-slate-300">{t('hash.pqc.desc')}</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-accent/5 to-white dark:from-slate-900 dark:to-accent/10 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-accent/50 transition-all flex flex-col h-full">
                            <div className="mb-4"><h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-accent transition-colors">{t('hash.pqc.kyber')}</h4><span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs font-bold rounded">{t('hash.pqc.kyber.tag')}</span></div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-grow leading-relaxed">{t('hash.pqc.kyber.text')}</p>
                        </div>
                        <div className="bg-gradient-to-br from-accent/5 to-white dark:from-slate-900 dark:to-accent/10 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-accent/50 transition-all flex flex-col h-full">
                            <div className="mb-4"><h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-accent transition-colors">{t('hash.pqc.dilithium')}</h4><span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs font-bold rounded">{t('hash.pqc.dilithium.tag')}</span></div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-grow leading-relaxed">{t('hash.pqc.dilithium.text')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HashGenerator;