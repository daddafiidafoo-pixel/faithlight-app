/**
 * pages.config.js - Page routing configuration
 * All pages are lazy-loaded for fast initial load and fast refresh.
 */
import { lazy } from 'react';
import __Layout from './Layout.jsx';

const AIBibleCompanion = lazy(() => import('./pages/AIBibleCompanion'));
const AIBibleGuide = lazy(() => import('./pages/AIBibleGuide'));
const AIBibleStudyPlanner = lazy(() => import('./pages/AIBibleStudyPlanner'));
const AIBibleTutor = lazy(() => import('./pages/AIBibleTutor'));
const AICourseGenerator = lazy(() => import('./pages/AICourseGenerator'));
const AIEnhancedBibleStudy = lazy(() => import('./pages/AIEnhancedBibleStudy'));
const AIExplain = lazy(() => import('./pages/AIExplain'));
const AIIntegrity = lazy(() => import('./pages/AIIntegrity'));
const AILessonAssistant = lazy(() => import('./pages/AILessonAssistant'));
const AIQuizzes = lazy(() => import('./pages/AIQuizzes'));
const AIReportsAdmin = lazy(() => import('./pages/AIReportsAdmin'));
const AISermonBuilder = lazy(() => import('./pages/AISermonBuilder'));
const AISpiritualMentor = lazy(() => import('./pages/AISpiritualMentor'));
const AIStudyContentCreator = lazy(() => import('./pages/AIStudyContentCreator'));
const AIStudyPlanBuilder = lazy(() => import('./pages/AIStudyPlanBuilder'));
const AIStudyPlanBuilderV2 = lazy(() => import('./pages/AIStudyPlanBuilderV2'));
const AIStudyPlanGenerator = lazy(() => import('./pages/AIStudyPlanGenerator'));
const AIWelcome = lazy(() => import('./pages/AIWelcome'));
const APIBibleTest = lazy(() => import('./pages/APIBibleTest'));
const APIDocumentation = lazy(() => import('./pages/APIDocumentation'));
const About = lazy(() => import('./pages/About'));
const AcademySubscription = lazy(() => import('./pages/AcademySubscription'));
const ActivityFeed = lazy(() => import('./pages/ActivityFeed'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLeaderVerification = lazy(() => import('./pages/AdminLeaderVerification'));
const AdminMentorManagement = lazy(() => import('./pages/AdminMentorManagement'));
const AdminModeration = lazy(() => import('./pages/AdminModeration'));
const AdminModerationDashboard = lazy(() => import('./pages/AdminModerationDashboard'));
const AdminRoles = lazy(() => import('./pages/AdminRoles'));
const AdminUserProfiles = lazy(() => import('./pages/AdminUserProfiles'));
const AdvancedBibleSearch = lazy(() => import('./pages/AdvancedBibleSearch'));
const AdvancedBibleStudy = lazy(() => import('./pages/AdvancedBibleStudy'));
const AdvancedReadingPlan = lazy(() => import('./pages/AdvancedReadingPlan'));
const AmbassadorAgreements = lazy(() => import('./pages/AmbassadorAgreements'));
const AmbassadorCountryDetail = lazy(() => import('./pages/AmbassadorCountryDetail'));
const AmbassadorDashboard = lazy(() => import('./pages/AmbassadorDashboard'));
const AmbassadorProgram = lazy(() => import('./pages/AmbassadorProgram'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const Announcements = lazy(() => import('./pages/Announcements'));
const AnonymousPrayerWall = lazy(() => import('./pages/AnonymousPrayerWall'));
const AppReviewAudit = lazy(() => import('./pages/AppReviewAudit'));
const AppReviewerChecklist = lazy(() => import('./pages/AppReviewerChecklist'));
const AppStoreDescription = lazy(() => import('./pages/AppStoreDescription'));
const AppStoreListing = lazy(() => import('./pages/AppStoreListing'));
const AppStoreMetadata = lazy(() => import('./pages/AppStoreMetadata'));
const AppStoreReadinessChecklist = lazy(() => import('./pages/AppStoreReadinessChecklist'));
const AppStoreReviewAudit = lazy(() => import('./pages/AppStoreReviewAudit'));
const AppStoreScreenshots = lazy(() => import('./pages/AppStoreScreenshots'));
const AppStoreSubmissionChecklist = lazy(() => import('./pages/AppStoreSubmissionChecklist'));
const AppStoreSubmissionPackage = lazy(() => import('./pages/AppStoreSubmissionPackage'));
const AppleRejectionFixes = lazy(() => import('./pages/AppleRejectionFixes'));
const AppleReviewGuide = lazy(() => import('./pages/AppleReviewGuide'));
const ApplyForVerification = lazy(() => import('./pages/ApplyForVerification'));
const ApplyTeacher = lazy(() => import('./pages/ApplyTeacher'));
const AskAI = lazy(() => import('./pages/AskAI'));
const AudioBible = lazy(() => import('./pages/AudioBible'));
const AudioBibleCatalog = lazy(() => import('./pages/AudioBibleCatalog'));
const AudioBiblePage = lazy(() => import('./pages/AudioBiblePage'));
const AudioBiblePlayer = lazy(() => import('./pages/AudioBiblePlayer'));
const AudioBibleV2 = lazy(() => import('./pages/AudioBibleV2'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const BecomeMentor = lazy(() => import('./pages/BecomeMentor'));
const BibleCanon = lazy(() => import('./pages/BibleCanon'));
const BibleComparison = lazy(() => import('./pages/BibleComparison'));
const BibleDataImport = lazy(() => import('./pages/BibleDataImport'));
const BibleDataSetup = lazy(() => import('./pages/BibleDataSetup'));
const BibleDownloads = lazy(() => import('./pages/BibleDownloads'));
const BibleExplain = lazy(() => import('./pages/BibleExplain'));
const BibleForum = lazy(() => import('./pages/BibleForum'));
const BibleGeographyMap = lazy(() => import('./pages/BibleGeographyMap'));
const BibleJournal = lazy(() => import('./pages/BibleJournal'));
const BibleMemoryGame = lazy(() => import('./pages/BibleMemoryGame'));
const BibleOfflineAccess = lazy(() => import('./pages/BibleOfflineAccess'));
const BibleOfflineManager = lazy(() => import('./pages/BibleOfflineManager'));
const BibleQuiz = lazy(() => import('./pages/BibleQuiz'));
const BibleReader = lazy(() => import('./pages/BibleReader'));
const BibleReaderNew = lazy(() => import('./pages/BibleReaderNew'));
const BibleReaderPage = lazy(() => import('./pages/BibleReaderPage'));
const BibleReaderSettings = lazy(() => import('./pages/BibleReaderSettings'));
const BibleReadingPlans = lazy(() => import('./pages/BibleReadingPlans'));
const BibleSearch = lazy(() => import('./pages/BibleSearch'));
const BibleStructureOverview = lazy(() => import('./pages/BibleStructureOverview'));
const BibleStudyGroups = lazy(() => import('./pages/BibleStudyGroups'));
const BibleStudyHub = lazy(() => import('./pages/BibleStudyHub'));
const BibleStudyMode = lazy(() => import('./pages/BibleStudyMode'));
const BibleStudyPartner = lazy(() => import('./pages/BibleStudyPartner'));
const BibleStudyPlanBrowser = lazy(() => import('./pages/BibleStudyPlanBrowser'));
const BibleStudyPlans = lazy(() => import('./pages/BibleStudyPlans'));
const BibleTools = lazy(() => import('./pages/BibleTools'));
const BibleTutor = lazy(() => import('./pages/BibleTutor'));
const BibleVerseSearch = lazy(() => import('./pages/BibleVerseSearch'));
const BiblicalTimeline = lazy(() => import('./pages/BiblicalTimeline'));
const BillingCancel = lazy(() => import('./pages/BillingCancel'));
const BillingHistory = lazy(() => import('./pages/BillingHistory'));
const BillingSuccess = lazy(() => import('./pages/BillingSuccess'));
const BillingualLegalDocs = lazy(() => import('./pages/BillingualLegalDocs'));
const BlogSearch = lazy(() => import('./pages/BlogSearch'));
const CallHistory = lazy(() => import('./pages/CallHistory'));
const CertificateCheckoutCancel = lazy(() => import('./pages/CertificateCheckoutCancel'));
const CertificateCheckoutSuccess = lazy(() => import('./pages/CertificateCheckoutSuccess'));
const ChristianPodcasts = lazy(() => import('./pages/ChristianPodcasts'));
const ChurchAdminDashboard = lazy(() => import('./pages/ChurchAdminDashboard'));
const ChurchAdminGuides = lazy(() => import('./pages/ChurchAdminGuides'));
const ChurchEvents = lazy(() => import('./pages/ChurchEvents'));
const ChurchFinder = lazy(() => import('./pages/ChurchFinder'));
const ChurchJoin = lazy(() => import('./pages/ChurchJoin'));
const ChurchJoinPage = lazy(() => import('./pages/ChurchJoinPage'));
const ChurchLanding = lazy(() => import('./pages/ChurchLanding'));
const ChurchMode = lazy(() => import('./pages/ChurchMode'));
const ChurchModeSettings = lazy(() => import('./pages/ChurchModeSettings'));
const ChurchPartnership = lazy(() => import('./pages/ChurchPartnership'));
const ChurchQuiz = lazy(() => import('./pages/ChurchQuiz'));
const ChurchStudyDetail = lazy(() => import('./pages/ChurchStudyDetail'));
const ChurchStudyMode = lazy(() => import('./pages/ChurchStudyMode'));
const Collections = lazy(() => import('./pages/Collections'));
const Community = lazy(() => import('./pages/Community'));
const CommunityChallenges = lazy(() => import('./pages/CommunityChallenges'));
const CommunityDiscussions = lazy(() => import('./pages/CommunityDiscussions'));
const CommunityGuidelines = lazy(() => import('./pages/CommunityGuidelines'));
const CommunityPostDetails = lazy(() => import('./pages/CommunityPostDetails'));
const CommunityPrayerBoard = lazy(() => import('./pages/CommunityPrayerBoard'));
const CommunityPrayerWall = lazy(() => import('./pages/CommunityPrayerWall'));
const CommunitySermons = lazy(() => import('./pages/CommunitySermons'));
const CommunityShowcase = lazy(() => import('./pages/CommunityShowcase'));
const CommunityStudyGroups = lazy(() => import('./pages/CommunityStudyGroups'));
const Contact = lazy(() => import('./pages/Contact'));
const CopyrightNotice = lazy(() => import('./pages/CopyrightNotice'));
const CountryResources = lazy(() => import('./pages/CountryResources'));
const CountryResourcesAdmin = lazy(() => import('./pages/CountryResourcesAdmin'));
const CourseBuilder = lazy(() => import('./pages/CourseBuilder'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const CreateLesson = lazy(() => import('./pages/CreateLesson'));
const CreateLiveEvent = lazy(() => import('./pages/CreateLiveEvent'));
const CreateLiveRoom = lazy(() => import('./pages/CreateLiveRoom'));
const CreateProfile = lazy(() => import('./pages/CreateProfile'));
const CustomReadingPlanGenerator = lazy(() => import('./pages/CustomReadingPlanGenerator'));
const CustomReadingPlans = lazy(() => import('./pages/CustomReadingPlans'));
const CustomStudyPlanBuilder = lazy(() => import('./pages/CustomStudyPlanBuilder'));
const Daily = lazy(() => import('./pages/Daily'));
const DailyBibleQuiz = lazy(() => import('./pages/DailyBibleQuiz'));
const DailyDevotional = lazy(() => import('./pages/DailyDevotional'));
const DailyDevotionals = lazy(() => import('./pages/DailyDevotionals'));
const DailyFaithJourney = lazy(() => import('./pages/DailyFaithJourney'));
const DailyPrayerGenerator = lazy(() => import('./pages/DailyPrayerGenerator'));
const DailyQuizPage = lazy(() => import('./pages/DailyQuizPage'));
const DailyReadingPlan = lazy(() => import('./pages/DailyReadingPlan'));
const DataDeletionRequest = lazy(() => import('./pages/DataDeletionRequest'));
const DetailedProgressDashboard = lazy(() => import('./pages/DetailedProgressDashboard'));
const DirectMessages = lazy(() => import('./pages/DirectMessages'));
const Discover = lazy(() => import('./pages/Discover'));
const DiscoverGroups = lazy(() => import('./pages/DiscoverGroups'));
const DiscoverStudyPlans = lazy(() => import('./pages/DiscoverStudyPlans'));
const DiscussionGroups = lazy(() => import('./pages/DiscussionGroups'));
const DonorFollowUp = lazy(() => import('./pages/DonorFollowUp'));
const DonorManagement = lazy(() => import('./pages/DonorManagement'));
const DonorPortal = lazy(() => import('./pages/DonorPortal'));
const Download = lazy(() => import('./pages/Download'));
const DownloadedBible = lazy(() => import('./pages/DownloadedBible'));
const Downloads = lazy(() => import('./pages/Downloads'));
const DraftCoursesReview = lazy(() => import('./pages/DraftCoursesReview'));
const DrivingMode = lazy(() => import('./pages/DrivingMode'));
const EventArchive = lazy(() => import('./pages/EventArchive'));
const EventCalendar = lazy(() => import('./pages/EventCalendar'));
const ExploreCourses = lazy(() => import('./pages/ExploreCourses'));
const FAQ = lazy(() => import('./pages/FAQ'));
const FaithJourneyDashboard = lazy(() => import('./pages/FaithJourneyDashboard'));
const FaithLightHome = lazy(() => import('./pages/FaithLightHome'));
const FaithLightPlus = lazy(() => import('./pages/FaithLightPlus'));
const FaithWidget = lazy(() => import('./pages/FaithWidget'));
const Favorites = lazy(() => import('./pages/Favorites'));
const FinalExam = lazy(() => import('./pages/FinalExam'));
const FinalLaunchChecklist = lazy(() => import('./pages/FinalLaunchChecklist'));
const FinalPreLaunchChecklist = lazy(() => import('./pages/FinalPreLaunchChecklist'));
const FindChurches = lazy(() => import('./pages/FindChurches'));
const FindFriends = lazy(() => import('./pages/FindFriends'));
const FindMentor = lazy(() => import('./pages/FindMentor'));
const FlutterDevelopmentGuide = lazy(() => import('./pages/FlutterDevelopmentGuide'));
const ForChurches = lazy(() => import('./pages/ForChurches'));
const ForTeachers = lazy(() => import('./pages/ForTeachers'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Forum = lazy(() => import('./pages/Forum'));
const ForumTopic = lazy(() => import('./pages/ForumTopic'));
const Friends = lazy(() => import('./pages/Friends'));
const FullBibleReader = lazy(() => import('./pages/FullBibleReader'));
const GamificationLeaderboard = lazy(() => import('./pages/GamificationLeaderboard'));
const GenerateFullLesson = lazy(() => import('./pages/GenerateFullLesson'));
const GetFaithLight = lazy(() => import('./pages/GetFaithLight'));
const GlobalBiblicalLeadershipDiploma = lazy(() => import('./pages/GlobalBiblicalLeadershipDiploma'));
const GlobalBiblicalLeadershipInstitute = lazy(() => import('./pages/GlobalBiblicalLeadershipInstitute'));
const GlobalPrayerMap = lazy(() => import('./pages/GlobalPrayerMap'));
const GlobalSearch = lazy(() => import('./pages/GlobalSearch'));
const GlobalStudyRoom = lazy(() => import('./pages/GlobalStudyRoom'));
const GrantNarratives = lazy(() => import('./pages/GrantNarratives'));
const GroupDetail = lazy(() => import('./pages/GroupDetail'));
const GroupEventsCalendar = lazy(() => import('./pages/GroupEventsCalendar'));
const GroupForumTopic = lazy(() => import('./pages/GroupForumTopic'));
const GroupForums = lazy(() => import('./pages/GroupForums'));
const Groups = lazy(() => import('./pages/Groups'));
const GroupsHub = lazy(() => import('./pages/GroupsHub'));
const GrowthDashboard = lazy(() => import('./pages/GrowthDashboard'));
const GrowthMetricsDashboard = lazy(() => import('./pages/GrowthMetricsDashboard'));
const GrowthStrategy = lazy(() => import('./pages/GrowthStrategy'));
const GuidedStudy = lazy(() => import('./pages/GuidedStudy'));
const HabitTracker = lazy(() => import('./pages/HabitTracker'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const History = lazy(() => import('./pages/History'));
const Home = lazy(() => import('./pages/Home'));
const HostEventManager = lazy(() => import('./pages/HostEventManager'));
const InstructorCourseManagement = lazy(() => import('./pages/InstructorCourseManagement'));
const InstructorFeedbackDashboard = lazy(() => import('./pages/InstructorFeedbackDashboard'));
const InstructorProfile = lazy(() => import('./pages/InstructorProfile'));
const InstructorReviewManagement = lazy(() => import('./pages/InstructorReviewManagement'));
const InstructorStudentManagement = lazy(() => import('./pages/InstructorStudentManagement'));
const InvestorPitch = lazy(() => import('./pages/InvestorPitch'));
const JoinLiveRoom = lazy(() => import('./pages/JoinLiveRoom'));
const LandingPageOromo = lazy(() => import('./pages/LandingPageOromo'));
const LaunchAudit20Point = lazy(() => import('./pages/LaunchAudit20Point'));
const LaunchStrategy = lazy(() => import('./pages/LaunchStrategy'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const LearningAnalytics = lazy(() => import('./pages/LearningAnalytics'));
const LearningPathDetail = lazy(() => import('./pages/LearningPathDetail'));
const LearningPaths = lazy(() => import('./pages/LearningPaths'));
const LearningPathsBrowser = lazy(() => import('./pages/LearningPathsBrowser'));
const LessonView = lazy(() => import('./pages/LessonView'));
const LifeSituationSearch = lazy(() => import('./pages/LifeSituationSearch'));
const LifeSituationVerses = lazy(() => import('./pages/LifeSituationVerses'));
const ListenLater = lazy(() => import('./pages/ListenLater'));
const LiveEventDetail = lazy(() => import('./pages/LiveEventDetail'));
const LiveEvents = lazy(() => import('./pages/LiveEvents'));
const LiveRoom = lazy(() => import('./pages/LiveRoom'));
const LiveStreamAdmin = lazy(() => import('./pages/LiveStreamAdmin'));
const LiveStreamView = lazy(() => import('./pages/LiveStreamView'));
const LiveStreamViewer = lazy(() => import('./pages/LiveStreamViewer'));
const ManageSubscription = lazy(() => import('./pages/ManageSubscription'));
const MemoryVerses = lazy(() => import('./pages/MemoryVerses'));
const MentorDashboard = lazy(() => import('./pages/MentorDashboard'));
const MentorshipDetail = lazy(() => import('./pages/MentorshipDetail'));
const ModerationDashboard = lazy(() => import('./pages/ModerationDashboard'));
const ModeratorDashboard = lazy(() => import('./pages/ModeratorDashboard'));
const MonetizationStrategy = lazy(() => import('./pages/MonetizationStrategy'));
const MyAIExplanations = lazy(() => import('./pages/MyAIExplanations'));
const MyAIOutputs = lazy(() => import('./pages/MyAIOutputs'));
const MyAudioLibrary = lazy(() => import('./pages/MyAudioLibrary'));
const MyCertificates = lazy(() => import('./pages/MyCertificates'));
const MyCourses = lazy(() => import('./pages/MyCourses'));
const MyEnrolledCourses = lazy(() => import('./pages/MyEnrolledCourses'));
const MyFaithJourney = lazy(() => import('./pages/MyFaithJourney'));
const MyFollows = lazy(() => import('./pages/MyFollows'));
const MyHighlights = lazy(() => import('./pages/MyHighlights'));
const MyJournal = lazy(() => import('./pages/MyJournal'));
const MyReadingPlans = lazy(() => import('./pages/MyReadingPlans'));
const MyStudyDashboard = lazy(() => import('./pages/MyStudyDashboard'));
const MyStudyPlans = lazy(() => import('./pages/MyStudyPlans'));
const MyTeachingPrograms = lazy(() => import('./pages/MyTeachingPrograms'));
const NotificationPreferencesPage = lazy(() => import('./pages/NotificationPreferencesPage'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const OfficeHours = lazy(() => import('./pages/OfficeHours'));
const OfflineBibleManager = lazy(() => import('./pages/OfflineBibleManager'));
const OfflineContentManager = lazy(() => import('./pages/OfflineContentManager'));
const OfflineDownloadCenter = lazy(() => import('./pages/OfflineDownloadCenter'));
const OfflineDownloadManager = lazy(() => import('./pages/OfflineDownloadManager'));
const OfflineDownloadsPage = lazy(() => import('./pages/OfflineDownloadsPage'));
const OfflineLessons = lazy(() => import('./pages/OfflineLessons'));
const OfflineLibrary = lazy(() => import('./pages/OfflineLibrary'));
const OfflineLibraryManager = lazy(() => import('./pages/OfflineLibraryManager'));
const OfflineLibraryPage = lazy(() => import('./pages/OfflineLibraryPage'));
const OfflineManager = lazy(() => import('./pages/OfflineManager'));
const OfflineMode = lazy(() => import('./pages/OfflineMode'));
const OfflineNotesLibrary = lazy(() => import('./pages/OfflineNotesLibrary'));
const OfflineReader = lazy(() => import('./pages/OfflineReader'));
const OfflineSearch = lazy(() => import('./pages/OfflineSearch'));
const OfflineSelfTest = lazy(() => import('./pages/OfflineSelfTest'));
const OfflineStorageManager = lazy(() => import('./pages/OfflineStorageManager'));
const OnboardingFlow = lazy(() => import('./pages/OnboardingFlow'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const PassageCompare = lazy(() => import('./pages/PassageCompare'));
const PastorAdminDashboard = lazy(() => import('./pages/PastorAdminDashboard'));
const PersonalReadingPlans = lazy(() => import('./pages/PersonalReadingPlans'));
const PersonalizedBibleJourney = lazy(() => import('./pages/PersonalizedBibleJourney'));
const PersonalizedLearningPath = lazy(() => import('./pages/PersonalizedLearningPath'));
const PersonalizedStudyPlanGenerator = lazy(() => import('./pages/PersonalizedStudyPlanGenerator'));
const PersonalizedStudyPlans = lazy(() => import('./pages/PersonalizedStudyPlans'));
const PrayerAssistantPage = lazy(() => import('./pages/PrayerAssistantPage'));
const PrayerCircles = lazy(() => import('./pages/PrayerCircles'));
const PrayerGroupDetail = lazy(() => import('./pages/PrayerGroupDetail'));
const PrayerGroups = lazy(() => import('./pages/PrayerGroups'));
const PrayerJournal = lazy(() => import('./pages/PrayerJournal'));
const PrayerPartnerPage = lazy(() => import('./pages/PrayerPartnerPage'));
const PrayerWall = lazy(() => import('./pages/PrayerWall'));
const PrayerWallCommunity = lazy(() => import('./pages/PrayerWallCommunity'));
const PrayerWallPage = lazy(() => import('./pages/PrayerWallPage'));
const PrePublishAudit = lazy(() => import('./pages/PrePublishAudit'));
const PreSubmissionTest = lazy(() => import('./pages/PreSubmissionTest'));
const PremiumFeatures = lazy(() => import('./pages/PremiumFeatures'));
const Pricing = lazy(() => import('./pages/Pricing'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const PrivateJournal = lazy(() => import('./pages/PrivateJournal'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Projects = lazy(() => import('./pages/Projects'));
const QuizCategories = lazy(() => import('./pages/QuizCategories'));
const QuizHistory = lazy(() => import('./pages/QuizHistory'));
const QuizLeaderboard = lazy(() => import('./pages/QuizLeaderboard'));
const QuizPlayer = lazy(() => import('./pages/QuizPlayer'));
const QuizView = lazy(() => import('./pages/QuizView'));
const ReadingGoals = lazy(() => import('./pages/ReadingGoals'));
const ReadingPlanDetail = lazy(() => import('./pages/ReadingPlanDetail'));
const ReadingPlans = lazy(() => import('./pages/ReadingPlans'));
const ReadingStreakDashboard = lazy(() => import('./pages/ReadingStreakDashboard'));
const ReadingStreaks = lazy(() => import('./pages/ReadingStreaks'));
const RejectionRiskAudit = lazy(() => import('./pages/RejectionRiskAudit'));
const ReleaseSheet = lazy(() => import('./pages/ReleaseSheet'));
const ReviewTeacherApplications = lazy(() => import('./pages/ReviewTeacherApplications'));
const ReviewerApprovalAdmin = lazy(() => import('./pages/ReviewerApprovalAdmin'));
const ReviewerOnboarding = lazy(() => import('./pages/ReviewerOnboarding'));
const ReviewerQAChecklist = lazy(() => import('./pages/ReviewerQAChecklist'));
const Roadmap = lazy(() => import('./pages/Roadmap'));
const SavedSermons = lazy(() => import('./pages/SavedSermons'));
const SavedVersesDashboard = lazy(() => import('./pages/SavedVersesDashboard'));
const ScriptureStudyGroups = lazy(() => import('./pages/ScriptureStudyGroups'));
const SecurityPolicy = lazy(() => import('./pages/SecurityPolicy'));
const SemanticBibleSearch = lazy(() => import('./pages/SemanticBibleSearch'));
const SermonAI = lazy(() => import('./pages/SermonAI'));
const SermonAnalytics = lazy(() => import('./pages/SermonAnalytics'));
const SermonAndPrayerBuilder = lazy(() => import('./pages/SermonAndPrayerBuilder'));
const SermonAudioLibrary = lazy(() => import('./pages/SermonAudioLibrary'));
const SermonBuilder = lazy(() => import('./pages/SermonBuilder'));
const SermonEditor = lazy(() => import('./pages/SermonEditor'));
const SermonGenerator = lazy(() => import('./pages/SermonGenerator'));
const SermonIllustrationGenerator = lazy(() => import('./pages/SermonIllustrationGenerator'));
const SermonSeries = lazy(() => import('./pages/SermonSeries'));
const SermonTools = lazy(() => import('./pages/SermonTools'));
const ServiceRoom = lazy(() => import('./pages/ServiceRoom'));
const Settings = lazy(() => import('./pages/Settings'));
const ShareAppPage = lazy(() => import('./pages/ShareAppPage'));
const ShareExplanation = lazy(() => import('./pages/ShareExplanation'));
const ShareSermon = lazy(() => import('./pages/ShareSermon'));
const ShareableCards = lazy(() => import('./pages/ShareableCards'));
const ShareableCardsPage = lazy(() => import('./pages/ShareableCardsPage'));
const SharedPlans = lazy(() => import('./pages/SharedPlans'));
const SharedVersesFeed = lazy(() => import('./pages/SharedVersesFeed'));
const SocialFeed = lazy(() => import('./pages/SocialFeed'));
const SpiritualGrowthDashboard = lazy(() => import('./pages/SpiritualGrowthDashboard'));
const Splash = lazy(() => import('./pages/Splash'));
const SpiritualJourneyMap = lazy(() => import('./pages/SpiritualJourneyMap'));
const StartServiceRoom = lazy(() => import('./pages/StartServiceRoom'));
const StatementOfFaith = lazy(() => import('./pages/StatementOfFaith'));
const StudentMessageInbox = lazy(() => import('./pages/StudentMessageInbox'));
const StudyCompanion = lazy(() => import('./pages/StudyCompanion'));
const StudyGroupDetail = lazy(() => import('./pages/StudyGroupDetail'));
const StudyGroupHub = lazy(() => import('./pages/StudyGroupHub'));
const StudyGroups = lazy(() => import('./pages/StudyGroups'));
const StudyJourneyBuilder = lazy(() => import('./pages/StudyJourneyBuilder'));
const StudyJourneyDetail = lazy(() => import('./pages/StudyJourneyDetail'));
const StudyNotes = lazy(() => import('./pages/StudyNotes'));
const StudyPlanDetail = lazy(() => import('./pages/StudyPlanDetail'));
const StudyPlanDetails = lazy(() => import('./pages/StudyPlanDetails'));
const StudyPlans = lazy(() => import('./pages/StudyPlans'));
const StudyProgressDashboard = lazy(() => import('./pages/StudyProgressDashboard'));
const StudyRoomDetail = lazy(() => import('./pages/StudyRoomDetail'));
const StudyRooms = lazy(() => import('./pages/StudyRooms'));
const StudyRoomsList = lazy(() => import('./pages/StudyRoomsList'));
const SupportFaithLight = lazy(() => import('./pages/SupportFaithLight'));
const TeacherAnalyticsDashboard = lazy(() => import('./pages/TeacherAnalyticsDashboard'));
const TeacherCourseAnalyticsDashboard = lazy(() => import('./pages/TeacherCourseAnalyticsDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const TeacherMessagingCenter = lazy(() => import('./pages/TeacherMessagingCenter'));
const TeacherWelcome = lazy(() => import('./pages/TeacherWelcome'));
const TeachingProgramGenerator = lazy(() => import('./pages/TeachingProgramGenerator'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const TrainingCourse = lazy(() => import('./pages/TrainingCourse'));
const TrainingHome = lazy(() => import('./pages/TrainingHome'));
const TrainingLesson = lazy(() => import('./pages/TrainingLesson'));
const TrainingMaterials = lazy(() => import('./pages/TrainingMaterials'));
const TrainingModuleBuilder = lazy(() => import('./pages/TrainingModuleBuilder'));
const TrainingPathDashboard = lazy(() => import('./pages/TrainingPathDashboard'));
const TrainingQuiz = lazy(() => import('./pages/TrainingQuiz'));
const TrainingSetup = lazy(() => import('./pages/TrainingSetup'));
const TrainingTrack = lazy(() => import('./pages/TrainingTrack'));
const TrainingTranslations = lazy(() => import('./pages/TrainingTranslations'));
const TranslationFeedbackDashboard = lazy(() => import('./pages/TranslationFeedbackDashboard'));
const TranslationManagement = lazy(() => import('./pages/TranslationManagement'));
const TranslationWorkspace = lazy(() => import('./pages/TranslationWorkspace'));
const UpgradePremium = lazy(() => import('./pages/UpgradePremium'));
const UserPreferences = lazy(() => import('./pages/UserPreferences'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const UserProfilePublic = lazy(() => import('./pages/UserProfilePublic'));
const UserProfileStudy = lazy(() => import('./pages/UserProfileStudy'));
const UserSettings = lazy(() => import('./pages/UserSettings'));
const UserXPDashboard = lazy(() => import('./pages/UserXPDashboard'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const VerifyCertificateFormal = lazy(() => import('./pages/VerifyCertificateFormal'));
const VerifyLeader = lazy(() => import('./pages/VerifyLeader'));
const VerseComparison = lazy(() => import('./pages/VerseComparison'));
const VerseDetail = lazy(() => import('./pages/VerseDetail'));
const VerseImageGenerator = lazy(() => import('./pages/VerseImageGenerator'));
const VerseImagePreview = lazy(() => import('./pages/VerseImagePreview'));
const VerseImageShare = lazy(() => import('./pages/VerseImageShare'));
const VerseImageStylePicker = lazy(() => import('./pages/VerseImageStylePicker'));
const VerseOfDaySettings = lazy(() => import('./pages/VerseOfDaySettings'));
const VisionValues = lazy(() => import('./pages/VisionValues'));
const Welcome = lazy(() => import('./pages/Welcome'));
const ProfileAchievements = lazy(() => import('./pages/ProfileAchievements'));

export const PAGES = {
    "AIBibleCompanion": AIBibleCompanion,
    "AIBibleGuide": AIBibleGuide,
    "AIBibleStudyPlanner": AIBibleStudyPlanner,
    "AIBibleTutor": AIBibleTutor,
    "AICourseGenerator": AICourseGenerator,
    "AIEnhancedBibleStudy": AIEnhancedBibleStudy,
    "AIExplain": AIExplain,
    "AIIntegrity": AIIntegrity,
    "AILessonAssistant": AILessonAssistant,
    "AIQuizzes": AIQuizzes,
    "AIReportsAdmin": AIReportsAdmin,
    "AISermonBuilder": AISermonBuilder,
    "AISpiritualMentor": AISpiritualMentor,
    "AIStudyContentCreator": AIStudyContentCreator,
    "AIStudyPlanBuilder": AIStudyPlanBuilder,
    "AIStudyPlanBuilderV2": AIStudyPlanBuilderV2,
    "AIStudyPlanGenerator": AIStudyPlanGenerator,
    "AIWelcome": AIWelcome,
    "APIBibleTest": APIBibleTest,
    "APIDocumentation": APIDocumentation,
    "About": About,
    "AcademySubscription": AcademySubscription,
    "ActivityFeed": ActivityFeed,
    "AdminDashboard": AdminDashboard,
    "AdminLeaderVerification": AdminLeaderVerification,
    "AdminMentorManagement": AdminMentorManagement,
    "AdminModeration": AdminModeration,
    "AdminModerationDashboard": AdminModerationDashboard,
    "AdminRoles": AdminRoles,
    "AdminUserProfiles": AdminUserProfiles,
    "AdvancedBibleSearch": AdvancedBibleSearch,
    "AdvancedBibleStudy": AdvancedBibleStudy,
    "AdvancedReadingPlan": AdvancedReadingPlan,
    "AmbassadorAgreements": AmbassadorAgreements,
    "AmbassadorCountryDetail": AmbassadorCountryDetail,
    "AmbassadorDashboard": AmbassadorDashboard,
    "AmbassadorProgram": AmbassadorProgram,
    "AnalyticsDashboard": AnalyticsDashboard,
    "Announcements": Announcements,
    "AnonymousPrayerWall": AnonymousPrayerWall,
    "AppReviewAudit": AppReviewAudit,
    "AppReviewerChecklist": AppReviewerChecklist,
    "AppStoreDescription": AppStoreDescription,
    "AppStoreListing": AppStoreListing,
    "AppStoreMetadata": AppStoreMetadata,
    "AppStoreReadinessChecklist": AppStoreReadinessChecklist,
    "AppStoreReviewAudit": AppStoreReviewAudit,
    "AppStoreScreenshots": AppStoreScreenshots,
    "AppStoreSubmissionChecklist": AppStoreSubmissionChecklist,
    "AppStoreSubmissionPackage": AppStoreSubmissionPackage,
    "AppleRejectionFixes": AppleRejectionFixes,
    "AppleReviewGuide": AppleReviewGuide,
    "ApplyForVerification": ApplyForVerification,
    "ApplyTeacher": ApplyTeacher,
    "AskAI": AskAI,
    "AudioBible": AudioBible,
    "AudioBibleCatalog": AudioBibleCatalog,
    "AudioBiblePage": AudioBiblePage,
    "AudioBiblePlayer": AudioBiblePlayer,
    "AudioBibleV2": AudioBibleV2,
    "AuthPage": AuthPage,
    "BecomeMentor": BecomeMentor,
    "BibleCanon": BibleCanon,
    "BibleComparison": BibleComparison,
    "BibleDataImport": BibleDataImport,
    "BibleDataSetup": BibleDataSetup,
    "BibleDownloads": BibleDownloads,
    "BibleExplain": BibleExplain,
    "BibleForum": BibleForum,
    "BibleGeographyMap": BibleGeographyMap,
    "BibleJournal": BibleJournal,
    "BibleMemoryGame": BibleMemoryGame,
    "BibleOfflineAccess": BibleOfflineAccess,
    "BibleOfflineManager": BibleOfflineManager,
    "BibleQuiz": BibleQuiz,
    "BibleReader": BibleReader,
    "BibleReaderNew": BibleReaderNew,
    "BibleReaderPage": BibleReaderPage,
    "BibleReaderSettings": BibleReaderSettings,
    "BibleReadingPlans": BibleReadingPlans,
    "BibleSearch": BibleSearch,
    "BibleStructureOverview": BibleStructureOverview,
    "BibleStudyGroups": BibleStudyGroups,
    "BibleStudyHub": BibleStudyHub,
    "BibleStudyMode": BibleStudyMode,
    "BibleStudyPartner": BibleStudyPartner,
    "BibleStudyPlanBrowser": BibleStudyPlanBrowser,
    "BibleStudyPlans": BibleStudyPlans,
    "BibleTools": BibleTools,
    "BibleTutor": BibleTutor,
    "BibleVerseSearch": BibleVerseSearch,
    "BiblicalTimeline": BiblicalTimeline,
    "BillingCancel": BillingCancel,
    "BillingHistory": BillingHistory,
    "BillingSuccess": BillingSuccess,
    "BillingualLegalDocs": BillingualLegalDocs,
    "BlogSearch": BlogSearch,
    "CallHistory": CallHistory,
    "CertificateCheckoutCancel": CertificateCheckoutCancel,
    "CertificateCheckoutSuccess": CertificateCheckoutSuccess,
    "ChristianPodcasts": ChristianPodcasts,
    "ChurchAdminDashboard": ChurchAdminDashboard,
    "ChurchAdminGuides": ChurchAdminGuides,
    "ChurchEvents": ChurchEvents,
    "ChurchFinder": ChurchFinder,
    "ChurchJoin": ChurchJoin,
    "ChurchJoinPage": ChurchJoinPage,
    "ChurchLanding": ChurchLanding,
    "ChurchMode": ChurchMode,
    "ChurchModeSettings": ChurchModeSettings,
    "ChurchPartnership": ChurchPartnership,
    "ChurchQuiz": ChurchQuiz,
    "ChurchStudyDetail": ChurchStudyDetail,
    "ChurchStudyMode": ChurchStudyMode,
    "Collections": Collections,
    "Community": Community,
    "CommunityChallenges": CommunityChallenges,
    "CommunityDiscussions": CommunityDiscussions,
    "CommunityGuidelines": CommunityGuidelines,
    "CommunityPostDetails": CommunityPostDetails,
    "CommunityPrayerBoard": CommunityPrayerBoard,
    "CommunityPrayerWall": CommunityPrayerWall,
    "CommunitySermons": CommunitySermons,
    "CommunityShowcase": CommunityShowcase,
    "CommunityStudyGroups": CommunityStudyGroups,
    "Contact": Contact,
    "CopyrightNotice": CopyrightNotice,
    "CountryResources": CountryResources,
    "CountryResourcesAdmin": CountryResourcesAdmin,
    "CourseBuilder": CourseBuilder,
    "CourseDetail": CourseDetail,
    "CreateLesson": CreateLesson,
    "CreateLiveEvent": CreateLiveEvent,
    "CreateLiveRoom": CreateLiveRoom,
    "CreateProfile": CreateProfile,
    "CustomReadingPlanGenerator": CustomReadingPlanGenerator,
    "CustomReadingPlans": CustomReadingPlans,
    "CustomStudyPlanBuilder": CustomStudyPlanBuilder,
    "Daily": Daily,
    "DailyBibleQuiz": DailyBibleQuiz,
    "DailyDevotional": DailyDevotional,
    "DailyDevotionals": DailyDevotionals,
    "DailyFaithJourney": DailyFaithJourney,
    "DailyPrayerGenerator": DailyPrayerGenerator,
    "DailyQuizPage": DailyQuizPage,
    "DailyReadingPlan": DailyReadingPlan,
    "DataDeletionRequest": DataDeletionRequest,
    "DetailedProgressDashboard": DetailedProgressDashboard,
    "DirectMessages": DirectMessages,
    "Discover": Discover,
    "DiscoverGroups": DiscoverGroups,
    "DiscoverStudyPlans": DiscoverStudyPlans,
    "DiscussionGroups": DiscussionGroups,
    "DonorFollowUp": DonorFollowUp,
    "DonorManagement": DonorManagement,
    "DonorPortal": DonorPortal,
    "Download": Download,
    "DownloadedBible": DownloadedBible,
    "Downloads": Downloads,
    "DraftCoursesReview": DraftCoursesReview,
    "DrivingMode": DrivingMode,
    "EventArchive": EventArchive,
    "EventCalendar": EventCalendar,
    "ExploreCourses": ExploreCourses,
    "FAQ": FAQ,
    "FaithJourneyDashboard": FaithJourneyDashboard,
    "FaithLightHome": FaithLightHome,
    "FaithLightPlus": FaithLightPlus,
    "FaithWidget": FaithWidget,
    "Favorites": Favorites,
    "FinalExam": FinalExam,
    "FinalLaunchChecklist": FinalLaunchChecklist,
    "FinalPreLaunchChecklist": FinalPreLaunchChecklist,
    "FindChurches": FindChurches,
    "FindFriends": FindFriends,
    "FindMentor": FindMentor,
    "FlutterDevelopmentGuide": FlutterDevelopmentGuide,
    "ForChurches": ForChurches,
    "ForTeachers": ForTeachers,
    "ForgotPassword": ForgotPassword,
    "Forum": Forum,
    "ForumTopic": ForumTopic,
    "Friends": Friends,
    "FullBibleReader": FullBibleReader,
    "GamificationLeaderboard": GamificationLeaderboard,
    "GenerateFullLesson": GenerateFullLesson,
    "GetFaithLight": GetFaithLight,
    "GlobalBiblicalLeadershipDiploma": GlobalBiblicalLeadershipDiploma,
    "GlobalBiblicalLeadershipInstitute": GlobalBiblicalLeadershipInstitute,
    "GlobalPrayerMap": GlobalPrayerMap,
    "GlobalSearch": GlobalSearch,
    "GlobalStudyRoom": GlobalStudyRoom,
    "GrantNarratives": GrantNarratives,
    "GroupDetail": GroupDetail,
    "GroupEventsCalendar": GroupEventsCalendar,
    "GroupForumTopic": GroupForumTopic,
    "GroupForums": GroupForums,
    "Groups": Groups,
    "GroupsHub": GroupsHub,
    "GrowthDashboard": GrowthDashboard,
    "GrowthMetricsDashboard": GrowthMetricsDashboard,
    "GrowthStrategy": GrowthStrategy,
    "GuidedStudy": GuidedStudy,
    "HabitTracker": HabitTracker,
    "HelpCenter": HelpCenter,
    "History": History,
    "Home": Home,
    "HostEventManager": HostEventManager,
    "InstructorCourseManagement": InstructorCourseManagement,
    "InstructorFeedbackDashboard": InstructorFeedbackDashboard,
    "InstructorProfile": InstructorProfile,
    "InstructorReviewManagement": InstructorReviewManagement,
    "InstructorStudentManagement": InstructorStudentManagement,
    "InvestorPitch": InvestorPitch,
    "JoinLiveRoom": JoinLiveRoom,
    "LandingPageOromo": LandingPageOromo,
    "LaunchAudit20Point": LaunchAudit20Point,
    "LaunchStrategy": LaunchStrategy,
    "Leaderboard": Leaderboard,
    "LearningAnalytics": LearningAnalytics,
    "LearningPathDetail": LearningPathDetail,
    "LearningPaths": LearningPaths,
    "LearningPathsBrowser": LearningPathsBrowser,
    "LessonView": LessonView,
    "LifeSituationSearch": LifeSituationSearch,
    "LifeSituationVerses": LifeSituationVerses,
    "ListenLater": ListenLater,
    "LiveEventDetail": LiveEventDetail,
    "LiveEvents": LiveEvents,
    "LiveRoom": LiveRoom,
    "LiveStreamAdmin": LiveStreamAdmin,
    "LiveStreamView": LiveStreamView,
    "LiveStreamViewer": LiveStreamViewer,
    "ManageSubscription": ManageSubscription,
    "MemoryVerses": MemoryVerses,
    "MentorDashboard": MentorDashboard,
    "MentorshipDetail": MentorshipDetail,
    "ModerationDashboard": ModerationDashboard,
    "ModeratorDashboard": ModeratorDashboard,
    "MonetizationStrategy": MonetizationStrategy,
    "MyAIExplanations": MyAIExplanations,
    "MyAIOutputs": MyAIOutputs,
    "MyAudioLibrary": MyAudioLibrary,
    "MyCertificates": MyCertificates,
    "MyCourses": MyCourses,
    "MyEnrolledCourses": MyEnrolledCourses,
    "MyFaithJourney": MyFaithJourney,
    "MyFollows": MyFollows,
    "MyHighlights": MyHighlights,
    "MyJournal": MyJournal,
    "MyReadingPlans": MyReadingPlans,
    "MyStudyDashboard": MyStudyDashboard,
    "MyStudyPlans": MyStudyPlans,
    "MyTeachingPrograms": MyTeachingPrograms,
    "NotificationPreferencesPage": NotificationPreferencesPage,
    "NotificationSettings": NotificationSettings,
    "OfficeHours": OfficeHours,
    "OfflineBibleManager": OfflineBibleManager,
    "OfflineContentManager": OfflineContentManager,
    "OfflineDownloadCenter": OfflineDownloadCenter,
    "OfflineDownloadManager": OfflineDownloadManager,
    "OfflineDownloadsPage": OfflineDownloadsPage,
    "OfflineLessons": OfflineLessons,
    "OfflineLibrary": OfflineLibrary,
    "OfflineLibraryManager": OfflineLibraryManager,
    "OfflineLibraryPage": OfflineLibraryPage,
    "OfflineManager": OfflineManager,
    "OfflineMode": OfflineMode,
    "OfflineNotesLibrary": OfflineNotesLibrary,
    "OfflineReader": OfflineReader,
    "OfflineSearch": OfflineSearch,
    "OfflineSelfTest": OfflineSelfTest,
    "OfflineStorageManager": OfflineStorageManager,
    "OnboardingFlow": OnboardingFlow,
    "OnboardingPage": OnboardingPage,
    "PassageCompare": PassageCompare,
    "PastorAdminDashboard": PastorAdminDashboard,
    "PersonalReadingPlans": PersonalReadingPlans,
    "PersonalizedBibleJourney": PersonalizedBibleJourney,
    "PersonalizedLearningPath": PersonalizedLearningPath,
    "PersonalizedStudyPlanGenerator": PersonalizedStudyPlanGenerator,
    "PersonalizedStudyPlans": PersonalizedStudyPlans,
    "PrayerAssistantPage": PrayerAssistantPage,
    "PrayerCircles": PrayerCircles,
    "PrayerGroupDetail": PrayerGroupDetail,
    "PrayerGroups": PrayerGroups,
    "PrayerJournal": PrayerJournal,
    "PrayerPartnerPage": PrayerPartnerPage,
    "PrayerWall": PrayerWall,
    "PrayerWallCommunity": PrayerWallCommunity,
    "PrayerWallPage": PrayerWallPage,
    "PrePublishAudit": PrePublishAudit,
    "PreSubmissionTest": PreSubmissionTest,
    "PremiumFeatures": PremiumFeatures,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "PrivateJournal": PrivateJournal,
    "ProjectDetail": ProjectDetail,
    "Projects": Projects,
    "QuizCategories": QuizCategories,
    "QuizHistory": QuizHistory,
    "QuizLeaderboard": QuizLeaderboard,
    "QuizPlayer": QuizPlayer,
    "QuizView": QuizView,
    "ReadingGoals": ReadingGoals,
    "ReadingPlanDetail": ReadingPlanDetail,
    "ReadingPlans": ReadingPlans,
    "ReadingStreakDashboard": ReadingStreakDashboard,
    "ReadingStreaks": ReadingStreaks,
    "RejectionRiskAudit": RejectionRiskAudit,
    "ReleaseSheet": ReleaseSheet,
    "ReviewTeacherApplications": ReviewTeacherApplications,
    "ReviewerApprovalAdmin": ReviewerApprovalAdmin,
    "ReviewerOnboarding": ReviewerOnboarding,
    "ReviewerQAChecklist": ReviewerQAChecklist,
    "Roadmap": Roadmap,
    "SavedSermons": SavedSermons,
    "SavedVersesDashboard": SavedVersesDashboard,
    "ScriptureStudyGroups": ScriptureStudyGroups,
    "SecurityPolicy": SecurityPolicy,
    "SemanticBibleSearch": SemanticBibleSearch,
    "SermonAI": SermonAI,
    "SermonAnalytics": SermonAnalytics,
    "SermonAndPrayerBuilder": SermonAndPrayerBuilder,
    "SermonAudioLibrary": SermonAudioLibrary,
    "SermonBuilder": SermonBuilder,
    "SermonEditor": SermonEditor,
    "SermonGenerator": SermonGenerator,
    "SermonIllustrationGenerator": SermonIllustrationGenerator,
    "SermonSeries": SermonSeries,
    "SermonTools": SermonTools,
    "ServiceRoom": ServiceRoom,
    "Settings": Settings,
    "ShareAppPage": ShareAppPage,
    "ShareExplanation": ShareExplanation,
    "ShareSermon": ShareSermon,
    "ShareableCards": ShareableCards,
    "ShareableCardsPage": ShareableCardsPage,
    "SharedPlans": SharedPlans,
    "SharedVersesFeed": SharedVersesFeed,
    "SocialFeed": SocialFeed,
    "SpiritualGrowthDashboard": SpiritualGrowthDashboard,
    "Splash": Splash,
    "SpiritualJourneyMap": SpiritualJourneyMap,
    "StartServiceRoom": StartServiceRoom,
    "StatementOfFaith": StatementOfFaith,
    "StudentMessageInbox": StudentMessageInbox,
    "StudyCompanion": StudyCompanion,
    "StudyGroupDetail": StudyGroupDetail,
    "StudyGroupHub": StudyGroupHub,
    "StudyGroups": StudyGroups,
    "StudyJourneyBuilder": StudyJourneyBuilder,
    "StudyJourneyDetail": StudyJourneyDetail,
    "StudyNotes": StudyNotes,
    "StudyPlanDetail": StudyPlanDetail,
    "StudyPlanDetails": StudyPlanDetails,
    "StudyPlans": StudyPlans,
    "StudyProgressDashboard": StudyProgressDashboard,
    "StudyRoomDetail": StudyRoomDetail,
    "StudyRooms": StudyRooms,
    "StudyRoomsList": StudyRoomsList,
    "SupportFaithLight": SupportFaithLight,
    "TeacherAnalyticsDashboard": TeacherAnalyticsDashboard,
    "TeacherCourseAnalyticsDashboard": TeacherCourseAnalyticsDashboard,
    "TeacherDashboard": TeacherDashboard,
    "TeacherMessagingCenter": TeacherMessagingCenter,
    "TeacherWelcome": TeacherWelcome,
    "TeachingProgramGenerator": TeachingProgramGenerator,
    "TermsOfService": TermsOfService,
    "TermsOfUse": TermsOfUse,
    "TrainingCourse": TrainingCourse,
    "TrainingHome": TrainingHome,
    "TrainingLesson": TrainingLesson,
    "TrainingMaterials": TrainingMaterials,
    "TrainingModuleBuilder": TrainingModuleBuilder,
    "TrainingPathDashboard": TrainingPathDashboard,
    "TrainingQuiz": TrainingQuiz,
    "TrainingSetup": TrainingSetup,
    "TrainingTrack": TrainingTrack,
    "TrainingTranslations": TrainingTranslations,
    "TranslationFeedbackDashboard": TranslationFeedbackDashboard,
    "TranslationManagement": TranslationManagement,
    "TranslationWorkspace": TranslationWorkspace,
    "UpgradePremium": UpgradePremium,
    "UserPreferences": UserPreferences,
    "UserProfile": UserProfile,
    "UserProfilePublic": UserProfilePublic,
    "UserProfileStudy": UserProfileStudy,
    "UserSettings": UserSettings,
    "UserXPDashboard": UserXPDashboard,
    "VerifyCertificate": VerifyCertificate,
    "VerifyCertificateFormal": VerifyCertificateFormal,
    "VerifyLeader": VerifyLeader,
    "VerseComparison": VerseComparison,
    "VerseDetail": VerseDetail,
    "VerseImageGenerator": VerseImageGenerator,
    "VerseImagePreview": VerseImagePreview,
    "VerseImageShare": VerseImageShare,
    "VerseImageStylePicker": VerseImageStylePicker,
    "VerseOfDaySettings": VerseOfDaySettings,
    "VisionValues": VisionValues,
    "Welcome": Welcome,
    "ProfileAchievements": ProfileAchievements,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};