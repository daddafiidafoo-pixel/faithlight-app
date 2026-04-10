import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useI18n } from '@/components/I18nProvider';
import { format } from 'date-fns';

export default function GlobalStudyCard() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [study, setStudy] = useState(null);
  const todayKey = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    base44.entities.GlobalDailyStudy.filter({ dateKey: todayKey })
      .then(studies => { if (studies?.length > 0) setStudy(studies[0]); })
      .catch(() => {});
  }, []);

  const verseText = study ? (study[`verseText_${lang}`] || study.verseText_en || '') : '';

  return (
    <div
      className="rounded-3xl overflow-hidden shadow-xl cursor-pointer active:scale-[0.99] transition-transform"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 55%, #4f46e5 100%)' }}
      onClick={() => navigate(createPageUrl('GlobalStudyRoom'))}
    >
      <div className="px-5 pt-5 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌍</span>
          <div>
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Global Study Today</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-300 text-xs font-semibold">
                {study ? ((study.participantCount || 0) + 12847).toLocaleString() : '…'} believers studying
              </span>
            </div>
          </div>
        </div>

        {/* Verse */}
        {study ? (
          <>
            <h2 className="text-white text-xl font-bold">{study.reference}</h2>
            {study.topic && <p className="text-indigo-300 text-xs font-medium">{study.topic}</p>}
            <p className="text-white/80 text-sm italic leading-relaxed line-clamp-2">"{verseText}"</p>
          </>
        ) : (
          <div className="space-y-2 py-1">
            <div className="h-5 bg-white/20 rounded-lg animate-pulse w-1/3" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
          </div>
        )}

        {/* Language flags strip */}
        <div className="flex gap-1.5 text-lg">
          {['🇺🇸','🇪🇹','🇫🇷','🇸🇦','🇰🇪','🇧🇷'].map((f, i) => (
            <span key={i} className="opacity-70 hover:opacity-100 transition-opacity">{f}</span>
          ))}
          <span className="text-indigo-300 text-xs font-medium self-center ml-1">+more</span>
        </div>

        {/* CTAs */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(createPageUrl('GlobalStudyRoom')); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-indigo-900 bg-white hover:bg-indigo-50 transition-colors"
          >
            💬 Join Discussion
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(createPageUrl('GlobalStudyRoom')); }}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/15 hover:bg-white/25 transition-colors"
          >
            🙏 Pray
          </button>
        </div>
      </div>
    </div>
  );
}