import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, Apple, RefreshCw } from 'lucide-react';

const AUDIT_SECTIONS = [
  {
    id: 'stability',
    title: '1. App Stability',
    icon: '⚡',
    items: [
      { id: 's1', text: 'App opens without blank screen', critical: true },
      { id: 's2', text: 'No crashes on page refresh', critical: true },
      { id: 's3', text: 'No infinite loading spinners', critical: true },
      { id: 's4', text: 'No stuck pending API requests', critical: false },
      { id: 's5', text: 'No raw 500/502/backend errors shown to users', critical: true },
      { id: 's6', text: 'No debug panels, test buttons, or developer content visible', critical: true },
    ],
  },
  {
    id: 'screens',
    title: '2. Core Screens',
    icon: '📱',
    items: [
      { id: 'sc1', text: 'Home screen loads and all cards render', critical: true },
      { id: 'sc2', text: 'Bible Reader loads correctly', critical: true },
      { id: 'sc3', text: 'Audio Bible loads correctly', critical: true },
      { id: 'sc4', text: 'AI Study screen loads correctly', critical: true },
      { id: 'sc5', text: 'Study Plans screen loads correctly', critical: false },
      { id: 'sc6', text: 'Search screen loads correctly', critical: false },
      { id: 'sc7', text: 'Settings screen loads correctly', critical: false },
      { id: 'sc8', text: 'Pricing / Support page loads correctly', critical: false },
      { id: 'sc9', text: 'Church Mode loads correctly', critical: false },
      { id: 'sc10', text: 'Privacy Policy page loads', critical: true },
      { id: 'sc11', text: 'Terms of Service page loads', critical: true },
    ],
  },
  {
    id: 'localization',
    title: '3. Language & Localization',
    icon: '🌍',
    items: [
      { id: 'l1', text: 'Language switcher changes all UI labels', critical: true },
      { id: 'l2', text: 'Buttons translate correctly when language is switched', critical: true },
      { id: 'l3', text: 'Bible book names show in selected language', critical: false },
      { id: 'l4', text: 'Verse references translate correctly', critical: false },
      { id: 'l5', text: 'Search results respect selected language', critical: false },
      { id: 'l6', text: 'Settings labels translate fully', critical: false },
      { id: 'l7', text: 'Premium / support text translates correctly', critical: false },
      { id: 'l8', text: 'AI Study works in selected language', critical: false },
      { id: 'l9', text: 'No mixed English/Oromo UI where Oromo data exists', critical: true },
      { id: 'l10', text: 'No raw translation keys visible anywhere', critical: true },
    ],
  },
  {
    id: 'bible',
    title: '4. Bible Reader',
    icon: '📖',
    items: [
      { id: 'b1', text: 'Book picker opens and works correctly', critical: true },
      { id: 'b2', text: 'Chapter picker opens and works correctly', critical: true },
      { id: 'b3', text: 'Previous chapter navigation works', critical: true },
      { id: 'b4', text: 'Next chapter navigation works', critical: true },
      { id: 'b5', text: 'Verse references render correctly', critical: false },
      { id: 'b6', text: 'Chapter content loads without errors', critical: true },
      { id: 'b7', text: 'No broken navigation states', critical: true },
    ],
  },
  {
    id: 'audio',
    title: '5. Audio Bible',
    icon: '🎧',
    items: [
      { id: 'a1', text: 'Chapter audio loads successfully', critical: true },
      { id: 'a2', text: 'Play / Pause works correctly', critical: true },
      { id: 'a3', text: 'Skip forward / back works', critical: false },
      { id: 'a4', text: 'Playback speed control works', critical: false },
      { id: 'a5', text: 'No raw technical audio error messages shown', critical: true },
      { id: 'a6', text: 'Mini player is stable when navigating away', critical: false },
      { id: 'a7', text: 'Full player opens and closes without crash', critical: false },
    ],
  },
  {
    id: 'search',
    title: '6. Search',
    icon: '🔍',
    items: [
      { id: 'sr1', text: 'Reference search works — e.g. JHN 3:16', critical: true },
      { id: 'sr2', text: 'Keyword search works in English', critical: true },
      { id: 'sr3', text: 'Keyword search works in Afaan Oromoo', critical: false },
      { id: 'sr4', text: 'Tapping a result opens the correct verse/chapter', critical: true },
    ],
  },
  {
    id: 'home',
    title: '7. Home Screen',
    icon: '🏠',
    items: [
      { id: 'h1', text: 'Verse of the Day displays correctly', critical: true },
      { id: 'h2', text: 'Continue Reading card works', critical: false },
      { id: 'h3', text: 'Read / Listen section works', critical: true },
      { id: 'h4', text: 'Streak card works (or is hidden when not applicable)', critical: false },
      { id: 'h5', text: 'Study Plan shortcuts work', critical: false },
      { id: 'h6', text: 'No broken cards or empty placeholders', critical: true },
    ],
  },
  {
    id: 'auth',
    title: '8. User Flows',
    icon: '👤',
    items: [
      { id: 'u1', text: 'Sign up flow works end-to-end', critical: true },
      { id: 'u2', text: 'Login works correctly', critical: true },
      { id: 'u3', text: 'Logout works and clears session', critical: true },
      { id: 'u4', text: 'Guest mode works (core features without login)', critical: true },
      { id: 'u5', text: 'Account deletion option exists in Settings', critical: true },
      { id: 'u6', text: 'Account deletion has confirmation dialog', critical: true },
      { id: 'u7', text: 'Account deletion logs user out after completion', critical: true },
    ],
  },
  {
    id: 'pricing',
    title: '9. Pricing & Support',
    icon: '💳',
    items: [
      { id: 'p1', text: 'Old/incorrect premium pricing is fully removed', critical: true },
      { id: 'p2', text: 'Current regional pricing text is correct', critical: false },
      { id: 'p3', text: 'Premium upgrade and donations are clearly separate flows', critical: true },
      { id: 'p4', text: 'Core Bible features are clearly free', critical: true },
    ],
  },
  {
    id: 'legal',
    title: '10. Legal',
    icon: '⚖️',
    items: [
      { id: 'lg1', text: 'Privacy Policy page exists and is accessible', critical: true },
      { id: 'lg2', text: 'Terms of Service page exists and is accessible', critical: true },
      { id: 'lg3', text: 'Both are linked from Settings', critical: true },
      { id: 'lg4', text: 'Support email or support page exists', critical: true },
    ],
  },
  {
    id: 'church',
    title: '11. Church Mode',
    icon: '⛪',
    items: [
      { id: 'ch1', text: 'Join code / QR code flow works', critical: false },
      { id: 'ch2', text: 'Live verse sync works during session', critical: false },
      { id: 'ch3', text: 'Notes work inside session', critical: false },
      { id: 'ch4', text: 'Share / QR behavior works without errors', critical: false },
      { id: 'ch5', text: 'No crashes when joining or leaving a session', critical: true },
    ],
  },
  {
    id: 'ux',
    title: '12. Final UX Quality',
    icon: '✨',
    items: [
      { id: 'ux1', text: 'Mobile-first layout on all screens', critical: true },
      { id: 'ux2', text: 'Dark mode works without broken colors', critical: false },
      { id: 'ux3', text: 'Safe areas respected (notch / home indicator)', critical: true },
      { id: 'ux4', text: 'No broken web-style controls on mobile', critical: true },
      { id: 'ux5', text: 'No "Coming Soon" visible on critical launch features', critical: true },
      { id: 'ux6', text: 'Bottom navigation is consistent across all main screens', critical: true },
    ],
  },
];

const STATUS = { pass: 'pass', warn: 'warn', fail: 'fail', skip: 'skip' };

const STATUS_STYLES = {
  pass: { btn: 'bg-green-100 text-green-700 border-green-300 ring-green-400', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  warn: { btn: 'bg-amber-100 text-amber-700 border-amber-300 ring-amber-400', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  fail: { btn: 'bg-red-100 text-red-700 border-red-300 ring-red-400', icon: <XCircle className="w-3.5 h-3.5" /> },
  skip: { btn: 'bg-gray-100 text-gray-400 border-gray-200', icon: null },
};

function StatusPill({ value, onChange }) {
  return (
    <div className="flex gap-1 flex-shrink-0">
      {['pass', 'warn', 'fail'].map(s => (
        <button
          key={s}
          onClick={() => onChange(value === s ? 'skip' : s)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold transition-all ${value === s ? STATUS_STYLES[s].btn + ' ring-1' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}`}
        >
          {STATUS_STYLES[s].icon}
          {s.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function PrePublishAudit() {
  const [statuses, setStatuses] = useState({});
  const [expanded, setExpanded] = useState({ stability: true });
  const [notes, setNotes] = useState({});

  const setStatus = (id, val) => setStatuses(p => ({ ...p, [id]: val }));
  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const allItems = AUDIT_SECTIONS.flatMap(s => s.items);
  const counts = {
    pass: allItems.filter(i => statuses[i.id] === 'pass').length,
    warn: allItems.filter(i => statuses[i.id] === 'warn').length,
    fail: allItems.filter(i => statuses[i.id] === 'fail').length,
    total: allItems.length,
    audited: allItems.filter(i => statuses[i.id] && statuses[i.id] !== 'skip').length,
  };

  const criticalFails = allItems.filter(i => i.critical && statuses[i.id] === 'fail');
  const criticalWarns = allItems.filter(i => i.critical && statuses[i.id] === 'warn');

  const readyToSubmit = criticalFails.length === 0 && counts.audited >= Math.floor(counts.total * 0.7);
  const pct = Math.round((counts.audited / counts.total) * 100);

  const reset = () => { setStatuses({}); setNotes({}); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-200 rounded-full px-4 py-1.5 text-sm font-semibold text-indigo-700 mb-4 shadow-sm">
            <Apple className="w-4 h-4" /> Pre-Publish Audit
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">FaithLight Final Audit</h1>
          <p className="text-gray-500 text-sm">Check every screen before submitting to App Store & Google Play.</p>
        </div>

        {/* Summary bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">Audit Progress — {counts.audited}/{counts.total} checked</span>
            <button onClick={reset} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-3">
            <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex gap-3 flex-wrap text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-green-700"><CheckCircle2 className="w-4 h-4" /> {counts.pass} PASS</span>
            <span className="flex items-center gap-1.5 font-semibold text-amber-600"><AlertTriangle className="w-4 h-4" /> {counts.warn} WARN</span>
            <span className="flex items-center gap-1.5 font-semibold text-red-600"><XCircle className="w-4 h-4" /> {counts.fail} FAIL</span>
          </div>

          {/* Verdict */}
          <div className={`mt-4 flex items-start gap-3 rounded-xl px-4 py-3 ${
            counts.audited === 0 ? 'bg-gray-50 border border-gray-200' :
            criticalFails.length > 0 ? 'bg-red-50 border border-red-200' :
            criticalWarns.length > 0 ? 'bg-amber-50 border border-amber-200' :
            readyToSubmit ? 'bg-green-50 border border-green-200' : 'bg-indigo-50 border border-indigo-200'
          }`}>
            {counts.audited === 0
              ? <span className="text-sm text-gray-500">Start marking items below to generate the verdict.</span>
              : criticalFails.length > 0
              ? <div>
                  <div className="font-bold text-red-700 text-sm flex items-center gap-2"><XCircle className="w-4 h-4" /> NOT READY — {criticalFails.length} critical issue{criticalFails.length > 1 ? 's' : ''} must be fixed.</div>
                  <ul className="mt-1.5 space-y-0.5">
                    {criticalFails.map(i => <li key={i.id} className="text-xs text-red-600">• {i.text}</li>)}
                  </ul>
                </div>
              : criticalWarns.length > 0
              ? <div>
                  <div className="font-bold text-amber-700 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> REVIEW WARNINGS before submitting.</div>
                  <ul className="mt-1.5 space-y-0.5">
                    {criticalWarns.map(i => <li key={i.id} className="text-xs text-amber-600">• {i.text}</li>)}
                  </ul>
                </div>
              : readyToSubmit
              ? <div className="font-bold text-green-700 text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> READY TO SUBMIT — no critical failures detected.</div>
              : <div className="text-sm text-indigo-700 font-semibold">Keep going — finish all sections for a complete verdict.</div>
            }
          </div>
        </div>

        {/* Audit sections */}
        <div className="space-y-3">
          {AUDIT_SECTIONS.map((section) => {
            const sItems = section.items;
            const sDone = sItems.filter(i => statuses[i.id] && statuses[i.id] !== 'skip').length;
            const sFail = sItems.filter(i => statuses[i.id] === 'fail').length;
            const sWarn = sItems.filter(i => statuses[i.id] === 'warn').length;
            const sPass = sItems.filter(i => statuses[i.id] === 'pass').length;
            const allPass = sPass === sItems.length;
            const isOpen = expanded[section.id];

            return (
              <div key={section.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${sFail > 0 ? 'border-red-200' : sWarn > 0 ? 'border-amber-200' : allPass ? 'border-green-200' : 'border-gray-200'}`}>
                <button onClick={() => toggleExpand(section.id)} className="w-full flex items-center gap-3 px-5 py-4 text-left">
                  <span className="text-xl flex-shrink-0">{section.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm">{section.title}</div>
                    <div className="flex gap-2 mt-0.5 text-xs">
                      {sPass > 0 && <span className="text-green-600 font-semibold">{sPass}✓</span>}
                      {sWarn > 0 && <span className="text-amber-600 font-semibold">{sWarn}⚠</span>}
                      {sFail > 0 && <span className="text-red-600 font-semibold">{sFail}✗</span>}
                      <span className="text-gray-400">{sDone}/{sItems.length}</span>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {sItems.map((item) => {
                      const st = statuses[item.id] || 'skip';
                      return (
                        <div key={item.id} className={`px-4 py-3 ${st === 'fail' ? 'bg-red-50' : st === 'warn' ? 'bg-amber-50' : st === 'pass' ? 'bg-green-50/40' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm ${st === 'pass' ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.text}</span>
                                {item.critical && <span className="text-[10px] bg-red-100 text-red-600 border border-red-200 rounded-full px-1.5 py-0.5 font-bold flex-shrink-0">CRITICAL</span>}
                              </div>
                            </div>
                            <StatusPill value={st} onChange={(val) => setStatus(item.id, val)} />
                          </div>
                          {st === 'fail' && (
                            <textarea
                              className="mt-2 w-full text-xs border border-red-200 rounded-lg px-3 py-2 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-red-300 text-gray-700 placeholder-gray-400"
                              rows={2}
                              placeholder="Describe the issue or what needs to be fixed…"
                              value={notes[item.id] || ''}
                              onChange={e => setNotes(p => ({ ...p, [item.id]: e.target.value }))}
                            />
                          )}
                          {st === 'warn' && (
                            <textarea
                              className="mt-2 w-full text-xs border border-amber-200 rounded-lg px-3 py-2 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-amber-300 text-gray-700 placeholder-gray-400"
                              rows={2}
                              placeholder="Note what needs attention…"
                              value={notes[item.id] || ''}
                              onChange={e => setNotes(p => ({ ...p, [item.id]: e.target.value }))}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom verdict */}
        {counts.audited > 0 && (
          <div className={`mt-6 rounded-2xl p-5 border ${criticalFails.length > 0 ? 'bg-red-50 border-red-200' : criticalWarns.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            <div className={`font-extrabold text-lg mb-1 ${criticalFails.length > 0 ? 'text-red-700' : criticalWarns.length > 0 ? 'text-amber-700' : 'text-green-700'}`}>
              {criticalFails.length > 0 ? '🚫 Fix required before submitting' : criticalWarns.length > 0 ? '⚠️ Review warnings carefully' : '✅ App looks ready to submit'}
            </div>
            <p className="text-sm text-gray-600">
              {counts.pass} passed · {counts.warn} warnings · {counts.fail} failed · {counts.total - counts.audited} not yet checked
            </p>
          </div>
        )}

      </div>
    </div>
  );
}