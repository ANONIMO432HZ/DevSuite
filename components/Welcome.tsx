
import React from 'react';
import { CalculatorType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme, ACCENT_PRESETS } from '../contexts/ThemeContext';

interface WelcomeProps {
  onNavigate: (tab: CalculatorType) => void;
}

const Icons = {
  Json: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>),
  Scale: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>),
  Binary: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>),
  Hash: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.848.578-4.156" /></svg>),
  Palette: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>),
  IdCard: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>),
  Clock: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Link: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>),
  Chip: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>),
  Heart: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>),
  Globe: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>),
  Sparkles: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>),
  Health: (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>) // Using Heart as placeholder, can be customized
};

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  tags: string[];
  onClick: () => void;
  fullWidth?: boolean;
}> = ({ title, description, icon: Icon, tags, onClick, fullWidth }) => (
  <button
    onClick={onClick}
    className={`group relative flex flex-col text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-xl hover:ring-2 hover:ring-accent hover:border-transparent transition-all duration-300 hover:-translate-y-1 ${fullWidth ? 'md:col-span-2' : ''}`}
  >
    <div className="flex items-start gap-5 h-full w-full">
        {/* Contenedor del Icono */}
        <div className="shrink-0 p-5 rounded-2xl bg-accent/10 dark:bg-accent/20 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300 group-hover:scale-110">
            <Icon className="w-10 h-10" />
        </div>

        <div className="flex flex-col h-full w-full">
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-accent transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {description}
                </p>
            </div>
            
            <div className="mt-auto pt-4 flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="text-[10px] font-mono uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    </div>
  </button>
);

const Welcome: React.FC<WelcomeProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { accentPreset, setAccentPreset, customAccentColor, setCustomAccentColor } = useTheme();
  
  // Pequeña lógica para el selector de color inline
  const handleCustomColor = (e: any) => {
      setCustomAccentColor(e.target.value);
      setAccentPreset('custom');
  };

  return (
    <div className="space-y-10">
      
      {/* Hero Section */}
      <div className="text-center py-8 sm:py-12 relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/50 to-accent"></div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-4">
          {t('welcome.hero.title')} <span className="text-accent">{t('welcome.hero.highlight')}</span>
        </h2>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-4 mb-8">
          {t('welcome.hero.desc')}
        </p>

        {/* Inline Color Picker for Hero */}
        {accentPreset && (
            <div className="flex justify-center items-center gap-4 animate-fadeIn mt-8">
                 {Object.entries(ACCENT_PRESETS).map(([key, val]: any) => (
                    <button
                        key={key}
                        onClick={() => setAccentPreset(key)}
                        className={`w-12 h-12 rounded-full ring-2 transition-all shadow-sm flex items-center justify-center ${
                            accentPreset === key 
                            ? `ring-offset-2 dark:ring-offset-slate-800 scale-110 ${key === 'tools' ? 'ring-slate-400 dark:ring-slate-500' : 'ring-accent'}` 
                            : 'ring-transparent hover:scale-110'
                        }`}
                        style={{ background: val.color === 'tools' ? 'linear-gradient(to right, #84cc16, #3b82f6, #ef4444)' : val.color }}
                        title={val.name}
                        aria-label={`Select color ${val.name}`}
                    >
                    </button>
                 ))}
                 <div className={`relative w-12 h-12 rounded-full overflow-hidden shadow-sm ring-2 transition-all flex items-center justify-center ${accentPreset === 'custom' ? 'ring-accent ring-offset-2 dark:ring-offset-slate-800' : 'ring-transparent hover:scale-110 ring-1 ring-slate-300 dark:ring-slate-600'}`}>
                    <input type="color" value={customAccentColor} onChange={handleCustomColor} className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer" />
                 </div>
            </div>
        )}
      </div>

      {/* Grid de Herramientas Unificadas */}
      <div>
        <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">{t('welcome.section.dev')}</h3>
            <div className="h-px flex-grow bg-slate-200 dark:bg-slate-700"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
                title={t('card.ai.title')}
                description={t('card.ai.desc')}
                icon={Icons.Sparkles}
                tags={['Gemini 2.5', 'Regex', 'Code', 'Fix']}
                onClick={() => onNavigate(CalculatorType.AiAssistant)}
            />

            <FeatureCard 
                title={t('card.unit.title')}
                description={t('card.unit.desc')}
                icon={Icons.Scale}
                tags={['Metros', 'Kilos', 'IMC', 'Tiempo']}
                onClick={() => onNavigate(CalculatorType.UnitConverter)}
            />
            
            <FeatureCard 
                title={t('card.text.title')}
                description={t('card.text.desc')}
                icon={Icons.Link}
                tags={['URL Encode', 'HTML Entities', 'ROT13']}
                onClick={() => onNavigate(CalculatorType.NumberBase)}
            />

            <FeatureCard 
                title={t('card.data.title')}
                description={t('card.data.desc')}
                icon={Icons.Json}
                tags={['JSON', 'YAML', 'TOML', 'Format']}
                onClick={() => onNavigate(CalculatorType.JSON)}
            />

            <FeatureCard 
                title={t('card.base.title')}
                description={t('card.base.desc')}
                icon={Icons.Binary}
                tags={['Binario', 'Hex', 'Base64', 'ASCII']}
                onClick={() => onNavigate(CalculatorType.NumberBase)}
            />

            <FeatureCard 
                title={t('card.bitwise.title')}
                description={t('card.bitwise.desc')}
                icon={Icons.Chip}
                tags={['AND', 'OR', 'XOR', 'SHIFT']}
                onClick={() => onNavigate(CalculatorType.BitwiseCalculator)}
            />

            <FeatureCard 
                title={t('card.crypto.title')}
                description={t('card.crypto.desc')}
                icon={Icons.Hash}
                tags={['AES', '3DES', 'SHA-3', 'Cifrado']}
                onClick={() => onNavigate(CalculatorType.HashGenerator)}
            />

            <FeatureCard 
                title={t('card.color.title')}
                description={t('card.color.desc')}
                icon={Icons.Palette}
                tags={['RGB', 'HSL', 'Gradientes', 'CSS']}
                onClick={() => onNavigate(CalculatorType.PaletteGenerator)}
            />

            <FeatureCard 
                title={t('card.network.title')}
                description={t('card.network.desc')}
                icon={Icons.Globe}
                tags={['Ping', 'DNS', 'IP', 'Subnet']}
                onClick={() => onNavigate(CalculatorType.NetworkTools)}
            />

            <FeatureCard 
                title={t('card.uuid.title')}
                description={t('card.uuid.desc')}
                icon={Icons.IdCard}
                tags={['v4 Random', 'v1 Time', 'Unique']}
                onClick={() => onNavigate(CalculatorType.UUIDGenerator)}
            />

            <FeatureCard 
                title={t('card.unix.title')}
                description={t('card.unix.desc')}
                icon={Icons.Clock}
                tags={['Timestamp', 'Epoch', 'Date']}
                onClick={() => onNavigate(CalculatorType.UnixTimestamp)}
            />

            <FeatureCard 
                title={t('card.support.title')}
                description={t('card.support.desc')}
                icon={Icons.Heart}
                tags={['Sponsor', 'Coffee', 'GitHub']}
                onClick={() => window.open('https://github.com/ANONIMO432HZ/DevSuite', '_blank')}
            />
        </div>
      </div>
    </div>
  );
};

export default Welcome;
