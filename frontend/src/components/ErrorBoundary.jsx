import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('StockSense ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-6 bg-rose-50 border border-rose-200 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Something went wrong on this page
          </h3>
          <p className="text-sm text-slate-600 max-w-md mb-4">
            {this.state.error?.message || 'An unexpected error occurred while rendering this module.'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
