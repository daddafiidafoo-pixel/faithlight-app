import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, AlertCircle, Clock, Download, FileCheck, Eye, Smartphone, Lock, FileText, Mail, Palette, Camera, List, Zap, Search, Package, Rocket, BarChart3 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const CHECKLIST_ITEMS = [
  {
    num: 1,
    title: 'Core App Functionality',
    icon: <Smartphone className="w-6 h-6 text-blue-600" />,
    category: 'Critical',
    tasks: [
      { task: 'App launches without crashing', details: 'Test on real device or emulator' },
      { task: 'Home page loads correctly', details: 'No blank pages or missing content' },
      { task: 'Bible reading works', details: 'Able to navigate books and chapters' },
      { task: 'Audio Bible plays correctly', details: 'Audio plays, pauses, resumes properly' },
      { task: 'Navigation buttons work', details: 'All menu items are clickable' },
      { task: 'Back button works', details: 'Android back button navigates correctly' },
      { task: 'App loads fast', details: 'Under 3-4 seconds to full load' },
      { task: 'No blank pages', details: 'All sections have content' },
      { task: 'Offline mode (if supported)', details: 'Works without internet' },
      { task: 'Switching chapters', details: 'Smooth navigation between chapters' },
      { task: 'Scrolling Bible text', details: 'No lag or stuttering' }
    ]
  },
  {
    num: 2,
    title: 'Login & Account System',
    icon: <Lock className="w-6 h-6 text-green-600" />,
    category: 'Required',
    tasks: [
      { task: 'Sign up works', details: 'New users can create account' },
      { task: 'Login works', details: 'Existing users can log in' },
      { task: 'Password reset works', details: 'Users can reset forgotten passwords' },
      { task: 'Logout works', details: 'Users can log out cleanly' },
      { task: 'Guest access (if optional)', details: 'Allow content access without login' }
    ]
  },
  {
    num: 3,
    title: 'Legal Pages (Required)',
    icon: <FileText className="w-6 h-6 text-purple-600" />,
    category: 'Critical',
    tasks: [
      { task: 'Privacy Policy accessible', details: 'Must open on mobile without issues' },
      { task: 'Terms of Service accessible', details: 'Must be readable on all devices' },
      { task: 'Disclaimer page accessible', details: 'If applicable for your content' },
      { task: 'Links work from app', details: 'All links point to correct pages' },
      { task: 'Pages are mobile-friendly', details: 'Text readable without zooming' }
    ]
  },
  {
    num: 4,
    title: 'Support Information',
    icon: <Mail className="w-6 h-6 text-orange-600" />,
    category: 'Required',
    tasks: [
      { task: 'Support email set', details: 'support@faithlight.app or similar' },
      { task: 'Email is monitored', details: 'You can receive and respond to emails' },
      { task: 'Support page (optional)', details: 'Link to support/help center' },
      { task: 'Contact info in app', details: 'Users can easily find how to contact support' }
    ]
  },
  {
    num: 5,
    title: 'App Icon & Branding',
    icon: <Palette className="w-6 h-6 text-pink-600" />,
    category: 'Critical',
    tasks: [
      { task: 'Icon resolution correct', details: '1024x1024 for iOS, 512x512 for Android' },
      { task: 'App name spelled correctly', details: 'FaithLight (not Faith Light)' },
      { task: 'No copyright issues', details: 'All assets have proper licenses' },
      { task: 'Visible on light background', details: 'Icon stands out clearly' },
      { task: 'Visible on dark background', details: 'Icon stands out clearly' }
    ]
  },
  {
    num: 6,
    title: 'Screenshots for Store Listing',
    icon: <Camera className="w-6 h-6 text-cyan-600" />,
    category: 'Critical',
    tasks: [
      { task: '5-8 screenshots prepared', details: 'High quality, actual UI screenshots' },
      { task: 'Screenshot 1: Home screen', details: 'Main dashboard/entry point' },
      { task: 'Screenshot 2: Bible reading', details: 'Core reading experience' },
      { task: 'Screenshot 3: Audio Bible', details: 'Audio player interface' },
      { task: 'Screenshot 4: Devotional/Study', details: 'Learning features' },
      { task: 'Screenshot 5: Prayer feature', details: 'Community/prayer features' },
      { task: 'Screenshots match actual UI', details: 'No outdated or mockup images' },
      { task: 'Text overlays on screenshots', details: 'Describe what users see' }
    ]
  },
  {
    num: 7,
    title: 'App Store Listing Content',
    icon: <List className="w-6 h-6 text-indigo-600" />,
    category: 'Critical',
    tasks: [
      { task: 'App title finalized', details: 'FaithLight (30 chars max for some stores)' },
      { task: 'Short description written', details: 'Eye-catching, keyword-rich' },
      { task: 'Full description complete', details: 'Clear, persuasive, highlights features' },
      { task: 'Keywords selected', details: '10-15 relevant search terms' },
      { task: 'Category selected', details: 'Lifestyle or Books & Reference' },
      { task: 'Support URL included', details: 'Link to support/help page' },
      { task: 'Privacy Policy URL included', details: 'Link to privacy policy' }
    ]
  },
  {
    num: 8,
    title: 'Notifications (if used)',
    icon: <Clock className="w-6 h-6 text-red-600" />,
    category: 'Conditional',
    tasks: [
      { task: 'Permission request works', details: 'Users see notification permission dialog' },
      { task: 'Notification arrives correctly', details: 'Daily verse/notifications send on time' },
      { task: 'Tapping notification opens app', details: 'Deep link works correctly' },
      { task: 'Notification text is clear', details: 'Appropriate, no spam language' }
    ]
  },
  {
    num: 9,
    title: 'Performance Check',
    icon: <Zap className="w-6 h-6 text-yellow-600" />,
    category: 'Critical',
    tasks: [
      { task: 'App opens in 3-4 seconds', details: 'No long loading screens' },
      { task: 'Audio loads quickly', details: 'No buffering on decent connection' },
      { task: 'Scrolling is smooth', details: 'No lag, 60 FPS experience' },
      { task: 'Tested on Android device', details: 'Actual Android phone or emulator' },
      { task: 'Tested on iOS device', details: 'Actual iPhone or Xcode simulator' },
      { task: 'Battery usage normal', details: 'No excessive battery drain' }
    ]
  },
  {
    num: 10,
    title: 'Content Review',
    icon: <Search className="w-6 h-6 text-green-600" />,
    category: 'Critical',
    tasks: [
      { task: 'No "Coming Soon" placeholders', details: 'Remove all incomplete sections' },
      { task: 'No "Test page" content', details: 'Remove all debug/test pages' },
      { task: 'No empty sections', details: 'All pages have actual content' },
      { task: 'Everything feels complete', details: 'Polished, production-ready feel' },
      { task: 'No broken links', details: 'All URLs work correctly' },
      { task: 'No typos or grammar errors', details: 'Spell-check entire app' }
    ]
  },
  {
    num: 11,
    title: 'Build Files Ready',
    icon: <Package className="w-6 h-6 text-slate-600" />,
    category: 'Critical',
    tasks: [
      { task: 'Android AAB file prepared', details: 'Ready for Google Play Console' },
      { task: 'iOS IPA/build prepared', details: 'Ready for App Store Connect' },
      { task: 'Build version number set', details: 'e.g., 1.0.0' },
      { task: 'Build is signed', details: 'Release signed, not debug' },
      { task: 'No console errors in build', details: 'Clean build log' }
    ]
  },
  {
    num: 12,
    title: 'Final Submission Steps',
    icon: <Rocket className="w-6 h-6 text-indigo-600" />,
    category: 'Critical',
    tasks: [
      { task: 'Android: Upload AAB to Play Console', details: '1-2 days to process' },
      { task: 'Android: Submit for review', details: 'Review time: 1-3 days' },
      { task: 'iOS: Upload build to App Store Connect', details: 'Build processing: 10-30 min' },
      { task: 'iOS: Submit for review', details: 'Review time: 2-5 days' },
      { task: 'Monitor review status', details: 'Check for rejection reasons' }
    ]
  }
];

const SELF_TEST_QUESTIONS = [
  {
    question: 'Can a new user open the app and immediately understand it?',
    explanation: 'The UI should be intuitive without instructions'
  },
  {
    question: 'Does every button work?',
    explanation: 'All interactive elements should have proper functionality'
  },
  {
    question: 'Are legal pages accessible?',
    explanation: 'Privacy Policy, Terms of Service must be findable in app'
  },
  {
    question: 'Are there any broken links?',
    explanation: 'Test all external and internal links'
  },
  {
    question: 'Does the app perform well on slower devices?',
    explanation: 'Should work smoothly on budget/older phones'
  },
  {
    question: 'Is the content appropriate and complete?',
    explanation: 'No test data, placeholders, or incomplete sections'
  }
];

function ChecklistSection({ item }) {
  const [expandedTasks, setExpandedTasks] = useState({});
  const [completedTasks, setCompletedTasks] = useState({});

  const toggleTask = (taskIndex) => {
    setCompletedTasks(prev => ({
      ...prev,
      [`${item.num}-${taskIndex}`]: !prev[`${item.num}-${taskIndex}`]
    }));
  };

  const completionCount = Object.values(completedTasks).filter(v => v).length;
  const completionPercent = Math.round((completionCount / item.tasks.length) * 100);

  const categoryColors = {
    Critical: 'bg-red-100 text-red-700',
    Required: 'bg-orange-100 text-orange-700',
    Conditional: 'bg-blue-100 text-blue-700'
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
                <Badge className={categoryColors[item.category]}>
                  {item.category}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-indigo-600">{completionPercent}%</p>
                <p className="text-xs text-gray-500">{completionCount}/{item.tasks.length}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              {item.tasks.map((taskItem, taskIndex) => {
                const taskKey = `${item.num}-${taskIndex}`;
                const isCompleted = completedTasks[taskKey];

                return (
                  <div
                    key={taskIndex}
                    className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                      isCompleted
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Checkbox
                      checked={isCompleted}
                      onChange={() => toggleTask(taskIndex)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className={`font-semibold ${isCompleted ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                        {taskItem.task}
                      </p>
                      <p className="text-sm text-gray-600">{taskItem.details}</p>
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FinalPreLaunchChecklist() {
  const [allCompleted, setAllCompleted] = useState(false);
  const criticalItems = CHECKLIST_ITEMS.filter(i => i.category === 'Critical').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">✅ Final Pre-Launch Checklist</h1>
          <p className="text-gray-600">Complete verification before publishing to App Store & Google Play</p>
        </div>

        {/* Warning Banner */}
        <Card className="mb-8 border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6 flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">Most App Rejections Happen Because Something Small Was Missed</p>
              <p className="text-sm text-gray-700">
                Use this checklist before submission. Apps that fail review are delayed 2-5 days. Better to test thoroughly now.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-semibold text-gray-600 uppercase">Total Items</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">12</p>
              <p className="text-sm text-gray-600 mt-1">Sections to verify</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-semibold text-gray-600 uppercase">Critical</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{criticalItems}</p>
              <p className="text-sm text-gray-600 mt-1">Must complete all</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-semibold text-gray-600 uppercase">Avg Review Time</p>
              <p className="text-3xl font-bold text-green-600 mt-2">2-5</p>
              <p className="text-sm text-gray-600 mt-1">Days (iOS & Android)</p>
            </CardContent>
          </Card>
        </div>

        {/* Checklist Items */}
        <div className="mb-8">
          {CHECKLIST_ITEMS.map(item => (
            <ChecklistSection key={item.num} item={item} />
          ))}
        </div>

        {/* Self-Test Section */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" /> Quick Self-Test (Before Submission)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Ask yourself these questions. If all are YES, you're ready to submit.
            </p>
            <div className="space-y-3">
              {SELF_TEST_QUESTIONS.map((q, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex gap-3">
                    <Checkbox className="mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{q.question}</p>
                      <p className="text-sm text-gray-600 mt-1">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform-Specific Guides */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Android */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg">🤖 Android (Google Play)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Build Format</p>
                <p className="text-sm text-gray-700">AAB (Android App Bundle)</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Submission Platform</p>
                <p className="text-sm text-gray-700">Google Play Console</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Review Time</p>
                <p className="text-sm text-gray-700">1-3 days</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Content Rating</p>
                <p className="text-sm text-gray-700">Fill out content rating questionnaire</p>
              </div>
            </CardContent>
          </Card>

          {/* iOS */}
          <Card className="border-2 border-slate-200 bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">🍎 iOS (App Store)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Build Format</p>
                <p className="text-sm text-gray-700">IPA or Xcode archive</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Submission Platform</p>
                <p className="text-sm text-gray-700">App Store Connect</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Review Time</p>
                <p className="text-sm text-gray-700">2-5 days (usually 24-48h)</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Content Rating</p>
                <p className="text-sm text-gray-700">IARC rating required</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Pages */}
        <Card className="border-2 border-purple-200 bg-purple-50 mb-8">
          <CardHeader>
            <CardTitle>📚 Related Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <Link to={createPageUrl('AppleReviewGuide')}>
                <Button variant="outline" className="w-full justify-start">
                  Apple Review Guide
                </Button>
              </Link>
              <Link to={createPageUrl('AppStoreDescription')}>
                <Button variant="outline" className="w-full justify-start">
                  Store Listing Copy
                </Button>
              </Link>
              <Link to={createPageUrl('AppStoreReadinessChecklist')}>
                <Button variant="outline" className="w-full justify-start">
                  Readiness Checklist
                </Button>
              </Link>
              <Link to={createPageUrl('AppStoreSubmissionChecklist')}>
                <Button variant="outline" className="w-full justify-start">
                  Submission Checklist
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <Card className="border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Rocket className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Launch?</h3>
              <p className="text-gray-700 mb-4">
                Once you've checked all items above, your app is ready for submission to both stores.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                ✔ Core functionality tested<br />
                ✔ Legal pages accessible<br />
                ✔ Store listings complete<br />
                ✔ Build files ready<br />
              </p>
              <div className="flex gap-3 justify-center">
                <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" /> Go to Play Console
                  </Button>
                </a>
                <a href="https://appstoreconnect.apple.com" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-slate-600 hover:bg-slate-700">
                    <Download className="w-4 h-4 mr-2" /> Go to App Store Connect
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}