import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg text-text-primary">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-text-muted mb-6">An unexpected error occurred.</p>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-accent text-white rounded-lg cursor-pointer border-none hover:bg-accent-hover transition-colors"
            >
              Back to Board
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
