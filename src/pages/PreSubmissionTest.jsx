import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Rocket, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const SECTIONS = [
  {
    id: 'launch',
    emoji: '🚀',
    title: 'App Launch Test',
    color: '#3B5BDB',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    items: [
      'App opens without crash',
      'Home page loads correctly',
      'No blank screens on startup',
      'Verse of the Day loads on Home',
      'Home cards all appear',
      'Bottom navigation bar works',
    ],
  },
  {
    id: 'nav',
    emoji: '🧭',
    title: 'Navigation Test',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    items: [
      'Bible Reader opens correctly',
      'AI Bible Guide opens correctly',
      'AI Companion opens correctly',
      'Quiz opens correctly',
      'Journal opens correctly',
      'Settings opens correctly',
      'No buttons do nothing',
      'No page freezes or navigation errors',
    ],
  },
  {
    id: 'language',
    emoji: '🌐',
    title: 'Language Switch Test',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    items: [
      'Switch to English — all labels correct',
      'Switch to Afaan Oromoo — all labels change',
      'Switch to Amharic — all labels change',
      'No mixed languages visible',
      'Buttons translated correctly in all languages',
    ],
  },
  {
    id: 'ai',
    emoji: '🤖',
    title: 'AI Features Test',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    items: [
      'Ask "What does faith mean in the Bible?" — AI responds',
      'Ask "Explain John 3:16" — AI responds',
      'No error messages appear',
      'Loading indicator shows while AI thinks',
      'AI Companion Send button works',
    ],
  },
  {
    id: 'buttons',
    emoji: '🔘',
    title: 'Search / Generate Buttons',
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    items: [
      'Generate Study Plan button works',
      'Generate Insight button works',
      'Passage Summary button works',
      'All input fields have a working action',
      'No user is left stuck on any screen',
    ],
  },
  {
    id: 'offline',
    emoji: '📶',
    title: 'Offline / Error Handling',
    color: '#64748B',
    bg: '#F8FAFC',
    border: '#E2E8F0',
    items: [
      'Turn internet off — app does not crash',
      'Friendly "Connection required" message appears',
      'App recovers when internet is restored',
    ],
  },
  {
    id: 'legal',
    emoji: '⚖️',
    title: 'Legal Pages',
    color: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    items: [
      'Privacy Policy page opens correctly',
      'Terms of Use page opens correctly',
      'Legal pages accessible from Settings',
    ],
    links: [
      { label: 'Privacy Policy', page: 'PrivacyPolicy' },
      { label: 'Terms of Service', page: 'TermsOfService' },
    ],
  },
  {
    id: 'metadata',
    emoji: '📋',
    title: 'App Store Metadata',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    items: [
      'App name: FaithLight — set correctly',
      'App description written and reviewed',
      'Keywords added for search discoverability',
      'Privacy policy URL added to listing',
      'Support email added',
    ],
  },
  {
    id: 'screenshots',
    emoji: '📸',
    title: 'Screenshots',
    color: '#EC4899',
    bg: '#FDF2F8',
    border: '#FBCFE8',
    items: [
      'Home page screenshot — clean UI',
      'Bible Reader screenshot',
      'AI Study Tools screenshot',
      'Quiz system screenshot',
      'Verse of the Day screenshot',
      'No developer views or debug overlays visible',
    ],
  },
  {
    id: 'version',
    emoji: '🏷️',
    title: 'Version & Build Number',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    items: [
      'Version set to 1.0.0',
      'Build number set to 1',
      'Version matches across iOS and Android configs',
    ],
  },
];

const STORAGE_KEY = 'faithlight_presubmit_checks';

export default function PreSubmissionTest() {
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState({ launch: true });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      setChecked(saved);
    } catch {}
  }, []);

  const toggle = (sectionId, item) => {
    const key = `${sectionId}::${item}`;
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleSection = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const totalItems = SECTIONS.reduce((s, sec) => s + sec.items.length, 0);
  const totalChecked = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((totalChecked / totalItems) * 100);

  const sectionDone = (sec) => sec.items.every(item => checked[`${sec.id}::${item}`]);

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg,#e8eef8 0%,#f0f4fc 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">

        {/* HERO */}
        <div className="rounded-3xl p-6 text-white shadow-md" style={{ background: 'linear-gradient(135deg,#3b5bdb 0%,#4f6ef7 100%)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-5 h-5 text-blue-200" />
            <span className="text-blue-200 text-xs font-bold uppercase tracking-wide">Pre-Submission</span>
          </div>
          <h1 className="text-2xl font-black mb-1">10-Minute App Store Checklist</h1>
          <p className="text-blue-200 text-sm mb-4">Complete before submitting to Apple App Store & Google Play</p>
          {/* Progress */}
          <div className="bg-white/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">Progress</span>
              <span className="text-2xl font-black text-amber-300">{totalChecked} / {totalItems}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
              <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#34D399,#10B981)' }} />
            </div>
            <p className="text-xs text-blue-200 mt-2 text-right">{pct}% complete</p>
          </div>
        </div>

        {/* SECTIONS */}
        {SECTIONS.map(sec => {
          const done = sectionDone(sec);
          const secChecked = sec.items.filter(item => checked[`${sec.id}::${item}`]).length;
          const isOpen = expanded[sec.id];
          return (
            <div key={sec.id} className="bg-white rounded-3xl border shadow-sm overflow-hidden" style={{ borderColor: done ? '#A7F3D0' : sec.border }}>
              <button onClick={() => toggleSection(sec.id)} className="w-full flex items-center gap-3 p-4 text-left">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: done ? '#ECFDF5' : sec.bg, border: `1px solid ${done ? '#A7F3D0' : sec.border}` }}>
                  {done ? '✅' : sec.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm">{sec.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: done ? '#10B981' : sec.color }}>
                    {secChecked} / {sec.items.length} checked
                  </p>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-2 border-t pt-3" style={{ borderColor: sec.border }}>
                  {sec.items.map(item => {
                    const key = `${sec.id}::${item}`;
                    const isChecked = !!checked[key];
                    return (
                      <button key={item} onClick={() => toggle(sec.id, item)}
                        className="w-full flex items-center gap-3 py-2.5 px-3 rounded-2xl text-left transition-all hover:opacity-90"
                        style={{ background: isChecked ? sec.bg : '#F9FAFB', border: `1px solid ${isChecked ? sec.border : '#F3F4F6'}` }}>
                        {isChecked
                          ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: sec.color }} />
                          : <Circle className="w-5 h-5 flex-shrink-0 text-gray-300" />}
                        <span className={`text-sm font-medium ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item}</span>
                      </button>
                    );
                  })}

                  {/* Quick links */}
                  {sec.links && (
                    <div className="flex gap-2 pt-1 flex-wrap">
                      {sec.links.map(l => (
                        <Link key={l.page} to={createPageUrl(l.page)}>
                          <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background: sec.color }}>
                            Open {l.label} →
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* BONUS TIP */}
        <div className="rounded-3xl p-5 border border-amber-200 shadow-sm" style={{ background: '#FFFBEB' }}>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-500" />
            <p className="font-black text-amber-800 text-sm">Bonus Tip</p>
          </div>
          <p className="text-sm text-amber-700">Before submitting, ask one friend or church member to test the app. Fresh eyes catch confusing buttons, translation mistakes, and broken pages that developers miss.</p>
        </div>

        {/* DONE STATE */}
        {pct === 100 && (
          <div className="rounded-3xl p-6 text-white text-center shadow-md" style={{ background: 'linear-gradient(135deg,#10B981,#34D399)' }}>
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-black text-xl mb-1">FaithLight is ready!</p>
            <p className="text-green-100 text-sm">All checks passed. Go publish version 1.0!</p>
          </div>
        )}

      </div>
    </div>
  );
}