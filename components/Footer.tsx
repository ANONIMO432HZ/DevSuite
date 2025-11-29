
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="text-center py-6 px-4">
      <p className="text-sm text-slate-500 dark:text-slate-500">
        {t('footer.developedBy')} <a href="https://github.com/ANONIMO432HZ/" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-accent transition-colors">4N0N1M0</a>
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
        {t('footer.madeWith')} <span className="text-red-500">❤️</span> & ☕.
      </p>
    </footer>
  );
};

export default Footer;
