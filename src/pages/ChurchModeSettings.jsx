import React, { useState, useEffect, useRef } from 'react';
import { Moon, Bell, BellOff, Sun, Eye, Monitor, BookOpen, CheckCircle2, Zap } from 'lucide-react';

const FONT_SIZES = [
  { label: 'Normal', value: '16px', class: 'text-base' },
  { label: 'Large', value: '20px', class: 'text-xl' },
  { label: 'X-Large', value: '24px', class: 'text-2xl' },
  { label: 'Huge', value: '30px', class: 'text-3xl' },
];

const WARM_LEVELS = [
  { label: 'Off', filter: 'none', sepia: 0 },
  { label: 'Mild', filter: 'sepia(15%) brightness(0.97)', sepia: 15 },
  { label: 'Medium', filter: 'sepia(30%) brightness(0.95)', sepia: 30 },
  { label: 'Warm', filter: 'sepia(55%) brightness(0.92)', sepia: 55 },
];

const SAVED_KEY = 'faithlight_church_mode';

export default function ChurchModeSettings() {
  const [active, setActive] = useState(false);
  const [fontSize, setFontSize] = useState(1); // index into FONT_SIZES
  const [warmLevel, setWarmLevel] = useState(1); // index into WARM_LEVELS
  const [notifsMuted, setNotifsMuted] = useState(true);
  const [highContrast, setHighContrast] = useState(true);
  const [screenWake, setScreenWake] = useState(true);
  const wakeLockRef = useRef(null);

  // Load saved settings
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '{}');
      if (saved.active) applyAll(saved);
    } catch {}
  }, []);

  const applyAll = (cfg) => {
    setActive(cfg.active ?? false);
    setFontSize(cfg.fontSize ?? 1);
    setWarmLevel(cfg.warmLevel ?? 1);
    setNotifsMuted(cfg.notifsMuted ?? true);
    setHighContrast(cfg.highContrast ?? true);
    setScreenWake(cfg.screenWake ?? true);
  };

  // Apply visual effects whenever settings change
  useEffect(() => {
    if (!active) {
      document.documentElement.style.removeProperty('--church-font-size');
      document.documentElement.style.removeProperty('filter');
      document.documentElement.style.removeProperty('background-color');
      document.documentElement.style.removeProperty('color');
      document.body.style.removeProperty('font-size');
      document.body.style.removeProperty('filter');
      releaseWakeLock();
      return;
    }

    // Font size
    document.body.style.fontSize = FONT_SIZES[fontSize].value;

    // Warm filter (reduce blue light)
    document.body.style.filter = WARM_LEVELS[warmLevel].filter;

    // High contrast
    if (highContrast) {
      document.body.style.backgroundColor = '#0a0a0a';
      document.body.style.color = '#f5f0e8';
    } else {
      document.body.style.removeProperty('background-color');
      document.body.style.removeProperty('color');
    }

    // Screen wake lock
    if (screenWake) requestWakeLock();
    else releaseWakeLock();

    // Save
    localStorage.setItem(SAVED_KEY, JSON.stringify({ active, fontSize, warmLevel, notifsMuted, highContrast, screenWake }));
  }, [active, fontSize, warmLevel, notifsMuted, highContrast, screenWake]);

  const requestWakeLock = async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {}
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; }
  };

  const toggleActive = () => {
    if (active) {
      setActive(false);
      localStorage.removeItem(SAVED_KEY);
    } else {
      setActive(true);
    }
  };

  const FEATURES = [
    { Icon: Monitor, label: 'Keep Screen Awake', desc: 'Prevents screen from sleeping during study', state: screenWake, toggle: () => setScreenWake(v => !v) },
    { Icon: Eye, label: 'High-Contrast Mode', desc: 'Dark background, warm text for easy reading', state: highContrast, toggle: () => setHighContrast(v => !v) },
    { Icon: BellOff, label: 'Mute Notifications', desc: 'No banners or sounds during your session', state: notifsMuted, toggle: () => setNotifsMuted(v => !v) },
  ];

  return (
    <div className={`min-h-screen py-8 px-4 transition-all duration-500 ${active && highContrast ? 'bg-gray-950 text-amber-50' : 'bg-gradient-to-br from-slate-50 to-indigo-50'}`}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-3 ${active ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-100 text-indigo-700'}`}>
            <BookOpen className="w-4 h-4" /> Church Mode
          </div>
          <h1 className={`text-2xl font-extrabold mb-1 ${active && highContrast ? 'text-amber-100' : 'text-gray-900'}`}>Focus Mode for Study</h1>
          <p className={`text-sm ${active && highContrast ? 'text-amber-200/70' : 'text-gray-500'}`}>Reduce distractions. Maximize scripture immersion.</p>
        </div>

        {/* Big Toggle */}
        <div className={`rounded-3xl border p-6 mb-6 text-center transition-all duration-300 ${active ? 'bg-gradient-to-br from-amber-900/40 to-indigo-900/40 border-amber-500/40 shadow-xl shadow-amber-900/30' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 transition-all ${active ? 'bg-amber-500 shadow-lg shadow-amber-500/40' : 'bg-gray-100'}`}>
            {active ? <Zap className="w-10 h-10 text-white" /> : <BookOpen className="w-10 h-10 text-gray-400" />}
          </div>
          <p className={`text-lg font-extrabold mb-1 ${active && highContrast ? 'text-amber-100' : 'text-gray-800'}`}>
            Church Mode is {active ? 'ON' : 'OFF'}
          </p>
          <p className={`text-xs mb-5 ${active && highContrast ? 'text-amber-200/60' : 'text-gray-400'}`}>
            {active ? 'Optimized for distraction-free study' : 'Toggle to begin your focused session'}
          </p>
          <button
            onClick={toggleActive}
            className={`px-10 py-3 rounded-2xl font-extrabold text-sm transition-all ${active ? 'bg-red-500/80 hover:bg-red-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'}`}>
            {active ? 'Exit Church Mode' : 'Activate Church Mode'}
          </button>
        </div>

        {/* Feature toggles */}
        <div className="space-y-2 mb-5">
          {FEATURES.map((feature) => {
          const { Icon, label, desc, state, toggle } = feature;
          return (
            <div key={label} className={`rounded-2xl border p-4 flex items-center gap-3 ${active && highContrast ? 'bg-gray-900/60 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${state ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                <Icon className={`w-4 h-4 ${state ? 'text-indigo-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${active && highContrast ? 'text-amber-100' : 'text-gray-800'}`}>{label}</p>
                <p className={`text-xs ${active && highContrast ? 'text-gray-400' : 'text-gray-400'}`}>{desc}</p>
              </div>
              <button onClick={toggle}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${state ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${state ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          );
        })}
        </div>

        {/* Font size */}
        <div className={`rounded-2xl border p-4 mb-4 ${active && highContrast ? 'bg-gray-900/60 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <p className={`text-sm font-bold mb-3 ${active && highContrast ? 'text-amber-100' : 'text-gray-800'}`}>
            <Sun className="w-4 h-4 inline mr-1.5 text-amber-500" />Text Size
          </p>
          <div className="grid grid-cols-4 gap-2">
            {FONT_SIZES.map((f, i) => (
              <button key={f.label} onClick={() => setFontSize(i)}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors ${fontSize === i ? 'bg-indigo-600 text-white border-indigo-600' : active && highContrast ? 'bg-gray-800 text-gray-300 border-gray-700 hover:border-indigo-400' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className={`mt-3 p-3 rounded-xl text-center ${active && highContrast ? 'bg-gray-800' : 'bg-gray-50'}`} style={{ fontSize: FONT_SIZES[fontSize].value }}>
            <span className={active && highContrast ? 'text-amber-100' : 'text-gray-700'}>Preview text size</span>
          </div>
        </div>

        {/* Blue light / warm filter */}
        <div className={`rounded-2xl border p-4 mb-6 ${active && highContrast ? 'bg-gray-900/60 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <p className={`text-sm font-bold mb-3 ${active && highContrast ? 'text-amber-100' : 'text-gray-800'}`}>
            <Moon className="w-4 h-4 inline mr-1.5 text-orange-400" />Blue Light Filter
          </p>
          <div className="grid grid-cols-4 gap-2">
            {WARM_LEVELS.map((w, i) => (
              <button key={w.label} onClick={() => setWarmLevel(i)}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors ${warmLevel === i ? 'bg-orange-500 text-white border-orange-500' : active && highContrast ? 'bg-gray-800 text-gray-300 border-gray-700 hover:border-orange-400' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300'}`}>
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active tip */}
        {active && (
          <div className="rounded-2xl border border-green-500/30 bg-green-900/20 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-green-300">Church Mode Active</p>
              <p className="text-xs text-green-400/70 mt-0.5">Your screen will stay on, blue light is reduced, and notifications are silenced. Enjoy your study.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}