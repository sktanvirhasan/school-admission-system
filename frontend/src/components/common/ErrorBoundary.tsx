import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { bn } from '../../i18n/bn';
import { en } from '../../i18n/en';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      const isEn = localStorage.getItem('school_admission_language') === 'en';
      const t = isEn ? en.errorBoundary : bn.errorBoundary;

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-lg w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {t.title}
            </h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              {t.subtitle}
            </p>
            {this.state.error?.message && (
              <div className="p-3.5 bg-red-50 text-red-700 text-xs font-mono rounded-xl mb-6 overflow-x-auto text-left border border-red-200">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t.reload_btn}
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
              >
                {t.retry_btn}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

