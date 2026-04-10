import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Volume2, Zap, Monitor, Type, Sun, ChevronRight } from 'lucide-react';
import { useAccessibility } from '@/lib/accessibilityStore.jsx';

const TEXT_SIZES = [
  { value: 'small',   label: 'Small',       sample: 'text-sm' },
  { value: 'medium',  label: 'Medium',      sample: 'text-base' },
  { value: 'large',   label: 'Large',       sample: 'text-lg' },
  { value: 'xlarge',  label: 'Extra Large', sample: 'text-xl' },
];

const AUDIO_SPEEDS = [
  { value: 0.75, label: '0.75×' },
  { value: 1.0,  label: '1×' },
  { value: 1.25, label: '1.25×' },
  { value: 1.5,  label: '1.5×' },
];

function SectionHeader({ icon: Icon, title, color }) {
  return (
    <div className={`flex items-center gap-2 mb-3 px-1`}>
      <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>
        <Icon size={14} className="text-white" aria-hidden="true" />
      </div>
      <h2 className="text-sm font-bold text-gray-800">{title}</h2>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
      <div className="flex-1 pr-4">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={`${label}: ${checked ? 'on' : 'off'}`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
}

export default function AccessibilitySettings() {
  const { prefs, update } = useAccessibility();

  return (
    <div className="min-h-screen bg-gray-50 pb-24" role="main">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link
            to="/UserProfile"
            aria-label="Go back to Profile"
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <ArrowLeft size={18} className="text-gray-600" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Accessibility</h1>
            <p className="text-xs text-gray-500">Make FaithLight easier to use for you</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* WCAG notice */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3"
          role="note" aria-label="Accessibility standard notice">
          <span className="text-xl" aria-hidden="true">♿</span>
          <div>
            <p className="text-xs font-bold text-indigo-900">WCAG 2.2 AA Compliant</p>
            <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">
              FaithLight supports VoiceOver (iPhone), TalkBack (Android), keyboard navigation, and switch access. All settings here are saved automatically.
            </p>
          </div>
        </div>

        {/* Text Size */}
        <section aria-labelledby="text-size-heading">
          <SectionHeader icon={Type} title="Text Size" color="bg-violet-500" />
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p id="text-size-heading" className="text-xs text-gray-500 mb-3">
              Choose a comfortable reading size for verses, devotions, and Bible content.
            </p>
            <div className="grid grid-cols-4 gap-2" role="group" aria-label="Text size options">
              {TEXT_SIZES.map(({ value, label, sample }) => (
                <button
                  key={value}
                  onClick={() => update('textSize', value)}
                  aria-pressed={prefs.textSize === value}
                  aria-label={`Text size: ${label}`}
                  className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    prefs.textSize === value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <span className={`font-bold text-gray-900 ${sample}`} aria-hidden="true">Aa</span>
                  <span className="text-[10px] text-gray-600 font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Live preview */}
            <div className="mt-4 bg-indigo-50 rounded-xl p-3 border border-indigo-100"
              aria-live="polite" aria-label="Text size preview">
              <p className="text-xs text-indigo-500 font-semibold mb-1">Preview</p>
              <p className={`text-gray-800 leading-relaxed italic font-medium
                ${prefs.textSize === 'small'  ? 'text-sm' : ''}
                ${prefs.textSize === 'medium' ? 'text-base' : ''}
                ${prefs.textSize === 'large'  ? 'text-lg' : ''}
                ${prefs.textSize === 'xlarge' ? 'text-xl' : ''}
              `}>
                "For God so loved the world that he gave his one and only Son." — John 3:16
              </p>
            </div>
          </div>
        </section>

        {/* Visual */}
        <section aria-labelledby="visual-heading">
          <SectionHeader icon={Eye} title="Vision & Display" color="bg-blue-500" />
          <div id="visual-heading" className="sr-only">Vision and display accessibility settings</div>
          <div className="space-y-2">
            <Toggle
              label="High Contrast Mode"
              description="Increases text and button contrast for easier reading. Helpful for low-vision users."
              checked={prefs.highContrast}
              onChange={v => update('highContrast', v)}
            />
            <Toggle
              label="Screen Reader Optimized"
              description="Adds extra descriptive labels for VoiceOver (iPhone) and TalkBack (Android)."
              checked={prefs.screenReaderOptimized}
              onChange={v => update('screenReaderOptimized', v)}
            />
          </div>
        </section>

        {/* Motion */}
        <section aria-labelledby="motion-heading">
          <SectionHeader icon={Zap} title="Motion & Animation" color="bg-amber-500" />
          <div id="motion-heading" className="sr-only">Motion and animation accessibility settings</div>
          <Toggle
            label="Reduce Motion"
            description="Minimizes animations, transitions, and glowing effects. Helpful for vestibular or cognitive sensitivities."
            checked={prefs.reduceMotion}
            onChange={v => update('reduceMotion', v)}
          />
          <p className="text-xs text-gray-400 mt-2 px-1">
            Note: FaithLight also respects your device's "Reduce Motion" system setting automatically.
          </p>
        </section>

        {/* Audio */}
        <section aria-labelledby="audio-heading">
          <SectionHeader icon={Volume2} title="Audio Playback" color="bg-emerald-500" />
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p id="audio-heading" className="text-xs text-gray-500 mb-3">
              Audio Bible and devotional playback speed.
            </p>
            <div className="flex gap-2" role="group" aria-label="Audio speed options">
              {AUDIO_SPEEDS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => update('audioSpeed', value)}
                  aria-pressed={prefs.audioSpeed === value}
                  aria-label={`Playback speed: ${label}`}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    prefs.audioSpeed === value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-100 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <Toggle
              label="Show Captions"
              description="Display text captions for audio and video content including sermons and devotionals."
              checked={prefs.captions}
              onChange={v => update('captions', v)}
            />
          </div>
        </section>

        {/* Quick tips */}
        <section aria-labelledby="tips-heading">
          <SectionHeader icon={Monitor} title="Device Accessibility Tips" color="bg-rose-500" />
          <div id="tips-heading" className="sr-only">Device accessibility tips</div>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {[
              { icon: '📱', title: 'iPhone VoiceOver', tip: 'Settings → Accessibility → VoiceOver. Triple-click side button to toggle.' },
              { icon: '🤖', title: 'Android TalkBack', tip: 'Settings → Accessibility → TalkBack. Triple-click volume to toggle.' },
              { icon: '⌨️', title: 'Keyboard Navigation', tip: 'All FaithLight buttons and forms are keyboard-accessible using Tab and Enter.' },
              { icon: '🔠', title: 'System Text Size', tip: 'Increase text size in your phone\'s Display settings — FaithLight responds to Dynamic Type.' },
              { icon: '🌙', title: 'Dark Mode', tip: 'Enabled in Profile → Theme toggle. Reduces eye strain in low light.' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3 p-4">
                <span className="text-xl flex-shrink-0" aria-hidden="true">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation shortcuts */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-4">
          <p className="text-xs font-bold text-indigo-900 mb-3">Quick Navigation</p>
          <div className="space-y-2">
            {[
              { label: 'Go to Prayer Journal', to: '/MyPrayerJournal' },
              { label: 'Go to Bible Reader', to: '/BibleReaderPage' },
              { label: 'Go to AI Bible Assistant', to: '/AIHub' },
              { label: 'Go to Notifications', to: '/NotificationsHub' },
            ].map(link => (
              <Link key={link.to} to={link.to}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 text-sm font-medium text-gray-800 hover:bg-indigo-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label={link.label}>
                {link.label}
                <ChevronRight size={14} className="text-gray-400" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}