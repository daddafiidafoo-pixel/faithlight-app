import React, { useState, useEffect, useRef } from 'react';
import { Flame, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useI18n } from '../I18nProvider';
import confetti from 'canvas-confetti';

const OM = {
  'streak.startToday': "Har'a tartiiba amantii kee jalqabi!",
  'streak.day1': "Har'a Sagalee Waaqayyoo keessa turteetta!",
  'streak.faithStreak': 'Tartiiba Amantii',
  'streak.dayFaithStreak': 'Guyyaa Tartiiba Amantii',
  'streak.todayDone': "Har'a xumurameera!",
  'streak.readToday': "Har'a dubbisi",
};

function launchConfetti() {
  const end = Date.now() + 1400;
  const colors = ['#FF6B35', '#FFD700', '#FF8C00', '#22C55E', '#6366F1'];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

export default function FaithStreakBanner({ user }) {
  const { t, lang } = useI18n();
  const tr = (key, fallback) => lang === 'om' && OM[key] ? OM[key] : t(key, fallback);
  const [stats, setStats] = useState(null);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [goalJustMet, setGoalJustMet] = useState(false);
  const prevDoneRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const res = await base44.functions.invoke('getUserStats', {});
        setStats(res.data?.stats || null);

        const today = new Date().toISOString().split('T')[0];
        const [reading, listening] = await Promise.all([
          base44.entities.ReadingSessions.filter({ user_id: user.id, date: today }).catch(() => []),
          base44.entities.ListeningSessions.filter({ user_id: user.id, date: today }).catch(() => []),
        ]);
        const mins = reading.reduce((s, r) => s + (r.readingMinutes || 0), 0)
                   + listening.reduce((s, r) => s + (r.listeningMinutes || 0), 0);
        setTodayMinutes(mins);
      } catch {}
    };
    load();
  }, [user?.id]);

  const streak = stats?.currentStreak || 0;
  const todayDone = todayMinutes >= 3;
  const streakActive = streak > 0;

  // Fire confetti exactly once when daily goal is freshly met
  useEffect(() => {
    if (todayDone && !prevDoneRef.current && stats !== null) {
      prevDoneRef.current = true;
      setGoalJustMet(true);
      launchConfetti();
      const t = setTimeout(() => setGoalJustMet(false), 3000);
      return () => clearTimeout(t);
    }
    if (!todayDone) prevDoneRef.current = false;
  }, [todayDone, stats]);

  const getMessage = () => {
    if (streak === 0) return tr('streak.startToday', 'Start your faith streak today!');
    if (streak === 1) return tr('streak.day1', "You've spent time in God's word today!");
    if (streak < 7) {
      if (lang === 'om') return `Guyyaa ${streak}f itti fufinsaan Sagalee Waaqayyoo waliin turteetta.`;
      return t('streak.daysRow', `You have spent time with God's word for ${streak} days in a row.`);
    }
    if (streak < 30) {
      if (lang === 'om') return `Ajaa'iba! Guyyaa ${streak} amantoota irratti itti fuftee!`;
      return t('streak.amazing', `Amazing! ${streak} days of faithfulness in a row!`);
    }
    if (lang === 'om') return `Dinqisiifatamaa! Waaqayyoo waliin guyyaa ${streak} deemteetta!`;
    return t('streak.incredible', `Incredible! ${streak} days walking with God!`);
  };

  if (!user || !stats) return null;

  return (
    <div
      className={`rounded-2xl p-4 mb-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden
        ${goalJustMet ? 'scale-[1.02] shadow-lg' : ''}`}
      style={{
        background: streakActive
          ? 'linear-gradient(135deg, #FF6B35 0%, #FF8C00 100%)'
          : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      }}
      onClick={() => navigate(createPageUrl('BibleReader'))}
    >
      {/* Goal-met celebration overlay */}
      {goalJustMet && (
        <div className="absolute inset-0 bg-white/10 animate-pulse rounded-2xl pointer-events-none" />
      )}

      <div className="flex items-center gap-3">
        <div className="relative">
          {/* Flame with glow when streak active */}
          <div className={`${streakActive ? 'drop-shadow-[0_0_8px_rgba(255,200,0,0.8)]' : ''} transition-all`}>
            <Flame className={`w-10 h-10 ${streakActive ? 'text-yellow-200' : 'text-indigo-200'} ${goalJustMet ? 'animate-bounce' : ''}`} />
          </div>
          {streakActive && (
            <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-gray-900 text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow">
              {streak > 99 ? '99+' : streak}
            </span>
          )}
        </div>
        <div>
          <p className="text-white font-bold text-sm">
            {streakActive
              ? `🔥 ${streak} ${tr('streak.dayFaithStreak', 'Day Faith Streak')}`
              : `🔥 ${tr('streak.faithStreak', 'Faith Streak')}`}
          </p>
          <p className="text-white/80 text-xs mt-0.5 leading-tight max-w-[220px]">
            {goalJustMet ? '🎉 Daily goal complete! Keep it up!' : getMessage()}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        {todayDone ? (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
            ${goalJustMet ? 'bg-yellow-300 scale-110' : 'bg-white/20'}`}>
            <span className="text-white text-lg">✓</span>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white/60" />
          </div>
        )}
        <p className="text-white/70 text-[10px]">
          {todayDone ? tr('streak.todayDone', 'Today done!') : tr('streak.readToday', 'Read today')}
        </p>
      </div>
    </div>
  );
}