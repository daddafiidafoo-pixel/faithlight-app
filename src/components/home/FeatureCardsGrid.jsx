import React from 'react';
import { BookOpen, Headphones, Sparkles, Heart, CalendarDays, Bookmark, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useI18n } from '../I18nProvider';

const FEATURES = [
  {
    icon: BookOpen,
    labelKey: 'home.continueReading',
    labelDefault: 'Continue Reading',
    descKey: 'home.continueReadingDesc',
    descDefault: 'Continue reading scripture',
    page: 'BibleReader',
    color: '#1E3A8A',
    bg: '#EFF6FF',
    iconColor: '#1E3A8A',
  },
  {
    icon: Headphones,
    labelKey: 'home.audioBible',
    labelDefault: 'Audio Bible',
    descKey: 'home.audioBibleDesc',
    descDefault: 'Listen anywhere offline',
    page: 'AudioBibleV2',
    color: '#7C3AED',
    bg: '#F5F3FF',
    iconColor: '#7C3AED',
  },
  {
    icon: Sparkles,
    labelKey: 'home.aiCompanion',
    labelDefault: 'AI Companion',
    descKey: 'home.aiCompanionDesc',
    descDefault: 'Ask questions about scripture',
    page: 'AIBibleCompanion',
    color: '#D97706',
    bg: '#FFFBEB',
    iconColor: '#D97706',
  },
  {
    icon: Heart,
    labelKey: 'home.dailyPrayer',
    labelDefault: 'Daily Prayer',
    descKey: 'home.dailyPrayerDesc',
    descDefault: 'Daily guided prayers',
    page: 'PrayerWall',
    color: '#DC2626',
    bg: '#FFF1F2',
    iconColor: '#DC2626',
  },
  {
    icon: CalendarDays,
    labelKey: 'home.readingPlans',
    labelDefault: 'Reading Plans',
    descKey: 'home.readingPlansDesc',
    descDefault: 'Structured Bible plans',
    page: 'ReadingPlans',
    color: '#059669',
    bg: '#ECFDF5',
    iconColor: '#059669',
  },
  {
    icon: Bookmark,
    labelKey: 'home.favorites',
    labelDefault: 'Favorites',
    descKey: 'home.favoritesDesc',
    descDefault: 'Saved verses & notes',
    page: 'MyHighlights',
    color: '#0891B2',
    bg: '#ECFEFF',
    iconColor: '#0891B2',
  },
  {
    icon: Target,
    labelKey: 'home.myPlans',
    labelDefault: 'My Plans',
    descKey: 'home.myPlansDesc',
    descDefault: 'Custom reading goals',
    page: 'CustomReadingPlans',
    color: '#7C3AED',
    bg: '#F5F3FF',
    iconColor: '#7C3AED',
  },
];

export default function FeatureCardsGrid() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-gray-900 mb-3">{t('home.explore', 'Explore')}</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.page}
              onClick={() => navigate(createPageUrl(f.page))}
              className="flex flex-col items-start p-4 rounded-2xl border border-gray-100 text-left shadow-sm hover:shadow-md transition-all active:scale-95"
              style={{ backgroundColor: f.bg }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: f.color + '22' }}>
                <Icon className="w-5 h-5" style={{ color: f.iconColor }} />
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {t(f.labelKey, f.labelDefault)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                {t(f.descKey, f.descDefault)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}