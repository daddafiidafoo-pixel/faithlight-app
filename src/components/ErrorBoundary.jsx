import React from 'react';
import { useErrorLog } from './useErrorLog';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Error boundary that catches rendering errors and logs them silently
 * Displays friendly fallback UI with retry button
 */
class ErrorBoundaryBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log error silently via function call
    // We can't use hooks here, but we'll handle this in the render with a wrapper
    const errorToLog = {
      message: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack
    };
    
    // Store in window for later logging
    if (typeof window !== 'undefined') {
      window.__lastBoundaryError = errorToLog;
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Fallback UI component for errors
 */
function ErrorFallback({ error, errorInfo, onRetry }) {
  const { logError } = useErrorLog();

  React.useEffect(() => {
    // Log the error silently
    logError(error, {
      errorCode: 'RENDER_ERROR',
      message: error?.toString?.() || 'Render error',
      meta: { componentStack: errorInfo?.componentStack }
    });
  }, [error, errorInfo, logError]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">This section couldn't load.</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Something went wrong. We've logged this issue and our team will look into it.
        </p>

        {import.meta.env.DEV && error && (
          <details className="mb-4 p-3 bg-red-50 rounded border border-red-200">
            <summary className="text-xs font-mono text-red-700 cursor-pointer">Error Details (Dev Only)</summary>
            <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-40">
              {error.toString()}
            </pre>
          </details>
        )}

        <Button
          onClick={onRetry}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}

export { ErrorBoundaryBase as ErrorBoundary };