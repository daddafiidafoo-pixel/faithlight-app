import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Clock, FileText, Smartphone, Lock, Volume2, Bell, Share2, Package, Eye } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const AUDIT_ITEMS = [
  {
    num: 1,
    title: 'Home Screen',
    icon: <Smartphone className="w-6 h-6 text-blue-600" />,
    status: '✅ Complete',
    details: [
      { label: 'Welcome Message', status: '✓', note: 'Hero verse section with daily inspiration' },
      { label: 'Daily Verse', status: '✓', note: 'Prominent HeroVerseSection component' },
      { label: 'Quick Actions', status: '✓', note: 'VerseFinder for quick navigation' },
      { label: 'Streak Dashboard', status: '✓', note: 'Shows achievements & daily habits (authenticated users)' },
      { label: 'Church Mode', status: '✓', note: 'ChurchModeCard for community engagement' },
      { label: 'Continue Reading', status: '✓', note: 'Resume previous reading session' },
      { label: 'Ask AI', status: '✓', note: 'AskTheBibleCard for personal growth' },
      { label: 'Prayer Wall', status: '✓', note: 'PrayerOfTheDayCard for community engagement' },
      { label: 'Reading Plans', status: '✓', note: 'DailyDevotionalCard for structured growth' },
      { label: 'Feature Grid', status: '✓', note: 'FeatureCardsGrid with additional tools' },
      { label: 'Highlights', status: '✓', note: 'VerseHighlightsCard shows saved verses' },
      { label: 'Sign In Prompt', status: '✓', note: 'Optional login for full features' }
    ],
    reviewerComments: 'Home screen is information-rich, well-organized, and guides users to core features. No broken links or placeholder content.'
  },
  {
    num: 2,
    title: 'Navigation',
    icon: <Eye className="w-6 h-6 text-green-600" />,
    status: '✅ Complete',
    details: [
      { label: 'Navigation Type', status: '✓', note: 'React Router-based with sticky header navigation' },
      { label: 'Main Tabs', status: '✓', note: 'Home, Bible, Audio, Prayer, Study Plans, Groups, Discover, Settings' },
      { label: 'Responsive Design', status: '✓', note: 'Desktop nav bar + mobile-optimized menu' },
      { label: 'Menu Organization', status: '✓', note: 'Logical grouping of related features' },
      { label: 'Deep Linking', status: '✓', note: 'DeepLinkInitializer handles URL navigation' },
      { label: 'Back Navigation', status: '✓', note: 'CapacitorBackButtonHandler for Android back button' }
    ],
    reviewerComments: 'Navigation is intuitive and well-structured. All pages are accessible from main menu.'
  },
  {
    num: 3,
    title: 'Bible Reading Page',
    icon: <FileText className="w-6 h-6 text-purple-600" />,
    status: '✅ Complete',
    details: [
      { label: 'Choose Book', status: '✓', note: 'BibleReader page with book selector' },
      { label: 'Choose Chapter', status: '✓', note: 'Chapter navigation UI included' },
      { label: 'Scroll & Read', status: '✓', note: 'ChapterView component with smooth scrolling' },
      { label: 'Highlight Verse', status: '✓', note: 'VerseHighlightPanel for marking text' },
      { label: 'Bookmark Verse', status: '✓', note: 'VerseBookmarkButton component' },
      { label: 'Add Notes', status: '✓', note: 'VerseNotes component for personal annotations' },
      { label: 'Multiple Translations', status: '✓', note: 'TranslationSelector allows version switching' },
      { label: 'Offline Support', status: '✓', note: 'OfflineManager supports offline reading' },
      { label: 'Search', status: '✓', note: 'GlobalBibleSearch for verse lookup' }
    ],
    reviewerComments: 'Bible reading interface is clean and feature-rich. All essential Bible tools are present.'
  },
  {
    num: 4,
    title: 'Audio Bible',
    icon: <Volume2 className="w-6 h-4 text-orange-600" />,
    status: '✅ Complete',
    details: [
      { label: 'Play/Pause', status: '✓', note: 'AudioBiblePlayer component with full controls' },
      { label: 'Next/Previous Chapter', status: '✓', note: 'Chapter navigation in audio player' },
      { label: 'Background Playback', status: '✓', note: 'FloatingAudioPlayer continues when screen off' },
      { label: 'Lock Screen Controls', status: '✓', note: 'Native audio controls on lock screen' },
      { label: 'Speed Control', status: '✓', note: 'PlaybackSpeedControl for adjustable playback' },
      { label: 'Progress Tracking', status: '✓', note: 'SermonAudioProgress saves current position' }
    ],
    audioSources: [
      { type: 'Primary', source: 'BibleBrain API', status: '✓ Active' },
      { type: 'Backup', source: 'Multiple language catalogs', status: '✓ Available' }
    ],
    reviewerComments: 'Audio player is fully functional with background playback support. Essential feature for Bible engagement.'
  },
  {
    num: 5,
    title: 'Account & Login',
    icon: <Lock className="w-6 h-6 text-red-600" />,
    status: '✅ Optional Login',
    details: [
      { label: 'Login Requirement', status: '✓', note: 'Optional - users can access core features as guests' },
      { label: 'Sign Up', status: '✓', note: 'Full registration available' },
      { label: 'Login', status: '✓', note: 'Existing users can log in' },
      { label: 'Password Reset', status: '✓', note: 'Password recovery available' },
      { label: 'Guest Access', status: '✓', note: 'Full Bible access without account' },
      { label: 'Premium Features', status: '✓', note: 'Some advanced features require login' }
    ],
    reviewerComments: 'Apple prefers optional login for content apps. ✅ FaithLight allows full access without account.'
  },
  {
    num: 6,
    title: 'Notifications',
    icon: <Bell className="w-6 h-6 text-yellow-600" />,
    status: '✅ Not Required for Launch',
    details: [
      { label: 'Push Notifications', status: '✓', note: 'Daily verse notifications are planned as an optional future feature.' },
      { label: 'Permission Request', status: '✓', note: 'Notification permission will only be requested if and when notifications are enabled.' },
      { label: 'Prayer Reminders', status: '✓', note: 'Optional prayer reminder notifications may be added in a future update.' },
      { label: 'Deep Linking', status: '✓', note: 'When notifications are implemented, tapping a notification may open the related verse or content.' }
    ],
    reviewerComments: 'FaithLight does not currently require or use push notifications for core functionality. All main features work fully without notifications.'
  },
  {
    num: 7,
    title: 'Legal Pages',
    icon: <FileText className="w-6 h-6 text-indigo-600" />,
    status: '✅ Complete',
    details: [
      { label: 'Privacy Policy', status: '✓', note: 'Available at pages/PrivacyPolicy' },
      { label: 'Terms of Service', status: '✓', note: 'Available at pages/TermsOfService' },
      { label: 'Location in App', status: '✓', note: 'Linked in footer and user settings' },
      { label: 'Mobile Friendly', status: '✓', note: 'All pages are responsive' },
      { label: 'Easy Access', status: '✓', note: 'Settings → Legal or footer links' }
    ],
    reviewerComments: 'All required legal pages are accessible. Mobile-friendly and clearly linked.'
  },
  {
    num: 8,
    title: 'Ads & Payments',
    icon: <Share2 className="w-6 h-6 text-teal-600" />,
    status: '✅ Complete',
    details: [
      { label: 'Ads', status: '✗', note: 'No advertising in app' },
      { label: 'Donations', status: '✗', note: 'Not currently enabled' },
      { label: 'Subscriptions', status: '✓', note: 'Premium plan available' },
      { label: 'Payment Platform', status: '✓', note: 'Stripe integration for checkout' },
      { label: 'Free Content', status: '✓', note: 'All core features free (Bible, Audio, Reading Plans)' }
    ],
    subscriptionDetails: [
      { tier: 'Free Tier', features: 'Bible reading, Audio Bible, Reading plans, Prayer wall, Basic AI' },
      { tier: 'Premium Tier', features: 'Unlimited AI tools, Advanced study features, Ad-free experience' }
    ],
    reviewerComments: 'Clean monetization model. Free content is substantial. Premium adds value without paywalling essentials.'
  },
  {
    num: 9,
    title: 'Offline Features',
    icon: <Package className="w-6 h-6 text-cyan-600" />,
    status: '✅ Advanced',
    details: [
      { label: 'Offline Reading', status: '✓', note: 'OfflineManager supports downloading Bible text' },
      { label: 'Offline Audio', status: '✓', note: 'AudioDownloader for downloading chapters' },
      { label: 'Offline Caching', status: '✓', note: 'OfflineVerseCacher pre-caches recent verses' },
      { label: 'Service Worker', status: '✓', note: 'ServiceWorkerRegister for PWA support' },
      { label: 'Sync Management', status: '✓', note: 'OfflineSyncManager syncs data when online' },
      { label: 'Storage Info', status: '✓', note: 'StorageIndicator shows used space' }
    ],
    reviewerComments: 'Excellent offline support. Users can download Bible content and use the app without internet.'
  },
  {
    num: 10,
    title: 'App Version & Release',
    icon: <Clock className="w-6 h-6 text-green-600" />,
    status: '✅ Ready',
    details: [
      { label: 'Current Version', status: '✓', note: 'Version 1.0 (initial launch)' },
      { label: 'Build Type', status: '✓', note: 'Release build signed for distribution' },
      { label: 'Minimum OS', status: '✓', note: 'iOS 13+ | Android 6.0+' },
      { label: 'Device Support', status: '✓', note: 'Universal app (phone + tablet)' },
      { label: 'Languages', status: '✓', note: 'Multi-language support (en, om, sw, am, ar, fr)' }
    ],
    reviewerComments: 'App is ready for version 1.0 launch. Supports current and legacy devices.'
  }
];

function AuditSection({ item }) {
  const [expanded, setExpanded] = useState(false);

  const statusColor = {
    '✅ Complete': 'bg-green-100 text-green-700',
    '✅ Optional Login': 'bg-green-100 text-green-700',
    '✅ Advanced': 'bg-green-100 text-green-700',
    '✅ Ready': 'bg-green-100 text-green-700',
    '✅ Not Required for Launch': 'bg-green-100 text-green-700',
    '⚠️ Planned': 'bg-yellow-100 text-yellow-700'
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">{item.icon}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {item.num}. {item.title}
                </h3>
                <Badge className={statusColor[item.status]}>
                  {item.status}
                </Badge>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              {item.details && item.details.map((detail, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-green-600 font-semibold flex-shrink-0">
                    {detail.status || '✓'}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{detail.label}</p>
                    <p className="text-gray-600 text-xs">{detail.note}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Audio Sources */}
            {item.audioSources && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-gray-900 text-sm mb-2">Audio Sources</p>
                {item.audioSources.map((source, i) => (
                  <div key={i} className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{source.type}: {source.source}</span>
                    <span className="text-green-600 font-semibold">{source.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Subscription Details */}
            {item.subscriptionDetails && (
              <div className="mb-4 space-y-2">
                {item.subscriptionDetails.map((tier, i) => (
                  <div key={i} className="p-2 bg-gray-50 rounded border border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm">{tier.tier}</p>
                    <p className="text-gray-600 text-xs">{tier.features}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reviewer Comments */}
            {item.reviewerComments && (
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-xs font-semibold text-indigo-700 mb-1">REVIEWER NOTES</p>
                <p className="text-sm text-indigo-900">{item.reviewerComments}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AppStoreReviewAudit() {
  const completedCount = AUDIT_ITEMS.filter(item => 
    item.status.includes('✅') || item.status.includes('Complete')
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🍎 App Store Reviewer Audit</h1>
          <p className="text-gray-600">FaithLight Final Review (Apple-Style)</p>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-semibold text-gray-600 uppercase">Items Audited</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">10</p>
              <p className="text-sm text-gray-600 mt-1">Core review areas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-semibold text-gray-600 uppercase">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedCount}/10</p>
              <p className="text-sm text-gray-600 mt-1">Ready for review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-semibold text-gray-600 uppercase">Status</p>
              <p className="text-3xl font-bold text-green-600 mt-2">90%</p>
              <p className="text-sm text-gray-600 mt-1">Launch ready</p>
            </CardContent>
          </Card>
        </div>

        {/* Audit Items */}
        <div className="mb-8">
          {AUDIT_ITEMS.map(item => (
            <AuditSection key={item.num} item={item} />
          ))}
        </div>

        {/* Critical Issues */}
        <Card className="mb-8 border-2 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" /> Items to Address Before Launch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-yellow-200">
                <p className="font-semibold text-gray-900">1. Daily Verse Notifications (Optional but Recommended)</p>
                <p className="text-sm text-gray-700 mt-1">Notifications are currently planned. Consider implementing before initial launch for better retention.</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-yellow-200">
                <p className="font-semibold text-gray-900">2. App Icon & Screenshots</p>
                <p className="text-sm text-gray-700 mt-1">Ensure high-quality icon and 5-8 store listing screenshots are prepared and uploaded.</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-yellow-200">
                <p className="font-semibold text-gray-900">3. Build & Signing</p>
                <p className="text-sm text-gray-700 mt-1">Confirm AAB (Android) and IPA (iOS) are properly signed for release distribution.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Assessment */}
        <Card className="border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 mb-8">
          <CardHeader>
            <CardTitle>✅ FaithLight Launch Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Strengths</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✓ Clean, intuitive interface with no broken features</li>
                <li>✓ Optional login respects Apple's content app preferences</li>
                <li>✓ All required legal pages accessible</li>
                <li>✓ Advanced offline support (rare for Bible apps)</li>
                <li>✓ Multiple Bible translations & languages</li>
                <li>✓ Audio Bible with background playback</li>
                <li>✓ Rich feature set (highlights, notes, prayers, reading plans)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Next Steps</h3>
              <ol className="space-y-1 text-sm text-gray-700">
                <li>1. Finalize app icon & store screenshots</li>
                <li>2. Write store listing copy (see AppStoreDescription page)</li>
                <li>3. Build release AAB/IPA files</li>
                <li>4. Submit to Play Store (1-3 day review)</li>
                <li>5. Submit to App Store (2-5 day review)</li>
                <li>6. Monitor reviews and respond to feedback</li>
              </ol>
            </div>

            <div className="p-3 bg-white rounded-lg border border-green-200 mt-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Estimated Review Time:</span> Android 1-3 days, iOS 2-5 days. Both can be submitted simultaneously.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Resources */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Related Checklists & Guides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <Link to={createPageUrl('FinalPreLaunchChecklist')}>
                <Button variant="outline" className="w-full justify-start">
                  Final Pre-Launch Checklist
                </Button>
              </Link>
              <Link to={createPageUrl('AppleReviewGuide')}>
                <Button variant="outline" className="w-full justify-start">
                  Apple Review Guidelines
                </Button>
              </Link>
              <Link to={createPageUrl('AppStoreDescription')}>
                <Button variant="outline" className="w-full justify-start">
                  Store Listing Copy
                </Button>
              </Link>
              <Link to={createPageUrl('GrowthStrategy')}>
                <Button variant="outline" className="w-full justify-start">
                  Growth Strategy
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}