import React, { Suspense, lazy, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import PageTransition from '@/components/PageTransition';
import A11yWrapper from '@/components/A11yWrapper';
import { LanguageProvider } from '@/context/LanguageContext';
import AudioProvider from '@/components/audio/AudioProvider';
import { initializeOfflineMode } from '@/lib/offlineInitializer';

// Home page
const HomePage = lazy(() => import('./pages/Home'));

// New feature pages
import CommunityPrayerBoardPage from './pages/CommunityPrayerBoard';
const AboutPage = lazy(() => import('./pages/About'));
const BibleMemorizationPage = lazy(() => import('./pages/BibleMemorizationPage'));
const DailyDevotionalPageOld = lazy(() => import('./pages/DailyDevotional'));
const DailyDevotionalPage = lazy(() => import('./pages/DailyDevotionalPage'));
const FaithRoutineHub = lazy(() => import('./pages/FaithRoutineHub'));
const MobileDeployGuide = lazy(() => import('./pages/MobileDeployGuide'));
const AIPrayerJournal = lazy(() => import('./pages/AIPrayerJournal'));
const OfflineContentManagerPage = lazy(() => import('./pages/OfflineContentManager'));
const FaithXPDashboard = lazy(() => import('./pages/FaithXPDashboard'));
const FamilyLink = lazy(() => import('./pages/FamilyLink'));
const SermonAnalyzerPage = lazy(() => import('./pages/SermonAnalyzer'));
const MentorshipHub = lazy(() => import('./pages/MentorshipHub'));
const BibleMarathon = lazy(() => import('./pages/BibleMarathon'));
const LivePrayerRoom = lazy(() => import('./pages/LivePrayerRoom'));
const PersonalPrayerJournal = lazy(() => import('./pages/PersonalPrayerJournal'));
const PrayerCirclesPage = lazy(() => import('./pages/PrayerCirclesPage'));
const VerseAudioQueue = lazy(() => import('./pages/VerseAudioQueue'));
const PrayerTimeSettings = lazy(() => import('./pages/PrayerTimeSettings'));
const LanguageValidationDashboard = lazy(() => import('./pages/LanguageValidationDashboard'));
const BibleProgressDashboard = lazy(() => import('./pages/BibleProgressDashboard'));
const StudyGroupChat = lazy(() => import('./pages/StudyGroupChat'));
const BibleJournal = lazy(() => import('./pages/BibleJournal'));
const OfflineReadingManager = lazy(() => import('./pages/OfflineReadingManager'));
const ReadingPlansPage = lazy(() => import('./pages/ReadingPlans'));
const MyJournalPage = lazy(() => import('./pages/MyJournal'));
const MyHighlightsPage = lazy(() => import('./pages/MyHighlights'));
const QuizPage = lazy(() => import('./pages/Quiz'));
const LeaderboardPage = lazy(() => import('./pages/Leaderboard'));
const BibleSearchPage = lazy(() => import('./pages/BibleSearch'));
const NotificationSettingsPage = lazy(() => import('./pages/NotificationSettings'));
const SavedPage = lazy(() => import('./pages/Saved'));
const PrayerJournalPage = lazy(() => import('./pages/PrayerJournalPage'));
const OfflineAudioLibraryPage = lazy(() => import('./pages/OfflineAudioLibraryPage'));
const PrayerReminderSettingsPage = lazy(() => import('./pages/PrayerReminderSettings'));
const QuizChallengePage = lazy(() => import('./pages/QuizChallenge'));
const SavedVersesPage = lazy(() => import('./pages/SavedVerses'));
const DailyReflectionPage = lazy(() => import('./pages/DailyReflectionPage'));
const DownloadsPage = lazy(() => import('./pages/Downloads'));
const SermonPreparationPage = lazy(() => import('./pages/SermonPreparation'));
const FaithLightAIChat = lazy(() => import('./pages/FaithLightAIChat'));
const PrivatePrayerJournal = lazy(() => import('./pages/PrivatePrayerJournal'));
const DailyReminderDashboard = lazy(() => import('./pages/DailyReminderDashboard'));
const SavedSermonsPage = lazy(() => import('./pages/SavedSermons'));
const VerseJournalHub = lazy(() => import('./pages/VerseJournalHub'));
const DataExportCenter = lazy(() => import('./pages/DataExportCenter'));
const BibleStudyGroupsHub = lazy(() => import('./pages/BibleStudyGroupsHub'));
const SemanticBibleSearchPage = lazy(() => import('./pages/SemanticBibleSearchPage'));
const SermonNotesPage = lazy(() => import('./pages/SermonNotes'));
const TopicReadingPlansPage = lazy(() => import('./pages/TopicReadingPlans'));
const BibleGroupChatPage = lazy(() => import('./pages/BibleGroupChat'));
const BibleReaderPageNew = lazy(() => import('./pages/BibleReaderPage'));
const BibleSearchPageNew = lazy(() => import('./pages/BibleSearchPage'));
const AudioBiblePageNew = lazy(() => import('./pages/AudioBiblePage'));
const AudioBibleScreenPage = lazy(() => import('./pages/AudioBibleScreen'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfService'));
const AboutPageNew = lazy(() => import('./pages/AboutPage'));
const ReadingPlanDetail = lazy(() => import('./pages/ReadingPlanDetail'));
const ReadingPlansLibraryPage = lazy(() => import('./pages/ReadingPlansLibrary'));
const MyPrayersPage = lazy(() => import('./pages/MyPrayers'));
const AddPrayerPage = lazy(() => import('./pages/AddPrayer'));
const EditPrayerPage = lazy(() => import('./pages/AddPrayer'));
const PrayerDetailPage = lazy(() => import('./pages/PrayerDetail'));
const HelpAndSupportPage = lazy(() => import('./pages/HelpAndSupportPage'));
const SharedSermonViewPage = lazy(() => import('./pages/SharedSermonView'));
const SupportFaithLightPage = lazy(() => import('./pages/SupportFaithLight'));
const ViralGrowthHubPage = lazy(() => import('./pages/ViralGrowthHub'));
const AppStoreScreenshotsGuidePage = lazy(() => import('./pages/AppStoreScreenshotsGuide'));
const TikTokScriptsGuidePage = lazy(() => import('./pages/TikTokScriptsGuide'));
const ConversionDashboardPage = lazy(() => import('./pages/ConversionDashboard'));
const LiveBroadcastWrapper = lazy(() => import('./pages/LiveBroadcastWrapper'));
const SermonArchivePageNew = lazy(() => import('./pages/SermonArchivePage'));
const BibleVerseSearchPage = lazy(() => import('./pages/BibleVerseSearch'));
const BibleVerseTextSearchPage = lazy(() => import('./pages/BibleVerseTextSearch'));
const VerseShareBuilderPage = lazy(() => import('./pages/VerseShareBuilder'));
const ReadingPlansNewPage = lazy(() => import('./pages/ReadingPlansPage'));
const DailyDevotionalPageNew = lazy(() => import('./pages/DailyDevotionalPage'));
const SettingsLanguagePageNew = lazy(() => import('./pages/SettingsLanguagePage'));
const SettingsPageNew = lazy(() => import('./pages/SettingsPage'));
const SettingsNotificationsPageNew = lazy(() => import('./pages/SettingsNotificationsPage'));
const BibleQuizGamePage = lazy(() => import('./pages/BibleQuizGame'));
const SermonNotesHubPage = lazy(() => import('./pages/SermonNotesHub'));
const VerseToSocialCardPage = lazy(() => import('./pages/VerseToSocialCard'));
const SettingsAboutPageNew = lazy(() => import('./pages/SettingsAboutPage'));
const ReadingStreaksDashboardPage = lazy(() => import('./pages/ReadingStreaksDashboard'));
const BibleQuizLeaderboardPage = lazy(() => import('./pages/BibleQuizLeaderboard'));
const AudioBibleLibraryPage = lazy(() => import('./pages/AudioBibleLibrary'));
const PersonalizedReadingPlanDashboardPage = lazy(() => import('./pages/PersonalizedReadingPlanDashboard'));
const PrayerCirclesHubPage = lazy(() => import('./pages/PrayerCirclesHub'));
const PrayerCircleDetailPage = lazy(() => import('./pages/PrayerCircleDetail'));
const CircleModerationQueuePage = lazy(() => import('./pages/CircleModerationQueue'));
const DailyBibleQuizPage = lazy(() => import('./pages/DailyBibleQuizPage'));
const PrayerJournal = lazy(() => import('./pages/PrayerJournal'));
const StudyPlans = lazy(() => import('./pages/StudyPlans'));
const BiblePlaylistsPage = lazy(() => import('./pages/BiblePlaylistsPage'));
import ModerationQueuePage from './pages/ModerationQueue';
const CommunityPrayerWallNewPage = lazy(() => import('./pages/CommunityPrayerWallPage'));
const BibleReadingPlansNewPage = lazy(() => import('./pages/BibleReadingPlansPage'));
const DailyVerseNotificationsPage = lazy(() => import('./pages/DailyVerseNotificationsPage'));
const SermonAssistantPage = lazy(() => import('./pages/SermonAssistantPage'));
const AISermonAssistantPage = lazy(() => import('./pages/AISermonAssistant'));
const ReadingPlansPageNew = lazy(() => import('./pages/ReadingPlansPage'));
const VerseImageGeneratorPageNew = lazy(() => import('./pages/VerseImageGeneratorPage'));
const AISermonGeneratorPageNew = lazy(() => import('./pages/AISermonGeneratorPage'));
const GamificationDashboard = lazy(() => import('./pages/GamificationDashboard'));
const ChristianHolidaysCalendar = lazy(() => import('./pages/ChristianHolidaysCalendar'));
const HolidayDetail = lazy(() => import('./pages/HolidayDetail'));
const HolidayNotificationSettings = lazy(() => import('./pages/HolidayNotificationSettings'));
const SpiritualLibrary = lazy(() => import('./pages/SpiritualLibrary'));
const SocialShareStudio = lazy(() => import('./pages/SocialShareStudio'));
const SavedContentLibrary = lazy(() => import('./pages/SavedContentLibrary'));
const BibleQuizGame = lazy(() => import('./pages/BibleQuizGame'));
const DailyReminderSettings = lazy(() => import('./pages/DailyReminderSettings'));
const ReadingProgressDashboard = lazy(() => import('./pages/ReadingProgressDashboard'));
const StudyGroupsHub = lazy(() => import('./pages/StudyGroupsHub'));
const StudyGroupDetail = lazy(() => import('./pages/StudyGroupDetail'));
const CommunityPrayerWall = lazy(() => import('./pages/CommunityPrayerWall'));
const AIBibleAssistant = lazy(() => import('./pages/AIBibleAssistant'));
const AIEnhancedBibleStudyPremium = lazy(() => import('./pages/AIEnhancedBibleStudyPremium'));
const CommunityGroupsPage = lazy(() => import('./pages/CommunityGroups'));
const OfflineLibraryPage = lazy(() => import('./pages/OfflineLibrary'));
const OfflineLibraryNewPage = lazy(() => import('./pages/OfflineLibraryPage'));
const PrayerCirclesNewPage = lazy(() => import('./pages/PrayerCirclesPage'));
const MyAnnotationsPage = lazy(() => import('./pages/MyAnnotations'));
const DailyProgressDashboardPage = lazy(() => import('./pages/DailyProgressDashboard'));
const AppSupportFormPage = lazy(() => import('./pages/AppSupportForm'));
const MyFavoriteVersesPage = lazy(() => import('./pages/MyFavoriteVerses'));
const ReadingPlansHubPage = lazy(() => import('./pages/ReadingPlansHub'));
const ReadingSchedulesPage = lazy(() => import('./pages/ReadingSchedules'));
const PrayerJournalFeaturePage = lazy(() => import('./pages/PrayerJournalFeature'));
const DailyVerseNotificationsFeaturePage = lazy(() => import('./pages/DailyVerseNotificationsFeature'));
const BibleQuizModulePage = lazy(() => import('./pages/BibleQuizModule'));
const ReflectionJournalPage = lazy(() => import('./pages/ReflectionJournal'));
const CommunityBoardPage = lazy(() => import('./pages/CommunityBoard'));
const SermonGeneratorPage = lazy(() => import('./pages/SermonGenerator'));
const AISermonGeneratorPage = lazy(() => import('./pages/AISermonGenerator'));
const DailyVersePageNew = lazy(() => import('./pages/DailyVersePage'));
const ReadingPlanPageNew = lazy(() => import('./pages/ReadingPlanPage'));
const PrayerBoardPageNew = lazy(() => import('./pages/PrayerBoardPage'));
const ReadingStreaksDashboardNew = lazy(() => import('./pages/ReadingStreaksDashboard'));
const StudyNotesPage = lazy(() => import('./pages/StudyNotes'));
const BibleReadingProgressPage = lazy(() => import('./pages/BibleReadingProgress'));
const VerseMediaGeneratorPage = lazy(() => import('./pages/VerseMediaGenerator'));
const StudyRoomPlansPage = lazy(() => import('./pages/StudyRoomPlans'));
const OfflineBibleDownloaderPage = lazy(() => import('./pages/OfflineBibleDownloader'));

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : () => null;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  useEffect(() => {
    initializeOfflineMode();
  }, []);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <A11yWrapper>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={
            <PageTransition>
              <LayoutWrapper currentPageName="Home">
                <HomePage />
              </LayoutWrapper>
            </PageTransition>
          } />
          {Object.entries(Pages).map(([path, Page]) => (
            <Route
              key={path}
              path={`/${path}`}
              element={
                <PageTransition>
                  <LayoutWrapper currentPageName={path}>
                    <Page />
                  </LayoutWrapper>
                </PageTransition>
              }
            />
          ))}

          {/* Feature pages */}
          <Route path="/community-prayer-board" element={<PageTransition><LayoutWrapper currentPageName="CommunityPrayerBoard"><CommunityPrayerBoardPage /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleMemorization" element={<PageTransition><LayoutWrapper currentPageName="BibleMemorization"><BibleMemorizationPage /></LayoutWrapper></PageTransition>} />
          <Route path="/FaithRoutineHub" element={<PageTransition><LayoutWrapper currentPageName="FaithRoutineHub"><FaithRoutineHub /></LayoutWrapper></PageTransition>} />
          <Route path="/MobileDeployGuide" element={<PageTransition><LayoutWrapper currentPageName="MobileDeployGuide"><MobileDeployGuide /></LayoutWrapper></PageTransition>} />
          <Route path="/AIPrayerJournal" element={<PageTransition><LayoutWrapper currentPageName="AIPrayerJournal"><AIPrayerJournal /></LayoutWrapper></PageTransition>} />
          <Route path="/OfflineContentManager" element={<PageTransition><LayoutWrapper currentPageName="OfflineContentManager"><OfflineContentManagerPage /></LayoutWrapper></PageTransition>} />
          <Route path="/FaithXPDashboard" element={<PageTransition><LayoutWrapper currentPageName="FaithXPDashboard"><FaithXPDashboard /></LayoutWrapper></PageTransition>} />
          <Route path="/FamilyLink" element={<PageTransition><LayoutWrapper currentPageName="FamilyLink"><FamilyLink /></LayoutWrapper></PageTransition>} />
          <Route path="/sermon-analyzer" element={<PageTransition><LayoutWrapper currentPageName="SermonAnalyzer"><SermonAnalyzerPage /></LayoutWrapper></PageTransition>} />
          <Route path="/MentorshipHub" element={<PageTransition><LayoutWrapper currentPageName="MentorshipHub"><MentorshipHub /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleMarathon" element={<PageTransition><LayoutWrapper currentPageName="BibleMarathon"><BibleMarathon /></LayoutWrapper></PageTransition>} />
          <Route path="/LivePrayerRoom" element={<PageTransition><LayoutWrapper currentPageName="LivePrayerRoom"><LivePrayerRoom /></LayoutWrapper></PageTransition>} />
          <Route path="/DailyDevotional" element={<PageTransition><LayoutWrapper currentPageName="DailyDevotional"><DailyDevotionalPage /></LayoutWrapper></PageTransition>} />
          <Route path="/DailyDevotionalAI" element={<PageTransition><LayoutWrapper currentPageName="DailyDevotionalAI"><DailyDevotionalPage /></LayoutWrapper></PageTransition>} />
          <Route path="/PersonalPrayerJournal" element={<PageTransition><LayoutWrapper currentPageName="PersonalPrayerJournal"><PersonalPrayerJournal /></LayoutWrapper></PageTransition>} />
          <Route path="/PrayerCircles" element={<PageTransition><LayoutWrapper currentPageName="PrayerCircles"><PrayerCirclesPage /></LayoutWrapper></PageTransition>} />
          <Route path="/VerseAudioQueue" element={<PageTransition><LayoutWrapper currentPageName="VerseAudioQueue"><VerseAudioQueue /></LayoutWrapper></PageTransition>} />
          <Route path="/PrayerTimeSettings" element={<PageTransition><LayoutWrapper currentPageName="PrayerTimeSettings"><PrayerTimeSettings /></LayoutWrapper></PageTransition>} />
          <Route path="/LanguageValidationDashboard" element={<PageTransition><LayoutWrapper currentPageName="LanguageValidationDashboard"><LanguageValidationDashboard /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleProgressDashboard" element={<PageTransition><LayoutWrapper currentPageName="BibleProgressDashboard"><BibleProgressDashboard /></LayoutWrapper></PageTransition>} />
          <Route path="/StudyGroupChat" element={<PageTransition><LayoutWrapper currentPageName="StudyGroupChat"><StudyGroupChat /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleJournal" element={<PageTransition><LayoutWrapper currentPageName="BibleJournal"><BibleJournal /></LayoutWrapper></PageTransition>} />
          <Route path="/OfflineReadingManager" element={<PageTransition><LayoutWrapper currentPageName="OfflineReadingManager"><OfflineReadingManager /></LayoutWrapper></PageTransition>} />
          <Route path="/About" element={<PageTransition><LayoutWrapper currentPageName="About"><AboutPage /></LayoutWrapper></PageTransition>} />
          <Route path="/ReadingPlans" element={<PageTransition><LayoutWrapper currentPageName="ReadingPlans"><ReadingPlansPage /></LayoutWrapper></PageTransition>} />
          <Route path="/MyJournal" element={<PageTransition><LayoutWrapper currentPageName="MyJournal"><MyJournalPage /></LayoutWrapper></PageTransition>} />
          <Route path="/MyHighlights" element={<PageTransition><LayoutWrapper currentPageName="MyHighlights"><MyHighlightsPage /></LayoutWrapper></PageTransition>} />
          <Route path="/Quiz" element={<PageTransition><LayoutWrapper currentPageName="Quiz"><QuizPage /></LayoutWrapper></PageTransition>} />
          <Route path="/Leaderboard" element={<PageTransition><LayoutWrapper currentPageName="Leaderboard"><LeaderboardPage /></LayoutWrapper></PageTransition>} />
          <Route path="/NotificationSettings" element={<PageTransition><LayoutWrapper currentPageName="NotificationSettings"><NotificationSettingsPage /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleSearch" element={<PageTransition><LayoutWrapper currentPageName="BibleSearch"><BibleSearchPage /></LayoutWrapper></PageTransition>} />
          <Route path="/Saved" element={<PageTransition><LayoutWrapper currentPageName="Saved"><SavedPage /></LayoutWrapper></PageTransition>} />
          <Route path="/PrayerJournalPage" element={<PageTransition><LayoutWrapper currentPageName="PrayerJournalPage"><PrayerJournalPage /></LayoutWrapper></PageTransition>} />
          <Route path="/OfflineAudioLibrary" element={<PageTransition><LayoutWrapper currentPageName="OfflineAudioLibrary"><OfflineAudioLibraryPage /></LayoutWrapper></PageTransition>} />
          <Route path="/PrayerReminderSettings" element={<PageTransition><LayoutWrapper currentPageName="PrayerReminderSettings"><PrayerReminderSettingsPage /></LayoutWrapper></PageTransition>} />
          <Route path="/QuizChallenge" element={<PageTransition><LayoutWrapper currentPageName="QuizChallenge"><QuizChallengePage /></LayoutWrapper></PageTransition>} />
          <Route path="/SavedVerses" element={<PageTransition><LayoutWrapper currentPageName="SavedVerses"><SavedVersesPage /></LayoutWrapper></PageTransition>} />
          <Route path="/DailyReflection" element={<PageTransition><LayoutWrapper currentPageName="DailyReflection"><DailyReflectionPage /></LayoutWrapper></PageTransition>} />
          <Route path="/Downloads" element={<PageTransition><LayoutWrapper currentPageName="Downloads"><DownloadsPage /></LayoutWrapper></PageTransition>} />
          <Route path="/SermonPreparation" element={<PageTransition><LayoutWrapper currentPageName="SermonPreparation"><SermonPreparationPage /></LayoutWrapper></PageTransition>} />
          <Route path="/SavedSermons" element={<PageTransition><LayoutWrapper currentPageName="SavedSermons"><SavedSermonsPage /></LayoutWrapper></PageTransition>} />
          <Route path="/VerseJournalHub" element={<PageTransition><LayoutWrapper currentPageName="VerseJournalHub"><VerseJournalHub /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleStudyGroupsHub" element={<PageTransition><LayoutWrapper currentPageName="BibleStudyGroupsHub"><BibleStudyGroupsHub /></LayoutWrapper></PageTransition>} />
          <Route path="/SemanticBibleSearch" element={<PageTransition><LayoutWrapper currentPageName="SemanticBibleSearch"><SemanticBibleSearchPage /></LayoutWrapper></PageTransition>} />
          <Route path="/SermonNotes" element={<PageTransition><LayoutWrapper currentPageName="SermonNotes"><SermonNotesPage /></LayoutWrapper></PageTransition>} />
          <Route path="/TopicReadingPlans" element={<PageTransition><LayoutWrapper currentPageName="TopicReadingPlans"><TopicReadingPlansPage /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleGroupChat" element={<PageTransition><LayoutWrapper currentPageName="BibleGroupChat"><BibleGroupChatPage /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleReaderPage" element={<PageTransition><LayoutWrapper currentPageName="BibleReaderPage"><BibleReaderPageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleSearchPage" element={<PageTransition><LayoutWrapper currentPageName="BibleSearchPage"><BibleSearchPageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/AudioBiblePage" element={<PageTransition><LayoutWrapper currentPageName="AudioBiblePage"><AudioBiblePageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/audio" element={<PageTransition><LayoutWrapper currentPageName="Audio"><AudioBibleScreenPage /></LayoutWrapper></PageTransition>} />
          <Route path="/PrivacyPolicy" element={<PageTransition><LayoutWrapper currentPageName="PrivacyPolicy"><PrivacyPolicyPage /></LayoutWrapper></PageTransition>} />
          <Route path="/TermsOfService" element={<PageTransition><LayoutWrapper currentPageName="TermsOfService"><TermsOfServicePage /></LayoutWrapper></PageTransition>} />
          <Route path="/AboutPage" element={<PageTransition><LayoutWrapper currentPageName="AboutPage"><AboutPageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/ReadingPlanDetail" element={<PageTransition><LayoutWrapper currentPageName="ReadingPlanDetail"><ReadingPlanDetail /></LayoutWrapper></PageTransition>} />
          <Route path="/ReadingPlansLibrary" element={<PageTransition><LayoutWrapper currentPageName="ReadingPlansLibrary"><ReadingPlansLibraryPage /></LayoutWrapper></PageTransition>} />
          <Route path="/MyPrayers" element={<PageTransition><LayoutWrapper currentPageName="MyPrayers"><MyPrayersPage /></LayoutWrapper></PageTransition>} />
          <Route path="/AddPrayer" element={<PageTransition><LayoutWrapper currentPageName="AddPrayer"><AddPrayerPage /></LayoutWrapper></PageTransition>} />
          <Route path="/EditPrayer/:prayerId" element={<PageTransition><LayoutWrapper currentPageName="EditPrayer"><EditPrayerPage /></LayoutWrapper></PageTransition>} />
          <Route path="/PrayerDetail/:prayerId" element={<PageTransition><LayoutWrapper currentPageName="PrayerDetail"><PrayerDetailPage /></LayoutWrapper></PageTransition>} />
          <Route path="/HelpAndSupport" element={<PageTransition><LayoutWrapper currentPageName="HelpAndSupport"><HelpAndSupportPage /></LayoutWrapper></PageTransition>} />
          <Route path="/SharedSermonView" element={<Suspense fallback={<PageLoader />}><SharedSermonViewPage /></Suspense>} />
          <Route path="/FaithLightAIChat" element={<PageTransition><LayoutWrapper currentPageName="FaithLightAIChat"><FaithLightAIChat /></LayoutWrapper></PageTransition>} />
          <Route path="/PrivatePrayerJournal" element={<PageTransition><LayoutWrapper currentPageName="PrivatePrayerJournal"><PrivatePrayerJournal /></LayoutWrapper></PageTransition>} />
          <Route path="/DailyReminders" element={<PageTransition><LayoutWrapper currentPageName="DailyReminders"><DailyReminderDashboard /></LayoutWrapper></PageTransition>} />
          <Route path="/DataExportCenter" element={<PageTransition><LayoutWrapper currentPageName="DataExportCenter"><DataExportCenter /></LayoutWrapper></PageTransition>} />
          <Route path="/SupportFaithLight" element={<PageTransition><LayoutWrapper currentPageName="SupportFaithLight"><SupportFaithLightPage /></LayoutWrapper></PageTransition>} />
          <Route path="/ViralGrowthHub" element={<PageTransition><LayoutWrapper currentPageName="ViralGrowthHub"><ViralGrowthHubPage /></LayoutWrapper></PageTransition>} />
          <Route path="/AppStoreScreenshotsGuide" element={<PageTransition><LayoutWrapper currentPageName="AppStoreScreenshotsGuide"><AppStoreScreenshotsGuidePage /></LayoutWrapper></PageTransition>} />
          <Route path="/TikTokScriptsGuide" element={<PageTransition><LayoutWrapper currentPageName="TikTokScriptsGuide"><TikTokScriptsGuidePage /></LayoutWrapper></PageTransition>} />
          <Route path="/ConversionDashboard" element={<PageTransition><LayoutWrapper currentPageName="ConversionDashboard"><ConversionDashboardPage /></LayoutWrapper></PageTransition>} />
          <Route path="/LiveBroadcast" element={<PageTransition><LayoutWrapper currentPageName="LiveBroadcast"><LiveBroadcastWrapper /></LayoutWrapper></PageTransition>} />
          <Route path="/SermonArchive" element={<PageTransition><LayoutWrapper currentPageName="SermonArchive"><SermonArchivePageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleVerseSearch" element={<PageTransition><LayoutWrapper currentPageName="BibleVerseSearch"><BibleVerseSearchPage /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleVerseTextSearch" element={<PageTransition><LayoutWrapper currentPageName="BibleVerseTextSearch"><BibleVerseTextSearchPage /></LayoutWrapper></PageTransition>} />
          <Route path="/VerseShareBuilder" element={<PageTransition><LayoutWrapper currentPageName="VerseShareBuilder"><VerseShareBuilderPage /></LayoutWrapper></PageTransition>} />
          <Route path="/ReadingPlansPage" element={<PageTransition><LayoutWrapper currentPageName="ReadingPlansPage"><ReadingPlansNewPage /></LayoutWrapper></PageTransition>} />
          <Route path="/SettingsLanguage" element={<PageTransition><LayoutWrapper currentPageName="SettingsLanguage"><SettingsLanguagePageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/SettingsPage" element={<PageTransition><LayoutWrapper currentPageName="SettingsPage"><SettingsPageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/settings/notifications" element={<PageTransition><LayoutWrapper currentPageName="SettingsNotifications"><SettingsNotificationsPageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleQuizGame" element={<PageTransition><LayoutWrapper currentPageName="BibleQuizGame"><BibleQuizGamePage /></LayoutWrapper></PageTransition>} />
          <Route path="/SermonNotesHub" element={<PageTransition><LayoutWrapper currentPageName="SermonNotesHub"><SermonNotesHubPage /></LayoutWrapper></PageTransition>} />
          <Route path="/VerseToSocialCard" element={<PageTransition><LayoutWrapper currentPageName="VerseToSocialCard"><VerseToSocialCardPage /></LayoutWrapper></PageTransition>} />
          <Route path="/settings/about" element={<PageTransition><LayoutWrapper currentPageName="SettingsAbout"><SettingsAboutPageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/reading-streaks" element={<PageTransition><LayoutWrapper currentPageName="ReadingStreaks"><ReadingStreaksDashboardPage /></LayoutWrapper></PageTransition>} />
          <Route path="/bible-quiz" element={<PageTransition><LayoutWrapper currentPageName="BibleQuiz"><BibleQuizLeaderboardPage /></LayoutWrapper></PageTransition>} />
          <Route path="/audio-library" element={<PageTransition><LayoutWrapper currentPageName="AudioLibrary"><AudioBibleLibraryPage /></LayoutWrapper></PageTransition>} />
          <Route path="/reading-plan-dashboard" element={<PageTransition><LayoutWrapper currentPageName="ReadingPlanDashboard"><PersonalizedReadingPlanDashboardPage /></LayoutWrapper></PageTransition>} />
          <Route path="/prayer-circles" element={<PageTransition><LayoutWrapper currentPageName="PrayerCircles"><PrayerCirclesHubPage /></LayoutWrapper></PageTransition>} />
          <Route path="/prayer-circle/:circleId" element={<PageTransition><LayoutWrapper currentPageName="PrayerCircleDetail"><PrayerCircleDetailPage /></LayoutWrapper></PageTransition>} />
          <Route path="/circle-moderation" element={<PageTransition><LayoutWrapper currentPageName="CircleModeration"><CircleModerationQueuePage /></LayoutWrapper></PageTransition>} />
          <Route path="/daily-quiz" element={<PageTransition><LayoutWrapper currentPageName="DailyQuiz"><DailyBibleQuizPage /></LayoutWrapper></PageTransition>} />
          <Route path="/moderation" element={<PageTransition><LayoutWrapper currentPageName="Moderation"><ModerationQueuePage /></LayoutWrapper></PageTransition>} />
          <Route path="/prayer-journal" element={<PageTransition><LayoutWrapper currentPageName="PrayerJournal"><PrayerJournal /></LayoutWrapper></PageTransition>} />
          <Route path="/study-plans" element={<PageTransition><LayoutWrapper currentPageName="StudyPlans"><StudyPlans /></LayoutWrapper></PageTransition>} />
          <Route path="/bible-playlists" element={<PageTransition><LayoutWrapper currentPageName="BiblePlaylists"><BiblePlaylistsPage /></LayoutWrapper></PageTransition>} />
          <Route path="/community-prayer-wall-new" element={<PageTransition><LayoutWrapper currentPageName="CommunityPrayerWall"><CommunityPrayerWallNewPage /></LayoutWrapper></PageTransition>} />
          <Route path="/bible-reading-plans" element={<PageTransition><LayoutWrapper currentPageName="BibleReadingPlans"><BibleReadingPlansNewPage /></LayoutWrapper></PageTransition>} />
          <Route path="/daily-verse-notifications" element={<PageTransition><LayoutWrapper currentPageName="DailyVerseNotifications"><DailyVerseNotificationsPage /></LayoutWrapper></PageTransition>} />
          <Route path="/sermon-assistant" element={<PageTransition><LayoutWrapper currentPageName="SermonAssistant"><SermonAssistantPage /></LayoutWrapper></PageTransition>} />
          <Route path="/ai-sermon-assistant" element={<PageTransition><LayoutWrapper currentPageName="AISermonAssistant"><AISermonAssistantPage /></LayoutWrapper></PageTransition>} />
          <Route path="/daily-devotional" element={<PageTransition><LayoutWrapper currentPageName="DailyDevotional"><DailyDevotionalPageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/reading-plans-new" element={<PageTransition><LayoutWrapper currentPageName="ReadingPlans"><ReadingPlansPageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/verse-images" element={<PageTransition><LayoutWrapper currentPageName="VerseImages"><VerseImageGeneratorPageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/ai-sermon" element={<PageTransition><LayoutWrapper currentPageName="AISermo"><AISermonGeneratorPageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/streaks" element={<PageTransition><LayoutWrapper currentPageName="Streaks"><GamificationDashboard /></LayoutWrapper></PageTransition>} />
          <Route path="/library" element={<PageTransition><LayoutWrapper currentPageName="Library"><SpiritualLibrary /></LayoutWrapper></PageTransition>} />
          <Route path="/share-studio" element={<PageTransition><LayoutWrapper currentPageName="ShareStudio"><SocialShareStudio /></LayoutWrapper></PageTransition>} />
          <Route path="/saved-content" element={<PageTransition><LayoutWrapper currentPageName="SavedContent"><SavedContentLibrary /></LayoutWrapper></PageTransition>} />
          <Route path="/bible-quiz" element={<PageTransition><LayoutWrapper currentPageName="BibleQuiz"><BibleQuizGame /></LayoutWrapper></PageTransition>} />
          <Route path="/reminder-settings" element={<PageTransition><LayoutWrapper currentPageName="ReminderSettings"><DailyReminderSettings /></LayoutWrapper></PageTransition>} />
          <Route path="/reading-progress" element={<PageTransition><LayoutWrapper currentPageName="ReadingProgress"><ReadingProgressDashboard /></LayoutWrapper></PageTransition>} />
          <Route path="/study-groups" element={<PageTransition><LayoutWrapper currentPageName="StudyGroups"><StudyGroupsHub /></LayoutWrapper></PageTransition>} />
          <Route path="/study-group/:groupId" element={<PageTransition><LayoutWrapper currentPageName="StudyGroupDetail"><StudyGroupDetail /></LayoutWrapper></PageTransition>} />
          <Route path="/prayer-wall" element={<PageTransition><LayoutWrapper currentPageName="PrayerWall"><CommunityPrayerWall /></LayoutWrapper></PageTransition>} />
          <Route path="/bible-assistant" element={<PageTransition><LayoutWrapper currentPageName="BibleAssistant"><AIBibleAssistant /></LayoutWrapper></PageTransition>} />
          <Route path="/ai-study-premium" element={<PageTransition><LayoutWrapper currentPageName="AIStudyPremium"><AIEnhancedBibleStudyPremium /></LayoutWrapper></PageTransition>} />
          <Route path="/community-groups" element={<PageTransition><LayoutWrapper currentPageName="CommunityGroups"><CommunityGroupsPage /></LayoutWrapper></PageTransition>} />
          <Route path="/offline-library" element={<PageTransition><LayoutWrapper currentPageName="OfflineLibrary"><OfflineLibraryPage /></LayoutWrapper></PageTransition>} />
          <Route path="/my-annotations" element={<PageTransition><LayoutWrapper currentPageName="MyAnnotations"><MyAnnotationsPage /></LayoutWrapper></PageTransition>} />
          <Route path="/daily-progress" element={<PageTransition><LayoutWrapper currentPageName="DailyProgress"><DailyProgressDashboardPage /></LayoutWrapper></PageTransition>} />
          <Route path="/reading-schedules" element={<PageTransition><LayoutWrapper currentPageName="ReadingSchedules"><ReadingSchedulesPage /></LayoutWrapper></PageTransition>} />
          <Route path="/support" element={<PageTransition><LayoutWrapper currentPageName="Support"><AppSupportFormPage /></LayoutWrapper></PageTransition>} />
          <Route path="/my-favorites" element={<PageTransition><LayoutWrapper currentPageName="MyFavorites"><MyFavoriteVersesPage /></LayoutWrapper></PageTransition>} />
          <Route path="/reading-plans-hub" element={<PageTransition><LayoutWrapper currentPageName="ReadingPlansHub"><ReadingPlansHubPage /></LayoutWrapper></PageTransition>} />
          <Route path="/prayer-journal-feature" element={<PageTransition><LayoutWrapper currentPageName="PrayerJournalFeature"><PrayerJournalFeaturePage /></LayoutWrapper></PageTransition>} />
          <Route path="/daily-verse-notifications-feature" element={<PageTransition><LayoutWrapper currentPageName="DailyVerseNotifications"><DailyVerseNotificationsFeaturePage /></LayoutWrapper></PageTransition>} />
          <Route path="/bible-quiz-module" element={<PageTransition><LayoutWrapper currentPageName="BibleQuizModule"><BibleQuizModulePage /></LayoutWrapper></PageTransition>} />
          <Route path="/reflection-journal" element={<PageTransition><LayoutWrapper currentPageName="ReflectionJournal"><ReflectionJournalPage /></LayoutWrapper></PageTransition>} />
          <Route path="/community-board" element={<PageTransition><LayoutWrapper currentPageName="CommunityBoard"><CommunityBoardPage /></LayoutWrapper></PageTransition>} />
          <Route path="/sermon-generator" element={<PageTransition><LayoutWrapper currentPageName="SermonGenerator"><SermonGeneratorPage /></LayoutWrapper></PageTransition>} />
          <Route path="/reflection-journal" element={<PageTransition><LayoutWrapper currentPageName="ReflectionJournal"><ReflectionJournalPage /></LayoutWrapper></PageTransition>} />
          <Route path="/community-board" element={<PageTransition><LayoutWrapper currentPageName="CommunityBoard"><CommunityBoardPage /></LayoutWrapper></PageTransition>} />
          <Route path="/ai-sermon-generator" element={<PageTransition><LayoutWrapper currentPageName="AISermonGenerator"><AISermonGeneratorPage /></LayoutWrapper></PageTransition>} />
          <Route path="/offline-bible-library" element={<PageTransition><LayoutWrapper currentPageName="OfflineBibleLibrary"><OfflineLibraryNewPage /></LayoutWrapper></PageTransition>} />
          <Route path="/my-prayer-circles" element={<PageTransition><LayoutWrapper currentPageName="PrayerCirclesNew"><PrayerCirclesNewPage /></LayoutWrapper></PageTransition>} />
          <Route path="/my-highlights" element={<PageTransition><LayoutWrapper currentPageName="MyHighlights"><MyHighlightsPage /></LayoutWrapper></PageTransition>} />
          <Route path="/christian-holidays" element={<PageTransition><LayoutWrapper currentPageName="ChristianHolidaysCalendar"><ChristianHolidaysCalendar /></LayoutWrapper></PageTransition>} />
          <Route path="/holiday/:holidayId" element={<PageTransition><LayoutWrapper currentPageName="HolidayDetail"><HolidayDetail /></LayoutWrapper></PageTransition>} />
          <Route path="/holiday-notifications" element={<PageTransition><LayoutWrapper currentPageName="HolidayNotificationSettings"><HolidayNotificationSettings /></LayoutWrapper></PageTransition>} />
          <Route path="/daily-verse" element={<PageTransition><LayoutWrapper currentPageName="DailyVerse"><DailyVersePageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/reading-plan-dashboard" element={<PageTransition><LayoutWrapper currentPageName="ReadingPlanDashboard"><ReadingPlanPageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/prayer-board" element={<PageTransition><LayoutWrapper currentPageName="PrayerBoard"><PrayerBoardPageNew /></LayoutWrapper></PageTransition>} />
          <Route path="/reading-streaks" element={<PageTransition><LayoutWrapper currentPageName="ReadingStreaks"><ReadingStreaksDashboardNew /></LayoutWrapper></PageTransition>} />
          <Route path="/StudyNotes" element={<PageTransition><LayoutWrapper currentPageName="StudyNotes"><StudyNotesPage /></LayoutWrapper></PageTransition>} />
          <Route path="/BibleReadingProgress" element={<PageTransition><LayoutWrapper currentPageName="BibleReadingProgress"><BibleReadingProgressPage /></LayoutWrapper></PageTransition>} />
          <Route path="/verse-media" element={<PageTransition><LayoutWrapper currentPageName="VerseMedia"><VerseMediaGeneratorPage /></LayoutWrapper></PageTransition>} />
          <Route path="/study-room-plans" element={<PageTransition><LayoutWrapper currentPageName="StudyRoomPlans"><StudyRoomPlansPage /></LayoutWrapper></PageTransition>} />
          <Route path="/offline-bible" element={<PageTransition><LayoutWrapper currentPageName="OfflineBible"><OfflineBibleDownloaderPage /></LayoutWrapper></PageTransition>} />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </A11yWrapper>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <AudioProvider>
            <Router>
              <A11yWrapper>
                <AuthenticatedApp />
              </A11yWrapper>
            </Router>
            <Toaster />
          </AudioProvider>
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;