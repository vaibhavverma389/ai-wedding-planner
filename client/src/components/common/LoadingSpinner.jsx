import React from 'react';
import { Sparkles } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading ShaadiSaathi...', fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-ivory-200 border-t-maroon-900 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-gold-600 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-stone-600 tracking-wide">{text}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-ivory-50">
        {content}
      </div>
    );
  }

  return content;
};
