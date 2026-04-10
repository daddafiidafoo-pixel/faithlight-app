import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Catches unhandled React render errors and shows a friendly screen.
 * Never exposes raw error messages to the user.
 */
export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log for developers, not shown to user
    console.error('[FaithLight] Render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
          <div className="text-5xl mb-4">🙏</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            We're sorry for the interruption. Please refresh to continue your study.
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm"
          >
            <RefreshCw size={15} /> Refresh App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}