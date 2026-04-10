import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertTriangle, ChevronDown, ChevronUp, RotateCcw, ShieldCheck, Apple } from 'lucide-react';

const RISKS = [
  {
    id: 'login',
    emoji: '🔐',
    title: 'Login & Reviewer Access',
    severity: 'critical',
    problem: 'Apple reviewers must be able to access the app. If they cannot create an account or email verification blocks them, the app is rejected.',
    fix: 'Provide test credentials in App Store Connect → Review Notes, and allow guest access for Bible reading.',
    hint: 'Test account: review@faithlight.app / FaithLight123',
    items: [
      'Guest / unauthenticated access works for Bible reading',
      'Test account credentials are ready for App Store Connect review notes',
      'Email verification does not block reviewers from accessing core features',
      'Login screen has a visible "Continue as Guest" option',
    ],
  },
  {
    id: 'deletion',
    emoji: '🗑️',
    title: 'Account Deletion Flow',
    severity: 'critical',
    problem: 'Apple requires in-app account deletion if your app uses accounts. Missing this is one of the most common rejection reasons.',
    fix: 'Settings → Account → Delete Account → Confirmation step → logs user out and removes data.',
    items: [
      'Account deletion option exists inside Settings',
      'Deletion requires a confirmation step (not instant)',
      'After deletion, user is logged out immediately',
      'Account data is actually removed (or queued for removal)',
    ],
  },
  {
    id: 'payments',
    emoji: '💳',
    title: 'Payment Methods (IAP vs Stripe)',
    severity: 'critical',
    problem: 'Digital features unlocked by payment MUST use Apple In-App Purchase on iOS. Using Stripe for premium subscriptions on iOS causes rejection.',
    fix: 'Premium subscriptions → Apple IAP only on iOS. Donations → optional, clearly labeled, not required to unlock anything.',
    items: [
      'Premium subscription on iOS uses Apple IAP (not Stripe)',
      'Donations are clearly labeled as optional',
      'No feature is locked behind a Stripe payment on iOS',
      'Pricing page makes it clear donations do not unlock premium',
      'Premium and donation flows are visually separated',
    ],
  },
  {
    id: 'links',
    emoji: '🔗',
    title: 'Broken Links & Placeholder Content',
    severity: 'high',
    problem: 'Reviewers tap every button and link. A broken Privacy Policy, missing Terms page, "Coming Soon" screen, or dead button causes rejection.',
    fix: 'Hide unfinished features instead of showing them. Test every visible link before submitting.',
    items: [
      'Privacy Policy link opens a real, complete page',
      'Terms of Service link opens a real, complete page',
      'No "Coming Soon" screens are visible to users',
      'Every visible button performs an action (nothing is a dead end)',
      'Support email or contact link is present and correct',
      'All footer links open correctly',
    ],
  },
  {
    id: 'mobile',
    emoji: '📱',
    title: 'Mobile UI (Not a Web Wrapper)',
    severity: 'high',
    problem: 'Apple rejects apps that look like a website wrapped in a browser. Desktop navigation bars, small text links, and web-style dropdowns are red flags.',
    fix: 'Use large tap targets, bottom navigation, smooth transitions, and proper mobile spacing throughout.',
    items: [
      'Bottom navigation is the primary way to navigate (not a top nav bar)',
      'All buttons are large and easy to tap on mobile',
      'No desktop-style horizontal nav links visible on mobile',
      'Text is readable without zooming',
      'Transitions between screens feel smooth (not like page reloads)',
      'Layout fits the phone screen without horizontal scrolling',
    ],
  },
  {
    id: 'safetycheck',
    emoji: '✅',
    title: 'Quick Safety Check',
    severity: 'check',
    problem: 'Final pass before submitting — confirm every item below.',
    fix: 'All of these must be true for a clean first submission.',
    items: [
      'App opens immediately without a blank screen',
      'Bible reading works without login',
      'Language switching works correctly',
      'No raw technical error messages appear anywhere',
      'Privacy Policy and Terms pages exist and are linked',
      'Premium and donation flows are clearly separate',
      'Account deletion exists inside the app',
    ],
  },
];

const SEVERITY_STYLES = {
  critical: { badge: 'bg-red-100 text-red-700 border-red-200', border: 'border-red-200', dot: 'bg-red-500', label: 'Critical' },
  high:     { badge: 'bg-amber-100 text-amber-700 border-amber-200', border: 'border-amber-200', dot: 'bg-amber-400', label: 'High Risk' },
  check:    { badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', border: 'border-indigo-200', dot: 'bg-indigo-400', label: 'Final Check' },
};

export default function RejectionRiskAudit() {
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState({ login: true, deletion: true });

  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));
  const toggleSection = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const reset = () => setChecked({});

  const allKeys = RISKS.flatMap(r => r.items.map((_, i) => `${r.id}_${i}`));
  const doneCount = allKeys.filter(k => checked[k]).length;
  const total = allKeys.length;
  const pct = Math.round((doneCount / total) * 100);

  const criticalRisks = RISKS.filter(r => r.severity === 'critical');
  const criticalKeys = criticalRisks.flatMap(r => r.items.map((_, i) => `${r.id}_${i}`));
  const criticalDone = criticalKeys.every(k => checked[k]);

  const isReady = pct === 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white border border-red-200 rounded-full px-4 py-1.5 text-sm font-semibold text-red-700 mb-3 shadow-sm">
            <AlertTriangle className="w-4 h-4" /> Rejection Risk Audit
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">App Store Rejection Check</h1>
          <p className="text-gray-500 text-sm">The 5 mistakes that most often delay good apps from approval.</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">{doneCount} / {total} checked</span>
            <button onClick={reset} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isReady ? 'bg-green-500' : criticalDone ? 'bg-amber-400' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className={`rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2 ${
            isReady
              ? 'bg-green-50 border border-green-200 text-green-700'
              : criticalDone
              ? 'bg-amber-50 border border-amber-200 text-amber-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {isReady
              ? <><ShieldCheck className="w-4 h-4 flex-shrink-0" /> All checks passed — safe to submit!</>
              : criticalDone
              ? <><Apple className="w-4 h-4 flex-shrink-0" /> Critical risks cleared — finish the remaining {total - doneCount} items.</>
              : <><AlertTriangle className="w-4 h-4 flex-shrink-0" /> Critical risks unresolved — fix these before submitting.</>
            }
          </div>
        </div>

        {/* Review Notes Tip */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-5 text-sm text-indigo-800">
          <p className="font-bold mb-1">💡 App Store Review Notes tip</p>
          <p className="text-indigo-700 text-xs leading-relaxed">Include this in App Store Connect → Review Notes:</p>
          <div className="mt-2 bg-white rounded-lg p-3 text-xs font-mono text-gray-700 border border-indigo-100 leading-relaxed">
            FaithLight is a Bible study and spiritual growth app.<br />
            Core features: Bible reading, audio Scripture, AI reflections, study plans, community prayer.<br /><br />
            Guest access is available for basic Bible reading.<br />
            Test account: review@faithlight.app / FaithLight123
          </div>
        </div>

        {/* Risk Sections */}
        <div className="space-y-3">
          {RISKS.map((risk) => {
            const style = SEVERITY_STYLES[risk.severity];
            const sectionDone = risk.items.filter((_, i) => checked[`${risk.id}_${i}`]).length;
            const allDone = sectionDone === risk.items.length;
            const isOpen = expanded[risk.id];

            return (
              <div key={risk.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors ${allDone ? 'border-green-200' : style.border}`}>
                <button onClick={() => toggleSection(risk.id)} className="w-full flex items-center gap-3 px-4 py-4 text-left">
                  <span className="text-xl flex-shrink-0">{risk.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{risk.title}</span>
                      {!allDone && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${style.badge}`}>
                          {style.label}
                        </span>
                      )}
                      {allDone && <span className="text-xs text-green-600 font-bold">✓ Cleared</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{sectionDone}/{risk.items.length} done</div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0 mr-1">
                    {risk.items.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${checked[`${risk.id}_${i}`] ? 'bg-green-500' : style.dot}`} />
                    ))}
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    {/* Problem / Fix */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 space-y-1.5">
                      <p className="text-xs text-gray-600"><span className="font-bold text-red-600">⚠ Problem: </span>{risk.problem}</p>
                      <p className="text-xs text-gray-600"><span className="font-bold text-green-700">✓ Fix: </span>{risk.fix}</p>
                      {risk.hint && <p className="text-xs text-indigo-600 font-mono bg-indigo-50 rounded px-2 py-1">{risk.hint}</p>}
                    </div>

                    <div className="divide-y divide-gray-50">
                      {risk.items.map((item, i) => {
                        const key = `${risk.id}_${i}`;
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

        {/* Bottom result */}
        <div className={`mt-6 rounded-2xl p-5 text-center border ${isReady ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
          {isReady ? (
            <>
              <div className="text-2xl mb-2">🛡️</div>
              <div className="font-extrabold text-green-700 text-lg mb-1">No rejection risks detected</div>
              <p className="text-sm text-green-600">FaithLight is clear for first-attempt approval.</p>
            </>
          ) : (
            <>
              <div className="text-2xl mb-2">📋</div>
              <div className="font-bold text-gray-700 mb-1">{total - doneCount} items still to resolve</div>
              <p className="text-sm text-gray-500">Address all items — especially the Critical ones — before submitting.</p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}