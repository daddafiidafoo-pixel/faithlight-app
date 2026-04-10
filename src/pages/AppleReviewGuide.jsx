import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Link as LinkIcon, Smartphone, Shield, Lock, Users, Zap, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const REJECTION_REASONS = [
  {
    num: 1,
    title: 'App Crashes or Bugs',
    icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
    problem: 'Apple tests on real iPhones. Any crash, freeze, or broken feature = rejection.',
    symptoms: [
      'App closes unexpectedly',
      'Audio stops playing',
      'Login screen hangs',
      'Pages load forever',
      'Console errors visible'
    ],
    fix: 'Test on real device: Bible reading, Audio Bible, navigation, login/signup',
    testUrl: '/Home',
  },
  {
    num: 2,
    title: 'Missing Privacy Policy',
    icon: <Shield className="w-6 h-6 text-orange-500" />,
    problem: 'Required by law. Every app needs one, even if you collect no data.',
    symptoms: [
      'No privacy policy link',
      'Policy not accessible from app',
      'Policy broken or outdated'
    ],
    fix: 'Include link in app footer + app store page',
    testUrl: '/PrivacyPolicy',
  },
  {
    num: 3,
    title: 'Broken Links',
    icon: <LinkIcon className="w-6 h-6 text-red-600" />,
    problem: 'Apple reviewers click every link. Even one broken link = rejection.',
    symptoms: [
      'Privacy Policy link broken',
      'Terms of Service 404',
      'Support email invalid',
      'Website unreachable'
    ],
    fix: 'Test all links before submission',
    testUrl: null,
  },
  {
    num: 4,
    title: 'App Looks Like Website Wrapper',
    icon: <Smartphone className="w-6 h-6 text-blue-500" />,
    problem: 'If app is just a website in a webview, Apple rejects it.',
    symptoms: [
      'Slow loading times',
      'No native feel',
      'No offline features',
      'Mobile layout looks zoomed'
    ],
    fix: 'Ensure native experience: fast loading, offline Bible, smooth navigation',
    testUrl: '/BibleReader',
  },
  {
    num: 5,
    title: 'Empty or Placeholder Content',
    icon: <Eye className="w-6 h-6 text-yellow-500" />,
    problem: '"Coming Soon" pages, empty features = immediate rejection.',
    symptoms: [
      '"Coming soon" text',
      'Empty sections',
      'Placeholder images',
      'Unfinished features'
    ],
    fix: 'App must feel complete with real content: Bible chapters, prayers, study plans',
    testUrl: '/BibleReader',
  },
  {
    num: 6,
    title: 'Account Creation Issues',
    icon: <Lock className="w-6 h-6 text-purple-500" />,
    problem: 'If login required, all flows must work. OR provide guest access.',
    symptoms: [
      'Sign up fails',
      'Login hangs',
      'Password reset broken',
      'Can\'t log out'
    ],
    fix: 'For Bible apps: allow guest access OR ensure all auth flows work',
    testUrl: '/UserSettings',
  },
  {
    num: 7,
    title: 'Missing App Store Information',
    icon: <Zap className="w-6 h-6 text-amber-500" />,
    problem: 'Submission fails without app description, keywords, screenshots, support email.',
    symptoms: [
      'No app icon',
      'Missing description',
      'No screenshots',
      'No support email'
    ],
    fix: 'Upload: icon, description, 5-8 screenshots, support email, privacy link',
    testUrl: null,
  },
];

const CRITICAL_LINKS = [
  { name: 'Privacy Policy', url: '/PrivacyPolicy', icon: <Shield className="w-4 h-4" /> },
  { name: 'Terms of Service', url: '/TermsOfService', icon: <Shield className="w-4 h-4" /> },
  { name: 'Community Guidelines', url: '/CommunityGuidelines', icon: <Users className="w-4 h-4" /> },
];

const SCREENSHOT_TIPS = [
  { order: 1, name: 'Home Screen', desc: 'Dashboard with daily devotional' },
  { order: 2, name: 'Bible Reading', desc: 'Chapter view with smooth scrolling' },
  { order: 3, name: 'Audio Bible', desc: 'Playing scripture with player controls' },
  { order: 4, name: 'Study Tools', desc: 'AI explanations or study plans' },
  { order: 5, name: 'Prayer Feature', desc: 'Prayer wall or prayer requests' },
  { order: 6, name: 'Settings', desc: 'Language, theme, account options' },
];

function RejectionCard({ item }) {
  return (
    <Card className="mb-4 border-l-4 border-l-red-400 hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">{item.icon}</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {item.num}. {item.title}
              <Badge className="bg-red-100 text-red-700 text-xs">REJECTION RISK</Badge>
            </h3>
            <p className="text-sm text-red-700 font-semibold mt-2">{item.problem}</p>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">🚫 Symptoms</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {item.symptoms.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-red-500">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">✅ Fix</p>
                <p className="text-sm text-gray-700 leading-relaxed">{item.fix}</p>
                {item.testUrl && (
                  <Link to={createPageUrl(item.testUrl.replace('/', ''))}>
                    <Button size="sm" variant="outline" className="mt-3 gap-1">
                      <LinkIcon className="w-3 h-3" /> Test This
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AppleReviewGuide() {
  const [activeTab, setActiveTab] = useState('rejections');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🍎 Apple Review Guidelines</h1>
          <p className="text-gray-600">7 Reasons Apps Get Rejected (And How to Fix Them)</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 justify-center mb-8">
          <Button
            onClick={() => setActiveTab('rejections')}
            variant={activeTab === 'rejections' ? 'default' : 'outline'}
            className="bg-red-600 hover:bg-red-700"
          >
            7 Rejection Reasons
          </Button>
          <Button
            onClick={() => setActiveTab('links')}
            variant={activeTab === 'links' ? 'default' : 'outline'}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Link Testing
          </Button>
          <Button
            onClick={() => setActiveTab('screenshots')}
            variant={activeTab === 'screenshots' ? 'default' : 'outline'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Screenshots
          </Button>
        </div>

        {/* TAB 1: Rejection Reasons */}
        {activeTab === 'rejections' && (
          <div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
              <p className="text-sm font-semibold text-yellow-800">
                ⚠️ These 7 issues cause 80% of rejections. Test each one before submitting.
              </p>
            </div>
            <div className="space-y-4">
              {REJECTION_REASONS.map(item => (
                <RejectionCard key={item.num} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Link Testing */}
        {activeTab === 'links' && (
          <div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
              <p className="text-sm font-semibold text-blue-800">
                🔗 Apple reviewers click every link. Test each one before submission.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Critical Links to Test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {CRITICAL_LINKS.map((link, i) => (
                    <Link key={i} to={createPageUrl(link.url.replace('/', ''))}>
                      <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                        {link.icon}
                        <div className="text-left">
                          <div className="font-semibold text-sm">{link.name}</div>
                          <div className="text-xs text-gray-500">Click to verify</div>
                        </div>
                      </Button>
                    </Link>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t space-y-3">
                  <h4 className="font-semibold text-gray-900">Also test:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Email links:</strong> support@faithlight.app & hello@faithlight.app</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Website:</strong> faithlight.app</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Social links:</strong> Any external links in footer</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Sermon links:</strong> Share functionality</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: Screenshots */}
        {activeTab === 'screenshots' && (
          <div>
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded mb-6">
              <p className="text-sm font-semibold text-indigo-800">
                📸 Prepare 5-8 high-quality screenshots showing your best features.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Recommended Screenshot Set</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SCREENSHOT_TIPS.map((shot, i) => (
                    <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">{shot.order}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{shot.name}</p>
                        <p className="text-sm text-gray-600">{shot.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-gray-900 mb-2">📝 App Store Description Template</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    "FaithLight is an all-in-one Christian app designed to help believers read the Bible, listen to scripture, and grow spiritually through daily devotionals, prayer tools, and community features. Features include: Bible reader with multiple translations, audio Bible playback, AI-powered study explanations, prayer requests, church mode for live sermons, and offline Bible access."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Final Checklist */}
        <Card className="mt-8 border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg">✅ Final Pre-Submission Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">App opens without crashes (tested on real phone)</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">All links work (Privacy, Terms, Support, Website)</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Real content visible (Bible, prayers, plans)</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Login/signup works or guest access enabled</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">No "Coming Soon" or placeholder text</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Account deletion option available</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Screenshots ready and optimized</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">App description written (see template above)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}