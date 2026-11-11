import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { useLanguage } from '../../i18n';
import { LanguageToggle } from '../common/LanguageToggle';
import { Sparkles } from 'lucide-react';

interface Props {
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<Props> = ({ onNavigateHome }) => {
  const { studentId, isValidStudentId } = useStudent();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center space-x-3 text-left focus:outline-none group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-md p-1 overflow-hidden transition-transform group-hover:scale-105">
              <img src="/logo.png" alt="School Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {t.brand.title}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                  {t.brand.session_year}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t.brand.subtitle}
              </p>
            </div>
          </button>

          
          <div className="flex items-center space-x-3">
            {isValidStudentId && (
              <div className="hidden md:flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3.5 py-1.5 shadow-2xs">
                <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none">
                    {t.identity.title}
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                    {studentId}
                  </div>
                </div>
              </div>
            )}

            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
