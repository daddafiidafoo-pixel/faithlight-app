import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../components/I18nProvider';
import { Sparkles, BookOpen, CheckCircle2, Circle, ChevronDown, ChevronUp, Plus, Loader2, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const TOPIC_KEYS = [
  'dealingWithAnxiety', 'findingPurpose', 'overcomingFear', 'griefAndLoss',
  'strengtheningFaith', 'forgivingOthers', 'marriageAndRelationships', 'financialStress',
  'loneliness', 'addictionAndTemptation', 'doubtAndQuestions', 'growingInPrayer',
];
const DURATION_KEYS = ['3Days', '7Days', '14Days', '30Days'];
const DURATION_VALS = [3, 7, 14, 30];
const LANG_NAMES    = { en: 'English', om: 'Afaan Oromoo', am: 'Amharic', ar: 'Arabic', fr: 'French', sw: 'Swahili' };

export default function AIBibleStudyPlanner() {
  const { t, lang } = useI18n();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState('form');
  const [challenge, setChallenge] = useState('');
  const [customChallenge, setCustomChallenge] = useState('');
  const [duration, setDuration] = useState(7);
  const [plan, setPlan] = useState(null);
  const [savedPlan, setSavedPlan] = useState(null);
  const [myPlans, setMyPlans] = useState([]);
  const [expandedDay, setExpandedDay] = useState(0);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const topics = TOPIC_KEYS.map(key => ({ key, label: t(`studyPlan.topics.${key}`) }));
  const durations = DURATION_KEYS.map((key, i) => ({ label: t(`studyPlan.durations.${key}`), value: DURATION_VALS[i] }));

  // English topic for AI (ensures best AI quality)
  const TOPIC_EN = [
    'Dealing with Anxiety', 'Finding Purpose', 'Overcoming Fear', 'Grief & Loss',
    'Strengthening Faith', 'Forgiving Others', 'Marriage & Relationships', 'Financial Stress',
    'Loneliness', 'Addiction & Temptation', 'Doubt & Questions', 'Growing in Prayer',
  ];
  const topicForAI = challenge === '__custom__'
    ? customChallenge
    : TOPIC_KEYS.includes(challenge) ? TOPIC_EN[TOPIC_KEYS.indexOf(challenge)] : challenge;
  const topicLabel = challenge === '__custom__'
    ? customChallenge
    : topics.find(t => t.key === challenge)?.label || challenge;

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const fetchMyPlans = async () => {
    if (!user) return;
    setLoadingPlans(true);
    const plans = await base44.entities.PersonalReadingPlan.filter({ user_id: user.id }, '-created_date', 10);
    setMyPlans(plans);
    setLoadingPlans(false);
  };

  const generatePlan = async () => {
    if (!topicForAI.trim()) return;
    setStep('loading');
    const langName = LANG_NAMES[lang] || 'English';
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a ${duration}-day Bible study plan for someone dealing with: "${topicForAI}".

IMPORTANT: Generate ALL content (title, description, day titles, summaries, reflection questions) entirely in ${langName}. Do not use English unless ${langName} IS English.

Return a JSON object:
{
   "title": "short inspiring plan title in ${langName}",
   "description": "2 sentence overview in ${langName}",
   "theme": "${topicForAI}",
   "days": [{"day":1,"title":"...","reference":"...","summary":"...","reflection":"..."}]
}
Make each day build on the previous. Use well-known Bible passages relevant to "${topicForAI}". Warm pastoral tone.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' }, description: { type: 'string' }, theme: { type: 'string' },
          days: { type: 'array', items: { type: 'object', properties: {
            day: { type: 'number' }, title: { type: 'string' }, reference: { type: 'string' },
            summary: { type: 'string' }, reflection: { type: 'string' },
          }}},
        },
      },
    });
    setPlan(result);
    setStep('plan');
    setExpandedDay(0);
  };

  const savePlan = async () => {
    if (!user) return;
    const record = await base44.entities.PersonalReadingPlan.create({
      user_id: user.id,
      title: plan.title, theme: plan.theme, description: plan.description,
      total_days: plan.days.length, completed_days: 0, status: 'active',
      started_date: new Date().toISOString().split('T')[0],
      days: plan.days.map(d => ({ day: d.day, title: d.title, reference: d.reference, reflection: d.reflection, completed: false })),
    });
    setSavedPlan(record);
  };

  const toggleDay = async (dayIndex) => {
    if (!savedPlan) return;
    const updatedDays = [...savedPlan.days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], completed: !updatedDays[dayIndex].completed, completed_date: new Date().toISOString() };
    const completedCount = updatedDays.filter(d => d.completed).length;
    const updated = await base44.entities.PersonalReadingPlan.update(savedPlan.id, {
      days: updatedDays, completed_days: completedCount,
      status: completedCount === updatedDays.length ? 'completed' : 'active',
    });
    setSavedPlan(updated);
  };

  // ── FORM ──
  if (step === 'form') {
    return (
    <div className="min-h-screen bg-[#F7F8FC] py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
            <Sparkles className="w-4 h-4" /> {t('studyPlan.aiPowered')}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{t('studyPlan.title')}</h1>
          <p className="text-gray-500 text-sm">{t('studyPlan.subtitle')}</p>
        </div>

        {user && (
          <button onClick={() => { fetchMyPlans(); setStep('myplans'); }}
            className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-5 shadow-sm hover:border-indigo-300 transition-colors">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <BookOpen className="w-4 h-4 text-indigo-500" /> {t('studyPlan.mySavedPlans')}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('studyPlan.whatAreYouGoingThrough')}</label>
            <div className="flex flex-wrap gap-2">
              {topics.map(topic => (
                <button key={topic.key} onClick={() => setChallenge(topic.key)}
                  className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-colors min-h-[44px] flex items-center justify-center ${challenge === topic.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                  {topic.label}
                </button>
              ))}
              <button onClick={() => setChallenge('__custom__')}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-colors min-h-[44px] flex items-center justify-center ${challenge === '__custom__' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                {t('studyPlan.topics.other')}
              </button>
            </div>
            {challenge === '__custom__' && (
              <Textarea className="mt-3 text-sm" placeholder={t('studyPlan.customPlaceholder', "Describe what you're going through…")} rows={2}
                value={customChallenge} onChange={e => setCustomChallenge(e.target.value)} />
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('studyPlan.planLength', 'Plan length')}</label>
            <div className="flex gap-2">
              {durations.map(d => (
                <button key={d.value} onClick={() => setDuration(d.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${duration === d.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={generatePlan} disabled={!topicForAI.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl gap-2">
            <Sparkles className="w-4 h-4" /> {t('studyPlan.generateMyPlan')}
          </Button>
        </div>
      </div>
    </div>
    );
  }

  // ── LOADING ──
  if (step === 'loading') {
    return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F8FC] px-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
      <p className="text-lg font-bold text-gray-800 mb-1">{t('studyPlan.buildingPlan')}</p>
      <p className="text-sm text-gray-500">"{topicLabel}"</p>
    </div>
    );
  }

  // ── MY PLANS ──
  if (step === 'myplans') {
    return (
    <div className="min-h-screen bg-[#F7F8FC] py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-gray-900">{t('studyPlan.myStudyPlans')}</h1>
          <Button variant="outline" size="sm" onClick={() => setStep('form')} className="gap-1">
            <Plus className="w-4 h-4" /> {t('studyPlan.newPlan')}
          </Button>
        </div>
        {loadingPlans && <div className="text-center py-10"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" /></div>}
        {!loadingPlans && myPlans.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">{t('studyPlan.noSavedPlans')}</p>
            <button onClick={() => setStep('form')} className="mt-3 text-indigo-600 text-sm font-bold hover:underline">
              {t('studyPlan.generateMyPlan')} →
            </button>
          </div>
        )}
        <div className="space-y-3">
          {myPlans.map(p => {
            const pct = p.total_days > 0 ? Math.round((p.completed_days / p.total_days) * 100) : 0;
            return (
              <button key={p.id}
                onClick={() => { setSavedPlan(p); setPlan({ title: p.title, description: p.description, theme: p.theme, days: p.days || [] }); setStep('plan'); }}
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-indigo-300 transition-colors shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-800 text-sm">{p.title}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>{p.status}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{p.total_days} · {p.theme}</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${p.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct}%</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
    );
  }

  // ── PLAN VIEW ──
  const displayDays = savedPlan?.days || plan?.days || [];
  const completedCount = savedPlan ? savedPlan.completed_days : 0;
  const totalDays = displayDays.length;
  const pct = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F7F8FC] py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-indigo-500 font-bold uppercase tracking-wide mb-0.5">{plan?.theme}</p>
              <h2 className="text-lg font-extrabold text-gray-900">{plan?.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{plan?.description}</p>
            </div>
            <button onClick={() => { setStep('form'); setPlan(null); setSavedPlan(null); }}>
              <RotateCcw className="w-4 h-4 text-gray-300 hover:text-indigo-500 transition-colors mt-1" />
            </button>
          </div>
          {savedPlan && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{completedCount}/{totalDays}</span><span>{pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
              </div>
              {pct === 100 && <p className="text-xs text-green-600 font-bold mt-1 text-center">{t('studyPlan.complete')}</p>}
            </div>
          )}
          {!savedPlan && user && (
          <Button onClick={savePlan} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
          <BookOpen className="w-4 h-4" /> {t('studyPlan.saveStartPlan')}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {displayDays.map((day, i) => {
            const isCompleted = savedPlan ? savedPlan.days?.[i]?.completed : false;
            const isOpen = expandedDay === i;
            return (
              <div key={i} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isCompleted ? 'border-green-200' : 'border-gray-200'}`}>
                <button onClick={() => setExpandedDay(isOpen ? -1 : i)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCompleted ? 'bg-green-500 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm ${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>{day.title}</div>
                    <div className="text-xs text-indigo-500 font-semibold">{day.reference}</div>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-300 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                    {day.summary && <p className="text-sm text-gray-600 leading-relaxed">{day.summary}</p>}
                    {day.reflection && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-amber-700 mb-1">{t('studyPlan.reflection')}</p>
                        <p className="text-sm text-amber-800 leading-relaxed">{day.reflection}</p>
                      </div>
                    )}
                    {savedPlan && (
                      <button onClick={() => toggleDay(i)}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-colors ${isCompleted ? 'bg-gray-100 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                        {isCompleted
                          ? <><Circle className="w-4 h-4" /> {t('studyPlan.markIncomplete')}</>
                          : <><CheckCircle2 className="w-4 h-4" /> {t('studyPlan.completeDay')} {i + 1}</>}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}