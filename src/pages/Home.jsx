import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoonStar } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import PullToRefresh from '@/components/PullToRefresh';
import { refreshHomePage } from '@/utils/pageRefreshHandlers';
import FirstTimeOnboarding from '@/components/onboarding/FirstTimeOnboarding';
import ContinueReadingSection from '@/components/home/ContinueReadingSection';
import VerseOfDayCardNew from '@/components/home/VerseOfDayCardNew';
import QuickActionsGrid from '@/components/home/QuickActionsGrid';
import FeaturedCardsSection from '@/components/home/FeaturedCardsSection';
import HeroSearchSection from '@/components/home/HeroSearchSection';
import SectionTitle from '@/components/home/SectionTitleComponent';
import Footer from '@/components/Footer';
import ReadingStreakWidget from '@/components/home/ReadingStreakWidget';
import DailyDevotionalCard from '@/components/home/DailyDevotionalCard';
import TodaysCelebrationBanner from '@/components/holidays/TodaysCelebrationBanner';
import { scheduleHolidayNotifications } from '@/utils/holidayNotificationService';
import { getChristianHolidays } from '@/utils/holidayService';
import StudyToolsSection from '@/components/home/StudyToolsSection';

/**
 * Map UI language to verse service language code
 */
function mapLanguageToCode(uiLanguage) {
  const mapping = {
    'en': 'en',
    'om': 'om',
    'am': 'am',
    'fr': 'fr',
    'sw': 'sw',
    'ar': 'ar',
    'ti': 'ti'
  };
  return mapping[uiLanguage] || 'en';
}

const translations = {
  en: {
    appName: 'FaithLight',
    welcome: 'Grow in faith every day',
    studyTools: 'Study Tools',
    searchTitle: 'Search Scripture',
    searchHeadline: 'Find comfort, truth, and hope.',
    searchSubtext: 'Search verses, prayers, and devotionals in your language.',
    searchPlaceholder: 'Search verses, topics, prayers...',
    searchButton: 'Search',
    quickActions: 'Quick Actions',
    featured: 'Featured',
    continueReading: 'Continue Reading',
  },
  om: {
    appName: 'FaithLight',
    welcome: 'Guyyaa guyyaan amantii keessatti guddadhu',
    studyTools: 'Meeshaalee Barumsa',
    searchTitle: 'Caaffata Qulqullaa\'aa Barbaadi',
    searchHeadline: 'Jajjabina, dhugaa fi abdii argadhu.',
    searchSubtext: 'Aayata, kadhannaa fi barsiisa afaan keetiin barbaadi.',
    searchPlaceholder: 'Aayata, mata duree, kadhannaa barbaadi...',
    searchButton: 'Barbaadi',
    quickActions: 'Gochawwan Ariifachiisaa',
    featured: 'Kan Filataman',
    continueReading: 'Dubbisuu Itti Fufi',
  },
  am: {
    appName: 'FaithLight',
    welcome: 'በየቀኑ በእምነት ውስጥ ያድጉ',
    studyTools: 'የጥናት መሳሪያዎች',
    searchTitle: 'ቅዱሳት መጻሕፍትን ፈልጉ',
    searchHeadline: 'ማጽናኛ፣ እውነት እና ተስፋ ያግኙ።',
    searchSubtext: 'ጥቅሶችን፣ ጸሎቶችን እና ምክሮችን በቋንቋዎ ፈልጉ።',
    searchPlaceholder: 'ጥቅሶችን፣ ርዕሶችን፣ ጸሎቶችን ፈልጉ...',
    searchButton: 'ፈልግ',
    quickActions: 'ፈጣን ድርጊቶች',
    featured: 'ተለይተው የቀረቡ',
    continueReading: 'ማንበብ ቀጥሉ',
  },
};

export default function Home() {
  const navigate = useNavigate();
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('faithlight_onboarding_dismissed');
    if (!dismissed) {
      setShowOnboarding(true);
    }
    
    // Schedule holiday notifications
    const year = new Date().getFullYear();
    const holidays = getChristianHolidays(year);
    scheduleHolidayNotifications(holidays);
  }, []);

  const handleOnboardingDismiss = () => {
    setShowOnboarding(false);
    localStorage.setItem('faithlight_onboarding_dismissed', '1');
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshHomePage({
        reloadVerse: async () => {
          // Verse of day will refresh on next render
        },
        reloadReflection: async () => {
          // Reflection/devotional will refresh on next render
        },
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  const t = translations[uiLanguage] ?? translations.en;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-[rgb(248,248,252)] text-slate-900 pb-24">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 px-4 pb-3 pt-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-violet-500 text-white shadow-sm">
              <MoonStar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-900">{t.appName}</h1>
              <p className="text-xs text-slate-500">{t.welcome}</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-4 pt-4 space-y-6">
        <TodaysCelebrationBanner />
        <VerseOfDayCardNew selectedLanguage={mapLanguageToCode(uiLanguage)} />
        <DailyDevotionalCard />
        <ReadingStreakWidget />
        <HeroSearchSection t={t} navigate={navigate} />
        <div>
          <SectionTitle title={t.quickActions} />
          <QuickActionsGrid t={t} navigate={navigate} />
        </div>
        <div>
          <SectionTitle title={t.featured} />
          <FeaturedCardsSection t={t} navigate={navigate} />
        </div>
        <div>
          <SectionTitle title={t.continueReading} />
          <ContinueReadingSection />
        </div>
        <div>
          <SectionTitle title={t.studyTools} />
          <StudyToolsSection />
        </div>
        <Footer />
      </div>

        {showOnboarding && <FirstTimeOnboarding onDismiss={handleOnboardingDismiss} />}
      </div>
    </PullToRefresh>
  );
}