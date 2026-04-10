import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import HelpAgentChat from './HelpAgentChat';

export default function FloatingHelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          <HelpAgentChat onClose={() => setOpen(false)} />
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg transition-all active:scale-95"
        style={{ bottom: 'calc(56px + env(safe-area-inset-bottom) + 12px)' }}
      >
        {open ? <X className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
        {open ? 'Close' : 'AI Help'}
      </button>
    </>
  );
}