import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Shield, Link2, Apple, Lock, Smartphone, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const TRIGGERS = [
  {
    id: 1,
    icon: <Smartphone className="w-6 h-6 text-red-500" />,
    title: 'App Hangs on Refresh',
    risk: 'HIGH',
    status: 'FIXED',
    description: 'All API calls use isAuthenticated() guard before fetching user data. No blocking calls on startup.',
    fix: 'Auth check uses isAuthenticated() first. Premium check has 5s timeout fallback. All API calls are non-blocking.',
    details: [
      '✅ Home: Auth guarded with isAuthenticated() + try/catch',
      '✅ PrayerWall: Non-blocking auth check',
      '✅ UpgradePremium: isAuthenticated() before me()',
      '✅ Premium check has 5s timeout fallback',
      '✅ Layout auth check is non-blocking with cancelled flag',
    ]
  },
  {
    id: 2,
    icon: <Link2 className="w-6 h-6 text-orange-500" />,
    title: 'Broken Privacy Policy / Terms Links',
    risk: 'CRITICAL',
    status: 'FIXED',
    description: 'Both Privacy Policy and Terms of Service pages exist with complete, detailed content.',
    fix: 'Pages are accessible via footer and settings. Links verified working.',
    details: [
      '✅ /PrivacyPolicy — Full policy page with all required sections',
      '✅ /TermsOfService — Full terms with educational disclaimer',
      '✅ Footer links working on every page',
      '✅ Email links: support@faithlight.app, hello@faithlight.app',
      '✅ Account deletion instructions included',
    ]
  },
  {
    id: 3,
    icon: <Lock className="w-6 h-6 text-yellow-500" />,
    title: 'Login Required — No Test Account',
    risk: 'HIGH',
    status: 'ACTION NEEDED',
    description: 'App works without login (guest mode). Core features (Bible, Audio, Devotionals) are accessible without an account.',
    fix: 'Provide demo credentials in App Store Connect review notes.',
    details: [
      '✅ Bible Reader — no login required',
      '✅ Audio Bible — no login required',
      '✅ Daily Devotionals — no login required',
      '✅ Home page — visible to guests',
      '⚠️ ACTION: In App Store Connect → "Notes for Reviewer" add test credentials',
      '⚠️ Demo account: reviewer@faithlight.app / FaithLight2026!',
    ]
  },
  {
    id: 4,
    icon: <Shield className="w-6 h-6 text-blue-500" />,
    title: 'Misleading Data / Privacy Disclosures',
    risk: 'HIGH',
    status: 'FIXED',
    description: 'Privacy policy clearly states what data is collected: account info, usage data, device info. No hidden tracking.',
    fix: 'Privacy policy covers all data types. AI content disclosure included.',
    details: [
      '✅ Account data collection disclosed (name, email, language)',
      '✅ Usage data disclosed (reading progress, course progress)',
      '✅ Device info disclosed (device type, crash reports)',
      '✅ AI interaction logging disclosed',
      '✅ "We do not sell personal information" statement',
      '✅ Apple/Google payment processing disclosed',
    ]
  },
  {
    id: 5,
    icon: <Smartphone className="w-6 h-6 text-purple-500" />,
    title: 'Looks Like a Website Wrapper',
    risk: 'MEDIUM',
    status: 'MITIGATED',
    description: 'App has native mobile UI patterns, touch-friendly design, offline support, and native share/audio features.',
    fix: 'Use Capacitor for native wrapping. Ensure smooth transitions and no browser chrome visible.',
    details: [
      '✅ Mobile-first responsive UI',
      '✅ Touch-friendly tap targets (44px+)',
      '✅ Offline Bible support (downloads)',
      '✅ Audio Bible with native playback controls',
      '✅ No visible browser chrome in native build',
      '⚠️ Ensure Capacitor is configured to hide status bar in web browser',
    ]
  },
  {
    id: 6,
    icon: <CreditCard className="w-6 h-6 text-green-500" />,
    title: 'External Payments for Digital Subscriptions',
    risk: 'CRITICAL',
    status: 'FIXED',
    description: 'Inside native iOS/Android wrapper, Stripe checkout is hidden. ReaderModeMembershipCard shown instead. IAP guard active.',
    fix: 'paymentsGuard.js detects native wrapper and hides all Stripe UI. No external payment links shown on iOS.',
    details: [
      '✅ isNativeWrapper() detects Capacitor, WKWebView, Cordova',
      '✅ shouldShowPaymentsUI() returns false in native wrapper',
      '✅ UpgradePremium shows ReaderModeMembershipCard in native app',
      '✅ UpgradeModal shows ReaderModeMembershipCard in native app',
      '✅ No Stripe links shown to Apple reviewers on device',
      '⚠️ Set HAS_REAL_MOBILE_IAP=true once StoreKit is wired',
    ]
  },
];

const statusColor = {
  'FIXED': 'bg-green-100 text-green-700 border-green-200',
  'MITIGATED': 'bg-blue-100 text-blue-700 border-blue-200',
  'ACTION NEEDED': 'bg-amber-100 text-amber-700 border-amber-200',
};

const riskColor = {
  'CRITICAL': 'bg-red-100 text-red-700',
  'HIGH': 'bg-orange-100 text-orange-700',
  'MEDIUM': 'bg-yellow-100 text-yellow-700',
};

export default function AppleRejectionFixes() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-4">
            <Apple className="w-9 h-9 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔥 Rejection Trigger Audit</h1>
          <p className="text-gray-500">Status of the 6 most common Apple/Google rejection causes</p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-green-700">4</p>
              <p className="text-xs text-green-600 font-semibold">Fixed</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-blue-700">1</p>
              <p className="text-xs text-blue-600 font-semibold">Mitigated</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-amber-700">1</p>
              <p className="text-xs text-amber-600 font-semibold">Action Needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Action needed callout */}
        <Card className="mb-8 border-2 border-amber-300 bg-amber-50">
          <CardContent className="pt-5 pb-5">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900 mb-1">⚠️ Required Action Before Submission</p>
                <p className="text-sm text-gray-700 mb-2">
                  In App Store Connect → App Information → <strong>Notes for Reviewer</strong>, add:
                </p>
                <div className="bg-white border border-amber-200 rounded-lg p-3 font-mono text-sm text-gray-800">
                  <p>Demo Account for Review:</p>
                  <p>Email: reviewer@faithlight.app</p>
                  <p>Password: FaithLight2026!</p>
                  <p className="mt-1 text-gray-500 font-sans text-xs">Core features (Bible, Audio, Devotionals) work without login.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trigger cards */}
        <div className="space-y-5">
          {TRIGGERS.map((trigger) => (
            <Card key={trigger.id} className="border border-gray-200">
              <CardContent className="pt-5 pb-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-0.5">{trigger.icon}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{trigger.id}. {trigger.title}</h3>
                      <Badge className={`text-xs border ${statusColor[trigger.status]}`}>{trigger.status}</Badge>
                      <Badge className={`text-xs ${riskColor[trigger.risk]}`}>{trigger.risk}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{trigger.description}</p>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                      {trigger.details.map((d, i) => (
                        <p key={i} className="text-xs text-gray-700">{d}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Verify links */}
        <Card className="mt-8 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-lg">🔗 Verify These Links Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Privacy Policy', page: 'PrivacyPolicy' },
              { label: 'Terms of Service', page: 'TermsOfService' },
              { label: 'Upgrade / Premium', page: 'UpgradePremium' },
              { label: 'Help Center', page: 'HelpCenter' },
              { label: 'About FaithLight', page: 'About' },
            ].map(({ label, page }) => (
              <div key={page} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-700">{label}</span>
                <Link to={createPageUrl(page)}>
                  <Badge className="bg-indigo-100 text-indigo-700 cursor-pointer hover:bg-indigo-200">Open →</Badge>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}