import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-stone-500 dark:text-stone-400 mb-8">
              The application encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            <div className="flex flex-col gap-3">
                <button
                    onClick={this.handleReload}
                    className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all btn-press shadow-md shadow-orange-600/20"
                >
                    Reload Page
                </button>
                <button
                    onClick={this.handleGoBack}
                    className="w-full py-3 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-all btn-press"
                >
                    Go Back
                </button>
            </div>

            {/* Technical details hidden for production */}
            {/* <details className="mt-8 text-left group">
                <summary className="text-xs text-stone-400 dark:text-stone-500 cursor-pointer hover:underline">
                    View technical details
                </summary>
                <div className="mt-2 p-4 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-100 dark:border-stone-800 overflow-auto max-h-48">
                    <pre className="text-[10px] font-mono text-stone-600 dark:text-stone-400">
                        {this.state.error?.stack || this.state.error?.toString()}
                    </pre>
                </div>
            </details> */}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
