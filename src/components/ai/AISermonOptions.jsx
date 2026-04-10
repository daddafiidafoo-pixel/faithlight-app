import React from "react";

const LENGTHS = [
  { value: "5_minutes", label: "5 min" },
  { value: "15_minutes", label: "15 min" },
  { value: "30_minutes", label: "30 min" },
];

const STYLES = [
  { value: "teaching", label: "Teaching" },
  { value: "preaching", label: "Preaching" },
  { value: "devotional", label: "Devotional" },
];

const AUDIENCES = [
  { value: "general", label: "General" },
  { value: "youth", label: "Youth" },
  { value: "adults", label: "Adults" },
  { value: "church_service", label: "Church Service" },
  { value: "bible_study", label: "Bible Study" },
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

export default function AISermonOptions({ length, style, audience, onLengthChange, onStyleChange, onAudienceChange }) {
  return (
    <div className="space-y-4">
      <OptionGroup label="Length" options={LENGTHS} value={length} onChange={onLengthChange} />
      <OptionGroup label="Style" options={STYLES} value={style} onChange={onStyleChange} />
      <OptionGroup label="Audience" options={AUDIENCES} value={audience} onChange={onAudienceChange} />
    </div>
  );
}