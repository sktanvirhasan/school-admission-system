import React, { useState } from 'react';
import { api, AppApiError } from '../../api';
import { useLanguage } from '../../i18n';
import { Card } from '../ui/card';
import { PlusCircle, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface Props {
  onClassCreated: () => void;
}

export const CreateClassForm: React.FC<Props> = ({ onClassCreated }) => {
  const { t, format } = useLanguage();
  const [name, setName] = useState('');
  const [totalSeats, setTotalSeats] = useState<number | ''>(120);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg(t.createClass.name_required);
      return;
    }

    if (!totalSeats || Number(totalSeats) <= 0) {
      setErrorMsg(t.createClass.seats_min_error);
      return;
    }

    setLoading(true);
    try {
      const result = await api.createClass({
        name: trimmedName,
        totalSeats: Number(totalSeats),
      });

      setSuccessMsg(
        format(t.createClass.success_msg, {
          name: result.name,
          seats: result.totalSeats,
        })
      );
      setName('');
      setTotalSeats(120);
      onClassCreated();
    } catch (err) {
      if (err instanceof AppApiError) {
        setErrorMsg(err.userMessage);
      } else {
        setErrorMsg(t.createClass.generic_error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex items-center space-x-3.5 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {t.createClass.title}
            </h2>
            <p className="text-xs text-slate-500">
              {t.createClass.subtitle}
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-sm rounded-xl flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-950 text-sm rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.createClass.name_label} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.createClass.name_placeholder}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100/60 outline-none transition-all"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.createClass.seats_label} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={totalSeats}
                onChange={(e) => {
                  const val = e.target.value;
                  setTotalSeats(val === '' ? '' : parseInt(val, 10));
                }}
                placeholder="120"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100/60 outline-none transition-all"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={loading || !name.trim() || !totalSeats}
              className="inline-flex items-center px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-xs active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.createClass.submitting_btn}
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2 text-indigo-400" />
                  {t.createClass.submit_btn}
                </>
              )}
            </button>
          </div>
        </form>
      </Card>

      
      <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-5 text-xs text-slate-700 space-y-2">
        <h4 className="font-bold flex items-center gap-2 text-sm text-slate-900">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          {t.createClass.guide_title}
        </h4>
        <p className="leading-relaxed">• {t.createClass.guide_p1}</p>
        <p className="leading-relaxed">• {t.createClass.guide_p2}</p>
      </div>
    </div>
  );
};
