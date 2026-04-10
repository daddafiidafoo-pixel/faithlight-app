import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ComingSoonModal({ featureName, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{featureName}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          This feature is coming soon. We're working hard to bring it to you!
        </p>

        <Button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}