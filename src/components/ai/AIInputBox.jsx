import React from "react";

export default function AIInputBox({ label, placeholder, value, onChange, maxLength = 5000 }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
        <span className={`text-xs ${value.length > maxLength * 0.9 ? "text-orange-500" : "text-gray-400"}`}>
          {value.length}/{maxLength}
        </span>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={5}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 min-h-[120px]"
      />
    </div>
  );
}