import React, { useState } from 'react';
import { X, Link, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SharePlanModal({ plan, onClose }) {
  const [copied, setCopied] = useState(false);

  // Generate a unique shareable link using the plan id + a simple hash
  const shareUrl = `${window.location.origin}/ReadingPlans?shared=${btoa(plan.id)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — try manually copying the link below');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Link size={16} className="text-indigo-600" />
            Share Reading Plan
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-indigo-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="text-3xl">{plan.icon}</div>
            <div>
              <p className="font-bold text-gray-900">{plan.title}</p>
              <p className="text-sm text-gray-500">{plan.durationDays} days</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Shareable Link</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 bg-gray-50 truncate"
              />
              <button
                onClick={copyLink}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  copied ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Anyone with this link can view and subscribe to this reading plan
          </p>
        </div>
      </div>
    </div>
  );
}