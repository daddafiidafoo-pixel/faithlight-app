import React, { useState } from 'react';
import { TrendingUp, Users, Download, CreditCard, Target, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ConversionDashboard() {
  const [selectedMetric, setSelectedMetric] = useState(null);

  const metrics = [
    {
      title: 'TikTok → Install',
      target: '5–10%',
      what: 'Estimated % who search FaithLight after seeing TikTok',
      how: [
        'CTA: "Search FaithLight" (not "Download")',
        'Use in all video end-cards',
        'Build urgency: "Available now"',
        'Test different hooks to find winners'
      ]
    },
    {
      title: 'Install → Active User',
      target: '60%',
      what: 'Who opens app after install and completes onboarding',
      how: [
        'Fast language selection (screen 1)',
        'Emotional welcome (screen 2)',
        'Immediate action buttons (screen 3)',
        'Auto-generate prayer within 10 sec'
      ]
    },
    {
      title: 'Active → Premium',
      target: '3–5%',
      what: 'Who upgrade to paid plan',
      how: [
        'Trigger 1: After 2–3 uses',
        'Trigger 2: After sermon generation',
        'Trigger 3: At limit reached',
        'Always show after value is clear'
      ]
    },
    {
      title: 'Viral Loop Score',
      target: 'Medium to High',
      what: 'How many new users come from sharing',
      how: [
        'Share button after every prayer',
        'TikTok integration with share CTA',
        'Referral tracking',
        'Encourage "share with friend" moments'
      ]
    }
  ];

  const funnel = [
    { stage: 'TikTok Viewers', est: '10,000', icon: Users, color: 'from-red-500 to-pink-500' },
    { stage: 'Install (5–10%)', est: '500–1,000', icon: Download, color: 'from-orange-500 to-red-500' },
    { stage: 'Active Users (60%)', est: '300–600', icon: CheckCircle, color: 'from-blue-500 to-indigo-500' },
    { stage: 'Premium (3–5%)', est: '9–30', icon: CreditCard, color: 'from-green-500 to-emerald-500' },
  ];

  const mistakes = [
    '❌ Too many onboarding screens',
    '❌ Confusing or cluttered UI',
    '❌ Hard paywall too early (before value)',
    '❌ Slow loading / laggy experience',
    '❌ Showing English when user selected Oromoo',
    '❌ No share button',
    '❌ CTA "Download" instead of "Search"',
    '❌ Forgetting about retention after install',
  ];

  const successFactors = [
    { emoji: '🙏', label: 'Emotion', desc: 'Faith + spirituality' },
    { emoji: '🌍', label: 'Identity', desc: 'Language matters (huge differentiator)' },
    { emoji: '⚡', label: 'Simplicity', desc: '3 screens → immediate value' },
    { emoji: '📅', label: 'Consistency', desc: 'Daily content keeps users back' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-2 text-sm font-bold mb-4">
            <TrendingUp className="w-4 h-4" />
            Conversion Optimization
          </div>
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            TikTok → Install → Revenue
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            The complete conversion funnel from viral traffic to paying users.
          </p>
        </div>

        {/* Conversion Funnel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {funnel.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i}>
                <div className={`bg-gradient-to-br ${f.color} text-white rounded-2xl p-6 text-center shadow-lg`}>
                  <Icon className="w-8 h-8 mx-auto mb-3 opacity-80" />
                  <p className="text-sm font-semibold opacity-90 mb-1">{f.stage}</p>
                  <p className="text-2xl font-black">{f.est}</p>
                </div>
                {i < funnel.length - 1 && (
                  <div className="h-3 md:h-0 md:w-full flex items-center justify-center md:h-1 my-2 md:my-0">
                    <div className="w-1 h-full md:w-full md:h-1 bg-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {metrics.map((m, i) => (
            <Card
              key={i}
              onClick={() => setSelectedMetric(selectedMetric === i ? null : i)}
              className="p-5 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-indigo-600"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{m.title}</h3>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{m.target}</p>
                </div>
                <Target className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              </div>
              <p className="text-sm text-gray-600 mb-3">{m.what}</p>

              {selectedMetric === i && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">How to Hit Target:</p>
                  <ul className="space-y-2">
                    {m.how.map((h, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Success Formula */}
        <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6">✨ Success Formula</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {successFactors.map((f, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-3xl mb-2">{f.emoji}</p>
                <p className="font-bold text-sm">{f.label}</p>
                <p className="text-xs text-white/70 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Implementation Checklist */}
        <Card className="p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Implementation Checklist
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'TikTok',
                items: [
                  'CTA: "Search FaithLight" in all videos',
                  'Hook time: 3 sec max',
                  'Show result fast',
                  'Keep audio engaging',
                ]
              },
              {
                title: 'App Store',
                items: [
                  'First line: "Grow your faith daily..."',
                  'Screenshot #1: "Faith in Your Language"',
                  'Keywords: Include language names',
                  'Subtitle: "Bible, Prayer & Sermons AI"',
                ]
              },
              {
                title: 'Onboarding',
                items: [
                  'Screen 1: Language selection (fast)',
                  'Screen 2: Welcome message (emotional)',
                  'Screen 3: Action buttons (clear)',
                  'Auto-generate prayer (10 sec max)',
                ]
              },
              {
                title: 'Retention + Revenue',
                items: [
                  'Share button on every prayer',
                  'Paywall trigger: After 2–3 uses',
                  'Paywall trigger: After sermon',
                  'Paywall trigger: At limit',
                ]
              },
            ].map((s, i) => (
              <div key={i}>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">{s.title}</h3>
                <ul className="space-y-2">
                  {s.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Mistakes to Avoid */}
        <Card className="bg-red-50 border-2 border-red-200 p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-red-900">
            <AlertCircle className="w-6 h-6" />
            Biggest Mistakes (Avoid These)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mistakes.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-red-800">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <span className="text-sm font-medium">{m}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}