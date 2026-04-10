import React, { useState } from 'react';
import { CheckCircle2, XCircle, Circle, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SECTIONS = [
  {
    title: '🛡️ App Stability',
    items: [
      'App opens without crashing',
      'No blank screens appear',
      'Console shows no critical errors',
    ],
  },
  {
    title: '🧭 Navigation',
    items: [
      'Home page loads',
      'Welcome page loads',
      'Bible Reader loads',
      'Audio Bible loads',
      'AI Companion loads',
      'Prayer Assistant loads',
      'Settings page loads',
      'Share page loads',
    ],
  },
  {
    title: '🌐 Language System',
    items: [
      'UI language changes interface text',
      'Bible language changes verse text',
      'Audio language changes audio',
      'Language settings persist after refresh',
      'No mixed-language UI text appears',
    ],
  },
  {
    title: '📖 Bible Content',
    items: [
      'Verse of the Day loads correctly',
      'Bible Reader shows real verses',
      'Book names display correctly',
      'No raw codes like ISA / PHI appear',
    ],
  },
  {
    title: '🔊 Audio Bible',
    items: [
      'Audio player loads',
      'Play / Pause works',
      'Correct audio language used',
      'Missing audio shows friendly message',
    ],
  },
  {
    title: '🤖 AI Features',
    items: [
      'AI Companion responds without errors',
      'AI responses match selected language',
      'Prayer Assistant generates prayer',
      'Prayer saves correctly',
    ],
  },
  {
    title: '📤 Sharing',
    items: [
      'Share page loads',
      'Verse cards generate correctly',
      'Copy link works',
      'QR code loads (if enabled)',
    ],
  },
  {
    title: '⚖️ Legal & Security',
    items: [
      'Privacy Policy page loads',
      'Terms of Use page loads',
      'Security page loads',
      'Support email is visible',
    ],
  },
  {
    title: '⚠️ Error Handling',
    items: [
      'No raw API errors shown to user',
      'Friendly messages appear when features fail',
      'AI failure shows retry message',
      'Audio failure shows "Audio unavailable"',
    ],
  },
  {
    title: '📱 Mobile Test',
    items: [
      'Layout works on small screen',
      'Buttons clickable on mobile',
      'Audio player does not block content',
      'Keyboard works with AI/prayer inputs',
    ],
  },
];

const FINAL_GATE = [
  'All pages load successfully',
  'Language switching works correctly',
  'AI features work without errors',
  'Bible Reader loads real content',
  'Audio works or fails gracefully',
  'Legal pages exist',
];

const STORAGE_KEY = 'faithlight_release_sheet_v1';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function save(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function ReleaseSheet() {
  const [checks, setChecks] = useState(() => load());

  const toggle = (key, value) => {
    const next = { ...checks, [key]: value };
    setChecks(next);
    save(next);
  };

  const reset = () => { setChecks({}); localStorage.removeItem(STORAGE_KEY); };

  const allItems = SECTIONS.flatMap(s => s.items);
  const totalItems = allItems.length + FINAL_GATE.length;
  const yesCount = Object.values(checks).filter(v => v === 'yes').length;
  const noCount = Object.values(checks).filter(v => v === 'no').length;
  const answeredCount = yesCount + noCount;
  const progress = Math.round((answeredCount / totalItems) * 100);

  const finalAllYes = FINAL_GATE.every(item => checks[`final::${item}`] === 'yes');
  const finalAnyNo = FINAL_GATE.some(item => checks[`final::${item}`] === 'no');

  const exportTxt = () => {
    let out = 'FaithLight v1 Release Sheet\n';
    out += `Exported: ${new Date().toLocaleString()}\n\n`;
    SECTIONS.forEach(s => {
      out += `\n${s.title}\n${'─'.repeat(40)}\n`;
      s.items.forEach(item => {
        const v = checks[`${s.title}::${item}`];
        out += `[${v === 'yes' ? 'YES' : v === 'no' ? 'NO ' : '   '}]  ${item}\n`;
      });
    });
    out += '\n\nFINAL LAUNCH GATE\n' + '─'.repeat(40) + '\n';
    FINAL_GATE.forEach(item => {
      const v = checks[`final::${item}`];
      out += `[${v === 'yes' ? 'YES' : v === 'no' ? 'NO ' : '   '}]  ${item}\n`;
    });
    out += `\nDECISION: ${finalAllYes ? '✅ READY TO PUBLISH' : finalAnyNo ? '❌ FIX BEFORE RELEASE' : '⏳ INCOMPLETE'}\n`;
    const blob = new Blob([out], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'FaithLight_v1_Release_Sheet.txt';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-4 py-6">
        <h1 className="text-2xl font-bold">FaithLight v1 Release Sheet</h1>
        <p className="text-indigo-200 text-sm mt-1">Interactive QA checklist — progress saves automatically</p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-indigo-200 mb-1">
            <span>{answeredCount} / {totalItems} answered</span>
            <span>{yesCount} ✅  {noCount} ❌</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Action buttons */}
        <div className="flex gap-3">
          <Button onClick={exportTxt} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Download className="w-4 h-4" /> Export .txt
          </Button>
          <Button variant="outline" onClick={reset} className="gap-2 text-gray-600">
            <RefreshCw className="w-4 h-4" /> Reset All
          </Button>
        </div>

        {/* Checklist Sections */}
        {SECTIONS.map(section => {
          const sectionYes = section.items.filter(i => checks[`${section.title}::${i}`] === 'yes').length;
          const sectionTotal = section.items.length;
          const allDone = sectionYes === sectionTotal;
          return (
            <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`px-5 py-3 flex items-center justify-between ${allDone ? 'bg-green-50 border-b border-green-100' : 'bg-gray-50 border-b border-gray-100'}`}>
                <h2 className="font-bold text-gray-800">{section.title}</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${allDone ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {sectionYes}/{sectionTotal}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {section.items.map(item => {
                  const key = `${section.title}::${item}`;
                  const val = checks[key];
                  return (
                    <div key={item} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                      <span className="text-sm text-gray-700 flex-1 pr-4">{item}</span>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggle(key, val === 'yes' ? undefined : 'yes')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                            val === 'yes'
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-green-300 hover:text-green-600'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> YES
                        </button>
                        <button
                          onClick={() => toggle(key, val === 'no' ? undefined : 'no')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                            val === 'no'
                              ? 'bg-red-500 text-white border-red-500'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-500'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> NO
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Final Launch Gate */}
        <div className={`rounded-2xl border-2 overflow-hidden shadow-sm ${finalAllYes ? 'border-green-400' : finalAnyNo ? 'border-red-400' : 'border-indigo-300'}`}>
          <div className={`px-5 py-4 ${finalAllYes ? 'bg-green-50' : finalAnyNo ? 'bg-red-50' : 'bg-indigo-50'}`}>
            <h2 className="font-bold text-lg text-gray-900">🚀 Final Launch Gate</h2>
            <p className="text-sm text-gray-600 mt-0.5">All must be YES before publishing</p>
          </div>
          <div className="bg-white divide-y divide-gray-50">
            {FINAL_GATE.map(item => {
              const key = `final::${item}`;
              const val = checks[key];
              return (
                <div key={item} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-700 flex-1 pr-4">{item}</span>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggle(key, val === 'yes' ? undefined : 'yes')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                        val === 'yes' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-400 border-gray-200 hover:border-green-300 hover:text-green-600'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> YES
                    </button>
                    <button
                      onClick={() => toggle(key, val === 'no' ? undefined : 'no')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                        val === 'no' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-500'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> NO
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Decision Banner */}
          <div className={`px-5 py-4 text-center font-bold text-lg ${
            finalAllYes ? 'bg-green-500 text-white' : finalAnyNo ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            {finalAllYes
              ? '✅ FaithLight v1 is READY TO PUBLISH'
              : finalAnyNo
              ? '❌ Fix failing items before release'
              : '⏳ Complete all checks above'}
          </div>
        </div>
      </div>
    </div>
  );
}