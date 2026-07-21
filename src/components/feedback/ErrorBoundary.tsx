import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-app-background p-6">
          <div className="max-w-md w-full glass-panel-elevated p-8 rounded-2xl border-danger/20 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-danger/10 rounded-full text-danger neon-glow">
                <AlertOctagon className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Algo salió mal</h1>
            <p className="text-text-secondary text-sm mb-6">
              La aplicación experimentó un error crítico. Los datos locales no se han perdido y puedes intentar recargar la página.
            </p>
            {this.state.error && (
              <pre className="text-left text-xs bg-app-background-soft p-4 rounded-lg overflow-x-auto text-danger border border-border-subtle max-h-40 mb-6">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-primary text-text-primary rounded-xl font-bold hover:bg-primary-strong transition-all duration-200"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
