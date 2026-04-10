import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default class BibleReaderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BibleReader Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">We couldn't open this chapter</h1>
            <p className="text-sm text-gray-600">An unexpected error occurred. Please try again.</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button 
                onClick={() => this.setState({ hasError: false })}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Try again
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.history.back()}
              >
                Go back
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}