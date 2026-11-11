import React from 'react';
import { useLanguage } from '../../i18n';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
      <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
          language === 'bn'
            ? 'bg-white text-emerald-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {t.brand.lang_bn}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
          language === 'en'
            ? 'bg-white text-emerald-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {t.brand.lang_en}
      </button>
    </div>
  );
};

