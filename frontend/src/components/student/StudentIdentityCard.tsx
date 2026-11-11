import React, { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import { useLanguage } from '../../i18n';
import {
  UserCheck,
  AlertCircle,
  Edit3,
  Check,
  X,
  CreditCard,
} from 'lucide-react';

export const StudentIdentityCard: React.FC = () => {
  const { studentId, setStudentId, isValidStudentId, clearStudent } = useStudent();
  const { t, format } = useLanguage();
  const [inputVal, setInputVal] = useState(studentId);
  const [isEditing, setIsEditing] = useState(!studentId || !isValidStudentId);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setInputVal(studentId);
    if (!studentId || !isValidStudentId) {
      setIsEditing(true);
    }
  }, [studentId, isValidStudentId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 17) {
      setInputVal(raw);
      if (raw.length === 0) {
        setLocalError(null);
      } else if (raw.length < 17) {
        setLocalError(format(t.identity.invalid_error, { count: raw.length }));
      } else {
        setLocalError(null);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (trimmed.length !== 17) {
      setLocalError(t.identity.required_error);
      return;
    }
    setStudentId(trimmed);
    setLocalError(null);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setInputVal(studentId);
    setLocalError(null);
    if (studentId && isValidStudentId) {
      setIsEditing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-50/60 via-transparent to-transparent pointer-events-none rounded-tr-2xl" />

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <CreditCard className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  {t.identity.title}
                  <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t.identity.hint}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 self-start sm:self-center">
              <span>{inputVal.length}</span>
              <span className="text-slate-400">/</span>
              <span>17 {t.identity.current_count}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={17}
                value={inputVal}
                onChange={handleInputChange}
                placeholder={t.identity.placeholder}
                className={`w-full px-4 py-2.5 text-sm sm:text-base rounded-xl border font-mono tracking-widest transition-all outline-none focus:ring-4 ${
                  localError
                    ? 'border-red-400 focus:ring-red-100 text-red-900 bg-red-50/20'
                    : inputVal.length === 17
                    ? 'border-indigo-600 focus:ring-indigo-100 bg-indigo-50/20 text-indigo-950 font-bold'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100/60 bg-white'
                }`}
                autoFocus={!studentId}
              />
            </div>

            <button
              type="submit"
              disabled={inputVal.length !== 17}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-xs active:scale-[0.98]"
            >
              <Check className="w-4 h-4 mr-1.5 text-indigo-400" />
              {t.identity.save}
            </button>

            {studentId && isValidStudentId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center justify-center px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-xl transition-colors"
                title={t.identity.cancel}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {localError && (
            <p className="text-xs text-red-600 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {localError}
            </p>
          )}
        </form>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center shadow-xs ring-2 ring-slate-100">
              <UserCheck className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>{t.identity.title}</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t.identity.verified}
                </span>
              </div>
              <div className="text-base sm:text-xl font-mono font-black text-slate-900 tracking-wider mt-0.5">
                {studentId}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/60"
              title={t.identity.edit}
            >
              <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {t.identity.edit}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t.identity.confirm_clear)) {
                  clearStudent();
                }
              }}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200/60"
              title={t.identity.clear}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              {t.identity.clear}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
