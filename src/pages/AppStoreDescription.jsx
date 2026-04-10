import React, { useState } from 'react';
import { BookOpen, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../components/I18nProvider';

export default function AppStoreDescription() {
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sections = [
    {
      id: 'title',
      label: 'App Store Title',
      content: 'FaithLight – Bible, Audio & AI Study',
    },
    {
      id: 'subtitle',
      label: 'App Store Subtitle',
      content: 'Daily Bible reading, audio Bible, and AI-powered study tools.',
    },
    {
      id: 'description',
      label: 'App Store Description',
      content: `Grow your faith every day with FaithLight, a powerful Bible companion designed to help you read, listen, and study God's Word anywhere.

FaithLight combines a beautiful Bible reader, audio Scripture, and intelligent study tools to make engaging with the Bible simple and meaningful.

Whether you're beginning your faith journey or preparing sermons, FaithLight provides the tools you need for deeper understanding.

📖 Bible Reading
Read the Holy Bible in a clean, distraction-free interface.
• Easy book and chapter navigation
• Comfortable reading layout
• Dark mode support
• Multiple languages supported

🎧 Audio Bible
Listen to Scripture wherever you are.
• High-quality audio Bible
• Background playback
• Mini audio player controls
• Perfect for commuting or prayer time

🧠 AI Bible Study Tools
Understand Scripture more deeply with intelligent tools.
• AI verse explanations
• Sermon outline generator
• Devotional reflection generator
• Bible study assistance

📅 Personalized Study Plans
Stay consistent in your spiritual growth.
• AI-generated study plans
• Daily reading guidance
• Track your reading progress
• Build lasting habits

🌍 Multilingual Support
FaithLight supports multiple languages including:
• English
• Afaan Oromoo
• Amharic
• Swahili
• French

More languages will continue to be added.

🔥 Reading Streaks
Build a daily habit of engaging with Scripture and track your progress.

Designed for Daily Faith
FaithLight is designed to help believers stay connected to God's Word every day — whether reading quietly, listening while traveling, or studying deeply.

Perfect For
• Personal Bible study
• Daily devotions
• Church leaders and teachers
• Sermon preparation
• New believers

Download FaithLight today and grow in the light of Scripture.`,
    },
    {
      id: 'keywords',
      label: 'App Store Keywords',
      content: 'bible,holy bible,bible app,audio bible,christian app,daily bible verse,bible study,devotional,bible reader,scripture,sermon study,christian study,faith app,bible audio,prayer app',
    },
    {
      id: 'google_short',
      label: 'Google Play Short Description',
      content: 'Read, listen, and study the Bible with AI tools, audio Scripture, and personalized study plans.',
    },
    {
      id: 'google_full',
      label: 'Google Play Full Description',
      content: `FaithLight helps you read, listen, and understand the Bible every day.
Explore Scripture with a powerful Bible reader, audio Bible playback, and intelligent AI study tools.

Features include:
• Bible reading
• Audio Bible listening
• AI study tools
• Personalized study plans
• Daily faith encouragement

Grow spiritually with FaithLight.`,
    },
  ];

  const screenshots = [
    { num: 1, title: 'Read the Bible Anywhere', desc: 'Clean and distraction-free reading experience.' },
    { num: 2, title: 'Listen to the Audio Bible', desc: 'Enjoy Scripture while commuting or relaxing.' },
    { num: 3, title: 'AI Bible Study Tools', desc: 'Understand Scripture with intelligent insights.' },
    { num: 4, title: 'Build Daily Faith Habits', desc: 'Track your reading streak and grow consistently.' },
    { num: 5, title: 'Multilingual Bible Experience', desc: 'Read Scripture in multiple languages.' },
  ];

  const checklist = [
    'App icon (1024 × 1024)',
    '5 screenshots',
    'Privacy policy link',
    'Support email',
    'Terms of service',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              App Store Listing
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Ready-to-use content for Apple App Store & Google Play
          </p>
          <div className="inline-block mt-4 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
            <p className="text-green-700 dark:text-green-300 font-semibold text-sm">
              ✅ FaithLight is 90–95% ready for launch
            </p>
          </div>
        </div>

        {/* Copyable Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {section.label}
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(section.content, section.id)}
                  className="gap-2"
                >
                  {copied === section.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Screenshots */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              App Store Screenshot Text Ideas (5 Required)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            {screenshots.map((shot) => (
              <div
                key={shot.num}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-700"
              >
                <p className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">
                  Screenshot {shot.num}
                </p>
                <p className="font-bold text-gray-900 dark:text-white mt-1">
                  {shot.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {shot.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Categories */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              App Store Categories
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-semibold">Primary:</span> Lifestyle
              </p>
              <p>
                <span className="font-semibold">Secondary:</span> Reference
              </p>
            </div>
          </div>

          {/* Age Rating */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Age Rating
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">4+</span> (safest for Bible apps)
            </p>
          </div>
        </div>

        {/* Pre-Launch Checklist */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">
              ✔ Pre-Launch Checklist
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {checklist.map((item, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600"
                />
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}