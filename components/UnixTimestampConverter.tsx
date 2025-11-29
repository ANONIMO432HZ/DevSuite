
import React, { useState, useEffect, useCallback } from 'react';
import InputGroup from './InputGroup';
import { useHistory } from '../contexts/HistoryContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useLanguage } from '../contexts/LanguageContext';

const TIME_UNITS = [ { id: 's', multiplier: 1000 }, { id: 'ms', multiplier: 1 }, { id: 'us', multiplier: 0.001 }, { id: 'ns', multiplier: 0.000001 } ];
const TIMEZONES = [ "UTC", "America/New_York", "America/Los_Angeles", "America/Chicago", "America/Mexico_City", "America/Bogota", "America/Lima", "America/Santiago", "America/Sao_Paulo", "America/Argentina/Buenos_Aires", "Europe/London", "Europe/Paris", "Europe/Madrid", "Europe/Berlin", "Europe/Moscow", "Asia/Tokyo", "Asia/Shanghai", "Asia/Singapore", "Asia/Dubai", "Asia/Kolkata", "Australia/Sydney", "Pacific/Auckland" ];
const OS_SNIPPETS = {
    linux: { name: 'Linux (Bash)', getCurrent: 'date +%s', convert: 'date -d @{ts}', desc: 'GNU date' },
    macos: { name: 'macOS (BSD Date)', getCurrent: 'date +%s', convert: 'date -r {ts}', desc: 'BSD date' },
    windows_ps: { name: 'Windows (PowerShell)', getCurrent: '[int][double]::Parse((Get-Date -UFormat %s))', convert: '(Get-Date "1970-01-01 00:00:00").AddSeconds({ts})', desc: 'PowerShell' },
    windows_cmd: { name: 'Windows (CMD)', getCurrent: 'w32tm /stripchart /computer:localhost /period:1 /dataonly /samples:1', convert: 'No native (Use PS)', desc: 'CMD limited' },
    mysql: { name: 'MySQL / MariaDB', getCurrent: 'SELECT UNIX_TIMESTAMP();', convert: 'SELECT FROM_UNIXTIME({ts});', desc: 'SQL' },
    postgresql: { name: 'PostgreSQL', getCurrent: 'SELECT extract(epoch from now());', convert: 'SELECT to_timestamp({ts});', desc: 'SQL' },
    python: { name: 'Python', getCurrent: 'import time; print(int(time.time()))', convert: 'import datetime; print(datetime.datetime.fromtimestamp({ts}))', desc: 'Python' },
    node: { name: 'Node.js', getCurrent: 'console.log(Math.floor(Date.now() / 1000))', convert: 'console.log(new Date({ts} * 1000))', desc: 'JS' }
};
type OSType = keyof typeof OS_SNIPPETS;
const MAX_SAFE_MS = 8640000000000000; 

const UnixTimestampConverter: React.FC = () => {
  const { t } = useLanguage();
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000));
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('s');
  const [selectedTimezone, setSelectedTimezone] = useState(() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return 'UTC'; } });
  const [selectedOS, setSelectedOS] = useState<OSType>('linux');
  const [isoDate, setIsoDate] = useState('');
  const [targetZoneDate, setTargetZoneDate] = useState('');
  const [localDate, setLocalDate] = useState('');
  const [relativeDate, setRelativeDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { addToHistory } = useHistory();

  useUnsavedChanges(inputTimestamp !== '');

  useEffect(() => { const timer = setInterval(() => { setCurrentTimestamp(Math.floor(Date.now() / 1000)); }, 1000); return () => clearInterval(timer); }, []);

  const convertTimestamp = useCallback(() => {
    if (inputTimestamp.trim() === '') { setIsoDate(''); setTargetZoneDate(''); setLocalDate(''); setRelativeDate(''); setError(null); return; }
    if (!/^-?\d+$/.test(inputTimestamp)) { setError('Numbers only'); return; }
    try {
        const unit = TIME_UNITS.find(u => u.id === selectedUnit); if (!unit) return;
        const inputBigInt = BigInt(inputTimestamp);
        let ms = Number(inputBigInt) * unit.multiplier;
        if (Math.abs(ms) > MAX_SAFE_MS) { setError('Out of range'); setIsoDate(''); return; }
        const date = new Date(ms);
        if (isNaN(date.getTime())) { setError('Invalid Date'); return; }
        const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
        setIsoDate(date.toISOString());
        setTargetZoneDate(new Intl.DateTimeFormat('es-ES', { timeZone: selectedTimezone, dateStyle: 'full', timeStyle: 'long' }).format(date));
        setLocalDate(new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeStyle: 'medium' }).format(date));
        const diffSeconds = (date.getTime() - Date.now()) / 1000;
        setRelativeDate(Math.abs(diffSeconds) < 60 ? formatter.format(Math.round(diffSeconds), 'second') : Math.abs(diffSeconds/60) < 60 ? formatter.format(Math.round(diffSeconds/60), 'minute') : formatter.format(Math.round(diffSeconds/3600), 'hour'));
        setError(null);
    } catch (e) { setError('Error'); }
  }, [inputTimestamp, selectedUnit, selectedTimezone]);

  useEffect(() => { convertTimestamp(); }, [convertTimestamp]);

  const setTimeToNow = useCallback(() => {
    const nowMs = Date.now();
    const unit = TIME_UNITS.find(u => u.id === selectedUnit);
    setInputTimestamp(Math.floor(nowMs / (unit?.multiplier || 1000)).toString()); // Aproximado reverso
  }, [selectedUnit]);

  const clearAll = useCallback(() => { setInputTimestamp(''); setIsoDate(''); setTargetZoneDate(''); setLocalDate(''); setRelativeDate(''); setError(null); }, []);
  const saveToHistory = () => { if (!inputTimestamp || error) return; addToHistory({ tool: t('menu.unixTimestamp'), details: `${selectedUnit} | ${selectedTimezone}`, input: inputTimestamp, output: isoDate }); };
  const getSnippet = (tpl: string) => tpl.replace('{ts}', inputTimestamp || '1234567890');

  return (
    <div className="space-y-8">
      <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-xl text-center border border-slate-200 dark:border-slate-700 shadow-sm"><p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{t('unix.current')}</p><p className="text-4xl sm:text-5xl font-mono font-bold text-accent tracking-wider tabular-nums">{currentTimestamp}</p></div>
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Timestamp</label><div className="flex rounded-md shadow-sm"><input type="text" value={inputTimestamp} onChange={(e) => setInputTimestamp(e.target.value)} placeholder="Ej: 1672531200" className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 focus:ring-2`}/><select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} className="inline-flex items-center px-3 py-2 border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 text-sm rounded-r-md">{TIME_UNITS.map(u => (<option key={u.id} value={u.id}>{u.id.toUpperCase()}</option>))}</select></div>{error && <p className="mt-1 text-sm text-red-500">{error}</p>}</div>
            <div><label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('unix.targetZone')}</label><select value={selectedTimezone} onChange={(e) => setSelectedTimezone(e.target.value)} className="block w-full px-3 py-2 border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200"><option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Local</option>{TIMEZONES.map(tz => (<option key={tz} value={tz}>{tz}</option>))}</select></div>
          </div>
      </div>
      <div className="space-y-4">
        <InputGroup id="iso-output" label={t('unix.label.iso')} value={isoDate} onChange={()=>{}} placeholder="" readOnly />
        <InputGroup id="target-output" label={`Date in ${selectedTimezone}`} value={targetZoneDate} onChange={()=>{}} placeholder="" readOnly />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputGroup id="local-output" label={t('unix.label.local')} value={localDate} onChange={()=>{}} placeholder="" readOnly /><InputGroup id="relative-output" label={t('unix.label.relative')} value={relativeDate} onChange={()=>{}} placeholder="" readOnly /></div>
      </div>
      <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={setTimeToNow} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 px-4 rounded-md">{t('unix.btn.now')}</button>
        <button onClick={clearAll} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 px-4 rounded-md">{t('action.clear')}</button>
        <button onClick={saveToHistory} disabled={!inputTimestamp || !!error} className="bg-accent hover:opacity-90 text-white font-bold py-2 px-6 rounded-md disabled:opacity-50">{t('action.save')}</button>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">{t('unix.snippets')}</h3>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="mb-4"><label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">OS / Lang</label><select value={selectedOS} onChange={(e) => setSelectedOS(e.target.value as OSType)} className="w-full sm:w-64 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3">{Object.entries(OS_SNIPPETS).map(([key, val]) => (<option key={key} value={key}>{val.name}</option>))}</select><p className="mt-1 text-xs text-slate-500 dark:text-slate-500">{OS_SNIPPETS[selectedOS].desc}</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputGroup id="cmd-get" label="Get Current" value={OS_SNIPPETS[selectedOS].getCurrent} onChange={()=>{}} placeholder="" readOnly /><InputGroup id="cmd-convert" label="Convert Timestamp" value={getSnippet(OS_SNIPPETS[selectedOS].convert)} onChange={()=>{}} placeholder="" readOnly /></div>
          </div>
      </div>
    </div>
  );
};

export default UnixTimestampConverter;
