import React from 'react';
import { useLanguage } from '../../i18n';
import { useStudent } from '../../context/StudentContext';
import {
  GraduationCap,
  FileText,
  Clock,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';

export type HomeTab = 'classes' | 'active-hold' | 'my-holds' | 'create-class';

interface Props {
  currentTab: HomeTab;
  onTabChange: (tab: HomeTab) => void;
}

export const NavigationTabs: React.FC<Props> = ({ currentTab, onTabChange }) => {
  const { t } = useLanguage();
  const { activeHoldId, activeHoldStatus } = useStudent();

  const isHeldPendingFee = Boolean(activeHoldId && activeHoldStatus === 'HELD');
  const isConfirmed = Boolean(activeHoldId && activeHoldStatus === 'CONFIRMED');

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs">
      <nav className="flex flex-wrap items-center gap-1.5" aria-label="Tabs">
        
        <button
          type="button"
          onClick={() => onTabChange('classes')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            currentTab === 'classes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{t.tabs.classes}</span>
        </button>

        
        <button
          type="button"
          onClick={() => onTabChange('active-hold')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
            currentTab === 'active-hold'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.tabs.active_hold}</span>

          
          {isHeldPendingFee && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          )}

          
          {isConfirmed && (
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                currentTab === 'active-hold' ? 'text-emerald-200' : 'text-emerald-600'
              }`}
            />
          )}
        </button>

        
        <button
          type="button"
          onClick={() => onTabChange('my-holds')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            currentTab === 'my-holds'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t.tabs.my_holds}</span>
        </button>

        
        <button
          type="button"
          onClick={() => onTabChange('create-class')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ml-auto ${
            currentTab === 'create-class'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-indigo-600 bg-indigo-50/70 hover:bg-indigo-100 hover:text-indigo-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.tabs.create_class}</span>
        </button>
      </nav>
    </div>
  );
};
