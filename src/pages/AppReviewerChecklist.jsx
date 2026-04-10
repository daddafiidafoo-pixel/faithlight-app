import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, AlertCircle, Zap, Package, Rocket, TrendingUp, FileText, Smartphone, Camera, Download } from 'lucide-react';

const REJECTION_RISKS = [
  {
    title: 'App Stability',
    icon: <Smartphone className="w-6 h-6 text-blue-600" />,
    risks: [
      { check: 'App opens without crashing', critical: true },
      { check: 'Navigation works (Home → Bible → Audio → Prayer)', critical: true },
      { check: 'No blank screens', critical: true },
      { check: 'Audio Bible plays correctly', critical: true },
      { check: 'All buttons are functional', critical: true },
      { check: 'No console errors visible to user', critical: true }
    ],
    consequence: 'If any page crashes → Apple/Google REJECTS the build immediately'
  },
  {
    title: 'App Must Not Look Like a Website',
    icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
    risks: [
      { check: 'Smooth navigation (no page reloads)', critical: true },
      { check: 'Mobile-style UI (not a web page)', critical: true },
      { check: 'Fast loading (under 3-4 seconds)', critical: true },
      { check: 'No browser address bar visible', critical: true },
      { check: 'Native mobile experience', critical: true }
    ],
    consequence: 'Apps that feel like web wrappers get rejected for lacking native experience'
  },
  {
    title: 'Privacy Policy',
    icon: <FileText className="w-6 h-6 text-purple-600" />,
    risks: [
      { check: 'Privacy policy exists and is accessible', critical: true },
      { check: 'Clearly states what data is collected', critical: true },
      { check: 'Explains how data is used', critical: true },
      { check: 'Includes contact email for privacy inquiries', critical: true },
      { check: 'Mobile-friendly formatting', critical: false }
    ],
    consequence: 'Missing privacy policy = AUTOMATIC REJECTION'
  },
  {
    title: 'Functional Links',
    icon: <TrendingUp className="w-6 h-6 text-green-600" />,
    risks: [
      { check: 'Privacy policy link works', critical: true },
      { check: 'Terms of service link works', critical: true },
      { check: 'Support email is valid', critical: true },
      { check: 'All external links open correctly', critical: true },
      { check: 'No broken or 404 links', critical: true }
    ],
    consequence: 'Apple testers click every link. One broken link can cause rejection.'
  },
  {
    title: 'No Placeholder Content',
    icon: <Zap className="w-6 h-6 text-yellow-600" />,
    risks: [
      { check: 'No "Coming soon" text', critical: true },
      { check: 'No "Test page" content', critical: true },
      { check: 'No "Demo content" or "Lorem ipsum"', critical: true },
      { check: 'All pages appear finished and polished', critical: true },
      { check: 'No empty sections or stubs', critical: true }
    ],
    consequence: 'Incomplete or placeholder content = REJECTION'
  }
];

const IMPROVEMENTS = [
  {
    title: 'Add Daily Verse on Home',
    description: 'Reviewers like when apps provide clear value immediately',
    example: 'Verse of the Day – Psalm 23:1\n"The Lord is my shepherd; I shall not want."',
    status: '✅ Exists'
  },
  {
    title: 'Add "About FaithLight" Page',
    description: 'Explain the mission and purpose of the app',
    example: 'FaithLight helps Christians read, listen, and reflect on the Bible every day.',
    status: '✅ Exists'
  },
  {
    title: 'Add Share Feature',
    description: 'Allow users to share verses easily',
    example: 'Select verse → Share to Instagram/WhatsApp/Facebook',
    status: '✅ Ready'
  },
  {
    title: 'Add Reading Plans',
    description: 'Structured Bible reading programs',
    example: '30-Day Plan, 365-Day Plan, Prayer & Gratitude Plan',
    status: '✅ Exists'
  },
  {
    title: 'Add Offline Support',
    description: 'Users can read/listen without internet',
    example: 'Download Bible chapters for offline use',
    status: '✅ Exists'
  }
];

const STORE_LISTING = [
  {
    field: 'App Title',
    content: 'FaithLight',
    note: 'Keep it simple and memorable'
  },
  {
    field: 'Subtitle',
    content: 'Bible, Audio Bible & Daily Devotion',
    note: 'Best 30 characters or less'
  },
  {
    field: 'Category',
    content: 'Lifestyle (preferred) or Books & Reference',
    note: 'Lifestyle performs better for Bible apps'
  },
  {
    field: 'Keywords',
    content: 'bible, audio bible, christian, daily devotion, prayer, scripture, faith, worship, study',
    note: '10-15 relevant search terms'
  },
  {
    field: 'Short Description',
    content: 'Read the Bible, listen to scripture, grow through devotionals',
    note: '80 characters max, keyword-rich'
  },
  {
    field: 'Full Description',
    content: 'See AppStoreDescription page for complete copy',
    note: 'Already prepared and ready to use'
  }
];

const SCREENSHOTS = [
  { num: 1, title: 'Home Screen', description: 'Main dashboard with daily verse and key features' },
  { num: 2, title: 'Bible Reading', description: 'Clean Bible reader interface' },
  { num: 3, title: 'Audio Bible', description: 'Audio player with controls' },
  { num: 4, title: 'Devotional', description: 'Daily devotional or study content' },
  { num: 5, title: 'Prayer', description: 'Prayer features or community engagement' },
  { num: 6, title: '(Optional) Highlights', description: 'Verse highlights and notes' },
  { num: 7, title: '(Optional) Reading Plans', description: 'Reading plan tracking' }
];

const BUILD_REQUIREMENTS = [
  {
    platform: 'Android',
    format: '.AAB (Android App Bundle)',
    platform_name: 'Google Play Console',
    steps: [
      'Generate AAB file from Gradle build',
      'Sign with your release keystore',
      'Test on real Android device',
      'Upload to Play Console'
    ]
  },
  {
    platform: 'iOS',
    format: '.IPA or Xcode Archive',
    platform_name: 'App Store Connect',
    steps: [
      'Archive in Xcode',
      'Sign with your distribution certificate',
      'Test on real iPhone (or simulator)',
      'Upload via Xcode or Transporter'
    ]
  }
];

const SUBMISSION_STEPS = [
  {
    platform: 'Android (Google Play)',
    steps: [
      '1. Open Google Play Console',
      '2. Create New App',
      '3. Upload .AAB file',
      '4. Fill store listing (title, description, screenshots)',
      '5. Set pricing (Free)',
      '6. Configure content rating',
      '7. Submit for review',
      'Review time: 1–3 days'
    ]
  },
  {
    platform: 'iOS (App Store)',
    steps: [
      '1. Open App Store Connect',
      '2. Create New App',
      '3. Upload build via Xcode',
      '4. Add screenshots and description',
      '5. Fill app info (category, keywords)',
      '6. Set pricing (Free)',
      '7. Submit for review',
      'Review time: 2–5 days (usually 24-48h)'
    ]
  }
];

function RejectionRiskSection({ item, index }) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (itemIndex) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemIndex]: !prev[itemIndex]
    }));
  };

  const completionCount = Object.values(checkedItems).filter(Boolean).length;
  const completionPercent = Math.round((completionCount / item.risks.length) * 100);
  const allCriticalChecked = item.risks
    .filter(r => r.critical)
    .every((_, i) => checkedItems[`critical-${i}`]);

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">{item.icon}</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            {/* Risks */}
            <div className="space-y-2 mb-4">
              {item.risks.map((risk, idx) => (
                <div key={idx} className="flex gap-3 p-2 rounded hover:bg-gray-50">
                  <Checkbox
                    checked={checkedItems[idx] || false}
                    onChange={() => toggleCheck(idx)}
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${checkedItems[idx] ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                      {risk.check}
                    </p>
                    {risk.critical && (
                      <Badge className="bg-red-100 text-red-700 text-xs mt-1">CRITICAL</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Consequence */}
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-semibold">{item.consequence}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AppReviewerChecklist() {
  const [allRisksChecked, setAllRisksChecked] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔍 Apple & Google Reviewer Checklist</h1>
          <p className="text-gray-600">The exact checklist reviewers use when evaluating FaithLight</p>
        </div>

        {/* Critical Warning */}
        <Card className="mb-8 border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6 flex gap-4">
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-gray-900 mb-1">⚠️ Most Apps Fail at These 5 Points</p>
              <p className="text-sm text-gray-700">
                If ANY of the Rejection Risk checks fail, your app will be rejected. Review each one carefully.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rejection Risks */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">✅ 1. Rejection Risk Check</h2>
          <p className="text-gray-600 mb-6">
            Verify each point below. If any fails → automatic rejection.
          </p>
          {REJECTION_RISKS.map((item, i) => (
            <RejectionRiskSection key={i} item={item} index={i} />
          ))}
        </div>

        {/* Improvements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⚡ 2. Last Improvements (Increase Approval Chances)</h2>
          <div className="space-y-4">
            {IMPROVEMENTS.map((imp, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{imp.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{imp.description}</p>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-2 text-gray-700 whitespace-pre">
                        {imp.example}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 flex-shrink-0">
                      {imp.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Store Listing */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📱 3. App Store Listing Preparation</h2>
          <div className="space-y-3">
            {STORE_LISTING.map((item, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Field</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{item.field}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Content</p>
                      <p className="text-sm text-gray-700 mt-1 font-mono">{item.content}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Note</p>
                      <p className="text-sm text-gray-700 mt-1">{item.note}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Screenshots */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📸 4. Required Screenshots (5-8)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {SCREENSHOTS.map((shot, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{shot.num}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{shot.title}</p>
                      <p className="text-sm text-gray-600">{shot.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Build Files */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📦 5. Build Files Ready</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {BUILD_REQUIREMENTS.map((build, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{build.platform}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs font-semibold text-gray-600">Format</p>
                    <p className="text-sm font-mono text-gray-900">{build.format}</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded border border-purple-200">
                    <p className="text-xs font-semibold text-gray-600">Upload To</p>
                    <p className="text-sm font-semibold text-gray-900">{build.platform_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Steps</p>
                    <ol className="space-y-1 text-sm text-gray-700">
                      {build.steps.map((step, j) => (
                        <li key={j}>• {step}</li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Submission Process */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 6. Submission Process</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {SUBMISSION_STEPS.map((sub, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{sub.platform}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-gray-700">
                    {sub.steps.map((step, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="font-semibold text-indigo-600 flex-shrink-0">
                          {step.split('.')[0]}.
                        </span>
                        <span>{step.split('. ')[1] || step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final Assessment */}
        <Card className="border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" /> Final Readiness Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">✅ FaithLight Passes All Categories</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✓ Christian content apps are allowed on all platforms</li>
                <li>✓ No restricted content (religion is not prohibited)</li>
                <li>✓ No payment requirement (free app)</li>
                <li>✓ Global audience (supports multiple languages)</li>
                <li>✓ Clear purpose (Bible reading & study)</li>
              </ul>
            </div>

            <div className="space-y-2 p-3 bg-white rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900">📈 Readiness Level</h3>
              <p className="text-2xl font-bold text-green-600">95%</p>
              <p className="text-sm text-gray-700">
                FaithLight should pass review if all links and pages work correctly.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">🎯 Next Steps</h3>
              <ol className="space-y-1 text-sm text-gray-700">
                <li>1. Verify all rejection risk checks ✅</li>
                <li>2. Finalize app icon & screenshots</li>
                <li>3. Prepare store listing copy</li>
                <li>4. Build AAB (Android) & IPA (iOS) files</li>
                <li>5. Submit to Play Store & App Store simultaneously</li>
                <li>6. Monitor for reviewer feedback</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>⏱️ Estimated Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <span className="font-semibold text-gray-900">Preparation</span>
                <span className="text-gray-600">1-2 days</span>
              </div>
              <div className="flex justify-between p-3 bg-orange-50 rounded border border-orange-200">
                <span className="font-semibold text-gray-900">Play Store Review</span>
                <span className="text-orange-600 font-semibold">1-3 days</span>
              </div>
              <div className="flex justify-between p-3 bg-blue-50 rounded border border-blue-200">
                <span className="font-semibold text-gray-900">App Store Review</span>
                <span className="text-blue-600 font-semibold">2-5 days (usually 24-48h)</span>
              </div>
              <div className="flex justify-between p-3 bg-green-50 rounded border border-green-200">
                <span className="font-semibold text-gray-900">Both stores live</span>
                <span className="text-green-600 font-semibold">~1 week total</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}