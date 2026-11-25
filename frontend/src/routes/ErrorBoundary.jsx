import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Application Error</h2>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              {this.state.error?.message || 'An unexpected UI rendering error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="px-5 py-2.5 rounded-xl bg-[#4F46E5] text-white text-sm font-semibold hover:bg-indigo-700 cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
