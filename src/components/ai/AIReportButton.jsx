import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Flag, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const REASONS = [
  { value: 'inaccurate_theology', label: 'Inaccurate theology', labelOm: 'Teessoo sirrii miti' },
  { value: 'offensive_harmful', label: 'Offensive or harmful content', labelOm: 'Miidhaa ykn arrabsoo qaba' },
  { value: 'inappropriate_advice', label: 'Inappropriate advice', labelOm: 'Gorsa sirrii hin taane' },
  { value: 'other', label: 'Other', labelOm: 'Kan biraa' },
];

export default function AIReportButton({ user, aiResponse, prompt, sessionId, messageId, language = 'en' }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOm = language === 'om';

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    await base44.entities.AIReport.create({
      user_id: user?.id || 'anonymous',
      session_id: sessionId || '',
      message_id: messageId || '',
      prompt: prompt || '',
      ai_response: aiResponse,
      reason: selected,
      status: 'pending',
    });
    setSubmitted(true);
    setLoading(false);
    toast.success(isOm ? 'Gabaasni ergame!' : 'Report submitted. Thank you.');
    setTimeout(() => { setOpen(false); setSubmitted(false); setSelected(''); }, 1500);
  };

  if (submitted) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-green-600">
        <Check className="w-3 h-3" /> {isOm ? 'Gabaafame' : 'Reported'}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
        title={isOm ? 'Deebii Gabaasi' : 'Report Response'}
      >
        <Flag className="w-3 h-3" />
        {isOm ? 'Gabaasi' : 'Report'}
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700">
              {isOm ? 'Maaliif deebii kana gabaasuu barbaadde?' : 'Why are you reporting this response?'}
            </p>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1 mb-3">
            {REASONS.map(r => (
              <button
                key={r.value}
                onClick={() => setSelected(r.value)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${selected === r.value ? 'bg-red-50 text-red-700 border border-red-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}
              >
                {isOm ? r.labelOm : r.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selected || loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
          >
            {loading ? '…' : (isOm ? 'Gabaasi' : 'Submit Report')}
          </button>
        </div>
      )}
    </div>
  );
}