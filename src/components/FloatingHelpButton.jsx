import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export default function FloatingHelpButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/HelpAndSupport')}
      aria-label="Open help and support"
      className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <HelpCircle className="w-6 h-6" />
    </button>
  );
}