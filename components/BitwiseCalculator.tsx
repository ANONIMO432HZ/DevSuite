
import React, { useState, useEffect, useCallback } from 'react';
import InputGroup from './InputGroup';
import { useHistory } from '../contexts/HistoryContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useLanguage } from '../contexts/LanguageContext';

type Operation = 'AND' | 'OR' | 'XOR' | 'NOT' | 'NAND' | 'NOR' | 'XNOR' | 'LSHIFT' | 'RSHIFT' | 'ZRSHIFT';

interface BitwiseState {
  a: number;
  b: number;
  result: number;
}

// Usamos claves de traducción para las descripciones
const OPERATIONS: { id: Operation; label: string; symbol: string; descKey: string }[] = [
  { id: 'AND', label: 'AND', symbol: '&', descKey: 'bitwise.desc.AND' },
  { id: 'OR', label: 'OR', symbol: '|', descKey: 'bitwise.desc.OR' },
  { id: 'XOR', label: 'XOR', symbol: '^', descKey: 'bitwise.desc.XOR' },
  { id: 'NOT', label: 'NOT', symbol: '~', descKey: 'bitwise.desc.NOT' },
  { id: 'NAND', label: 'NAND', symbol: '~&', descKey: 'bitwise.desc.NAND' },
  { id: 'NOR', label: 'NOR', symbol: '~|', descKey: 'bitwise.desc.NOR' },
  { id: 'XNOR', label: 'XNOR', symbol: '~^', descKey: 'bitwise.desc.XNOR' },
  { id: 'LSHIFT', label: '<<', symbol: '<<', descKey: 'bitwise.desc.LSHIFT' },
  { id: 'RSHIFT', label: '>>', symbol: '>>', descKey: 'bitwise.desc.RSHIFT' },
  { id: 'ZRSHIFT', label: '>>>', symbol: '>>>', descKey: 'bitwise.desc.ZRSHIFT' },
];

const BitwiseCalculator: React.FC = () => {
  const [inputA, setInputA] = useState<string>('0');
  const [inputB, setInputB] = useState<string>('0');
  const [selectedOp, setSelectedOp] = useState<Operation>('AND');
  const [calc, setCalc] = useState<BitwiseState>({ a: 0, b: 0, result: 0 });
  const { addToHistory } = useHistory();
  const { t } = useLanguage();

  useUnsavedChanges(inputA !== '0' || inputB !== '0');

  const parseValue = (val: string): number => {
    val = val.trim();
    if (!val) return 0;
    try {
      let num = Number(val);
      return num | 0; 
    } catch {
      return 0;
    }
  };

  const calculate = useCallback(() => {
    const valA = parseValue(inputA);
    const valB = parseValue(inputB);
    let res = 0;

    switch (selectedOp) {
      case 'AND': res = valA & valB; break;
      case 'OR': res = valA | valB; break;
      case 'XOR': res = valA ^ valB; break;
      case 'NOT': res = ~valA; break;
      case 'NAND': res = ~(valA & valB); break;
      case 'NOR': res = ~(valA | valB); break;
      case 'XNOR': res = ~(valA ^ valB); break;
      case 'LSHIFT': res = valA << valB; break;
      case 'RSHIFT': res = valA >> valB; break;
      case 'ZRSHIFT': res = valA >>> valB; break;
    }

    setCalc({ a: valA, b: valB, result: res });
  }, [inputA, inputB, selectedOp]);

  useEffect(() => { calculate(); }, [calculate]);

  const toHexString = (num: number): string => '0x' + (num >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const isUnary = selectedOp === 'NOT';

  const renderBitRow = (label: string, num: number, highlightOne = false, colorClass = "text-slate-500 dark:text-slate-400") => {
    const binStr = (num >>> 0).toString(2).padStart(32, '0');
    const nibbles = binStr.match(/.{1,4}/g) || [];

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-1 font-mono text-sm sm:text-base">
            <span className="w-16 font-bold text-slate-500 dark:text-slate-400 text-right shrink-0">{label}</span>
            <div className="flex flex-wrap gap-x-2 sm:gap-x-3">
                {nibbles.map((nibble, i) => (
                    <div key={i} className="flex tracking-widest">
                        {nibble.split('').map((bit, j) => (
                            <span key={j} className={`${bit === '1' ? (highlightOne ? 'text-accent font-bold' : 'text-slate-900 dark:text-slate-200') : 'text-slate-300 dark:text-slate-600'}`}>
                                {bit}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
            <span className={`ml-auto font-bold ${colorClass} hidden sm:block`}>
                 {num} <span className="text-xs font-normal opacity-70">(Dec)</span>
            </span>
        </div>
    );
  };

  const saveToHistory = () => {
      const opSymbol = OPERATIONS.find(o => o.id === selectedOp)?.symbol || selectedOp;
      const expression = isUnary ? `${opSymbol} ${calc.a}` : `${calc.a} ${opSymbol} ${calc.b}`;
      
      addToHistory({
          tool: t('menu.bitwiseCalculator'),
          details: t(OPERATIONS.find(o => o.id === selectedOp)?.descKey || ''),
          input: expression,
          output: `${calc.result} (Dec) | ${toHexString(calc.result)} (Hex)`
      });
  };

  return (
    <div className="space-y-8">
      
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('bitwise.opA')}</label>
                    <input type="text" value={inputA} onChange={(e) => setInputA(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 font-mono text-lg focus:ring-2 focus:ring-accent" placeholder="Ej: 42, 0xFA, 0b101"/>
                    <div className="text-xs text-slate-400 mt-1 text-right font-mono">= {parseValue(inputA)}</div>
                </div>

                <div className={`transition-opacity duration-200 ${isUnary ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('bitwise.opB')}</label>
                    <input type="text" value={inputB} onChange={(e) => setInputB(e.target.value)} disabled={isUnary} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 font-mono text-lg focus:ring-2 focus:ring-accent disabled:bg-slate-100 dark:disabled:bg-slate-800" placeholder={selectedOp.includes('SHIFT') ? "Bits" : "Ej: 15"}/>
                    <div className="text-xs text-slate-400 mt-1 text-right font-mono">= {parseValue(inputB)}</div>
                </div>
            </div>

            <div className="w-full md:w-2/3">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">{t('bitwise.op')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {OPERATIONS.map((op) => (
                        <button key={op.id} onClick={() => setSelectedOp(op.id)} className={`group relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${selectedOp === op.id ? 'bg-accent border-accent text-white shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-accent'}`}>
                            <span className="text-lg font-bold font-mono">{op.symbol}</span>
                            <span className="text-xs font-medium uppercase mt-1">{op.label}</span>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-32 text-center z-10">
                                {t(op.descKey)}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-100 dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-slate-700 flex-grow mr-4">
                        ℹ️ {t(OPERATIONS.find(op => op.id === selectedOp)?.descKey || '')}
                    </p>
                    <button onClick={saveToHistory} className="bg-accent hover:opacity-90 text-white font-semibold py-2 px-4 rounded-md transition-all">
                        {t('action.save')}
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl p-6 font-mono shadow-inner border border-slate-200 dark:border-slate-700 overflow-x-auto transition-colors duration-300">
         <div className="min-w-[600px]">
            <div className="flex ml-[4.5rem] gap-x-3 mb-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="flex-1 text-left">31</span>
                <span className="flex-1 text-center">24</span>
                <span className="flex-1 text-center">16</span>
                <span className="flex-1 text-center">8</span>
                <span className="flex-1 text-right">0</span>
            </div>
            {renderBitRow("A", calc.a)}
            {!isUnary && (
                <div className="relative py-1">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent font-bold text-xl">{OPERATIONS.find(o => o.id === selectedOp)?.symbol}</div>
                     {renderBitRow("B", calc.b)}
                </div>
            )}
            <div className="my-3 border-t border-slate-300 dark:border-slate-700 relative"></div>
            {renderBitRow(t('bitwise.res'), calc.result, true, "text-accent")}
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <InputGroup id="res-dec" label="Decimal" value={calc.result.toString()} onChange={() => {}} placeholder="" readOnly />
        <InputGroup id="res-hex" label="Hexadecimal" value={toHexString(calc.result)} onChange={() => {}} placeholder="" readOnly />
        <InputGroup id="res-bin" label="Binario" value={(calc.result >>> 0).toString(2)} onChange={() => {}} placeholder="" readOnly />
      </div>
    </div>
  );
};

export default BitwiseCalculator;