import React from "react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "om", label: "Afaan Oromoo" },
  { code: "am", label: "አማርኛ" },
  { code: "ar", label: "العربية" },
  { code: "sw", label: "Kiswahili" },
  { code: "fr", label: "Français" },
  { code: "ti", label: "ትግርኛ" },
];

export default function AILanguagePicker({ label, value, onChange, allowAuto = false }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="min-h-[44px] border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
      >
        {allowAuto && <option value="auto">Auto-detect</option>}
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}