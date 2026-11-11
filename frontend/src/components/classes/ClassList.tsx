import React, { useState, useEffect, useCallback } from 'react';
import { api, AppApiError } from '../../api';
import { ClassItem } from '../../types';
import { useStudent } from '../../context/StudentContext';
import { useLanguage } from '../../i18n';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  GraduationCap,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Send,
  Ban,
  Sparkles,
  X,
} from 'lucide-react';

interface Props {
  onHoldCreated: (holdId: string) => void;
  refreshTrigger?: number;
}

export const ClassList: React.FC<Props> = ({ onHoldCreated, refreshTrigger }) => {
  const { studentId, isValidStudentId } = useStudent();
  const { t, format } = useLanguage();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applyingClassId, setApplyingClassId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchClasses = useCallback(async (isBackground = false) => {
    if (!isBackground) setRefreshing(true);
    try {
      const data = await api.getClasses();
      setClasses(data);
    } catch (err) {
      if (!isBackground) {
        if (err instanceof AppApiError) {
          setFeedback({ type: 'error', message: err.userMessage });
        } else {
          setFeedback({
            type: 'error',
            message: t.classList.load_error,
          });
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t.classList.load_error]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses, refreshTrigger]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchClasses(true);
    }, 4000);
    return () => clearInterval(timer);
  }, [fetchClasses]);

  const handleApply = async (cls: ClassItem) => {
    setFeedback(null);

    if (!isValidStudentId) {
      setFeedback({
        type: 'error',
        message: t.classList.enter_id_warning,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (cls.availableSeats <= 0) {
      setFeedback({
        type: 'error',
        message: t.classList.seat_finished_error,
      });
      return;
    }

    setApplyingClassId(cls.id);
    try {
      const hold = await api.createHold(cls.id, studentId);
      setFeedback({
        type: 'success',
        message: format(t.classList.apply_success, { name: cls.name }),
      });
      fetchClasses(true);
      onHoldCreated(hold.holdId);
    } catch (err) {
      if (err instanceof AppApiError) {
        setFeedback({ type: 'error', message: err.userMessage });
      } else {
        setFeedback({
          type: 'error',
          message: t.classList.generic_error,
        });
      }
      fetchClasses(true);
    } finally {
      setApplyingClassId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            {t.classList.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.classList.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-center">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold gap-1.5 py-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            {t.classList.live_badge}
          </Badge>
          <button
            type="button"
            onClick={() => fetchClasses(false)}
            disabled={refreshing}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white shadow-2xs"
            title={t.classList.refresh}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-start gap-3 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className="font-medium flex-1">{feedback.message}</p>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-6 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded-md w-3/4" />
              <div className="h-2 bg-slate-100 rounded-full w-full" />
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="h-10 bg-slate-100 rounded-lg" />
                <div className="h-10 bg-slate-100 rounded-lg" />
                <div className="h-10 bg-slate-100 rounded-lg" />
                <div className="h-10 bg-slate-100 rounded-lg" />
              </div>
              <div className="h-10 bg-slate-200 rounded-xl" />
            </Card>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card className="border-dashed p-12 text-center shadow-none">
          <GraduationCap className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {t.classList.no_classes}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {t.classList.no_classes_sub}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const isFull = cls.availableSeats <= 0;
            const isApplying = applyingClassId === cls.id;
            const filledPercent = Math.min(
              100,
              Math.round(((cls.totalSeats - cls.availableSeats) / cls.totalSeats) * 100)
            );

            return (
              <Card
                key={cls.id}
                className={`transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between overflow-hidden border ${
                  isFull
                    ? 'border-slate-200/70 bg-slate-50/50'
                    : 'border-slate-200 hover:border-indigo-400 bg-white'
                }`}
              >
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base font-extrabold text-slate-900 leading-snug">
                      {cls.name}
                    </CardTitle>
                    {isFull ? (
                      <Badge variant="destructive" className="flex-shrink-0 font-bold">
                        <Ban className="w-3 h-3 mr-1" />
                        {t.classList.seat_full}
                      </Badge>
                    ) : (
                      <Badge variant="success" className="flex-shrink-0 font-bold bg-indigo-50 text-indigo-700 border-indigo-200">
                        <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
                        {t.classList.seat_available}
                      </Badge>
                    )}
                  </div>

                  
                  <div className="space-y-1.5 pt-3">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>{t.classList.seat_occupancy}</span>
                      <span>{filledPercent}%</span>
                    </div>
                    <Progress
                      value={filledPercent}
                      indicatorClassName={
                        isFull
                          ? 'bg-rose-500'
                          : filledPercent > 80
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }
                    />
                  </div>
                </CardHeader>

                <CardContent className="px-6 py-2">
                  
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-center">
                    <div className="p-1">
                      <div className="text-[10px] text-slate-500 font-medium">
                        {t.classList.total_seats}
                      </div>
                      <div className="text-sm font-black text-slate-800 flex items-center justify-center gap-0.5 mt-0.5">
                        <Users className="w-3 h-3 text-slate-400" />
                        {cls.totalSeats}
                      </div>
                    </div>

                    <div className="p-1">
                      <div className="text-[10px] text-amber-600 font-medium">
                        {t.classList.held_seats}
                      </div>
                      <div className="text-sm font-black text-amber-700 flex items-center justify-center gap-0.5 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {cls.heldSeats}
                      </div>
                    </div>

                    <div className="p-1">
                      <div className="text-[10px] text-indigo-600 font-medium">
                        {t.classList.confirmed_seats}
                      </div>
                      <div className="text-sm font-black text-indigo-700 flex items-center justify-center gap-0.5 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-indigo-500" />
                        {cls.confirmedSeats}
                      </div>
                    </div>

                    <div
                      className={`p-1 rounded-lg ${
                        isFull
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      <div className="text-[10px] font-bold">
                        {t.classList.available_seats}
                      </div>
                      <div className="text-base font-extrabold mt-0.5">
                        {cls.availableSeats}
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-3">
                  <button
                    type="button"
                    onClick={() => handleApply(cls)}
                    disabled={isFull || isApplying}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98] ${
                      isFull
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/80 shadow-none'
                        : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-md'
                    }`}
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t.classList.applying_btn}
                      </>
                    ) : isFull ? (
                      <>
                        <Ban className="w-4 h-4" />
                        {t.classList.no_seats_btn}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-indigo-400" />
                        {t.classList.apply_btn}
                      </>
                    )}
                  </button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
