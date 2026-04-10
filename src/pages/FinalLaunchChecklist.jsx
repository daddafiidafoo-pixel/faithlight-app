import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Rocket, RotateCcw, Apple } from 'lucide-react';

const SECTIONS = [
  {
    id: 'stability',
    emoji: '⚡',
    title: 'App Stability',
    items: [
      'App installs successfully on device',
      'App launches quickly without blank screen',
      'No raw error messages shown to users',
      'No debug logs or developer panels visible',
      'No infinite loading states',
      'Closing and reopening the app works correctly',
    ],
  },
  {
    id: 'features',
    emoji: '📖',
    title: 'Core Features',
    items: [
      'Bible Reader: open a book and chapter',
      'Bible Reader: scroll smoothly through chapter',
      'Bible Reader: highlight a verse',
      'Bible Reader: open verse actions menu',
      'Audio Bible: audio loads without error',
      'Audio Bible: play / pause works',
      'Audio Bible: speed control works',
      'AI Study: reflection generates correctly',
      'AI Study: verse explanation loads',
      'AI Study: no AI error messages appear',
    ],
  },
  {
    id: 'language',
    emoji: '🌍',
    title: 'Language Switching',
    items: [
      'Switching language updates all buttons',
      'Page titles translate correctly',
      'Bible book names update in selected language',
      'Verse references display correctly',
      'Settings text translates fully',
      'Study plans translate correctly',
      'No mixed English/Oromo text where translations exist',
      'No raw translation keys visible (e.g. nav.home)',
    ],
  },
  {
    id: 'auth',
    emoji: '👤',
    title: 'User Account Flow',
    items: [
      'Sign up flow works end-to-end',
      'Login works correctly',
      'Logout works and clears the session',
      'Account deletion option exists in Settings',
      'Account deletion has a confirmation step',
      'Account deletion logs user out after completion',
    ],
  },
  {
    id: 'payments',
    emoji: '💳',
    title: 'Payments & Donations',
    items: [
      'Core Bible reading is clearly free',
      'Premium upgrade uses store billing (IAP)',
      'Donations are clearly labeled as optional',
      'Pricing page shows correct current values',
      'No misleading or outdated pricing visible',
    ],
  },
  {
    id: 'legal',
    emoji: '⚖️',
    title: 'Legal Pages',
    items: [
      'Privacy Policy page exists and is accessible',
      'Terms of Service page exists and is accessible',
      'Both are linked from Settings',
      'Support contact or email is visible',
      'All legal links open correctly',
    ],
  },
  {
    id: 'navigation',
    emoji: '🧭',
    title: 'Navigation',
    items: [
      'Bottom navigation works on all main screens',
      'Back button works throughout the app',
      'Deep links open the correct screen',
      'Church Mode does not break navigation',
      'No dead-end screens with no way back',
    ],
  },
  {
    id: 'offline',
    emoji: '📴',
    title: 'Offline Behavior',
    items: [
      'App still opens when internet is off',
      'Downloaded Bible content loads offline',
      'Offline state shows a friendly message (not raw error)',
      'No "NetworkError" or "API failure" shown to users',
    ],
  },
  {
    id: 'notifications',
    emoji: '🔔',
    title: 'Push Notifications',
    items: [
      'Notification permission request appears correctly',
      'Daily verse notification sends and opens app',
      'Tapping notification opens the correct screen',
    ],
  },
  {
    id: 'assets',
    emoji: '🎨',
    title: 'App Store Assets',
    items: [
      'App icon is 1024×1024 PNG, no transparency',
      'At least 5 screenshots prepared for each device size',
      'App description clearly explains what FaithLight does',
      'Keywords include: bible, bible study, audio bible, daily verse, christian prayer',
      'App name is consistent across all store listings',
    ],
  },
  {
    id: 'finaltest',
    emoji: '🧪',
    title: 'Final New-User Test',
    note: 'Simulate a brand new user completing this exact flow:',
    items: [
      'Open FaithLight fresh (or clear app data)',
      'Read the Verse of the Day on Home screen',
      'Open Bible Reader and navigate to a chapter',
      'Play Audio Bible for that chapter',
      'Highlight a verse in Bible Reader',
      'Share a verse image',
      'Open a Study Plan',
      'Open the Prayer Wall',
      'Change language to Afaan Oromoo and back',
      'Everything above worked without errors',
    ],
  },
];

export default function FinalLaunchChecklist() {
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState({ stability: true, finaltest: true });

  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));
  const toggleSection = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const reset = () => setChecked({});

  const allItems = SECTIONS.flatMap(s => s.items.map((_, i) => `${s.id}_${i}`));
  const doneCount = allItems.filter(k => checked[k]).length;
  const total = allItems.length;
  const pct = Math.round((doneCount / total) * 100);

  const isReady = pct === 100;
  const isAlmostReady = pct >= 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-200 rounded-full px-4 py-1.5 text-sm font-semibold text-indigo-700 mb-3 shadow-sm">
            <Rocket className="w-4 h-4" /> Launch Checklist
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">FaithLight Final Launch</h1>
          <p className="text-gray-500 text-sm">Complete every item before submitting to App Store & Google Play.</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">{doneCount} / {total} completed</span>
            <button onClick={reset} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isReady ? 'bg-green-500' : isAlmostReady ? 'bg-amber-400' : 'bg-indigo-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className={`rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2 ${
            isReady ? 'bg-green-50 border border-green-200 text-green-700'
            : isAlmostReady ? 'bg-amber-50 border border-amber-200 text-amber-700'
            : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
          }`}>
            {isReady
              ? <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> ✅ Ready to submit — all items complete!</>
              : isAlmostReady
              ? <><Apple className="w-4 h-4 flex-shrink-0" /> Almost there — {total - doneCount} items remaining.</>
              : <><Rocket className="w-4 h-4 flex-shrink-0" /> Work through each section to get launch-ready.</>
            }
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {SECTIONS.map((section) => {
            const sectionDone = section.items.filter((_, i) => checked[`${section.id}_${i}`]).length;
            const allDone = sectionDone === section.items.length;
            const isOpen = expanded[section.id];

            return (
              <div
                key={section.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors ${allDone ? 'border-green-200' : 'border-gray-200'}`}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 text-left"
                >
                  <span className="text-xl flex-shrink-0">{section.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm">{section.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {sectionDone}/{section.items.length} done
                      {allDone && <span className="ml-2 text-green-600 font-bold">✓ Complete</span>}
                    </div>
                  </div>
                  {/* Mini progress pip */}
                  <div className="flex gap-0.5 flex-shrink-0 mr-1">
                    {section.items.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${checked[`${section.id}_${i}`] ? 'bg-green-500' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    {section.note && (
                      <div className="px-4 py-2 bg-indigo-50 text-xs text-indigo-700 font-semibold border-b border-indigo-100">
                        {section.note}
                      </div>
                    )}
                    <div className="divide-y divide-gray-50">
                      {section.items.map((item, i) => {
                        const key = `${section.id}_${i}`;
                        const done = !!checked[key];
                        return (
                          <button
                            key={i}
                            onClick={() => toggle(key)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${done ? 'bg-green-50/60' : 'hover:bg-gray-50'}`}
                          >
                            {done
                              ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                              : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                            }
                            <span className={`text-sm ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className={`mt-6 rounded-2xl p-5 text-center border ${isReady ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
          {isReady ? (
            <>
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-extrabold text-green-700 text-lg mb-1">All done — submit FaithLight!</div>
              <p className="text-sm text-green-600">Every item is complete. You're ready for the App Store and Google Play.</p>
            </>
          ) : (
            <>
              <div className="text-2xl mb-2">📋</div>
              <div className="font-bold text-gray-700 mb-1">{total - doneCount} items left</div>
              <p className="text-sm text-gray-500">Complete all items before submitting for the best chance of first-attempt approval.</p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}