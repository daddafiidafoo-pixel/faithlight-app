import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';
import { useI18n } from '../components/I18nProvider';
import { Loader2, BookOpen, Volume2, Users, PenTool, Sun, Brain, CheckCircle } from 'lucide-react';

const makeGoals = (t) => [
  { key: 'daily_reading', icon: BookOpen, label: t('focus.dailyBibleReading', 'Daily Bible reading'), desc: t('focus.dailyBibleReadingDesc', 'Build a consistent reading habit') },
  { key: 'deeper_study', icon: Brain, label: t('focus.deeperStudy', 'Deeper study'), desc: t('focus.deeperStudyDesc', 'Explore themes and passages in depth') },
  { key: 'sermon_prep', icon: PenTool, label: t('focus.sermonPreparation', 'Sermon preparation'), desc: t('focus.sermonPreparationDesc', 'Create outlines and teaching notes') },
  { key: 'personal_growth', icon: Sun, label: t('focus.personalGrowth', 'Personal growth'), desc: t('focus.personalGrowthDesc', 'Devotionals and daily reflection') },
  { key: 'foundations', icon: BookOpen, label: t('focus.learningFoundations', 'Learning foundations'), desc: t('focus.learningFoundationsDesc', 'Structured courses for new believers') },
];

const makeTimeOptions = (t) => [
  { key: '5', label: t('time.fiveMinutes', '5 minutes'), sublabel: t('time.fiveMinutesDesc', 'A short daily verse and reflection') },
  { key: '10', label: t('time.tenMinutes', '10 minutes'), sublabel: t('time.tenMinutesDesc', 'A passage with study notes') },
  { key: '20', label: t('time.twentyPlusMinutes', '20+ minutes'), sublabel: t('time.twentyPlusMinutesDesc', 'Full study plan or course lesson') },
];

const TOTAL_STEPS = 5;

function ProgressDots({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${i < current ? 'w-6 h-2 bg-indigo-600' : i === current ? 'w-6 h-2 bg-indigo-400' : 'w-2 h-2 bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function AIWelcome() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0); // 0=welcome, 1=goals, 2=time, 3=ai-info, 4=first-action
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const navigate = useNavigate();
  const { t } = useI18n();
  const GOALS = makeGoals(t);
  const TIME_OPTIONS = makeTimeOptions(t);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser({ id: 'guest' }));
  }, []);

  const toggleGoal = (key) => {
    setSelectedGoals(prev => prev.includes(key) ? prev.filter(g => g !== key) : [...prev, key]);
  };

  const saveAndContinue = async () => {
    if (user && user.id !== 'guest') {
      await base44.auth.updateMe({
        ai_onboarding_completed: true,
        onboarding_goals: selectedGoals,
        onboarding_time: selectedTime,
      }).catch(() => null);
    }
    // Route by top goal
    if (selectedGoals.includes('sermon_prep')) {
      navigate(createPageUrl('SermonBuilder'));
    } else if (selectedGoals.includes('deeper_study')) {
      navigate(createPageUrl('AIEnhancedBibleStudy'));
    } else if (selectedGoals.includes('foundations')) {
      navigate(createPageUrl('GlobalBiblicalLeadershipInstitute'));
    } else {
      navigate(createPageUrl('Daily'));
    }
  };

  const handleSkip = async () => {
    if (user && user.id !== 'guest') {
      await base44.auth.updateMe({ ai_onboarding_completed: true }).catch(() => null);
    }
    navigate(createPageUrl('Home'));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F8FC' }}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="ltr" style={{ background: '#F7F8FC' }}>
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-3" style={{ background: '#6C5CE7' }}>
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <p className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">FaithLight</p>
        </div>

        <ProgressDots current={step} />

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

          {/* Step 0 — Welcome */}
           {step === 0 && (
             <div className="text-center space-y-6">
               <div>
                 <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('welcome.title', 'Grow in Scripture — Every Day')}</h1>
                 <p className="text-gray-500 text-sm leading-relaxed">
                   {t('welcome.description', 'Read, listen, and study Scripture with AI-assisted study tools. FaithLight is your companion for daily engagement with God\'s Word.')}
                 </p>
               </div>
               <div className="grid grid-cols-3 gap-3 py-2">
                 {[
                   { icon: BookOpen, label: t('welcome.readAndStudy', 'Read & Study') },
                   { icon: Volume2, label: t('welcome.listenOffline', 'Listen Offline') },
                   { icon: Brain, label: t('welcome.aiTools', 'AI Tools') },
                 ].map(({ icon: Icon, label }) => (
                   <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-indigo-50">
                     <Icon className="w-5 h-5 text-indigo-600" />
                     <span className="text-xs font-medium text-indigo-700">{label}</span>
                   </div>
                 ))}
               </div>
               <Button className="w-full h-12 text-base" style={{ background: '#6C5CE7' }} onClick={() => setStep(1)}>
                 {t('welcome.getStarted', 'Get Started')}
               </Button>
               <button onClick={handleSkip} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                 {t('welcome.skipForNow', 'Skip for now')}
               </button>
             </div>
           )}

          {/* Step 1 — Goals */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{t('focus.title', 'What would you like to focus on?')}</h2>
                <p className="text-sm text-gray-500">{t('focus.description', 'Select one or more. This personalizes your experience.')}</p>
              </div>
              <div className="space-y-2">
                {GOALS.map(({ key, icon: Icon, label, desc }) => {
                  const selected = selectedGoals.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleGoal(key)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${selected ? 'bg-[#EEEAFE]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      style={selected ? { borderColor: '#6C5CE7' } : {}}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? 'text-white' : 'bg-gray-100'}`} style={selected ? { background: '#6C5CE7' } : {}}>
                          <Icon className={`w-4 h-4 ${selected ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${selected ? 'text-[#5B4BD6]' : 'text-gray-800'}`}>{label}</p>
                        <p className="text-xs text-gray-500 truncate">{desc}</p>
                      </div>
                      {selected && <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#6C5CE7' }} />}
                    </button>
                  );
                })}
              </div>
              <Button
                className="w-full h-11"
                style={{ background: '#6C5CE7' }}
                onClick={() => setStep(2)}
                disabled={selectedGoals.length === 0}
              >
                {t('focus.continue', 'Continue')}
              </Button>
              <button onClick={handleSkip} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors">
                {t('focus.skipForNow', 'Skip for now')}
              </button>
            </div>
          )}

          {/* Step 2 — Time */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{t('time.title', 'How much time per day?')}</h2>
                <p className="text-sm text-gray-500">{t('time.description', 'This helps us suggest the right plan length for you.')}</p>
              </div>
              <div className="space-y-3">
                {TIME_OPTIONS.map(({ key, label, sublabel }) => {
                  const selected = selectedTime === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedTime(key)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${selected ? 'bg-[#EEEAFE]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      style={selected ? { borderColor: '#6C5CE7' } : {}}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${selected ? 'text-white' : 'bg-gray-100 text-gray-600'}`} style={selected ? { background: '#6C5CE7' } : {}}>
                          {key}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${selected ? 'text-[#5B4BD6]' : 'text-gray-800'}`}>{label}</p>
                        <p className="text-xs text-gray-500">{sublabel}</p>
                      </div>
                      {selected && <CheckCircle className="w-5 h-5 flex-shrink-0 ml-auto" style={{ color: '#6C5CE7' }} />}
                    </button>
                  );
                })}
              </div>
              <Button
                className="w-full h-11"
                style={{ background: '#6C5CE7' }}
                onClick={() => setStep(3)}
                disabled={!selectedTime}
              >
                {t('time.continue', 'Continue')}
              </Button>
              <button onClick={handleSkip} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors">
                {t('time.skipForNow', 'Skip for now')}
              </button>
            </div>
          )}

          {/* Step 3 — AI Explanation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 mb-4">
                  <Brain className="w-7 h-7 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{t('ai.title', 'How AI helps your study')}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t('ai.description', 'FaithLight uses AI to assist your learning — not to define theology.')}
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { label: t('ai.outlines', 'Generates study outlines'), desc: t('ai.outlinesDesc', 'Topic-based plans tailored to your goals') },
                  { label: t('ai.passages', 'Explains difficult passages'), desc: t('ai.passagesDesc', 'Educational context to aid understanding') },
                  { label: t('ai.sermon', 'Assists sermon preparation'), desc: t('ai.sermonDesc', 'Structured outlines with Scripture references') },
                  { label: t('ai.quizzes', 'Creates Bible quizzes'), desc: t('ai.quizzesDesc', 'Reinforce what you have studied') },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
                {t('ai.disclaimer', 'AI supports learning — Scripture remains the authority. AI-generated content should be considered alongside personal study and church teaching.')}
              </div>
              <Button className="w-full h-11" style={{ background: '#6C5CE7' }} onClick={() => setStep(4)}>
                {t('common.continue', 'Continue')}
              </Button>
            </div>
          )}

          {/* Step 4 — First Action */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{t('action.title', 'You\'re ready to begin')}</h2>
                <p className="text-sm text-gray-500">{t('action.subtitle', 'Choose where you\'d like to start today.')}</p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Sun, label: t('action.daily', 'Today\'s daily reading'), sublabel: t('action.dailyDesc', 'Your personalized verse for today'), dest: 'Daily', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { icon: Brain, label: t('action.plan', 'My personalized study plan'), sublabel: t('action.planDesc', 'AI-suggested plan based on your goals'), dest: 'BibleStudyPlans', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { icon: Volume2, label: t('action.audio', 'Audio Bible'), sublabel: t('action.audioDesc', 'Listen to Scripture offline'), dest: 'AudioBibleV2', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: BookOpen, label: t('action.reader', 'Bible Reader'), sublabel: t('action.readerDesc', 'Start reading Scripture now'), dest: 'BibleReader', color: 'text-green-600', bg: 'bg-green-50' },
                ].map(({ icon: Icon, label, sublabel, dest, color, bg }) => (
                  <button
                    key={dest}
                    onClick={async () => {
                      if (user && user.id !== 'guest') {
                        await base44.auth.updateMe({ ai_onboarding_completed: true }).catch(() => null);
                      }
                      navigate(createPageUrl(dest));
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 bg-white text-left transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">{sublabel}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button className="w-full h-11 bg-gray-100 hover:bg-gray-200 text-gray-700" variant="ghost" onClick={saveAndContinue}>
                {t('action.dashboard', 'Go to Dashboard')}
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}