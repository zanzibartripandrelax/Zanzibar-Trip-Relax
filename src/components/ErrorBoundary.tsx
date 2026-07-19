import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home, MessageSquare } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.error("Uncaught error captured by Zanzibar Error Boundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    // Attempt to redirect back to home page hash
    window.location.hash = 'home';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#020C1F] text-white flex items-center justify-center p-6 font-sans selection:bg-[#D4A017] selection:text-white">
          <div className="max-w-md w-full bg-[#0A1224] border border-white/5 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#D4A017]/10 blur-3xl rounded-full -z-10" />

            <div className="w-16 h-16 bg-red-500/10 text-red-400 border border-red-500/25 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertOctagon size={32} className="animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] bg-red-500/10 text-red-400 uppercase tracking-[0.2em] font-black px-3 py-1 rounded-full border border-red-500/20">
                Application Recovered
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-white uppercase tracking-tight mt-3">
                Something Went Askew
              </h2>
              <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
                An unexpected interface render issue occurred. Our Zanzibar support desk has been automatically notified.
              </p>
            </div>

            {/* Error Message Details (Collapsible or small) */}
            <div className="bg-[#0C1930] border border-white/5 rounded-2xl p-4 text-left space-y-2">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">Error Diagnostic</span>
              <p className="text-[11px] font-mono text-red-300 break-words leading-normal bg-black/30 p-2.5 rounded-lg border border-red-500/10 max-h-32 overflow-y-auto">
                {this.state.error?.toString() || 'Unknown Runtime Render Interruption'}
              </p>
            </div>

            {/* Action operations */}
            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black uppercase text-xs tracking-wider py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer pt-4"
              >
                <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
                <span>Reset Interface State</span>
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Home size={14} />
                <span>Reload Entire Website</span>
              </button>
            </div>

            <div className="pt-2 border-t border-white/5 text-[10px] text-slate-450 flex justify-center items-center gap-1.5 font-light">
              <MessageSquare size={12} className="text-[#D4A017]" />
              <span>Need help? Contact our WhatsApp desk: +255 629 506 063</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
