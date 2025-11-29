
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useHistory } from '../contexts/HistoryContext';

type System = 'metric' | 'imperial';
type Standard = 'who' | 'asian';

interface BMIResult {
  value: number;
  category: string;
  color: string;
  risk: string;
}

const BMICalculator: React.FC = () => {
  const { t } = useLanguage();
  const { addToHistory } = useHistory();

  const [system, setSystem] = useState<System>('metric');
  const [standard, setStandard] = useState<Standard>('who');
  
  // Metric Inputs
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  
  // Imperial Inputs
  const [weightLb, setWeightLb] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');

  const [result, setResult] = useState<BMIResult | null>(null);

  const calculateBMI = useCallback(() => {
    let weight = 0; // in kg
    let height = 0; // in meters

    if (system === 'metric') {
        if (!weightKg || !heightCm) { setResult(null); return; }
        weight = parseFloat(weightKg);
        height = parseFloat(heightCm) / 100;
    } else {
        if (!weightLb || !heightFt) { setResult(null); return; }
        weight = parseFloat(weightLb) * 0.453592;
        const totalInches = (parseFloat(heightFt) * 12) + (parseFloat(heightIn) || 0);
        height = totalInches * 0.0254;
    }

    if (weight <= 0 || height <= 0) { setResult(null); return; }

    const bmi = weight / (height * height);
    const categoryData = getBMICategory(bmi, standard, t);
    
    setResult({
        value: bmi,
        ...categoryData
    });

  }, [system, standard, weightKg, heightCm, weightLb, heightFt, heightIn, t]);

  useEffect(() => {
    calculateBMI();
  }, [calculateBMI]);

  const saveToHistory = () => {
    if (!result) return;
    const inputStr = system === 'metric' 
        ? `${weightKg}kg / ${heightCm}cm` 
        : `${weightLb}lb / ${heightFt}'${heightIn}"`;
    
    addToHistory({
        tool: t('menu.bmi'),
        details: `${system.toUpperCase()} | ${standard === 'who' ? 'Standard' : 'Asia'}`,
        input: inputStr,
        output: `BMI: ${result.value.toFixed(1)} (${result.category})`
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Configuración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Sistema de Medida</label>
              <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                  <button onClick={() => setSystem('metric')} className={`flex-1 py-1.5 text-sm font-medium rounded transition-all ${system === 'metric' ? 'bg-accent text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{t('bmi.metric')}</button>
                  <button onClick={() => setSystem('imperial')} className={`flex-1 py-1.5 text-sm font-medium rounded transition-all ${system === 'imperial' ? 'bg-accent text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{t('bmi.imperial')}</button>
              </div>
          </div>
          <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Estándar de Clasificación</label>
              <select value={standard} onChange={(e) => setStandard(e.target.value as Standard)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-accent text-slate-700 dark:text-slate-200">
                  <option value="who">{t('bmi.standard')}</option>
                  <option value="asian">{t('bmi.asian')}</option>
              </select>
          </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                  {t('bmi.weight')}
              </h3>
              {system === 'metric' ? (
                  <div className="relative">
                      <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="0" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-3 pl-4 pr-12 text-xl font-mono focus:ring-2 focus:ring-accent" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">kg</span>
                  </div>
              ) : (
                  <div className="relative">
                      <input type="number" value={weightLb} onChange={(e) => setWeightLb(e.target.value)} placeholder="0" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-3 pl-4 pr-12 text-xl font-mono focus:ring-2 focus:ring-accent" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">lb</span>
                  </div>
              )}
          </div>

          <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                   {t('bmi.height')}
              </h3>
              {system === 'metric' ? (
                  <div className="relative">
                      <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="0" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-3 pl-4 pr-12 text-xl font-mono focus:ring-2 focus:ring-accent" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">cm</span>
                  </div>
              ) : (
                  <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="0" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-3 pl-4 pr-12 text-xl font-mono focus:ring-2 focus:ring-accent" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">ft</span>
                      </div>
                      <div className="relative">
                        <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="0" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-3 pl-4 pr-12 text-xl font-mono focus:ring-2 focus:ring-accent" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">in</span>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* Result Area */}
      {result && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mt-6 animate-fadeIn">
              <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: result.color }}></div>
                  
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t('bmi.result')}</p>
                  <div className="text-6xl font-bold font-mono tracking-tighter mb-4" style={{ color: result.color }}>
                      {result.value.toFixed(1)}
                  </div>
                  
                  <div className="inline-block px-4 py-1.5 rounded-full text-white font-bold text-sm mb-6 shadow-sm" style={{ backgroundColor: result.color }}>
                      {result.category}
                  </div>

                  {/* Gauge Bar Visualization */}
                  <div className="w-full max-w-md h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative mb-2">
                      <div className="absolute top-0 bottom-0 w-1 bg-slate-800 dark:bg-white z-10 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ left: `${Math.min(100, Math.max(0, ((result.value - 10) / 40) * 100))}%` }}></div>
                      {/* Color Zones */}
                      <div className="absolute inset-0 flex opacity-70">
                          <div className="h-full bg-blue-400" style={{ width: '21%' }}></div> {/* Underweight < 18.5 approx relative to range 10-50 */}
                          <div className="h-full bg-green-500" style={{ width: '16%' }}></div> {/* Normal 18.5-25 */}
                          <div className="h-full bg-yellow-400" style={{ width: '13%' }}></div> {/* Overweight 25-30 */}
                          <div className="h-full bg-orange-500" style={{ width: '12%' }}></div> {/* Obese I 30-35 */}
                          <div className="h-full bg-red-500" style={{ width: '13%' }}></div> {/* Obese II 35-40 */}
                          <div className="h-full bg-red-700" style={{ width: '25%' }}></div> {/* Obese III > 40 */}
                      </div>
                  </div>
                  <div className="w-full max-w-md flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>10</span>
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>
                      <span>40</span>
                      <span>50+</span>
                  </div>

                  <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl w-full max-w-2xl border border-slate-100 dark:border-slate-700/50">
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">{t('bmi.risk')}</h4>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{result.risk}</p>
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                      <button onClick={saveToHistory} className="bg-slate-800 dark:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm">
                          {t('action.save')}
                      </button>
                  </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 text-center border-t border-amber-100 dark:border-amber-900/30">
                  <p className="text-xs text-amber-700 dark:text-amber-400 italic">
                      Disclaimer: {t('bmi.disclaimer')}
                  </p>
              </div>
          </div>
      )}
    </div>
  );
};

// Helper logic based on WHO & WPRO standards
function getBMICategory(bmi: number, standard: Standard, t: (k: string) => string) {
    // Colors
    const C_UNDER = '#3b82f6'; // Blue
    const C_NORMAL = '#22c55e'; // Green
    const C_OVER = '#eab308'; // Yellow
    const C_OBESE1 = '#f97316'; // Orange
    const C_OBESE2 = '#ef4444'; // Red
    const C_OBESE3 = '#b91c1c'; // Dark Red

    if (standard === 'asian') {
        // Asia-Pacific Cut-offs
        if (bmi < 18.5) return { category: t('bmi.underweight'), color: C_UNDER, risk: t('bmi.risk.low') };
        if (bmi < 23) return { category: t('bmi.normal'), color: C_NORMAL, risk: t('bmi.risk.average') };
        if (bmi < 25) return { category: t('bmi.overweight'), color: C_OVER, risk: t('bmi.risk.increased') };
        if (bmi < 30) return { category: t('bmi.obese1'), color: C_OBESE1, risk: t('bmi.risk.moderate') };
        return { category: t('bmi.obese2'), color: C_OBESE2, risk: t('bmi.risk.severe') }; // WPRO often groups >30 or >35
    } else {
        // WHO Standard
        if (bmi < 18.5) return { category: t('bmi.underweight'), color: C_UNDER, risk: t('bmi.risk.low') };
        if (bmi < 25) return { category: t('bmi.normal'), color: C_NORMAL, risk: t('bmi.risk.average') };
        if (bmi < 30) return { category: t('bmi.overweight'), color: C_OVER, risk: t('bmi.risk.increased') };
        if (bmi < 35) return { category: t('bmi.obese1'), color: C_OBESE1, risk: t('bmi.risk.moderate') };
        if (bmi < 40) return { category: t('bmi.obese2'), color: C_OBESE2, risk: t('bmi.risk.severe') };
        return { category: t('bmi.obese3'), color: C_OBESE3, risk: t('bmi.risk.very_severe') };
    }
}

export default BMICalculator;
