import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ message = 'Unable to load data from server.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-red-50/50 rounded-2xl border border-red-200">
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-slate-900">Something went wrong</h4>
      <p className="text-xs text-slate-600 max-w-md mt-1 mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
