
import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../contexts/LanguageContext';

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12" />
    </svg>
);

const InstallButton: React.FC = () => {
  const { isInstallable, handleInstallClick } = usePWAInstall();
  const { t } = useLanguage();

  // Si no es instalable (ya instalada, iOS, o no compatible), no renderizar nada
  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="
        fixed bottom-6 right-6 z-50
        flex items-center gap-2
        px-5 py-3
        bg-lime-600 hover:bg-lime-700 active:bg-lime-800
        text-white font-bold
        rounded-full shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        transform hover:-translate-y-1 animate-fadeIn
        dark:bg-lime-500 dark:hover:bg-lime-600
        border border-white/20 backdrop-blur-sm
      "
      aria-label={t('pwa.install')}
    >
      <DownloadIcon className="h-5 w-5" />
      <span>{t('pwa.install')}</span>
    </button>
  );
};

export default InstallButton;
