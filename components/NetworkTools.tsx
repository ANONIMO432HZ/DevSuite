
import React, { useState, useEffect } from 'react';
import InputGroup from './InputGroup';
import { useLanguage } from '../contexts/LanguageContext';
import { useHistory } from '../contexts/HistoryContext';

type ToolMode = 'myip' | 'ping' | 'dns' | 'subnet' | 'ua' | 'port';
type PortStatus = 'open' | 'closed' | 'timeout' | null;

// --- Icon Components ---
const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const ChipIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>);
const PulseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
const UserIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const PortIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>);
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>);

const NetworkTools: React.FC = () => {
  const { t } = useLanguage();
  const { addToHistory } = useHistory();
  const [activeTool, setActiveTool] = useState<ToolMode>('myip');

  // --- MY IP State ---
  const [ipState, setIpState] = useState<{
      v4: string | null;
      v6: string | null;
      details: any | null;
      error: string | null;
  } | null>(null);
  const [loadingIp, setLoadingIp] = useState(false);

  // --- PING State ---
  const [pingHost, setPingHost] = useState('');
  const [pingResult, setPingResult] = useState<{ status: 'online' | 'offline' | null, time?: number, statusText?: string }>({ status: null });
  const [isPinging, setIsPinging] = useState(false);

  // --- DNS State ---
  const [dnsDomain, setDnsDomain] = useState('');
  const [dnsType, setDnsType] = useState('A');
  const [dnsResults, setDnsResults] = useState<any[]>([]);
  const [isDnsLoading, setIsDnsLoading] = useState(false);
  const [dnsError, setDnsError] = useState<string | null>(null);

  // --- Subnet State ---
  const [subnetIp, setSubnetIp] = useState('');
  const [subnetMask, setSubnetMask] = useState('24');
  const [subnetResult, setSubnetResult] = useState<any>(null);

  // --- Port Scan State ---
  const [portHost, setPortHost] = useState('');
  const [portInput, setPortInput] = useState('80, 443, 8080, 3000');
  const [portResults, setPortResults] = useState<Record<number, PortStatus>>({});
  const [isScanning, setIsScanning] = useState(false);

  // --- Fetch My IP ---
  useEffect(() => {
    if (activeTool === 'myip' && !ipState) {
      setLoadingIp(true);
      
      const fetchData = async () => {
          const newState = { v4: null, v6: null, details: null, error: null };
          
          try {
              // 1. Detectar IPv4 e IPv6 en paralelo (Dual Stack)
              const [v4Res, v6Res] = await Promise.allSettled([
                  fetch('https://api.ipify.org?format=json').then(r => r.json()),
                  fetch('https://api6.ipify.org?format=json').then(r => r.json())
              ]);

              if (v4Res.status === 'fulfilled') newState.v4 = v4Res.value.ip;
              if (v6Res.status === 'fulfilled') newState.v6 = v6Res.value.ip;

              // 2. Estrategia de Geolocalización en Cascada (3 Niveles de Respaldo)
              let geoData = null;

              // Intento A: ipapi.co (Muy detallado, pero estricto con CORS/RateLimit)
              try {
                  const res = await fetch('https://ipapi.co/json/');
                  if (res.ok) {
                      geoData = await res.json();
                  } else {
                      throw new Error('ipapi.co blocked');
                  }
              } catch (errA) {
                  console.warn("Primary geo failed, trying backup 1 (ipwho.is)...");
                  
                  // Intento B: ipwho.is (Menos restricciones, buena data)
                  try {
                      const res = await fetch('https://ipwho.is/');
                      if (res.ok) {
                          const data = await res.json();
                          if (data.success) {
                              geoData = {
                                  city: data.city,
                                  region: data.region,
                                  country_name: data.country,
                                  // Mapeo seguro usando los datos que proporcionaste
                                  org: data.connection?.org || data.connection?.isp || data.org,
                                  latitude: data.latitude,
                                  longitude: data.longitude
                              };
                          } else {
                              throw new Error('ipwho.is success=false');
                          }
                      } else {
                          throw new Error('ipwho.is network error');
                      }
                  } catch (errB) {
                      console.warn("Backup 1 failed, trying backup 2 (freeipapi)...");

                      // Intento C: freeipapi.com (Último recurso, muy permisivo)
                      try {
                          const res = await fetch('https://freeipapi.com/api/json');
                          if (res.ok) {
                              const data = await res.json();
                              geoData = {
                                  city: data.cityName,
                                  region: data.regionName,
                                  country_name: data.countryName,
                                  org: 'Unknown (FreeIP)',
                                  latitude: data.latitude,
                                  longitude: data.longitude
                              };
                          }
                      } catch (errC) {
                          console.error("All geo services failed.");
                      }
                  }
              }

              newState.details = geoData;

              if (!newState.v4 && !newState.v6) {
                  newState.error = "No se pudo detectar ninguna conexión.";
              }

              setIpState(newState);
          } catch (e) {
              setIpState({ v4: null, v6: null, details: null, error: 'Error de conexión general.' });
          } finally {
              setLoadingIp(false);
          }
      };

      fetchData();
    }
  }, [activeTool, ipState]);

  const copyToClipboard = (text: string) => {
      if (text) navigator.clipboard.writeText(text);
  };

  // --- Helper to get OSM Embed URL ---
  const getOsmEmbedUrl = (lat: number, lon: number) => {
      // Calculate a small bounding box for the embed
      const delta = 0.05;
      const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  };

  // --- Ping / HTTP Head Logic ---
  const handlePing = async () => {
    if (!pingHost) return;
    setIsPinging(true);
    setPingResult({ status: null });
    
    let url = pingHost;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    const start = performance.now();
    try {
      await fetch(url, { mode: 'no-cors', method: 'HEAD' });
      const time = Math.round(performance.now() - start);
      setPingResult({ status: 'online', time, statusText: 'OK' });
      addToHistory({ tool: 'Ping', details: url, input: pingHost, output: `Online (${time}ms)` });
    } catch (e) {
      setPingResult({ status: 'offline', statusText: 'Network Error / CORS Block / Timeout' });
    } finally {
      setIsPinging(false);
    }
  };

  // --- DNS Logic ---
  const handleDnsLookup = async () => {
    if (!dnsDomain) return;
    setIsDnsLoading(true);
    setDnsResults([]);
    setDnsError(null);
    try {
      const res = await fetch(`https://dns.google/resolve?name=${dnsDomain}&type=${dnsType}`);
      const data = await res.json();
      if (data.Answer) {
        setDnsResults(data.Answer);
        addToHistory({ tool: 'DNS Lookup', details: `${dnsType} record`, input: dnsDomain, output: JSON.stringify(data.Answer) });
      } else {
        setDnsResults([]);
      }
    } catch (e) {
      console.error(e);
      setDnsError("Error conectando al servicio DNS (dns.google). Verifica tu conexión.");
    } finally {
      setIsDnsLoading(false);
    }
  };

  // --- Subnet Logic ---
  const calculateSubnet = () => {
    if (!subnetIp) return;
    const ipParts = subnetIp.split('.').map(Number);
    if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255)) {
        setSubnetResult({ error: "Invalid IPv4" }); return;
    }
    const mask = parseInt(subnetMask);
    if (isNaN(mask) || mask < 0 || mask > 32) return;

    const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const maskNum = mask === 0 ? 0 : (~0) << (32 - mask);
    
    const networkNum = ipNum & maskNum;
    const broadcastNum = networkNum | (~maskNum);
    const count = mask === 32 ? 1 : mask === 31 ? 2 : (broadcastNum - networkNum - 1); 

    const numToIp = (num: number) => 
        `${(num >>> 24) & 255}.${(num >>> 16) & 255}.${(num >>> 8) & 255}.${num & 255}`;

    const res = {
        network: numToIp(networkNum),
        broadcast: numToIp(broadcastNum),
        first: numToIp(networkNum + 1),
        last: numToIp(broadcastNum - 1),
        mask: numToIp(maskNum),
        count: count < 0 ? 0 : count
    };
    setSubnetResult(res);
    addToHistory({ tool: 'Subnet Calc', details: `${subnetIp}/${mask}`, input: subnetIp, output: `Net: ${res.network}, Hosts: ${res.count}` });
  };

  // --- Robust Port Scan Logic ---
  const handlePortScan = async () => {
      if (!portHost) return;
      setIsScanning(true);
      setPortResults({});
      
      const ports = portInput.split(',')
        .map(p => parseInt(p.trim()))
        .filter(p => !isNaN(p) && p > 0 && p <= 65535);

      if (ports.length === 0) { setIsScanning(false); return; }

      const checkProtocol = async (port: number, protocol: string): Promise<PortStatus> => {
          const controller = new AbortController();
          const timeoutMs = 1500; // 1.5s timeout for race
          const id = setTimeout(() => controller.abort(), timeoutMs);
          const start = performance.now();

          try {
              await fetch(`${protocol}://${portHost}:${port}`, { 
                  mode: 'no-cors', 
                  method: 'HEAD',
                  signal: controller.signal 
              });
              clearTimeout(id);
              // Si no lanza error, significa que hubo respuesta (aunque sea opaca) -> ABIERTO
              return 'open';
          } catch (err: any) {
              clearTimeout(id);
              if (err.name === 'AbortError') {
                  // Si salta el timeout, es probable que esté filtrado (firewall drop)
                  return 'timeout'; 
              }
              // Si falla rápido (NetworkError), es probable que esté cerrado (RST inmediato)
              // o que haya un problema de red real.
              return 'closed';
          }
      };

      const checkPortRobust = async (port: number) => {
          let status: PortStatus = 'closed';
          
          // Strategy: Try appropriate protocol first to save time
          if (port === 443 || port === 8443) {
              status = await checkProtocol(port, 'https');
          } else {
              status = await checkProtocol(port, 'http');
              // If HTTP failed (closed/timeout), try HTTPS as fallback unless it was timeout (slow)
              if (status !== 'open') {
                   const httpsStatus = await checkProtocol(port, 'https');
                   if (httpsStatus === 'open') status = 'open';
                   // Prioritize Timeout status over Closed if mixed results
                   else if (httpsStatus === 'timeout') status = 'timeout'; 
              }
          }
          setPortResults(prev => ({ ...prev, [port]: status }));
      };

      // Limit concurrency to avoid browser connection limits
      const chunk = 3;
      for (let i = 0; i < ports.length; i += chunk) {
          await Promise.all(ports.slice(i, i + chunk).map(p => checkPortRobust(p)));
      }

      setIsScanning(false);
      addToHistory({ tool: 'Port Scan', details: portHost, input: `Ports: ${ports.join(',')}`, output: 'Scan Complete' });
  };

  const ToolButton: React.FC<{ id: ToolMode, label: string, icon: React.ElementType }> = ({ id, label, icon: Icon }) => (
    <button 
        onClick={() => setActiveTool(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all ${activeTool === id ? 'bg-accent text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 border border-slate-200 dark:border-slate-700 h-fit">
            <div className="space-y-1">
                <ToolButton id="myip" label={t('net.menu.myip')} icon={GlobeIcon} />
                <ToolButton id="ping" label={t('net.menu.ping')} icon={PulseIcon} />
                <ToolButton id="dns" label={t('net.menu.dns')} icon={SearchIcon} />
                <ToolButton id="subnet" label={t('net.menu.subnet')} icon={ChipIcon} />
                <ToolButton id="port" label={t('net.menu.port')} icon={PortIcon} />
                <ToolButton id="ua" label={t('net.menu.ua')} icon={UserIcon} />
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            
            {activeTool === 'myip' && (
                <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <GlobeIcon className="w-6 h-6 text-accent"/> {t('net.menu.myip')}
                        <span className="ml-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800/50 uppercase tracking-widest">{t('net.beta.badge')}</span>
                    </h3>
                    {loadingIp ? (
                        <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div></div>
                    ) : ipState ? (
                        <div className="grid grid-cols-1 gap-6">
                            
                            {/* Panel de IPs */}
                            <div className="bg-slate-100 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <p className="text-xs uppercase text-slate-500 font-bold">IPv4 Pública</p>
                                        {ipState.v4 && <button onClick={() => copyToClipboard(ipState.v4!)} className="text-accent hover:text-white hover:bg-accent p-1 rounded transition-colors" title="Copiar"><CopyIcon className="w-3.5 h-3.5"/></button>}
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <p className={`text-xl sm:text-2xl font-mono font-bold select-all ${ipState.v4 ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600 italic'}`}>
                                            {ipState.v4 || 'No detectada'}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                                    <div className="flex justify-between items-end mb-1">
                                        <p className="text-xs uppercase text-slate-500 font-bold">IPv6 Pública</p>
                                        {ipState.v6 && <button onClick={() => copyToClipboard(ipState.v6!)} className="text-accent hover:text-white hover:bg-accent p-1 rounded transition-colors" title="Copiar"><CopyIcon className="w-3.5 h-3.5"/></button>}
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <p className={`text-sm sm:text-lg font-mono font-bold select-all break-all ${ipState.v6 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600 italic'}`}>
                                            {ipState.v6 || 'No detectada'}
                                        </p>
                                    </div>
                                </div>
                                {ipState.error && <p className="text-red-500 text-sm font-bold text-center mt-2">{ipState.error}</p>}
                            </div>

                            {/* Panel de Geolocalización */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputGroup id="ip-city" label={t('net.ip.city')} value={ipState.details?.city || '-'} onChange={()=>{}} placeholder="" readOnly />
                                <InputGroup id="ip-region" label={t('net.ip.region')} value={ipState.details?.region || '-'} onChange={()=>{}} placeholder="" readOnly />
                                <InputGroup id="ip-country" label={t('net.ip.country')} value={ipState.details?.country_name || '-'} onChange={()=>{}} placeholder="" readOnly />
                                <InputGroup id="ip-org" label={t('net.ip.org')} value={ipState.details?.org || '-'} onChange={()=>{}} placeholder="" readOnly />
                            </div>

                            {/* Mapa (OpenStreetMap Embed) */}
                            {ipState.details?.latitude && ipState.details?.longitude && (
                                <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                            <MapPinIcon className="w-4 h-4 text-accent" />
                                            {t('net.map.location')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                                {ipState.details.latitude}, {ipState.details.longitude}
                                            </span>
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${ipState.details.latitude},${ipState.details.longitude}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {t('net.map.google')} <ExternalLinkIcon className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight={0}
                                            marginWidth={0}
                                            src={getOsmEmbedUrl(ipState.details.latitude, ipState.details.longitude)}
                                            className="absolute inset-0"
                                            title="IP Location Map"
                                        ></iframe>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : <p className="text-red-500">Failed to load IP data.</p>}
                </div>
            )}

            {activeTool === 'ping' && (
                <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <PulseIcon className="w-6 h-6 text-accent"/> {t('net.menu.ping')}
                        <span className="ml-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800/50 uppercase tracking-widest">{t('net.beta.badge')}</span>
                    </h3>
                    <div className="flex gap-2">
                        <div className="flex-grow">
                            <InputGroup id="ping-input" label={t('net.label.domain')} value={pingHost} onChange={(e) => setPingHost(e.target.value)} placeholder="google.com, example.org..." />
                        </div>
                        <div className="flex items-end">
                            <button onClick={handlePing} disabled={isPinging || !pingHost} className="bg-accent hover:opacity-90 text-white font-bold py-3 px-6 rounded-md mb-0.5 disabled:opacity-50">{t('net.btn.check')}</button>
                        </div>
                    </div>
                    {pingResult.status && (
                        <div className={`p-4 rounded-lg border ${pingResult.status === 'online' ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200'}`}>
                            <div className="flex items-center gap-2">
                                <span className={`h-3 w-3 rounded-full ${pingResult.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="font-bold text-lg dark:text-white">{pingResult.status === 'online' ? t('net.status.online') : t('net.status.offline')}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                {pingResult.statusText}
                                {pingResult.time && ` • ${t('net.status.latency')}: ${pingResult.time}ms`}
                            </p>
                        </div>
                    )}
                    <p className="text-xs text-slate-400 mt-4 italic">Note: Browser security prevents raw ICMP Pings. This tool measures HTTP connect time (RTT) to the target.</p>
                </div>
            )}

            {activeTool === 'dns' && (
                <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <SearchIcon className="w-6 h-6 text-accent"/> {t('net.menu.dns')}
                        <span className="ml-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800/50 uppercase tracking-widest">{t('net.beta.badge')}</span>
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-grow w-full">
                            <InputGroup id="dns-host" label={t('net.label.domain')} value={dnsDomain} onChange={(e) => setDnsDomain(e.target.value)} placeholder="example.com" />
                        </div>
                        <div className="w-full sm:w-32">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Type</label>
                            <select value={dnsType} onChange={(e) => setDnsType(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md py-3 px-3 text-slate-900 dark:text-slate-200">
                                {['A', 'AAAA', 'MX', 'TXT', 'NS', 'PTR', 'CNAME'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <button onClick={handleDnsLookup} disabled={isDnsLoading || !dnsDomain} className="w-full sm:w-auto bg-accent hover:opacity-90 text-white font-bold py-3 px-6 rounded-md disabled:opacity-50 h-[50px]">{t('net.btn.check')}</button>
                    </div>
                    
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 min-h-[100px]">
                        {isDnsLoading ? (
                            <div className="text-center text-slate-500">Loading...</div>
                        ) : dnsError ? (
                            <div className="text-center text-red-500 text-sm font-medium">{dnsError}</div>
                        ) : dnsResults.length > 0 ? (
                            <div className="space-y-2">
                                {dnsResults.map((rec, i) => (
                                    <div key={i} className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2 last:border-0 font-mono text-sm">
                                        <span className="text-accent font-bold">{rec.type}</span>
                                        <span className="text-slate-700 dark:text-slate-300 break-all text-right pl-4">{rec.data}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 text-sm">No records found or invalid domain.</div>
                        )}
                    </div>
                </div>
            )}

            {activeTool === 'subnet' && (
                <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ChipIcon className="w-6 h-6 text-accent"/> {t('net.menu.subnet')} (IPv4)
                        <span className="ml-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800/50 uppercase tracking-widest">{t('net.beta.badge')}</span>
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-grow w-full">
                            <InputGroup id="sub-ip" label="IP Address" value={subnetIp} onChange={(e) => setSubnetIp(e.target.value)} placeholder="192.168.1.10" />
                        </div>
                        <div className="w-full sm:w-32">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">CIDR (/{subnetMask})</label>
                            <input type="number" min="0" max="32" value={subnetMask} onChange={(e) => setSubnetMask(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md py-3 px-3 text-slate-900 dark:text-slate-200"/>
                        </div>
                        <button onClick={calculateSubnet} className="w-full sm:w-auto bg-accent hover:opacity-90 text-white font-bold py-3 px-6 rounded-md h-[50px]">{t('action.calculate')}</button>
                    </div>
                    {subnetResult && !subnetResult.error ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputGroup id="res-net" label="Network Address" value={subnetResult.network} onChange={()=>{}} placeholder="" readOnly />
                            <InputGroup id="res-bcast" label={t('net.subnet.bcast')} value={subnetResult.broadcast} onChange={()=>{}} placeholder="" readOnly />
                            <InputGroup id="res-mask" label={t('net.subnet.mask')} value={subnetResult.mask} onChange={()=>{}} placeholder="" readOnly />
                            <InputGroup id="res-count" label={t('net.subnet.count')} value={subnetResult.count.toString()} onChange={()=>{}} placeholder="" readOnly />
                            <InputGroup id="res-first" label={t('net.subnet.first')} value={subnetResult.first} onChange={()=>{}} placeholder="" readOnly />
                            <InputGroup id="res-last" label={t('net.subnet.last')} value={subnetResult.last} onChange={()=>{}} placeholder="" readOnly />
                        </div>
                    ) : subnetResult?.error && <p className="text-red-500 font-bold">{subnetResult.error}</p>}
                </div>
            )}

            {activeTool === 'port' && (
                <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <PortIcon className="w-6 h-6 text-accent"/> {t('net.menu.port')}
                        <span className="ml-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800/50 uppercase tracking-widest">{t('net.beta.badge')}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <InputGroup id="port-host" label={t('net.label.ip')} value={portHost} onChange={(e) => setPortHost(e.target.value)} placeholder="localhost, google.com..." />
                        <InputGroup id="port-custom" label={t('net.port.custom')} value={portInput} onChange={(e) => setPortInput(e.target.value)} placeholder={t('net.port.ph')} />
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handlePortScan} disabled={isScanning || !portHost} className="w-full sm:w-auto bg-accent hover:opacity-90 text-white font-bold py-3 px-8 rounded-md disabled:opacity-50">{isScanning ? 'Scanning...' : t('net.btn.scan')}</button>
                    </div>
                    
                    {Object.keys(portResults).length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(portResults).map(([port, status]) => (
                                <div key={port} className={`p-3 rounded-lg border flex justify-between items-center ${status === 'open' ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : status === 'closed' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'}`}>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Port {port}</span>
                                    <span className={`text-xs font-bold uppercase ${status === 'open' ? 'text-green-600 dark:text-green-400' : status === 'closed' ? 'text-red-500 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                        {status === 'open' ? t('net.port.open') : status === 'closed' ? t('net.port.closed') : t('net.port.timeout')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-slate-400 mt-4 italic">Limitation: Browser security restricts port scanning to HTTP/HTTPS ports only.</p>
                </div>
            )}

            {activeTool === 'ua' && (
                <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <UserIcon className="w-6 h-6 text-accent"/> {t('net.menu.ua')}
                        <span className="ml-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800/50 uppercase tracking-widest">{t('net.beta.badge')}</span>
                    </h3>
                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="font-mono text-sm text-slate-700 dark:text-slate-300 break-words leading-relaxed">{navigator.userAgent}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border dark:border-slate-700">
                            <span className="block text-slate-400 text-xs uppercase font-bold">Platform</span>
                            <span className="dark:text-white">{navigator.platform}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border dark:border-slate-700">
                            <span className="block text-slate-400 text-xs uppercase font-bold">Language</span>
                            <span className="dark:text-white">{navigator.language}</span>
                        </div>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default NetworkTools;