import React from 'react';
import { useLanguage } from '../../i18n';
import { HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200/80 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span>{t.brand.footer_text}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>{t.brand.footer_help}</span>
        </div>
      </div>
    </footer>
  );
};
