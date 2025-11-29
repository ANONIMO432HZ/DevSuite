import React, { useState, useEffect, useCallback, useRef } from 'react';
import TextareaGroup from './TextareaGroup';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useLanguage } from '../contexts/LanguageContext';

type HarmonyType = 'analogous' | 'monochromatic' | 'complementary' | 'split-complementary' | 'triadic' | 'tetradic';
type GradientType = 'linear' | 'radial';
type EditMode = 'rgb' | 'hsl';

interface ColorInfo { hex: string; hsl: { h: number; s: number; l: number }; }

const COLOR_PRESETS = [
  { name: 'Pasión', color: '#E74C3C', description: 'Amor, peligro, acción' },
  { name: 'Energía', color: '#F39C12', description: 'Creatividad, aventura' },
  { name: 'Lujo', color: '#D4AF37', description: 'Exclusividad, éxito, dorado' },
  { name: 'Felicidad', color: '#F1C40F', description: 'Optimismo, calidez, verano' },
  { name: 'Naturaleza', color: '#4CAF50', description: 'Crecimiento, salud, orgánico' },
  { name: 'Equilibrio', color: '#009688', description: 'Calma, renovación, teal' },
  { name: 'Tecnología', color: '#00BCD4', description: 'Futuro, claridad, cian' },
  { name: 'Confianza', color: '#2196F3', description: 'Seguridad, profesional' },
  { name: 'Corporativo', color: '#2C3E50', description: 'Seriedad, autoridad, navy' },
  { name: 'Espiritual', color: '#673AB7', description: 'Sabiduría, imaginación' },
  { name: 'Creatividad', color: '#9C27B0', description: 'Misterio, artístico, violeta' },
  { name: 'Romance', color: '#E91E63', description: 'Sensibilidad, dulzura' },
  { name: 'Tierra', color: '#795548', description: 'Estabilidad, rústico, hogar' },
  { name: 'Sofisticado', color: '#607D8B', description: 'Moderno, neutro, acero' },
  { name: 'Minimalismo', color: '#9E9E9E', description: 'Balance, plata, calma' },
];

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const ExclamationIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>);

const hexToRgb = (hex: string) => { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16), } : null; };
const rgbToHsl = (r: number, g: number, b: number) => { r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0, s, l = (max + min) / 2; if (max === min) { h = s = 0; } else { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; } h /= 6; } return { h: h * 360, s: s * 100, l: l * 100 }; };
const hslToRgb = (h: number, s: number, l: number) => { h /= 360; s /= 100; l /= 100; let r, g, b; if (s === 0) { r = g = b = l; } else { const hue2rgb = (p: number, q: number, t: number) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }; const q = l < 0.5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q; r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3); } return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }; };
const rgbToHex = (r: number, g: number, b: number) => '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
const hslToHex = (h: number, s: number, l: number) => { const { r, g, b } = hslToRgb(normalizeAngle(h), Math.max(0, Math.min(100, s)), Math.max(0, Math.min(100, l))); return rgbToHex(r, g, b); };
const formatHslString = (h: number, s: number, l: number) => `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
const formatRgbString = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;

interface ColorSliderProps { label: string; value: number | string; max: number; onChange: (val: string) => void; backgroundStyle: string; }
const ColorSlider: React.FC<ColorSliderProps> = ({ label, value, max, onChange, backgroundStyle }) => (
    <div className="flex items-center gap-3 mb-2"><span className="w-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</span><div className="flex-grow relative h-6 rounded-md overflow-hidden ring-1 ring-slate-200 dark:ring-slate-600"><div className="absolute inset-0" style={{ background: backgroundStyle }}/><input type="range" min="0" max={max} value={typeof value === 'number' ? value : 0} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/></div><input type="number" min="0" max={max} value={value} onChange={(e) => onChange(e.target.value)} className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 rounded-md px-1 py-0.5 text-center text-sm focus:ring-2 focus:ring-accent"/></div>
);

const PaletteGenerator: React.FC = () => {
  const { t } = useLanguage();
  const [baseColor, setBaseColor] = useState('#3B82F6');
  const [hexInput, setHexInput] = useState('#3B82F6');
  const [inputError, setInputError] = useState<string | null>(null);
  const isUserInputRef = useRef(false);
  const [baseColorData, setBaseColorData] = useState({ rgb: '', hsl: '' });
  const [harmony, setHarmony] = useState<HarmonyType>('analogous');
  const [palette, setPalette] = useState<ColorInfo[]>([]);
  const [editMode, setEditMode] = useState<EditMode>('rgb');
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [gradientAngle, setGradientAngle] = useState(90);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'css' | 'json'>('css');

  useUnsavedChanges(baseColor !== '#3B82F6');

  const rgbVal = hexToRgb(baseColor) || { r: 0, g: 0, b: 0 };
  const hslVal = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b);

  useEffect(() => {
    if (!isUserInputRef.current) { setHexInput(baseColor); setInputError(null); }
    isUserInputRef.current = false;
    const rgb = hexToRgb(baseColor);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setBaseColorData({ rgb: formatRgbString(rgb.r, rgb.g, rgb.b), hsl: formatHslString(hsl.h, hsl.s, hsl.l) });
    }
  }, [baseColor]);

  const generateRandomColor = useCallback(() => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    setBaseColor(rgbToHex(r, g, b));
  }, []);

  const generatePalette = useCallback(() => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let newPalette: { h: number; s: number; l: number }[] = [];
    switch (harmony) {
      case 'analogous': newPalette = [ { ...hsl, h: hsl.h - 60 }, { ...hsl, h: hsl.h - 30 }, hsl, { ...hsl, h: hsl.h + 30 }, { ...hsl, h: hsl.h + 60 }, ]; break;
      case 'monochromatic': newPalette = [ { ...hsl, l: Math.max(5, hsl.l - 40) }, { ...hsl, l: Math.max(10, hsl.l - 20) }, hsl, { ...hsl, l: Math.min(95, hsl.l + 20) }, { ...hsl, l: Math.min(90, hsl.l + 40) }, ]; break;
      case 'complementary': const compH = hsl.h + 180; newPalette = [ hsl, { ...hsl, l: Math.min(90, hsl.l + 30) }, { h: compH, s: hsl.s, l: hsl.l }, { h: compH, s: hsl.s, l: Math.max(10, hsl.l - 20) }, { h: compH, s: hsl.s, l: Math.min(90, hsl.l + 20) }, ]; break;
      case 'split-complementary': newPalette = [ hsl, { ...hsl, h: hsl.h + 150 }, { ...hsl, h: hsl.h + 210 }, { h: hsl.h + 150, s: hsl.s, l: Math.min(90, hsl.l + 20) }, { h: hsl.h + 210, s: hsl.s, l: Math.max(10, hsl.l - 20) }, ]; break;
      case 'triadic': newPalette = [ hsl, { ...hsl, h: hsl.h + 120 }, { ...hsl, h: hsl.h + 240 }, { h: hsl.h + 120, s: hsl.s, l: Math.min(90, hsl.l + 20) }, { h: hsl.h + 240, s: hsl.s, l: Math.max(10, hsl.l - 20) }, ]; break;
      case 'tetradic': newPalette = [ hsl, { ...hsl, h: hsl.h + 60 }, { ...hsl, h: hsl.h + 180 }, { ...hsl, h: hsl.h + 240 }, { ...hsl, h: hsl.h + 180, l: Math.min(90, hsl.l + 20) } ]; break;
    }
    setPalette(newPalette.map((color) => ({ hsl: color, hex: hslToHex(color.h, color.s, color.l) })));
  }, [baseColor, harmony]);

  useEffect(() => { generatePalette(); }, [generatePalette]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; isUserInputRef.current = true; setHexInput(val);
    if (!val) { setInputError("Empty"); return; }
    if (!/^[#0-9A-F]*$/i.test(val)) { setInputError("Invalid"); return; }
    if (/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(val)) { setBaseColor(val.startsWith('#') ? val : '#' + val); setInputError(null); } 
    else { setInputError("Format Error"); }
  };

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: string) => {
    if (value === '') { const newRgb = { ...rgbVal, [component]: 0 }; setBaseColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b)); return; }
    let val = parseInt(value); if (isNaN(val)) return; val = Math.max(0, Math.min(255, val));
    const newRgb = { ...rgbVal, [component]: val }; setBaseColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHslChange = (component: 'h' | 's' | 'l', value: string) => {
    if (value === '') { const newHsl = { ...hslVal, [component]: 0 }; setBaseColor(hslToHex(newHsl.h, newHsl.s, newHsl.l)); return; }
    let val = parseInt(value); if (isNaN(val)) return; val = Math.max(0, Math.min(component === 'h' ? 360 : 100, val));
    const newHsl = { ...hslVal, [component]: val }; setBaseColor(hslToHex(newHsl.h, newHsl.s, newHsl.l));
  };

  const handleCopyColor = (hex: string, index: number) => { navigator.clipboard.writeText(hex); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 1500); };
  const handleCopyValue = useCallback((value: string, field: string) => { navigator.clipboard.writeText(value); setCopiedField(field); setTimeout(() => setCopiedField(null), 1500); }, []);
  const getContrastColor = (hex: string) => { const rgb = hexToRgb(hex); if (!rgb) return 'black'; return ((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000) >= 128 ? 'black' : 'white'; };
  const getGradientCSS = useCallback(() => { if (palette.length === 0) return ''; const colors = palette.map(c => c.hex).join(', '); return gradientType === 'linear' ? `background-image: linear-gradient(${gradientAngle}deg, ${colors});` : `background-image: radial-gradient(circle, ${colors});`; }, [palette, gradientType, gradientAngle]);
  const getExportCode = useCallback(() => { if (palette.length === 0) return ''; if (exportFormat === 'json') return JSON.stringify(palette.map(c => c.hex), null, 2); return `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`; }, [palette, exportFormat]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="w-full h-full min-h-[300px] rounded-xl shadow-inner flex flex-col items-center justify-center transition-colors duration-500 ease-in-out border border-slate-200 dark:border-slate-700 relative overflow-hidden" style={{ backgroundColor: baseColor }}>
            <span className="text-4xl font-bold font-mono tracking-wider opacity-90 mb-2" style={{ color: getContrastColor(baseColor) }}>{baseColor}</span>
            <div className="opacity-80 text-sm font-mono flex flex-col items-center gap-1" style={{ color: getContrastColor(baseColor) }}>
                <button onClick={() => handleCopyValue(baseColorData.rgb, 'rgb-main')} className="hover:underline flex items-center gap-2">{baseColorData.rgb} {copiedField === 'rgb-main' && <CheckIcon className="w-4 h-4"/>}</button>
                <button onClick={() => handleCopyValue(baseColorData.hsl, 'hsl-main')} className="hover:underline flex items-center gap-2">{baseColorData.hsl} {copiedField === 'hsl-main' && <CheckIcon className="w-4 h-4"/>}</button>
            </div>
            <button onClick={generateRandomColor} className="absolute bottom-6 right-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg active:scale-95" style={{ color: getContrastColor(baseColor), borderColor: getContrastColor(baseColor) }}>🎲 Random</button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-6">
            <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('palette.edit')}</label>
                    <div className="flex bg-slate-200 dark:bg-slate-900 rounded-md p-0.5"><button onClick={() => setEditMode('rgb')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${editMode === 'rgb' ? 'bg-white dark:bg-slate-700 shadow text-accent' : 'text-slate-500 dark:text-slate-400'}`}>RGB</button><button onClick={() => setEditMode('hsl')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${editMode === 'hsl' ? 'bg-white dark:bg-slate-700 shadow text-accent' : 'text-slate-500 dark:text-slate-400'}`}>HSL</button></div>
                </div>
                
                {editMode === 'rgb' ? (
                    <>
                        <ColorSlider label="R" value={rgbVal.r} max={255} onChange={(v) => handleRgbChange('r', v)} backgroundStyle={`linear-gradient(to right, rgb(0, ${rgbVal.g}, ${rgbVal.b}), rgb(255, ${rgbVal.g}, ${rgbVal.b}))`} />
                        <ColorSlider label="G" value={rgbVal.g} max={255} onChange={(v) => handleRgbChange('g', v)} backgroundStyle={`linear-gradient(to right, rgb(${rgbVal.r}, 0, ${rgbVal.b}), rgb(${rgbVal.r}, 255, ${rgbVal.b}))`} />
                        <ColorSlider label="B" value={rgbVal.b} max={255} onChange={(v) => handleRgbChange('b', v)} backgroundStyle={`linear-gradient(to right, rgb(${rgbVal.r}, ${rgbVal.g}, 0), rgb(${rgbVal.r}, ${rgbVal.g}, 255))`} />
                    </>
                ) : (
                    <>
                        <ColorSlider label="H" value={Math.round(hslVal.h)} max={360} onChange={(v) => handleHslChange('h', v)} backgroundStyle="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" />
                        <ColorSlider label="S" value={Math.round(hslVal.s)} max={100} onChange={(v) => handleHslChange('s', v)} backgroundStyle={`linear-gradient(to right, hsl(${hslVal.h}, 0%, ${hslVal.l}%), hsl(${hslVal.h}, 100%, ${hslVal.l}%))`} />
                        <ColorSlider label="L" value={Math.round(hslVal.l)} max={100} onChange={(v) => handleHslChange('l', v)} backgroundStyle={`linear-gradient(to right, #000, hsl(${hslVal.h}, ${hslVal.s}%, 50%), #fff)`} />
                    </>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">HEX Color</label>
                    <div className="relative">
                        <input type="text" value={hexInput} onChange={handleHexChange} className={`w-full bg-white dark:bg-slate-900 border ${inputError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-md py-2 px-3 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-accent`}/>
                        {inputError && <ExclamationIcon className="absolute right-3 top-2.5 w-5 h-5 text-red-500" />}
                    </div>
                </div>
            </div>

            <div>
                 <label className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 block">{t('palette.harmony')}</label>
                 <select value={harmony} onChange={(e) => setHarmony(e.target.value as HarmonyType)} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-700 dark:text-slate-200">
                    <option value="analogous">Analogous</option>
                    <option value="monochromatic">Monochromatic</option>
                    <option value="complementary">Complementary</option>
                    <option value="split-complementary">Split Complementary</option>
                    <option value="triadic">Triadic</option>
                    <option value="tetradic">Tetradic</option>
                 </select>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t('palette.generated')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {palette.map((color, idx) => (
                <div key={idx} className="group relative aspect-square rounded-xl shadow-sm transition-transform hover:-translate-y-1 overflow-hidden cursor-pointer ring-1 ring-slate-200 dark:ring-slate-700" style={{ backgroundColor: color.hex }} onClick={() => handleCopyColor(color.hex, idx)}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                         <span className="font-mono font-bold text-white tracking-widest bg-black/40 px-2 py-1 rounded">{copiedIndex === idx ? 'COPIED' : color.hex}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t('palette.gradient')}</h3>
             <div className="h-32 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700" style={{ backgroundImage: gradientType === 'linear' ? `linear-gradient(${gradientAngle}deg, ${palette.map(c => c.hex).join(', ')})` : `radial-gradient(circle, ${palette.map(c => c.hex).join(', ')})` }}></div>
             <div className="flex gap-4 items-center">
                 <select value={gradientType} onChange={(e) => setGradientType(e.target.value as GradientType)} className="bg-slate-100 dark:bg-slate-800 border-none rounded py-1 px-3 text-sm"><option value="linear">{t('palette.gradient.linear')}</option><option value="radial">{t('palette.gradient.radial')}</option></select>
                 {gradientType === 'linear' && <input type="range" min="0" max="360" value={gradientAngle} onChange={(e) => setGradientAngle(parseInt(e.target.value))} className="flex-grow"/>}
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{t('palette.gradient.css')}</label>
                <div className="relative"><input type="text" readOnly value={getGradientCSS()} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded py-2 px-3 text-xs font-mono text-slate-600 dark:text-slate-400" /><button onClick={() => handleCopyValue(getGradientCSS(), 'grad-css')} className="absolute right-1 top-1 p-1.5 text-slate-400 hover:text-accent">{copiedField === 'grad-css' ? <CheckIcon className="w-4 h-4"/> : <CopyIcon className="w-4 h-4"/>}</button></div>
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t('palette.export')}</h3>
             <div className="flex gap-2 mb-2"><button onClick={() => setExportFormat('css')} className={`px-3 py-1 text-xs font-bold rounded ${exportFormat === 'css' ? 'bg-accent text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>CSS</button><button onClick={() => setExportFormat('json')} className={`px-3 py-1 text-xs font-bold rounded ${exportFormat === 'json' ? 'bg-accent text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>JSON</button></div>
             <TextareaGroup id="export-code" label="" value={getExportCode()} onChange={()=>{}} placeholder="" rows={5} readOnly />
          </div>
      </div>
      
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
         <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t('palette.psychology')}</h3>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
             {COLOR_PRESETS.map((p, i) => (
                 <button key={i} onClick={() => setBaseColor(p.color)} className="text-left group bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-accent dark:hover:border-accent transition-all hover:-translate-y-0.5">
                     <div className="w-full h-8 rounded mb-2" style={{ backgroundColor: p.color }}></div>
                     <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.name}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>
                 </button>
             ))}
         </div>
      </div>
    </div>
  );
};

export default PaletteGenerator;