import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { useI18n } from '@/components/I18nProvider';
import LanguageDropdown from './LanguageDropdown';
import IOSBackButton from './iOSBackButton.jsx';
import UserAvatar from './user/UserAvatar';
import { base44 } from '@/api/base44Client';

// Pages that show the FaithLight logo in the header
const LOGO_PAGES = new Set(['Home', 'BibleReaderPage', 'AIHub', 'Saved', 'UserProfile']);
// Pages where the header is hidden entirely (they have their own full-screen headers)
const HIDDEN_PAGES = new Set([]);

// Helper to translate page titles using language context
const PAGE_TITLES = {
  en: {
    BibleReaderPage: 'Bible', AIHub: 'AI Study', Saved: 'Saved', UserProfile: 'Profile',
    FamilyLink: 'Family Link', AIPrayerJournal: 'Prayer Journal', FaithWidget: 'Verse Widget',
    SermonAnalyzer: 'Sermon Analyzer', MentorshipHub: 'Mentorship', BibleMarathon: 'Bible Marathon',
    LivePrayerRoom: 'Live Prayer', PersonalPrayerJournal: 'Prayer Journal', PrayerCirclesPage: 'Prayer Circles',
    FaithXPDashboard: 'Faith XP', BibleProgressDashboard: 'Reading Progress', LanguageValidationDashboard: 'Language Validation',
    BibleJournal: 'Bible Journal', MyJournal: 'My Journal', MyHighlights: 'Highlights', ReadingPlans: 'Reading Plans',
    Quiz: 'Bible Quiz', Leaderboard: 'Leaderboard', BibleSearch: 'Search', NotificationSettings: 'Notifications',
    Settings: 'Settings', UserSettings: 'Settings', DailyDevotional: 'Daily Devotional', FaithRoutineHub: 'Faith Routine',
    OfflineContentManager: 'Offline Content', MobileDeployGuide: 'Deploy Guide', StudyGroupChat: 'Study Group',
    OfflineReadingManager: 'Offline Reading', About: 'About', PrayerJournalPage: 'Prayer Journal', OfflineAudioLibrary: 'Audio Library',
    PrayerReminderSettings: 'Prayer Reminders', QuizChallenge: 'Quiz Challenge', SavedVerses: 'Saved Verses',
    DailyReflection: 'Daily Reflection', CommunityPrayerBoard: 'Community Prayer', CommunityPrayerBoardPage: 'Community Prayer',
    PrayerJournal: 'Prayer Journal', MyPrayerJournal: 'Prayer Journal', AIBibleGuide: 'AI Bible Guide',
    AccessibilitySettings: 'Accessibility', UpgradePremium: 'Premium', PrivacyPolicy: 'Privacy Policy',
    TermsOfUse: 'Terms of Use', SecurityPolicy: 'Security Policy', Community: 'Community', Forum: 'Forum',
    StudyGroups: 'Study Groups', Groups: 'Groups', FindChurches: 'Find Churches', ChurchFinder: 'Find Churches',
    AudioBible: 'Audio Bible', BibleReader: 'Bible', BibleQuiz: 'Bible Quiz', PrayerWall: 'Prayer Wall',
    Discover: 'Discover', GrowthDashboard: 'Growth', MyPrayerJournal: 'Prayer Journal', ActivityFeed: 'Activity',
  },
  om: {
    BibleReaderPage: 'Macaafa', AIHub: 'Barumsa AI', Saved: 'Olkaasaa', UserProfile: 'Seensa',
    FamilyLink: 'Haadha Maatii', AIPrayerJournal: 'Waraqaa Kadhaa', FaithWidget: 'Widget Ayaata',
    SermonAnalyzer: 'Xiinxala Seermona', MentorshipHub: 'Barsiisa', BibleMarathon: 'Marathoona Macaafaa',
    LivePrayerRoom: 'Kutaa Kadhaa Live', PersonalPrayerJournal: 'Waraqaa Kadhaa', PrayerCirclesPage: 'Moggaa Kadhaa',
    FaithXPDashboard: 'XP Amantii', BibleProgressDashboard: 'Haala Dubbisuu', LanguageValidationDashboard: 'Lakkaachuu Afaan',
    BibleJournal: 'Waraqaa Macaafaa', MyJournal: 'Waraqaa Koo', MyHighlights: 'Ibsa Mijoote', ReadingPlans: 'Plana Dubbisuu',
    Quiz: 'Qormaata Macaafaa', Leaderboard: 'Saafiyaa Hogganaa', BibleSearch: 'Barbaadi', NotificationSettings: 'Qindaa\'ina Beeksisa',
    Settings: 'Qindaa\'ina', UserSettings: 'Qindaa\'ina', DailyDevotional: 'Yaada Guyyaa', FaithRoutineHub: 'Gidduugala Hojii Amantii',
    OfflineContentManager: 'Manaajira Qabeenta Offline', MobileDeployGuide: 'Gargaarsa Baasuu', StudyGroupChat: 'Haala Qophaa Barumsaa',
    OfflineReadingManager: 'Manaajira Dubbisuu Offline', About: 'Waa\'ee', PrayerJournalPage: 'Waraqaa Kadhaa', OfflineAudioLibrary: 'Gidduugala Sagalee Offline',
    PrayerReminderSettings: 'Qindaa\'ina Yaadachiisa Kadhaa', QuizChallenge: 'Qormaata Kadhaa', SavedVerses: 'Ayaata Olkaasaa',
    DailyReflection: 'Yaada Guyyaa', CommunityPrayerBoard: 'Saafiyaa Kadhaa Hawaasaa', CommunityPrayerBoardPage: 'Saafiyaa Kadhaa Hawaasaa',
    PrayerJournal: 'Waraqaa Kadhaa', MyPrayerJournal: 'Waraqaa Kadhaa Koo', AIBibleGuide: 'Gargaarsa AI Macaafaa',
    AccessibilitySettings: 'Qindaa\'ina Wal\'aansiinsa', UpgradePremium: 'Seera Premium', PrivacyPolicy: 'Imaammata Iccitii',
    TermsOfUse: 'Haala Fayyadamaa', SecurityPolicy: 'Imaammata Jidha', Community: 'Hawaasa', Forum: 'Forum',
    StudyGroups: 'Gareen Barumsa', Groups: 'Gareen', FindChurches: 'Mana Raajii Barbaadi', ChurchFinder: 'Mana Raajii Barbaadi',
    AudioBible: 'Macaafa Sagalee', BibleReader: 'Macaafa', BibleQuiz: 'Qormaata Macaafaa', PrayerWall: 'Balbala Kadhaa',
    Discover: 'Argamsa', GrowthDashboard: 'Haala Guddina', MyPrayerJournal: 'Waraqaa Kadhaa Koo', ActivityFeed: 'Hojii',
  },
  am: {
    BibleReaderPage: 'ቅዱስ ኪዳን', AIHub: 'የ AI ጥናት', Saved: 'የተቀመጠ', UserProfile: 'መገለጫ',
    About: 'ስለ', Settings: 'ቅንብር', DailyDevotional: 'ዕለታዊ ምግባር', ReadingPlans: 'የንባብ திட្ដ',
    BibleSearch: 'ፍለግ', AudioBible: 'የድምጽ ቅዱስ ኪዳን', PrayerJournal: 'የጸሎት ያታሪክ', MyPrayerJournal: 'የጸሎት ያታሪክ ኩ', ActivityFeed: 'ተግባር',
  }
};

const getPageTitle = (pageName, language) => {
  return PAGE_TITLES[language]?.[pageName] ?? PAGE_TITLES.en[pageName] ?? pageName?.replace(/([A-Z])/g, ' $1').trim();
};

export default function Header({ currentPageName }) {
  // Add data-header attribute for screenshot mode
  const headerRef = React.useRef(null);
  const { language } = useLanguage();
  const { t } = useI18n();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
    const handler = () => base44.auth.me().then(setCurrentUser).catch(() => {});
    window.addEventListener('profile-image-updated', handler);
    return () => window.removeEventListener('profile-image-updated', handler);
  }, []);

  const isLogoPage = LOGO_PAGES.has(currentPageName);
  const isHidden = HIDDEN_PAGES.has(currentPageName);
  const pageTitle = getPageTitle(currentPageName, language);

  if (isHidden) return null;

  return (
    <header
      ref={headerRef}
      data-header="true"
      role="banner"
      className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 sm:px-4 overflow-x-hidden"
      style={{ height: 'calc(56px + env(safe-area-inset-top))', paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Left: back button or logo */}
      <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
        <IOSBackButton currentPageName={currentPageName} />

        {isLogoPage ? (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-white font-bold text-sm">FL</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">FaithLight</span>
          </div>
        ) : (
          <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate leading-tight">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right: language selector + notifications bell */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <LanguageDropdown />

        {isLogoPage && (
          <Link
            to="/NotificationsHub"
            aria-label={t('header.viewNotifications', 'View notifications')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
          </Link>
        )}
        {isLogoPage && (
          <Link to="/UserProfile" aria-label={t('header.viewProfile', 'View your profile')} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <UserAvatar
              imageUrl={currentUser?.profileImageUrl}
              name={currentUser?.full_name}
              size="sm"
              rounded="full"
              className="ring-2 ring-gray-200 hover:ring-indigo-400 transition-all"
            />
          </Link>
        )}
      </div>
    </header>
  );
}