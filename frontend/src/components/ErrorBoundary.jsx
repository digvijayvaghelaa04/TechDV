import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen text-foreground bg-slate-900 px-4">
                    <div className="glass-panel p-10 rounded-[3rem] text-center border-rose-500/20 max-w-lg">
                        <span className="text-6xl mb-6 block">🌋</span>
                        <h2 className="text-3xl font-display font-bold mb-4">Something went wrong</h2>
                        <p className="text-muted-foreground mb-6">The application encountered an unexpected error. Don't worry, your data is safe.</p>
                        <pre className="bg-background/40 p-4 rounded-xl text-xs text-rose-400 text-left overflow-auto mb-8 max-h-40">
                            {this.state.error?.message || "Unknown error"}
                        </pre>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-primary-600 rounded-2xl font-bold hover:bg-primary-500 transition-colors shadow-xl shadow-primary-600/20"
                        >
                            Refresh Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
