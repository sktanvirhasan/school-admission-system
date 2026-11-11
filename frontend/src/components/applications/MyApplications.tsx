import React, { useState, useEffect, useCallback } from 'react';
import { api, AppApiError } from '../../api';
import { MyHold } from '../../types';
import { useStudent } from '../../context/StudentContext';
import { useLanguage } from '../../i18n';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  onSelectHold: (holdId: string) => void;
  refreshTrigger?: number;
}

export const MyApplications: React.FC<Props> = ({ onSelectHold, refreshTrigger }) => {
  const { studentId, isValidStudentId } = useStudent();
  const { t, format } = useLanguage();
  const [holds, setHolds] = useState<MyHold[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMyHolds = useCallback(
    async (isBackground = false) => {
      if (!isValidStudentId) {
        setHolds([]);
        return;
      }

      if (!isBackground) {
        setLoading(true);
        setErrorMsg(null);
      } else {
        setRefreshing(true);
      }

      try {
        const data = await api.getMyHolds(studentId);
        setHolds(data);
      } catch (err) {
        if (!isBackground) {
          if (err instanceof AppApiError) {
            setErrorMsg(err.userMessage);
          } else {
            setErrorMsg(t.myApplications.load_error);
          }
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [studentId, isValidStudentId, t.myApplications.load_error]
  );

  useEffect(() => {
    fetchMyHolds();
  }, [fetchMyHolds, refreshTrigger]);

  useEffect(() => {
    if (!isValidStudentId) return;
    const interval = setInterval(() => {
      fetchMyHolds(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [isValidStudentId, fetchMyHolds]);

  if (!isValidStudentId) {
    return (
      <Card className="p-10 text-center shadow-xs">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {t.myApplications.id_required_title}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          {t.myApplications.id_required_sub}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            {t.myApplications.title}
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {t.myApplications.student_label} {studentId}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Badge variant="secondary" className="font-bold">
            {format(t.myApplications.total_count, { count: holds.length })}
          </Badge>
          <button
            type="button"
            onClick={() => fetchMyHolds(false)}
            disabled={refreshing || loading}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white shadow-2xs"
            title={t.classList.refresh}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-sm rounded-xl flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <p className="font-medium flex-1">{errorMsg}</p>
        </div>
      )}

      
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <Card key={n} className="p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : holds.length === 0 ? (
        <Card className="border-dashed p-12 text-center shadow-none">
          <FileText className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {t.myApplications.no_holds_title}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t.myApplications.no_holds_sub}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {holds.map((h) => {
            const isConfirmed = h.status === 'CONFIRMED';
            const isExpired = h.status === 'EXPIRED';
            const isCancelled = h.status === 'CANCELLED';
            const isHeld = h.status === 'HELD';

            return (
              <Card
                key={h.holdId}
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-xs border ${
                  isConfirmed
                    ? 'border-emerald-200 hover:border-emerald-300 bg-emerald-50/20'
                    : isHeld
                    ? 'border-amber-200 hover:border-amber-300 bg-amber-50/30'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {h.className}
                    </h3>

                    
                    {isConfirmed && (
                      <Badge variant="success" className="font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        {t.application.status_confirmed}
                      </Badge>
                    )}

                    {isHeld && (
                      <Badge variant="warning" className="font-bold animate-pulse">
                        <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                        {t.application.status_held}
                      </Badge>
                    )}

                    {isExpired && (
                      <Badge variant="destructive" className="font-bold">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        {t.application.status_expired}
                      </Badge>
                    )}

                    {isCancelled && (
                      <Badge variant="secondary" className="font-bold">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        {t.application.status_cancelled}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-mono flex-wrap">
                    <span>{t.myApplications.hold_id_prefix} {h.holdId}</span>
                    <span>
                      {t.myApplications.expiry_prefix} {new Date(h.expiresAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => onSelectHold(h.holdId)}
                    className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold transition-all w-full sm:w-auto shadow-xs active:scale-[0.98] ${
                      isHeld
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                        : isConfirmed
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isHeld ? t.myApplications.pay_or_cancel_btn : t.myApplications.view_details_btn}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
