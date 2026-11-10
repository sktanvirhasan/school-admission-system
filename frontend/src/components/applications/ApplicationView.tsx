import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, AppApiError } from '../../api';
import { HoldStatusResponse, HoldStatus, ClassItem } from '../../types';
import { useStudent } from '../../context/StudentContext';
import { useLanguage } from '../../i18n';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CreditCard,
  Trash2,
  Loader2,
  RefreshCw,
  Calendar,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface Props {
  holdId: string;
  onStatusChange?: (newStatus: HoldStatus) => void;
  onBackToClasses?: () => void;
}

export const ApplicationView: React.FC<Props> = ({
  holdId,
  onStatusChange,
  onBackToClasses,
}) => {
  const { studentId, setActiveHoldStatus } = useStudent();
  const { t } = useLanguage();
  const [hold, setHold] = useState<HoldStatusResponse | null>(null);
  const [classDetails, setClassDetails] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const hasTriggeredExpiryRef = useRef<boolean>(false);

  const fetchHold = useCallback(async () => {
    try {
      const data = await api.getHold(holdId);
      setHold(data);

      try {
        const cls = await api.getClass(data.classId);
        setClassDetails(cls);
      } catch {

      }

      const expiry = new Date(data.expiresAt).getTime();
      const diffSec = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setRemainingSeconds(diffSec);

      let finalStatus = data.status;
      if (diffSec <= 0 && data.status === 'HELD') {
        finalStatus = 'EXPIRED';
        data.status = 'EXPIRED';
        setHold({ ...data });
      }

      setActiveHoldStatus(finalStatus);
      onStatusChange?.(finalStatus);
    } catch (err) {
      if (err instanceof AppApiError) {
        setFeedback({ type: 'error', message: err.userMessage });
      } else {
        setFeedback({
          type: 'error',
          message: t.application.loading,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [holdId, onStatusChange, setActiveHoldStatus, t.application.loading]);

  useEffect(() => {
    hasTriggeredExpiryRef.current = false;
    fetchHold();
  }, [fetchHold]);

  useEffect(() => {
    if (!hold || hold.status !== 'HELD') return;

    const interval = setInterval(() => {
      const expiry = new Date(hold.expiresAt).getTime();
      const diffSec = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setRemainingSeconds(diffSec);

      if (diffSec <= 0) {
        clearInterval(interval);
        if (!hasTriggeredExpiryRef.current) {
          hasTriggeredExpiryRef.current = true;
          setHold((prev) => (prev ? { ...prev, status: 'EXPIRED' } : null));
          setActiveHoldStatus('EXPIRED');
          onStatusChange?.('EXPIRED');
          fetchHold();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hold, fetchHold, onStatusChange, setActiveHoldStatus]);

  const handlePayFee = async () => {
    if (!hold || hold.status !== 'HELD' || remainingSeconds <= 0) return;

    setFeedback(null);
    setPaying(true);
    try {
      const result = await api.confirmHold(hold.holdId, studentId);
      setHold((prev) => (prev ? { ...prev, status: result.status } : null));
      setActiveHoldStatus(result.status);
      setFeedback({
        type: 'success',
        message: t.application.payment_success,
      });
      onStatusChange?.('CONFIRMED');
    } catch (err) {
      if (err instanceof AppApiError) {
        setFeedback({ type: 'error', message: err.userMessage });
        fetchHold();
      } else {
        setFeedback({
          type: 'error',
          message: t.application.payment_error,
        });
      }
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!hold || hold.status !== 'HELD') return;

    const confirmed = window.confirm(t.application.cancel_confirm);
    if (!confirmed) return;

    setFeedback(null);
    setCancelling(true);
    try {
      await api.cancelHold(hold.holdId, studentId);
      setHold((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
      setActiveHoldStatus('CANCELLED');
      setFeedback({
        type: 'success',
        message: t.application.cancel_success,
      });
      onStatusChange?.('CANCELLED');
    } catch (err) {
      if (err instanceof AppApiError) {
        setFeedback({ type: 'error', message: err.userMessage });
        fetchHold();
      } else {
        setFeedback({
          type: 'error',
          message: t.application.cancel_error,
        });
      }
    } finally {
      setCancelling(false);
    }
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (loading) {
    return (
      <Card className="p-12 text-center shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">{t.application.loading}</p>
      </Card>
    );
  }

  if (!hold) {
    return (
      <Card className="border-rose-200 p-10 text-center shadow-xs">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">{t.application.not_found_title}</h3>
        <p className="text-xs text-slate-500 mb-5">{t.application.not_found_sub}</p>
        {onBackToClasses && (
          <button
            type="button"
            onClick={onBackToClasses}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            {t.application.go_classes_btn}
          </button>
        )}
      </Card>
    );
  }

  const isHeld = hold.status === 'HELD' && remainingSeconds > 0;
  const isConfirmed = hold.status === 'CONFIRMED';
  const isExpired = hold.status === 'EXPIRED' || (hold.status === 'HELD' && remainingSeconds <= 0);
  const isCancelled = hold.status === 'CANCELLED';

  return (
    <Card className="overflow-hidden border border-slate-200 shadow-sm">
      
      <div
        className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isConfirmed
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : isExpired
            ? 'bg-rose-50/80 border-rose-200 text-rose-950'
            : isCancelled
            ? 'bg-slate-100 border-slate-200 text-slate-800'
            : 'bg-gradient-to-r from-amber-50 to-orange-50/60 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-center space-x-3">
          {isConfirmed && <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />}
          {isExpired && <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />}
          {isCancelled && <XCircle className="w-6 h-6 text-slate-500 flex-shrink-0" />}
          {isHeld && <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 animate-pulse" />}

          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              {t.application.status_label}
            </div>
            <div className="text-base sm:text-lg font-black">
              {isConfirmed && t.application.status_confirmed}
              {isExpired && t.application.status_expired}
              {isCancelled && t.application.status_cancelled}
              {isHeld && t.application.status_held}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchHold}
          className="self-start sm:self-center p-2 text-slate-500 hover:text-slate-900 hover:bg-black/5 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <CardContent className="p-6 sm:p-8 space-y-6">
        
        {feedback && (
          <div
            className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <p className="font-medium flex-1">{feedback.message}</p>
          </div>
        )}

        
        {isHeld && (
          <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/50 to-orange-50/30 p-6 sm:p-8 text-center shadow-xs">
            <Badge variant="warning" className="font-bold gap-1 mb-3">
              <Clock className="w-3.5 h-3.5" />
              {t.application.countdown_title}
            </Badge>

            
            <div
              data-testid="hold-countdown"
              className="flex items-center justify-center gap-3 my-3"
            >
              <div className="flex flex-col items-center">
                <span className="w-16 sm:w-20 py-2 sm:py-3 rounded-xl bg-slate-900 text-white font-mono text-3xl sm:text-4xl font-black shadow-md tracking-wider">
                  {pad(minutes)}
                </span>
                <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">মিনিট</span>
              </div>

              <span className="text-3xl sm:text-4xl font-mono font-bold text-slate-400 -mt-4">:</span>

              <div className="flex flex-col items-center">
                <span
                  className={`w-16 sm:w-20 py-2 sm:py-3 rounded-xl font-mono text-3xl sm:text-4xl font-black shadow-md tracking-wider ${
                    remainingSeconds < 60
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {pad(seconds)}
                </span>
                <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">সেকেন্ড</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mt-2">
              {t.application.countdown_sub}
            </p>
          </div>
        )}

        
        {isConfirmed && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Sparkles className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-xl font-black text-emerald-950 mb-1">
              {t.application.confirmed_title}
            </h4>
            <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
              {t.application.confirmed_sub}
            </p>
          </div>
        )}

        
        {isExpired && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center">
            <XCircle className="w-14 h-14 text-rose-600 mx-auto mb-3" />
            <h4 className="text-xl font-bold text-rose-950 mb-1.5">
              {t.application.expired_title}
            </h4>
            <p className="text-xs sm:text-sm text-rose-800 max-w-md mx-auto leading-relaxed">
              {t.application.expired_sub}
            </p>
          </div>
        )}

        
        {isCancelled && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <XCircle className="w-14 h-14 text-slate-400 mx-auto mb-3" />
            <h4 className="text-xl font-bold text-slate-800 mb-1.5">
              {t.application.cancelled_title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {t.application.cancelled_sub}
            </p>
          </div>
        )}

        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-500 font-medium block mb-0.5">{t.application.class_label}</span>
            <span className="font-bold text-slate-900 text-sm">
              {classDetails?.name || hold.classId}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-medium block mb-0.5">{t.application.hold_id_label}</span>
            <span className="font-mono font-bold text-slate-800 select-all">
              {hold.holdId}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-medium block mb-0.5">{t.application.student_id_label}</span>
            <span className="font-mono font-bold text-slate-800">
              {studentId || 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-medium block mb-0.5">{t.application.expires_at_label}</span>
            <span className="font-mono text-slate-800 flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              {new Date(hold.expiresAt).toLocaleTimeString()} ({hold.expiresAt})
            </span>
          </div>
        </div>

        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handlePayFee}
            disabled={!isHeld || paying}
            className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] ${
              isHeld && !paying
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
            }`}
          >
            {paying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.application.paying_btn}
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                {t.application.pay_fee_btn}
              </>
            )}
          </button>

          {isHeld && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="py-3.5 px-6 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
            >
              {cancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {t.application.cancel_btn}
            </button>
          )}

          {onBackToClasses && (
            <button
              type="button"
              onClick={onBackToClasses}
              className="py-3.5 px-6 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.application.back_to_classes_btn}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
