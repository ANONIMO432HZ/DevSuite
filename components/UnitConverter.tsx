
import React, { useState, useCallback, useEffect } from 'react';
import InputGroup from './InputGroup';
import { useHistory } from '../contexts/HistoryContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useLanguage } from '../contexts/LanguageContext';
import BMICalculator from './BMICalculator';

// Definición de tipos para las unidades
interface UnitDefinition {
  name: string;
  multiplier: number;
}

interface CategoryDefinition {
  labelKey: string;
  baseUnit: string;
  units: Record<string, UnitDefinition>;
}

// Definición de Categorías y Unidades
const CATEGORIES: Record<string, CategoryDefinition> = {
    length: {
        labelKey: 'unit.category.length',
        baseUnit: 'm',
        units: {
            nm: { name: 'Nanometers', multiplier: 1e-9 }, 
            microns: { name: 'Micrometers', multiplier: 1e-6 },
            mm: { name: 'Millimeters', multiplier: 0.001 },
            cm: { name: 'Centimeters', multiplier: 0.01 },
            m: { name: 'Meters', multiplier: 1 },
            km: { name: 'Kilometers', multiplier: 1000 },
            in: { name: 'Inches', multiplier: 0.0254 },
            ft: { name: 'Feet', multiplier: 0.3048 },
            yd: { name: 'Yards', multiplier: 0.9144 },
            mi: { name: 'Miles', multiplier: 1609.344 },
            nmi: { name: 'Nautical Miles', multiplier: 1852 },
        }
    },
    weight: {
        labelKey: 'unit.category.weight',
        baseUnit: 'g',
        units: {
            mg: { name: 'Milligrams', multiplier: 0.001 },
            g: { name: 'Grams', multiplier: 1 },
            kg: { name: 'Kilograms', multiplier: 1000 },
            t: { name: 'Metric Tonnes', multiplier: 1e6 },
            oz: { name: 'Ounces', multiplier: 28.349523125 },
            lb: { name: 'Pounds', multiplier: 453.59237 },
            st: { name: 'Stones', multiplier: 6350.29318 },
        }
    },
    volume: {
        labelKey: 'unit.category.volume',
        baseUnit: 'ml',
        units: {
            ml: { name: 'Milliliters', multiplier: 1 },
            cl: { name: 'Centiliters', multiplier: 10 },
            l: { name: 'Liters', multiplier: 1000 },
            m3: { name: 'Cubic Meters', multiplier: 1e6 },
            tsp: { name: 'Teaspoons (US)', multiplier: 4.92892 },
            tbsp: { name: 'Tablespoons (US)', multiplier: 14.7868 },
            floz: { name: 'Fluid Ounces (US)', multiplier: 29.5735 },
            cup: { name: 'Cups (US)', multiplier: 236.588 },
            pt: { name: 'Pints (US)', multiplier: 473.176 },
            qt: { name: 'Quarts (US)', multiplier: 946.353 },
            gal: { name: 'Gallons (US)', multiplier: 3785.41 },
        }
    },
    area: {
        labelKey: 'unit.category.area',
        baseUnit: 'm2',
        units: {
            cm2: { name: 'Sq Centimeters', multiplier: 0.0001 },
            m2: { name: 'Sq Meters', multiplier: 1 },
            ha: { name: 'Hectares', multiplier: 10000 },
            km2: { name: 'Sq Kilometers', multiplier: 1e6 },
            sqin: { name: 'Sq Inches', multiplier: 0.00064516 },
            sqft: { name: 'Sq Feet', multiplier: 0.092903 },
            ac: { name: 'Acres', multiplier: 4046.86 },
            sqmi: { name: 'Sq Miles', multiplier: 2.59e6 },
        }
    },
    speed: {
        labelKey: 'unit.category.speed',
        baseUnit: 'm/s',
        units: {
            mps: { name: 'Meters/s (m/s)', multiplier: 1 },
            kph: { name: 'Kilometers/h (km/h)', multiplier: 0.277777778 },
            mph: { name: 'Miles/h (mph)', multiplier: 0.44704 },
            kn: { name: 'Knots (kn)', multiplier: 0.514444444 },
            fps: { name: 'Feet/s (ft/s)', multiplier: 0.3048 },
            mach: { name: 'Mach', multiplier: 340.29 },
            c: { name: 'Light Speed', multiplier: 299792458 }
        }
    },
    time: {
        labelKey: 'unit.category.time',
        baseUnit: 's',
        units: {
            ns: { name: 'Nanoseconds', multiplier: 1e-9 },
            microns: { name: 'Microseconds', multiplier: 1e-6 },
            ms: { name: 'Milliseconds', multiplier: 0.001 },
            s: { name: 'Seconds', multiplier: 1 },
            min: { name: 'Minutes', multiplier: 60 },
            h: { name: 'Hours', multiplier: 3600 },
            d: { name: 'Days', multiplier: 86400 },
            wk: { name: 'Weeks', multiplier: 604800 },
            mo: { name: 'Months (avg)', multiplier: 2.628e6 }, 
            yr: { name: 'Years (avg)', multiplier: 3.154e7 }, 
            dec: { name: 'Decades', multiplier: 3.154e8 },
            cen: { name: 'Centuries', multiplier: 3.154e9 },
        }
    },
    digital: {
        labelKey: 'unit.category.digital',
        baseUnit: 'B',
        units: {
            bit: { name: 'Bits (b)', multiplier: 0.125 },
            byte: { name: 'Bytes (B)', multiplier: 1 },
            kb: { name: 'Kilobytes (KB)', multiplier: 1024 },
            mb: { name: 'Megabytes (MB)', multiplier: 1024 ** 2 },
            gb: { name: 'Gigabytes (GB)', multiplier: 1024 ** 3 },
            tb: { name: 'Terabytes (TB)', multiplier: 1024 ** 4 },
            pb: { name: 'Petabytes (PB)', multiplier: 1024 ** 5 },
            eb: { name: 'Exabytes (EB)', multiplier: 1024 ** 6 },
        }
    }
};

type CategoryKey = keyof typeof CATEGORIES | 'bmi';

const UnitConverter: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<CategoryKey>('length');
    const [values, setValues] = useState<Record<string, string>>({});
    const { addToHistory } = useHistory();
    const { t } = useLanguage();

    // Protección contra pérdida de datos: Activa si hay algún valor ingresado (solo para conversor estándar)
    useUnsavedChanges(activeCategory !== 'bmi' && Object.keys(values).length > 0);

    useEffect(() => {
        setValues({});
    }, [activeCategory]);

    // Helpers para el conversor estándar
    const currentUnits = activeCategory !== 'bmi' ? CATEGORIES[activeCategory].units : {};

    const formatNumber = (num: number): string => {
        if (num === 0) return '0';
        if (!isFinite(num)) return ''; 
        
        if (Math.abs(num) < 1e-6 || Math.abs(num) > 1e9) {
             return num.toExponential(6).replace(/\.?0+e/, 'e');
        }
        return parseFloat(num.toPrecision(10)).toString();
    };

    const handleValueChange = useCallback((unitKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (activeCategory === 'bmi') return;
        const inputValue = e.target.value;

        if (inputValue.trim() === '') {
            setValues({});
            return;
        }

        if (!/^-?\d*\.?\d*(e-?\d*)?$/.test(inputValue)) {
            return; 
        }

        const numericValue = parseFloat(inputValue);

        if (isNaN(numericValue)) {
            setValues(prev => ({ ...prev, [unitKey]: inputValue }));
            return;
        }

        const units = CATEGORIES[activeCategory as keyof typeof CATEGORIES].units;
        const baseValue = numericValue * units[unitKey].multiplier;
        const newValues: Record<string, string> = {};

        Object.entries(units).forEach(([key, data]) => {
            const unitDef = data as UnitDefinition;
            if (key === unitKey) {
                newValues[key] = inputValue; 
            } else {
                const convertedValue = baseValue / unitDef.multiplier;
                newValues[key] = formatNumber(convertedValue);
            }
        });

        setValues(newValues);

    }, [activeCategory]);

    const clearAll = () => setValues({});

    const saveToHistory = () => {
        if (activeCategory === 'bmi') return; // BMI tiene su propio historial
        const nonEmptyEntries = Object.entries(values).filter(([_, val]) => val && (val as string).trim() !== '');
        if (nonEmptyEntries.length === 0) return;

        const units = CATEGORIES[activeCategory as keyof typeof CATEGORIES].units;
        const firstEntry = nonEmptyEntries[0];
        const inputStr = `${firstEntry[1]} ${units[firstEntry[0]].name}`;
        
        const outputStr = nonEmptyEntries.slice(1, 4).map(([key, val]) => 
            `${val} ${units[key].name}`
        ).join(', ') + (nonEmptyEntries.length > 4 ? '...' : '');

        addToHistory({
            tool: t('menu.unitConverter'),
            details: t(CATEGORIES[activeCategory as keyof typeof CATEGORIES].labelKey),
            input: inputStr,
            output: outputStr || '...'
        });
    };

    return (
        <div className="space-y-6">
            {/* Category Selector */}
            <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                {(Object.entries(CATEGORIES) as [CategoryKey, CategoryDefinition][]).map(([key, data]) => (
                    <button
                        key={key}
                        onClick={() => setActiveCategory(key)}
                        className={`flex-grow sm:flex-grow-0 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            activeCategory === key
                                ? 'bg-white dark:bg-slate-700 text-accent shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        {t(data.labelKey)}
                    </button>
                ))}
                
                {/* Botón especial para BMI */}
                <button
                    onClick={() => setActiveCategory('bmi')}
                    className={`flex-grow sm:flex-grow-0 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        activeCategory === 'bmi'
                            ? 'bg-white dark:bg-slate-700 text-accent shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                    {t('unit.category.bmi')}
                </button>
            </div>

            {/* Content Area */}
            {activeCategory === 'bmi' ? (
                <div className="pt-2 animate-fadeIn">
                     <BMICalculator />
                </div>
            ) : (
                <div className="animate-fadeIn">
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                        <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                            {t('unit.section.conversion')} {t(CATEGORIES[activeCategory as keyof typeof CATEGORIES].labelKey)}
                        </span>
                        <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 mt-6">
                        {Object.entries(currentUnits).map(([key, data]) => (
                            <InputGroup
                                key={key}
                                id={`${activeCategory}-${key}`}
                                label={(data as UnitDefinition).name}
                                value={values[key] || ''}
                                onChange={(e) => handleValueChange(key, e)}
                                placeholder="0"
                            />
                        ))}
                    </div>

                    <div className="mt-8 text-right border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-3">
                        <button
                            onClick={saveToHistory}
                            disabled={Object.keys(values).length === 0}
                            className="bg-accent hover:opacity-90 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('action.save')}
                        </button>
                        <button
                            onClick={clearAll}
                            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-6 rounded-md transition-colors duration-200"
                        >
                            {t('action.clear')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitConverter;
