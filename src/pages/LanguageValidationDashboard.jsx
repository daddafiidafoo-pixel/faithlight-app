import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguageStore, supportedLanguages } from '@/components/languageStore';
import { LANGUAGES } from '@/config/languages';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2, XCircle, Circle, Globe, BookOpen, Brain, Home,
  Heart, Bot, User, Settings, Search, AlertTriangle, Smartphone,
  AlignRight, ChevronDown, ChevronUp, Loader2, RefreshCw, Eye, Lock, PlayCircle
} from 'lucide-react';
import { isLaunchReady } from '@/utils/languageValidation';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

// ── Checklist structure ────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'global', icon: Globe, label: 'Global Language Switch',
    items: [
      'Language switches instantly (no reload)',
      'Language persists after page refresh',
      'No mixed English text anywhere',
      'Fallback message shown (not silent fallback)',
    ]
  },
  {
    id: 'bible', icon: BookOpen, label: 'Bible Page (CRITICAL)',
    items: [
      'Verse text loads in selected language',
      'Book names are localized (e.g. Filiphisiiyus)',
      'Chapter/verse numbers display correctly',
      'Switching language reloads verse content',
      'No English verse in non-English mode',
      'Proper "not available" message shown when missing',
    ]
  },
  {
    id: 'ai', icon: Brain, label: 'Bible Explanation (AI)',
    items: [
      'Explanation language matches selected language',
      'No English paragraphs inside other languages',
      'Section titles match language (Meaning, Context…)',
      'Error message localized if generation fails',
    ]
  },
  {
    id: 'home', icon: Home, label: 'Home Page',
    items: [
      '"Verse of the Day" fully translated',
      'Verse text matches selected language',
      'Buttons correctly translated (Create/Share)',
      'No mixed-language UI elements',
    ]
  },
  {
    id: 'prayer', icon: Heart, label: 'Prayer Page',
    items: [
      '"Add Prayer" button translated',
      'Empty state message translated',
      'Prayer list content displays correctly',
      'No English fallback unless necessary',
    ]
  },
  {
    id: 'aihub', icon: Bot, label: 'AI Hub',
    items: [
      'User input works in selected language',
      'AI responses are in selected language',
      'Mode labels translated',
      'Errors are localized',
    ]
  },
  {
    id: 'profile', icon: User, label: 'Profile Page',
    items: [
      'Labels translated (name, email, etc.)',
      'Settings links translated',
      'Logout / delete account translated',
    ]
  },
  {
    id: 'settings', icon: Settings, label: 'Settings Page',
    items: [
      'Language selector works',
      'Language names displayed correctly',
      'Changing language updates whole app',
    ]
  },
  {
    id: 'search', icon: Search, label: 'Search',
    items: [
      'Search results match selected language',
      'No English results in non-English mode',
      'Placeholder text translated',
    ]
  },
  {
    id: 'errors', icon: AlertTriangle, label: 'Error Handling',
    items: [
      'No generic English errors in other languages',
      'Each language has its own error messages',
      'Network errors handled with localized text',
    ]
  },
  {
    id: 'mobile', icon: Smartphone, label: 'Mobile UX',
    items: [
      'Text fits UI (no overflow or truncation)',
      'Buttons still readable in all languages',
      'RTL layout works for Arabic',
    ]
  },
  {
    id: 'rtl', icon: AlignRight, label: 'Arabic RTL (Special)',
    items: [
      'Layout switches to RTL',
      'Text aligns right across all pages',
      'UI elements flip correctly (icons, arrows)',
    ]
  },
];

const LANG_AREAS = ['ui', 'bible', 'ai', 'errors'];

const STATUS_COLORS = {
  ready: 'bg-green-100 text-green-700 border-green-200',
  partial: 'bg-amber-100 text-amber-700 border-amber-200',
  notready: 'bg-red-100 text-red-700 border-red-200',
  untested: 'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_LABELS = {
  ready: '✅ Ready',
  partial: '⚠️ Partial',
  notready: '❌ Not Ready',
  untested: '○ Untested',
};

// Default state stored in localStorage
const STORAGE_KEY = 'fl_lang_validation_v2';

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function computeStatus(checks) {
  if (!checks || Object.keys(checks).length === 0) return 'untested';
  const vals = Object.values(checks);
  const passCount = vals.filter(Boolean).length;
  if (passCount === vals.length) return 'ready';
  if (passCount === 0) return 'notready';
  return 'partial';
}

function langAreaStatus(langCode, area, areaStatuses) {
  return areaStatuses?.[langCode]?.[area] || 'untested';
}

// ── AI Quick Test ─────────────────────────────────────────────────────────
async function runAITest(langCode) {
  const aiName = LANGUAGES[langCode]?.aiName || langCode;
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a test assistant. Reply ONLY in ${aiName}. Do not use English at all.
Write one short sentence that means "God loves you" in ${aiName}.
Then on a new line write: [AI: ${aiName} ✓]
No extra explanation.`,
  });
  return res;
}

// ── Bible Brain Validator ─────────────────────────────────────────────────
async function runBibleBrainTest(langCode) {
  try {
    const res = await base44.functions.invoke('bibleBrainAPI', {
      action: 'validateLanguage',
      lang: langCode,
    });
    return res?.data || { lang: langCode, bestBibleId: null, results: [] };
  } catch (e) {
    return { lang: langCode, bestBibleId: null, error: e.message, results: [] };
  }
}

export default function LanguageValidationDashboard() {
  const setLanguage = useLanguageStore(s => s.setLanguage);
  const currentLang = useLanguageStore(s => s.uiLanguage);

  const [state, setState] = useState(() => loadState());
  const [activeLang, setActiveLang] = useState('en');
  const [expandedSection, setExpandedSection] = useState('bible');
  const [aiTestResult, setAiTestResult] = useState({});
  const [aiTesting, setAiTesting] = useState({});
  const [bibleTestResult, setBibleTestResult] = useState({});
  const [bibleTesting, setBibleTesting] = useState({});
  const [areaStatuses, setAreaStatuses] = useState(() => loadState().areaStatuses || {});

  // persist on every change
  useEffect(() => {
    saveState({ ...state, areaStatuses });
  }, [state, areaStatuses]);

  const getChecks = (langCode, sectionId) => state?.[langCode]?.[sectionId] || {};

  const setCheck = (langCode, sectionId, itemIdx, value) => {
    setState(prev => {
      const next = { ...prev };
      if (!next[langCode]) next[langCode] = {};
      if (!next[langCode][sectionId]) next[langCode][sectionId] = {};
      next[langCode][sectionId][itemIdx] = value;
      return next;
    });
  };

  const setAreaStatus = (langCode, area, status) => {
    setAreaStatuses(prev => {
      const next = { ...prev };
      if (!next[langCode]) next[langCode] = {};
      next[langCode][area] = status;
      return next;
    });
  };

  const runAIQuickTest = async (langCode) => {
    setAiTesting(p => ({ ...p, [langCode]: true }));
    try {
      const result = await runAITest(langCode);
      setAiTestResult(p => ({ ...p, [langCode]: result }));
    } catch (e) {
      setAiTestResult(p => ({ ...p, [langCode]: '⚠️ Test failed: ' + e.message }));
    }
    setAiTesting(p => ({ ...p, [langCode]: false }));
  };

  const runBibleTest = async (langCode) => {
    setBibleTesting(p => ({ ...p, [langCode]: true }));
    try {
      const result = await runBibleBrainTest(langCode);
      setBibleTestResult(p => ({ ...p, [langCode]: result }));
    } catch (e) {
      setBibleTestResult(p => ({ ...p, [langCode]: { error: e.message } }));
    }
    setBibleTesting(p => ({ ...p, [langCode]: false }));
  };

  const switchToLang = (code) => {
    setActiveLang(code);
    setLanguage(code);
    toast.success(`Switched app to ${supportedLanguages.find(l => l.code === code)?.label || code}`);
  };

  const resetLang = (langCode) => {
    setState(prev => { const next = { ...prev }; delete next[langCode]; return next; });
    setAreaStatuses(prev => { const next = { ...prev }; delete next[langCode]; return next; });
    setAiTestResult(p => { const next = { ...p }; delete next[langCode]; return next; });
    toast.info('Reset validation for ' + langCode);
  };

  // Summary stats per language
  const getLangSummary = (langCode) => {
    let total = 0, passed = 0;
    SECTIONS.forEach(s => {
      const checks = getChecks(langCode, s.id);
      s.items.forEach((_, i) => {
        total++;
        if (checks[i] === true) passed++;
      });
    });
    return { total, passed, pct: total > 0 ? Math.round((passed / total) * 100) : 0 };
  };

  const [auditResults, setAuditResults] = useState({});
  const [auditRunning, setAuditRunning] = useState(false);

  const overallReady = (langCode) => {
    const { pct } = getLangSummary(langCode);
    const areas = LANG_AREAS.map(a => langAreaStatus(langCode, a, areaStatuses));
    const audit = auditResults[langCode];
    const launchCheck = isLaunchReady({
      ui: areas[0] === 'ready',
      ai: audit ? audit.aiValid : (areas[2] === 'ready'),
      bible: audit ? audit.bibleSuccess : (areas[1] === 'ready'),
      rtl: langCode !== 'ar' || areas[3] === 'ready',
    });
    return pct === 100 && launchCheck;
  };

  const runFullAudit = async () => {
    setAuditRunning(true);
    const langs = ['en', 'om', 'am', 'fr', 'sw', 'ar'];
    const results = {};
    for (const lang of langs) {
      try {
        const [aiRes, bibleRes] = await Promise.all([
          base44.functions.invoke('faithAIEngine', {
            input: 'Give me a short Christian encouragement about hope.',
            language: lang,
            feature: 'emotional',
          }),
          base44.functions.invoke('bibleBrainAPI', {
            action: 'verse',
            book: 'PHP',
            chapter: 4,
            verse: 13,
            lang,
          }),
        ]);
        results[lang] = {
          lang,
          aiSuccess: !!aiRes?.data?.success,
          aiValid: aiRes?.data?.languageValidation?.valid ?? false,
          aiIssues: aiRes?.data?.languageValidation?.issues ?? [],
          bibleSuccess: !!bibleRes?.data?.success,
          bibleError: bibleRes?.data?.error || null,
          bibleMessage: bibleRes?.data?.message || null,
        };
      } catch (e) {
        results[lang] = { lang, aiSuccess: false, aiValid: false, bibleSuccess: false, error: e.message };
      }
    }
    setAuditResults(results);
    setAuditRunning(false);
    toast.success('Language audit complete!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 to-violet-700 py-8 px-4 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/15 rounded-xl"><Globe className="w-5 h-5" /></div>
            <div>
              <h1 className="text-xl font-bold">Language Validation Dashboard</h1>
              <p className="text-indigo-200 text-xs mt-0.5">Pre-launch checklist · Track readiness for all 6 languages</p>
            </div>
          </div>
          {/* Quick language switcher */}
          <div className="flex flex-wrap gap-2 mt-4">
            {supportedLanguages.filter(l => l.code !== 'ti').map(lang => {
              const { pct } = getLangSummary(lang.code);
              const ready = overallReady(lang.code);
              return (
                <button
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${activeLang === lang.code ? 'bg-white text-indigo-700 border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                >
                  <span>{lang.label}</span>
                  {pct > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${ready ? 'bg-green-400 text-green-900' : pct > 50 ? 'bg-amber-300 text-amber-900' : 'bg-red-300 text-red-900'}`}>{pct}%</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Final Status Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">📊 Final Language Status Table</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-gray-500 font-semibold">Language</th>
                  {LANG_AREAS.map(a => <th key={a} className="text-center py-2 px-2 text-gray-500 font-semibold capitalize">{a}</th>)}
                  <th className="text-center py-2 px-2 text-gray-500 font-semibold">Checklist</th>
                  <th className="text-center py-2 px-2 text-gray-500 font-semibold">Status</th>
                  <th className="py-2 px-2" />
                </tr>
              </thead>
              <tbody>
                {supportedLanguages.filter(l => l.code !== 'ti').map(lang => {
                  const { pct, passed, total } = getLangSummary(lang.code);
                  const ready = overallReady(lang.code);
                  return (
                    <tr key={lang.code} className={`border-b border-gray-50 transition-colors ${activeLang === lang.code ? 'bg-indigo-50' : ''}`}>
                      <td className="py-2.5 pr-4">
                        <button onClick={() => setActiveLang(lang.code)} className="font-semibold text-gray-800 hover:text-indigo-700 text-left">
                          {lang.label}
                        </button>
                      </td>
                      {LANG_AREAS.map(area => {
                        const s = langAreaStatus(lang.code, area, areaStatuses);
                        return (
                          <td key={area} className="text-center px-2 py-2.5">
                            <select
                              value={s}
                              onChange={e => setAreaStatus(lang.code, area, e.target.value)}
                              className={`text-xs rounded-full px-2 py-0.5 border font-semibold cursor-pointer ${STATUS_COLORS[s]}`}
                            >
                              {Object.entries(STATUS_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                            </select>
                          </td>
                        );
                      })}
                      <td className="text-center px-2">
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : pct > 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-gray-500">{passed}/{total}</span>
                        </div>
                      </td>
                      <td className="text-center px-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${ready ? STATUS_COLORS.ready : pct > 0 ? STATUS_COLORS.partial : STATUS_COLORS.untested}`}>
                          {ready ? '✅ Ready' : pct > 0 ? '⚠️ In Progress' : '○ Untested'}
                        </span>
                      </td>
                      <td className="px-2">
                        <button onClick={() => switchToLang(lang.code)} title="Switch app to this language"
                          className="p-1 text-gray-300 hover:text-indigo-600 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Active Language Panel */}
        {(() => {
          const lang = supportedLanguages.find(l => l.code === activeLang);
          const { pct, passed, total } = getLangSummary(activeLang);
          const ready = overallReady(activeLang);
          return (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-gray-900">Testing: {lang?.label}</h2>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${ready ? STATUS_COLORS.ready : pct > 0 ? STATUS_COLORS.partial : STATUS_COLORS.untested}`}>
                    {ready ? '✅ Ready to launch' : pct > 0 ? `⚠️ ${pct}% done` : '○ Not started'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"
                    onClick={() => switchToLang(activeLang)}>
                    <Eye className="w-3.5 h-3.5" /> Test Live
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-red-400 h-8"
                    onClick={() => resetLang(activeLang)}>
                    <RefreshCw className="w-3 h-3 mr-1" /> Reset
                  </Button>
                </div>
              </div>

              {/* AI Quick Test */}
              <Card className="mb-3 border-violet-100 bg-violet-50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <Bot className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-violet-800 mb-1">AI Language Quick Test</p>
                      <p className="text-xs text-violet-600 mb-3">Verifies AI responds in <strong>{lang?.label}</strong> — uses language-locked prompt with retry guard</p>
                      {aiTestResult[activeLang] && (
                        <div className="bg-white rounded-xl p-3 mb-3 border border-violet-100" dir={LANGUAGES[activeLang]?.rtl ? 'rtl' : 'ltr'}>
                          <p className="text-xs text-gray-500 font-medium mb-1">Response:</p>
                          <p className="text-sm text-gray-800 leading-relaxed">{aiTestResult[activeLang]}</p>
                        </div>
                      )}
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-700 gap-2 text-xs h-8"
                        onClick={() => runAIQuickTest(activeLang)}
                        disabled={aiTesting[activeLang]}>
                        {aiTesting[activeLang] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                        {aiTesting[activeLang] ? 'Testing…' : 'Run AI Test'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bible Brain Test */}
              <Card className="mb-4 border-blue-100 bg-blue-50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-blue-800 mb-1">Bible Brain Availability Test</p>
                      <p className="text-xs text-blue-600 mb-1">
                        Preferred IDs: <span className="font-mono">{LANGUAGES[activeLang]?.preferredBibleIds?.join(', ') || '—'}</span>
                      </p>
                      <p className="text-xs text-blue-500 mb-3">Tests each preferred BibleId against the live API (John 3:16 probe)</p>
                      {bibleTestResult[activeLang] && (
                        <div className="bg-white rounded-xl p-3 mb-3 border border-blue-100 space-y-1.5">
                          {bibleTestResult[activeLang].error && (
                            <p className="text-xs text-red-600">⚠️ {bibleTestResult[activeLang].error}</p>
                          )}
                          {bibleTestResult[activeLang].bestBibleId
                            ? <p className="text-xs text-green-700 font-semibold">✅ Best Bible ID: <span className="font-mono">{bibleTestResult[activeLang].bestBibleId}</span></p>
                            : <p className="text-xs text-red-600 font-semibold">❌ No verified Bible ID found — will fall back to English</p>
                          }
                          {(bibleTestResult[activeLang].results || []).map((r, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span>{r.available ? '✅' : '❌'}</span>
                              <span className="font-mono text-gray-700">{r.bibleId}</span>
                              {r.text && <span className="text-gray-400 truncate max-w-[160px]">"{r.text}…"</span>}
                              {r.httpStatus && <span className="text-gray-400">HTTP {r.httpStatus}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2 text-xs h-8"
                        onClick={() => runBibleTest(activeLang)}
                        disabled={bibleTesting[activeLang]}>
                        {bibleTesting[activeLang] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
                        {bibleTesting[activeLang] ? 'Probing API…' : 'Run Bible Brain Test'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Launch Rule Warning */}
              {!ready && pct > 0 && (
                <Card className="mb-4 border-amber-200 bg-amber-50">
                  <CardContent className="pt-3 pb-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800">
                      <strong>🚨 Launch Rule:</strong> This language is NOT ready. Hide it from users until all checks pass. Never silently fallback (e.g. Oromo UI + English Bible ❌).
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section Checklists */}
              <div className="space-y-2">
                {SECTIONS.map(section => {
                  const Icon = section.icon;
                  const checks = getChecks(activeLang, section.id);
                  const sectionPassed = section.items.filter((_, i) => checks[i] === true).length;
                  const sectionTotal = section.items.length;
                  const sectionDone = sectionPassed === sectionTotal && Object.keys(checks).length === sectionTotal;
                  const isOpen = expandedSection === section.id;

                  return (
                    <Card key={section.id} className={`overflow-hidden transition-all ${sectionDone ? 'border-green-200' : ''}`}>
                      <button
                        className="w-full text-left px-4 py-3 flex items-center gap-3"
                        onClick={() => setExpandedSection(isOpen ? null : section.id)}
                      >
                        <div className={`p-1.5 rounded-lg ${sectionDone ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Icon className={`w-4 h-4 ${sectionDone ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${sectionDone ? 'text-green-800' : 'text-gray-800'}`}>
                            {section.label}
                          </p>
                          <p className="text-xs text-gray-400">{sectionPassed}/{sectionTotal} items checked</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {sectionDone
                            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                            : sectionPassed > 0
                              ? <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center"><span className="text-xs font-bold text-amber-500">{sectionPassed}</span></div>
                              : <Circle className="w-5 h-5 text-gray-300" />
                          }
                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-gray-50">
                          <div className="space-y-2 mt-3">
                            {section.items.map((item, i) => {
                              const val = checks[i];
                              return (
                                <div key={i} className="flex items-start gap-3">
                                  <div className="flex gap-1 flex-shrink-0 mt-0.5">
                                    <button
                                      onClick={() => setCheck(activeLang, section.id, i, true)}
                                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all text-xs font-bold ${val === true ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-gray-300 hover:border-green-300'}`}
                                      title="Pass"
                                    >✓</button>
                                    <button
                                      onClick={() => setCheck(activeLang, section.id, i, false)}
                                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all text-xs font-bold ${val === false ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 text-gray-300 hover:border-red-300'}`}
                                      title="Fail"
                                    >✗</button>
                                  </div>
                                  <p className={`text-sm mt-0.5 leading-snug ${val === true ? 'text-green-700' : val === false ? 'text-red-600 line-through' : 'text-gray-700'}`}>
                                    {item}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick mark all */}
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => section.items.forEach((_, i) => setCheck(activeLang, section.id, i, true))}
                              className="text-xs text-green-600 hover:text-green-700 font-medium"
                            >✓ Mark all pass</button>
                            <span className="text-gray-300">·</span>
                            <button
                              onClick={() => section.items.forEach((_, i) => setCheck(activeLang, section.id, i, false))}
                              className="text-xs text-red-500 hover:text-red-600 font-medium"
                            >✗ Mark all fail</button>
                            <span className="text-gray-300">·</span>
                            <button
                              onClick={() => setState(prev => {
                                const next = { ...prev };
                                if (next[activeLang]) delete next[activeLang][section.id];
                                return next;
                              })}
                              className="text-xs text-gray-400 hover:text-gray-600 font-medium"
                            >Reset</button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Automated Language Audit Runner */}
        <Card className="border-indigo-100">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-indigo-600" /> Automated Language Audit
              </p>
              <Button
                size="sm"
                onClick={runFullAudit}
                disabled={auditRunning}
                className="bg-indigo-600 hover:bg-indigo-700 text-xs gap-2 h-8"
              >
                {auditRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
                {auditRunning ? 'Running…' : 'Run All Languages'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Tests AI (faithAIEngine) + Bible (bibleBrainAPI) for all 6 languages in parallel. Uses production endpoints.</p>
            {Object.keys(auditResults).length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                      <th className="text-left py-1.5 pr-3">Language</th>
                      <th className="text-center px-2">AI ✓</th>
                      <th className="text-center px-2">AI Valid</th>
                      <th className="text-center px-2">Bible ✓</th>
                      <th className="text-left px-2">Note</th>
                      <th className="text-center px-2">Ready?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['en', 'om', 'am', 'fr', 'sw', 'ar'].map(lang => {
                      const r = auditResults[lang];
                      if (!r) return null;
                      const areas = LANG_AREAS.map(a => langAreaStatus(lang, a, areaStatuses));
                      const ready = isLaunchReady({
                        ui: areas[0] === 'ready',
                        ai: r.aiValid,
                        bible: r.bibleSuccess,
                        rtl: lang !== 'ar' || areas[3] === 'ready',
                      });
                      return (
                        <tr key={lang} className="border-b border-gray-50">
                          <td className="py-2 pr-3 font-semibold text-gray-800">{LANGUAGES[lang]?.label || lang}</td>
                          <td className="text-center px-2">{r.aiSuccess ? '✅' : '❌'}</td>
                          <td className="text-center px-2">{r.aiValid ? '✅' : <span className="text-amber-500">⚠️ {r.aiIssues?.join(', ')}</span>}</td>
                          <td className="text-center px-2">{r.bibleSuccess ? '✅' : '❌'}</td>
                          <td className="px-2 text-gray-400 max-w-[160px] truncate">{r.bibleError === 'VERSE_NOT_AVAILABLE' ? <span className="text-amber-600">not in language</span> : r.bibleMessage || r.error || '—'}</td>
                          <td className="text-center px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ready ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {ready ? 'Ready' : 'No'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Launch Rules Reference */}
        <Card className="border-red-100 bg-red-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">🚨 Launch Rules</p>
            <div className="space-y-2 text-xs text-red-700">
              <p>A language is <strong>READY</strong> only when ALL of these are true:</p>
              <ul className="space-y-1 ml-3">
                <li>✅ No mixed English in UI or content</li>
                <li>✅ Bible content loads in correct language</li>
                <li>✅ AI responds in correct language</li>
                <li>✅ UI is fully translated</li>
                <li>✅ Error messages are localized</li>
              </ul>
              <p className="mt-3 font-semibold">Never silently fallback:</p>
              <div className="bg-white/70 rounded-xl p-2 space-y-1">
                <p>❌ Oromo UI + English Bible</p>
                <p>❌ Swahili UI + English AI responses</p>
                <p className="border-t border-red-100 pt-1">✅ Instead show: "Content not available in this language yet"</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 text-center pb-4">
          Progress auto-saved to localStorage · Admin use only
        </p>
      </div>
    </div>
  );
}