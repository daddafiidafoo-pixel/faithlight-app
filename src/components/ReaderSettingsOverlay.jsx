import React, { useState, useEffect } from 'react';
import { X, Sun, Moon, Coffee, Type, AlignJustify } from 'lucide-react';
import { getReaderSettings, saveReaderSettings } from '@/lib/readerSettings';

export default function ReaderSettingsOverlay({ open, onClose, onChange }) {
  const [settings, setSettings] = useState(getReaderSettings());

  useEffect(() => {
    if (open) setSettings(getReaderSettings());
  }, [open]);

  const update = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveReaderSettings(next);
    onChange?.(next);
  };

  if (!open) return null;

  const themes = [
    { id: 'light', label: 'Light', icon: <Sun className="h-4 w-4" />, bg: 'bg-white', border: 'border-slate-300 text-slate-800' },
    { id: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" />, bg: 'bg-slate-900', border: 'border-slate-600 text-slate-100' },
    { id: 'sepia', label: 'Sepia', icon: <Coffee className="h-4 w-4" />, bg: 'bg-amber-50', border: 'border-amber-400 text-amber-900' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl p-6 pb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-200 rounded-full" />

        <div className="flex items-center justify-between mb-6 mt-2">
          <h2 className="text-lg font-bold text-slate-900">Reading Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Theme */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Sun className="h-4 w-4" /> Theme
          </p>
          <div className="flex gap-3">
            {themes.map(th => (
              <button
                key={th.id}
                onClick={() => update({ theme: th.id })}
                className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition ${th.bg} ${th.border} ${settings.theme === th.id ? 'border-violet-500 ring-2 ring-violet-300' : 'border-slate-200'}`}
              >
                {th.icon}
                <span className="text-xs font-medium">{th.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Type className="h-4 w-4" /> Font Size
            </p>
            <span className="text-sm text-slate-500">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min={12}
            max={26}
            step={1}
            value={settings.fontSize}
            onChange={e => update({ fontSize: Number(e.target.value) })}
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* Line Height */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <AlignJustify className="h-4 w-4" /> Line Spacing
            </p>
            <span className="text-sm text-slate-500">{settings.lineHeight.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={1.2}
            max={2.4}
            step={0.1}
            value={settings.lineHeight}
            onChange={e => update({ lineHeight: parseFloat(e.target.value) })}
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Tight</span>
            <span>Spacious</span>
          </div>
        </div>

        {/* Preview */}
        <div className={`mt-6 rounded-xl p-4 border ${settings.theme === 'dark' ? 'bg-slate-900 border-slate-700' : settings.theme === 'sepia' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <p className={`${settings.theme === 'dark' ? 'text-slate-100' : settings.theme === 'sepia' ? 'text-amber-900' : 'text-slate-800'}`}
            style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight }}>
            "For God so loved the world that he gave his one and only Son…" — John 3:16
          </p>
        </div>
      </div>
    </div>
  );
}