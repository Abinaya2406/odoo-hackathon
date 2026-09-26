import React from 'react';

export const LoadingState = React.memo(({ message = 'Loading StockSense data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-600 tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
});

LoadingState.displayName = 'LoadingState';
