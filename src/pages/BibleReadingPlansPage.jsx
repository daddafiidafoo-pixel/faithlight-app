import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguageStore } from '@/components/languageStore';
import { BookOpen, Check, Plus, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const UI = {
  en: {
    title: 'Bible Reading Plans',
    subtitle: 'Structured journeys through Scripture',
    myPlans: 'My Active Plans',
    browsePlans: 'Browse Plans',
    join: 'Join Plan',
    joined: 'Active',
    days: (n) => `${n}-day plan`,
    progress: (done, total) => `Day ${done} of ${total}`,
    complete: 'Completed',
    loading: 'Loading plans...',
    noPlans: 'No plans yet. Browse below to get started.',
    continue: 'Continue',
    resume: 'Resume',
    markRead: 'Mark Chapter Read',
    done: 'Done',
  },
  om: {
    title: 'Karoora Dubbisuu Macaafa Qulqulluu',
    subtitle: 'Imala qindaa\'aa Macaafa Qulqulluu keessa',
    myPlans: 'Karoora Koo Isa Ammaa',
    browsePlans: 'Karoora Ilaalaa',
    join: 'Karoora Makame',
    joined: 'Hojii Irra',
    days: (n) => `Karoora guyyaa ${n}`,
    progress: (done, total) => `Guyyaa ${done} / ${total}`,
    complete: 'Xumurame',
    loading: 'Karoori fe\'amaa jira...',
    noPlans: 'Karoora hin jiru. Armaan gaditti ilaalaa.',
    continue: 'Itti Fufi',
    resume: 'Deebi\'i',
    markRead: 'Boqonnaa Dubbisameen Mallatteessi',
    done: 'Ta\'e',
  },
  am: {
    title: 'የመጽሐፍ ቅዱስ ንባብ እቅዶች',
    subtitle: 'ሥርዓት ያለው የቅዱስ ቃል ጉዞ',
    myPlans: 'ንቁ እቅዶቼ',
    browsePlans: 'እቅዶችን ያስሱ',
    join: 'እቅድ ይቀላቀሉ',
    joined: 'ንቁ',
    days: (n) => `${n}-ቀን እቅድ`,
    progress: (done, total) => `ቀን ${done} / ${total}`,
    complete: 'ተጠናቋል',
    loading: 'እቅዶች እየተጫኑ ነው...',
    noPlans: 'ምንም እቅድ የለም። ከዚህ በታች ያስሱ።',
    continue: 'ቀጥል',
    resume: 'ቀጥል',
    markRead: 'ምዕራፍ ተነበበ ምልክት',
    done: 'ተጠናቋል',
  },
};

const getL = (lang) => UI[lang] || UI.en;

const BUILT_IN_PLANS = [
  {
    id: 'genesis-30',
    title: 'Genesis in 30 Days',
    topic: 'Creation & Origins',
    emoji: '🌱',
    description: 'Walk through the book of beginnings.',
    duration_days: 30,
    readings: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1, book_id: 'GEN', book_name: 'Genesis', chapter: i + 1,
      reference: `Genesis ${i + 1}`,
    })).filter(r => r.chapter <= 50),
  },
  {
    id: 'psalms-30',
    title: 'Psalms of Praise',
    topic: 'Worship & Prayer',
    emoji: '🎵',
    description: '30 days of worship through the Psalms.',
    duration_days: 30,
    readings: [1,2,3,4,5,8,9,13,16,19,22,23,24,27,31,32,34,37,40,46,51,63,73,84,90,91,103,121,139,145].map((ch, i) => ({
      day: i + 1, book_id: 'PSA', book_name: 'Psalms', chapter: ch,
      reference: `Psalms ${ch}`,
    })),
  },
  {
    id: 'john-21',
    title: 'Gospel of John',
    topic: 'Life of Jesus',
    emoji: '✝️',
    description: 'Read the Gospel of John in 21 days.',
    duration_days: 21,
    readings: Array.from({ length: 21 }, (_, i) => ({
      day: i + 1, book_id: 'JHN', book_name: 'John', chapter: i + 1,
      reference: `John ${i + 1}`,
    })),
  },
  {
    id: 'proverbs-31',
    title: 'Wisdom in 31 Days',
    topic: 'Wisdom & Guidance',
    emoji: '💡',
    description: 'One chapter of Proverbs each day.',
    duration_days: 31,
    readings: Array.from({ length: 31 }, (_, i) => ({
      day: i + 1, book_id: 'PRO', book_name: 'Proverbs', chapter: i + 1,
      reference: `Proverbs ${i + 1}`,
    })),
  },
];

export default function BibleReadingPlansPage() {
  const { user, isAuthenticated } = useAuth();
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const L = getL(uiLanguage);
  const navigate = useNavigate();

  const [myPlans, setMyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  const loadMyPlans = async () => {
    if (!isAuthenticated || !user?.email) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await base44.entities.UserReadingPlanProgress.filter(
        { user_email: user.email }, '-started_at', 20
      );
      setMyPlans(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadMyPlans(); }, [user?.email]);

  const isJoined = (planId) => myPlans.some(p => p.plan_id === planId);

  const handleJoin = async (plan) => {
    if (!isAuthenticated || joiningId) return;
    if (isJoined(plan.id)) {
      // Navigate to continue
      const myPlan = myPlans.find(p => p.plan_id === plan.id);
      const nextDay = (myPlan?.completed_days?.length || 0);
      const reading = plan.readings[nextDay];
      if (reading) navigate(`/BibleReaderPage?book_id=${reading.book_id}&chapter=${reading.chapter}`);
      return;
    }
    setJoiningId(plan.id);
    try {
      await base44.entities.UserReadingPlanProgress.create({
        user_email: user.email,
        plan_id: plan.id,
        plan_title: plan.title,
        plan_topic: plan.topic,
        plan_emoji: plan.emoji,
        plan_duration_days: plan.duration_days,
        completed_days: [],
        started_at: new Date().toISOString(),
        is_completed: false,
      });
      await loadMyPlans();
    } catch {}
    setJoiningId(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F6F1' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">{L.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{L.subtitle}</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 pb-28 space-y-6">

        {/* My Active Plans */}
        {isAuthenticated && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">{L.myPlans}</h2>
            {loading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-sm text-gray-400">{L.loading}</span>
              </div>
            ) : myPlans.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">{L.noPlans}</p>
            ) : (
              <div className="space-y-3">
                {myPlans.map(mp => {
                  const plan = BUILT_IN_PLANS.find(p => p.id === mp.plan_id) || { readings: [] };
                  const done = mp.completed_days?.length || 0;
                  const total = mp.plan_duration_days;
                  const pct = Math.round((done / total) * 100);
                  const nextReading = plan.readings?.[done];
                  return (
                    <motion.div key={mp.id} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{mp.plan_emoji}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{mp.plan_title}</p>
                          <p className="text-xs text-gray-400">{L.progress(done, total)}</p>
                        </div>
                        <span className="text-xs font-bold text-purple-600">{pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full mb-3">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      {nextReading && (
                        <button
                          onClick={() => navigate(`/BibleReaderPage?book_id=${nextReading.book_id}&chapter=${nextReading.chapter}`)}
                          className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold flex items-center justify-center gap-2 min-h-[44px]"
                        >
                          <BookOpen className="w-4 h-4" />
                          {L.continue}: {nextReading.reference}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Browse Plans */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">{L.browsePlans}</h2>
          <div className="space-y-3">
            {BUILT_IN_PLANS.map(plan => {
              const joined = isJoined(plan.id);
              return (
                <div key={plan.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl mt-0.5">{plan.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{plan.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                        {L.days(plan.duration_days)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleJoin(plan)}
                      disabled={joiningId === plan.id}
                      className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold min-h-[44px] transition-all ${
                        joined
                          ? 'bg-green-50 text-green-600 border border-green-200'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {joiningId === plan.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : joined
                        ? <><Check className="w-4 h-4" /> {L.joined}</>
                        : <><Plus className="w-4 h-4" /> {L.join}</>
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}