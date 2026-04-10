import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, RotateCcw, Rocket, Copy, Check } from 'lucide-react';

const SECTIONS = [
  {
    id: 'builds',
    emoji: '📦',
    title: 'App Build Files',
    items: [
      'iOS: IPA build file generated and uploaded to App Store Connect',
      'Android: AAB (Android App Bundle) generated and uploaded to Google Play Console',
      'Both builds tested on a real device before upload',
    ],
  },
  {
    id: 'icon',
    emoji: '🎨',
    title: 'App Icon',
    note: 'File: faithlight-app-icon-1024.png',
    items: [
      'Icon is 1024 × 1024 PNG',
      'No transparency or alpha channel',
      'No rounded corners (stores apply them automatically)',
      'Text is readable at small sizes',
      'Icon uploaded to both App Store Connect and Google Play Console',
    ],
  },
  {
    id: 'screenshots',
    emoji: '📸',
    title: 'App Screenshots',
    note: 'iOS: 1290×2796 px · Android: 1080×1920 px · Minimum 5 screenshots',
    items: [
      'Screenshot 1: Home – Verse of the Day',
      'Screenshot 2: Bible Reader',
      'Screenshot 3: Audio Bible',
      'Screenshot 4: AI Study Tools',
      'Screenshot 5: Prayer / Community',
      'iOS screenshots uploaded (1290 × 2796 px)',
      'Android screenshots uploaded (1080 × 1920 px)',
    ],
  },
  {
    id: 'metadata',
    emoji: '📝',
    title: 'App Metadata',
    items: [
      'App Name set: "FaithLight: Bible Study & Prayer"',
      'Subtitle set (iOS): "Daily Bible, Audio Scripture & AI Study Tools"',
      'Keywords entered: bible, bible study, audio bible, scripture, daily verse, christian prayer, devotional',
      'Short description written and spell-checked',
      'Full description written and reviewed',
      'Category set: Reference (Primary), Lifestyle (Secondary)',
      'Age rating set to 4+',
    ],
  },
  {
    id: 'legal',
    emoji: '⚖️',
    title: 'Privacy Policy & Terms',
    items: [
      'Privacy Policy URL entered (e.g. faithlight.app/privacy)',
      'Privacy policy covers: data collected, analytics, account data, contact email',
      'Terms of Service URL entered (e.g. faithlight.app/terms)',
      'Terms cover: usage rules, content ownership, donation/subscription terms, liability',
      'Support URL entered (e.g. faithlight.app/support)',
      'Support page has contact email and help information',
    ],
  },
  {
    id: 'reviewnotes',
    emoji: '📋',
    title: 'Review Notes (App Store Connect)',
    note: 'Paste the text below into App Store Connect → Review Notes before submitting.',
    items: [
      'Review notes added in App Store Connect',
      'Test account credentials included in review notes',
      'Guest access flow described in review notes',
      'Key features listed for reviewer reference',
    ],
  },
  {
    id: 'preflight',
    emoji: '🧪',
    title: 'Final Pre-Submit Test',
    items: [
      'App launches without errors',
      'Bible Reader loads and scrolls correctly',
      'Audio Bible plays and pauses correctly',
      'AI reflections generate without errors',
      'Language switching works (English ↔ Afaan Oromoo)',
      'No debug text or raw error messages visible',
      'Privacy Policy and Terms pages open correctly',
      'Pricing page shows correct, updated values',
      'Share buttons work correctly',
      'Account deletion flow is accessible in Settings',
    ],
  },
  {
    id: 'launch',
    emoji: '🚀',
    title: 'Post-Approval Launch Strategy',
    items: [
      'Share with church community on approval',
      'Encourage verse sharing on social media',
      'Invite users to Prayer Wall and Study Rooms',
      'Promote the Verse of the Day daily habit',
      'Monitor reviews and respond within 48 hours',
    ],
  },
];

const REVIEW_NOTES = `FaithLight is a Bible study and spiritual growth app.

Features include:
• Bible reading (multiple translations)
• Audio Bible
• AI reflections & study tools
• Study plans
• Prayer requests
• Church study sessions
• Community forum

Guest access is available for basic Bible reading.

Test account (if needed):
Email: review@faithlight.app
Password: FaithLight123`;

function CopyBlock({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="relative bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-mono text-gray-700 whitespace-pre-wrap leading-relaxed">
      {text}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 flex items-center gap-1 text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
      >
        {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
      </button>
    </div>
  );
}

export default function AppStoreSubmissionPackage() {
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState({ builds: true, preflight: true });

  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));
  const toggleSection = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const reset = () => setChecked({});

  const allKeys = SECTIONS.flatMap(s => s.items.map((_, i) => `${s.id}_${i}`));
  const doneCount = allKeys.filter(k => checked[k]).length;
  const total = allKeys.length;
  const pct = Math.round((doneCount / total) * 100);
  const isReady = pct === 100;
  const isClose = pct >= 75;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-200 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-700 mb-3 shadow-sm">
            <Rocket className="w-4 h-4" /> Submission Package
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">FaithLight Store Submission</h1>
          <p className="text-gray-500 text-sm">Everything required to publish to App Store & Google Play.</p>
        </div>

        {/* Review time info */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
            <div className="text-xl mb-1">🍎</div>
            <p className="text-xs font-bold text-gray-700">Apple App Store</p>
            <p className="text-xs text-gray-400 mt-0.5">Typical review: 1–5 days</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
            <div className="text-xl mb-1">🤖</div>
            <p className="text-xs font-bold text-gray-700">Google Play</p>
            <p className="text-xs text-gray-400 mt-0.5">Typical review: 1–3 days</p>
          </div>
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
              className={`h-full rounded-full transition-all duration-500 ${isReady ? 'bg-green-500' : isClose ? 'bg-blue-500' : 'bg-indigo-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className={`rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2 ${
            isReady ? 'bg-green-50 border border-green-200 text-green-700'
            : isClose ? 'bg-blue-50 border border-blue-200 text-blue-700'
            : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
          }`}>
            {isReady
              ? <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Package complete — ready to submit!</>
              : isClose
              ? <><Rocket className="w-4 h-4 flex-shrink-0" /> Almost ready — {total - doneCount} items left.</>
              : <><Rocket className="w-4 h-4 flex-shrink-0" /> Work through each section to prepare your package.</>
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
              <div key={section.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${allDone ? 'border-green-200' : 'border-gray-200'}`}>
                <button onClick={() => toggleSection(section.id)} className="w-full flex items-center gap-3 px-4 py-4 text-left">
                  <span className="text-xl flex-shrink-0">{section.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm">{section.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {sectionDone}/{section.items.length} done
                      {allDone && <span className="ml-2 text-green-600 font-bold">✓ Complete</span>}
                    </div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0 mr-1">
                    {section.items.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${checked[`${section.id}_${i}`] ? 'bg-green-500' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    {section.note && (
                      <div className="px-4 py-2 bg-blue-50 text-xs text-blue-700 font-semibold border-b border-blue-100">
                        {section.note}
                      </div>
                    )}

                    {/* Review notes copy block */}
                    {section.id === 'reviewnotes' && (
                      <div className="px-4 pt-3 pb-1">
                        <CopyBlock text={REVIEW_NOTES} />
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

        {/* Bottom */}
        <div className={`mt-6 rounded-2xl p-5 text-center border ${isReady ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
          {isReady ? (
            <>
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-extrabold text-green-700 text-lg mb-1">Package complete — submit FaithLight!</div>
              <p className="text-sm text-green-600">All items checked. You're ready for App Store and Google Play review.</p>
            </>
          ) : (
            <>
              <div className="text-2xl mb-2">📋</div>
              <div className="font-bold text-gray-700 mb-1">{total - doneCount} items remaining</div>
              <p className="text-sm text-gray-500">Complete all items before pressing Submit in App Store Connect or Google Play Console.</p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}