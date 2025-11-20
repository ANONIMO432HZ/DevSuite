
import React, { useState, useCallback, useRef } from 'react';
import TextareaGroup from './TextareaGroup';
import * as yaml from 'js-yaml';
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';

type DataFormat = 'json' | 'yaml' | 'toml';

// --- Iconos ---
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const MagicIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

// --- Presets de Datos ---
const PRESETS = [
    {
        id: 'package',
        label: 'JSON: package.json',
        format: 'json' as DataFormat,
        content: `{
  "name": "mi-proyecto",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "react": "^18.2.0"
  }
}`
    },
    {
        id: 'docker-compose',
        label: 'YAML: docker-compose.yml',
        format: 'yaml' as DataFormat,
        content: `version: '3'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
  db:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: secret`
    },
    {
        id: 'cargo',
        label: 'TOML: Cargo.toml',
        format: 'toml' as DataFormat,
        content: `[package]
name = "mi-crate"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1.0", features = ["derive"] }`
    },
    {
        id: 'vercel',
        label: 'JSON: vercel.json',
        format: 'json' as DataFormat,
        content: `{
  "version": 2,
  "name": "mi-app-vercel",
  "builds": [
    { "src": "package.json", "use": "@vercel/next" }
  ]
}`
    },
    {
        id: 'k8s',
        label: 'YAML: Kubernetes Pod',
        format: 'yaml' as DataFormat,
        content: `apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.14.2
    ports:
    - containerPort: 80`
    },
    {
        id: 'pyproject',
        label: 'TOML: pyproject.toml',
        format: 'toml' as DataFormat,
        content: `[build-system]
requires = ["setuptools", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "mi_proyecto"
version = "0.0.1"`
    }
];

// --- Funciones de Conversión ---

const parseInput = (input: string): { data: any, format: DataFormat } => {
    input = input.trim();
    if (!input) throw new Error("Entrada vacía");

    // Intentar JSON
    try {
        const data = JSON.parse(input);
        return { data, format: 'json' };
    } catch (e) {}

    // Intentar YAML (js-yaml)
    try {
        const data = yaml.load(input);
        if (typeof data === 'object' && data !== null) {
            return { data, format: 'yaml' };
        }
    } catch (e) {}

    // Intentar TOML (smol-toml)
    try {
        const data = parseToml(input);
        return { data, format: 'toml' };
    } catch (e) {}

    throw new Error("Formato no reconocido o inválido (esperado JSON, YAML o TOML).");
};

const stringifyData = (data: any, format: DataFormat): string => {
    switch (format) {
        case 'json':
            return JSON.stringify(data, null, 2);
        case 'yaml':
            return yaml.dump(data);
        case 'toml':
            try {
                return stringifyToml(data);
            } catch (e) {
                throw new Error("Error al generar TOML: " + (e as Error).message);
            }
        default:
            return "";
    }
};

const JSONConverter: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState('config');
  const [detectedFormat, setDetectedFormat] = useState<DataFormat | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputData(e.target.value);
    setError(null);
    setSuccessMsg(null);
    setDetectedFormat(null); // Resetear detección al editar
  }, []);

  // Función central para convertir/formatear
  const handleConvert = useCallback((targetFormat: DataFormat) => {
    const trimmedInput = inputData.trim();
    if (!trimmedInput) return;

    try {
      // 1. Parsear la entrada (Auto-detección)
      const { data, format } = parseInput(trimmedInput);
      setDetectedFormat(format);
      
      // 2. Generar la salida en el formato deseado
      const output = stringifyData(data, targetFormat);
      setInputData(output);
      setError(null);
      
    } catch (e: any) {
      setError(e.message || "Error al procesar los datos.");
    }
  }, [inputData]);

  const handleUnescape = useCallback(() => {
    const trimmedInput = inputData.trim();
    if (!trimmedInput) return;
    try {
        const firstPass = JSON.parse(trimmedInput);
        if (typeof firstPass === 'string') {
            try {
                const objectData = JSON.parse(firstPass);
                setInputData(JSON.stringify(objectData, null, 2));
                setError(null);
                setDetectedFormat('json');
            } catch {
                setInputData(firstPass);
                setError(null);
            }
        } else if (typeof firstPass === 'object') {
            setInputData(JSON.stringify(firstPass, null, 2));
            setError(null);
            setDetectedFormat('json');
        }
    } catch (e) {
        setError("No se pudo descodificar. Asegúrate de que es un string JSON válido.");
    }
  }, [inputData]);

  const clearAll = useCallback(() => {
    setInputData('');
    setError(null);
    setSuccessMsg(null);
    setFileName('config');
    setDetectedFormat(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // --- Funciones de Importar/Exportar ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    setFileName(nameWithoutExt);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setInputData(content);
        setError(null);
        
        // Intentar adivinar formato por extensión primero
        if (ext === 'json') setDetectedFormat('json');
        else if (ext === 'yaml' || ext === 'yml') setDetectedFormat('yaml');
        else if (ext === 'toml') setDetectedFormat('toml');
        else {
             // Si no, parsear
             try {
                 const { format } = parseInput(content);
                 setDetectedFormat(format);
             } catch (e) {
                 setDetectedFormat(null);
             }
        }

      } catch (err) {
        setError("Error al leer el archivo.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const handleExportClick = () => {
    if (!inputData.trim()) {
        setError("No hay contenido para exportar.");
        return;
    }

    try {
        // Determinar formato actual para poner la extensión correcta
        const { format } = parseInput(inputData);
        let ext = format === 'yaml' ? 'yaml' : format === 'toml' ? 'toml' : 'json';
        let mime = format === 'yaml' ? 'text/yaml' : format === 'toml' ? 'application/toml' : 'application/json';

        const finalFileName = fileName.trim() ? fileName.trim() : 'config';
        
        const blob = new Blob([inputData], { type: mime });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${finalFileName}.${ext}`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setError(null);
    } catch (err: any) {
        setError("Error al exportar: " + (err.message || "Datos inválidos"));
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = e.target.value;
      const preset = PRESETS.find(p => p.id === selectedId);
      
      if (preset) {
          setInputData(preset.content);
          setFileName(preset.id);
          setDetectedFormat(preset.format);
          setError(null);
      }
      e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json,.yaml,.yml,.toml,.txt"
        className="hidden" 
      />

      {/* Barra de Herramientas */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-end xl:items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
         
         {/* Izquierda: Importar y Presets */}
         <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2 px-4 rounded-md transition-colors duration-200 border border-slate-300 dark:border-slate-600 shadow-sm text-sm"
                title="Cargar archivo (JSON, YAML, TOML)"
            >
                <UploadIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Importar</span>
            </button>

            <div className="relative">
                <select
                    onChange={handlePresetChange}
                    defaultValue=""
                    className="appearance-none cursor-pointer bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 py-2 pl-3 pr-8 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                    <option value="" disabled>📄 Cargar Ejemplo</option>
                    {PRESETS.map(preset => (
                        <option key={preset.id} value={preset.id}>{preset.label}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400">
                    <ChevronDownIcon className="w-4 h-4" />
                </div>
            </div>

            <div className="h-8 w-px bg-slate-300 dark:bg-slate-600 mx-1 hidden sm:block"></div>

            <div className="flex items-center relative flex-grow md:flex-grow-0">
                <input 
                    type="text" 
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Nombre archivo"
                    className="w-full md:w-32 lg:w-40 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-l-md py-2 px-3 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition text-sm"
                />
                <button
                    onClick={handleExportClick}
                    disabled={!inputData.trim()}
                    className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-3 rounded-r-md transition-colors duration-200 shadow-sm disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center"
                    title="Descargar (La extensión se detecta automáticamente)"
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Derecha: Acciones de Conversión */}
        <div className="flex flex-wrap gap-2 justify-end w-full xl:w-auto items-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mr-1 hidden xl:inline">Convertir a:</span>
            
            <div className="flex bg-slate-200 dark:bg-slate-700 rounded-md p-1 gap-1">
                <button
                    onClick={() => handleConvert('json')}
                    disabled={!inputData.trim()}
                    className="px-3 py-1.5 text-sm font-medium rounded bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm hover:text-lime-600 dark:hover:text-lime-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    JSON
                </button>
                <button
                    onClick={() => handleConvert('yaml')}
                    disabled={!inputData.trim()}
                    className="px-3 py-1.5 text-sm font-medium rounded bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm hover:text-lime-600 dark:hover:text-lime-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    YAML
                </button>
                <button
                    onClick={() => handleConvert('toml')}
                    disabled={!inputData.trim()}
                    className="px-3 py-1.5 text-sm font-medium rounded bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm hover:text-lime-600 dark:hover:text-lime-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    TOML
                </button>
            </div>

            <div className="h-8 w-px bg-slate-300 dark:bg-slate-600 mx-1 hidden sm:block"></div>

            <button
                onClick={handleUnescape}
                disabled={!inputData.trim()}
                className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50"
                title="Descodificar string JSON"
            >
                <MagicIcon className="w-5 h-5" />
            </button>
            
            <button
                onClick={clearAll}
                className="px-3 py-2 text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-md transition-colors"
            >
                Limpiar
            </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        {detectedFormat && (
            <div className="absolute top-0 right-0 transform -translate-y-full mb-1 mr-1">
                <span className="bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 text-xs font-bold px-2 py-1 rounded-t-md border-b-0">
                    Detectado: {detectedFormat.toUpperCase()}
                </span>
            </div>
        )}
        {successMsg && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow-md animate-bounce">
                {successMsg}
            </div>
        )}
        <TextareaGroup
            id="data-editor"
            label="Editor de Datos"
            value={inputData}
            onChange={handleInputChange}
            placeholder='Pega tu JSON, YAML o TOML aquí...'
            error={error}
            rows={18}
        />
      </div>
    </div>
  );
};

export default JSONConverter;
