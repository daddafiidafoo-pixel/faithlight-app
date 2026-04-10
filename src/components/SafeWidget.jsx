import React, { useState, useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * SafeWidget: Wraps a child component to prevent crashes
 * If the child fails to render, shows a friendly retry UI
 * Logs errors silently without showing stack traces to users
 */
export class SafeWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Section failed to load'
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log silently
    console.warn(`[SafeWidget] Render error in ${this.props.name || 'component'}:`, error?.message);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              {this.props.fallbackText || "This section couldn't load."}
            </p>
            <Button
              onClick={this.handleRetry}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafeWidget;

/**
 * DevErrorOverlay: Shows errors only in development
 * Displays the last API error in a non-intrusive overlay
 */
export function DevErrorOverlay() {
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    const checkError = () => {
      const error = window.__lastApiError;
      if (error && error !== lastError) {
        setLastError(error);
      }
    };

    const interval = setInterval(checkError, 1000);
    return () => clearInterval(interval);
  }, [lastError]);

  if (!import.meta.env.DEV || !lastError) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
      <details className="text-xs">
        <summary className="font-semibold text-red-700 cursor-pointer mb-2">
          API Error (Dev Only)
        </summary>
        <pre className="text-red-600 overflow-auto max-h-32 bg-white p-2 rounded mt-2">
          {typeof lastError === 'string' ? lastError : JSON.stringify(lastError, null, 2)}
        </pre>
        <button
          onClick={() => {
            window.__lastApiError = null;
            setLastError(null);
          }}
          className="text-xs text-red-600 hover:text-red-700 mt-2 underline"
        >
          Clear
        </button>
      </details>
    </div>
  );
}