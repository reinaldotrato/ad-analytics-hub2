import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-8 max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Algo deu errado
            </h1>
            <p className="text-gray-300 mb-4">
              Um erro inesperado ocorreu. Por favor, tente recarregar a página.
            </p>
            <details className="mb-4">
              <summary className="text-purple-400 cursor-pointer hover:text-purple-300">
                Detalhes do erro (para desenvolvedores)
              </summary>
              <pre className="mt-2 p-4 bg-slate-800 rounded text-sm text-red-300 overflow-auto max-h-60">
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
