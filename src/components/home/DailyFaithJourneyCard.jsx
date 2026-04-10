import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useI18n } from '@/components/I18nProvider';
import { Button } from '@/components/ui/button';
import { Flame, CheckCircle2 } from 'lucide-react';

export default function DailyFaithJourneyCard() {
  const { lang, t } = useI18n();
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastCompleted = localStorage.getItem('faithlight_journey_date');
    setCompleted(lastCompleted === today);

    const streakCount = parseInt(localStorage.getItem('faithlight_journey_streak') || '0');
    setStreak(streakCount);
  }, []);

  const labels = {
    en: {
      title: 'Daily Faith Journey',
      subtitle: 'Your 5-minute spiritual guide',
      btn: 'Start Journey',
      btn_done: 'Completed Today',
      streak: 'Day Streak',
    },
    om: {
      title: 'Imala Aaraaraa Jidhadhii',
      subtitle: 'Imaala spiirituaalaa dhiqdhaqtaa keessan',
      btn: 'Imala Jalqabi',
      btn_done: 'Har\'a Xummame',
      streak: 'Guyyaa Walitti Hiriira',
    },
    am: {
      title: 'ዕለታዊ ምሕረት ጉዞ',
      subtitle: 'የእርስዎ 5-ደቂቃ መንፈስ መምሪያ',
      btn: 'ጉዞ ይጀምሩ',
      btn_done: 'ዛሬ ተጠናቀቀ',
      streak: 'ቀን ተከታታይ',
    },
    ar: {
      title: 'رحلة الإيمان اليومية',
      subtitle: 'دليلك الروحي لمدة 5 دقائق',
      btn: 'ابدأ الرحلة',
      btn_done: 'مكتمل اليوم',
      streak: 'يوم متتالي',
    },
    sw: {
      title: 'Safari ya Imani ya Kila Siku',
      subtitle: 'Mwongozo wako wa roho kwa dakika 5',
      btn: 'Anza Safari',
      btn_done: 'Kumalizwa Leo',
      streak: 'Siku Mfuatano',
    },
    fr: {
      title: 'Voyage de Foi Quotidien',
      subtitle: 'Votre guide spirituel de 5 minutes',
      btn: 'Commencer le Voyage',
      btn_done: 'Complété Aujourd\'hui',
      streak: 'Jours Consécutifs',
    },
  };

  const label = labels[lang] || labels.en;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{label.title}</h3>
          <p className="text-indigo-100 text-sm mt-1">{label.subtitle}</p>
        </div>
        <div className="text-3xl">✨</div>
      </div>

      {/* Streak Counter */}
      {streak > 0 && (
        <div className="flex items-center gap-2 mb-4 bg-white/20 rounded-lg px-3 py-2 w-fit">
          <Flame className="w-4 h-4 text-amber-300" />
          <span className="font-semibold text-sm">{streak} {label.streak}</span>
        </div>
      )}

      {/* CTA Button */}
      <Link to={createPageUrl('DailyFaithJourney')}>
        <Button
          className={`w-full ${
            completed
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-white hover:bg-gray-100 text-indigo-600 font-semibold'
          }`}
        >
          {completed ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {label.btn_done}
            </>
          ) : (
            label.btn
          )}
        </Button>
      </Link>
    </div>
  );
}