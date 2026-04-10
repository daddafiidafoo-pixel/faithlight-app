import React from "react";

const TONES = [
  { value: "simple", label: "Simple" },
  { value: "study", label: "Study" },
  { value: "teaching", label: "Teaching" },
];

const AUDIENCES = [
  { value: "general", label: "General" },
  { value: "youth", label: "Youth" },
  { value: "adults", label: "Adults" },
  { value: "church_service", label: "Church Group" },
];

function OptionGroup({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all min-h-[40px] ${
              value === opt.value
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AIExplanationOptions({ tone, audience, onToneChange, onAudienceChange }) {
  return (
    <div className="space-y-4">
      <OptionGroup label="Tone" options={TONES} value={tone} onChange={onToneChange} />
      <OptionGroup label="Audience" options={AUDIENCES} value={audience} onChange={onAudienceChange} />
    </div>
  );
}