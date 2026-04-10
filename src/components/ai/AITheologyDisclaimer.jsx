import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function AITheologyDisclaimer({ compact = false, language = 'en' }) {
  const [expanded, setExpanded] = useState(false);

  const text = language === 'om'
    ? 'Deebiin AI qo\'annoo Macaafa Qulqulluuf gargaarsa qofa. Hubannoo amantii hunda hin bakka bu\'u. Yeroo hunda Macaafa Qulqulluu fi qajeelfama amansiisaa waliin madaali.'
    : 'AI responses are for Bible study support only and may not reflect every Christian tradition. Always compare with Scripture and trusted spiritual guidance.';

  if (compact) {
    return (
      <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
        <span>{text}</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-800">AI Study Tool — Theological Note</span>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-amber-500" />
          : <ChevronDown className="w-4 h-4 text-amber-500" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2 text-xs text-amber-800 border-t border-amber-200 pt-3">
          <p>{text}</p>
          <ul className="space-y-1 pl-3 list-disc text-amber-700">
            <li>AI acts as a <strong>study assistant</strong>, not a pastor, prophet, or doctrinal authority.</li>
            <li>All responses are anchored to Scripture references you can verify yourself.</li>
            <li>On disputed passages, the AI will note that Christian traditions may differ.</li>
            <li>AI output is not prophecy, divine revelation, or a replacement for pastoral care.</li>
          </ul>
        </div>
      )}
    </div>
  );
}