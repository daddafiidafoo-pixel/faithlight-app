import React, { useState } from 'react';
import { Copy, Check, BookOpen, Code2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AppStoreListing() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyableBox = ({ text, id, label }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
      <div className="flex justify-between items-start gap-3 mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <button
          onClick={() => copyToClipboard(text, id)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Copy to clipboard"
        >
          {copied === id ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="text-gray-900 font-mono text-sm whitespace-pre-wrap break-words">
        {text}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              FaithLight Store Listing
            </h1>
          </div>
          <p className="text-lg text-gray-700 mb-6">
            Complete store metadata, keywords, and copy for Apple App Store and Google Play Store submission.
          </p>
        </div>

        {/* Section 1: App Title */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-indigo-600" />
            1. App Title (Optimized)
          </h2>
          <p className="text-gray-700 mb-4">
            Use a title that contains strong search keywords for better App Store ranking.
          </p>
          <CopyableBox
            text="FaithLight – Bible, Prayer & AI Sermon Builder"
            id="title-main"
            label="Recommended Title"
          />
          <CopyableBox
            text="FaithLight – AI Bible Study & Prayer"
            id="title-alt"
            label="Alternative Title"
          />
          <p className="text-sm text-gray-600 italic">
            Keywords in title improve search visibility and ranking.
          </p>
        </Card>

        {/* Section 2: Short Description / Subtitle */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            2. App Store Subtitle (~30 chars)
          </h2>
          <p className="text-gray-700 mb-4">
            Apple App Store subtitle — ~30 characters for max visibility.
          </p>
          <CopyableBox
            text="Bible, Prayer & Sermons AI"
            id="subtitle-main"
            label="⭐ Recommended Subtitle (26 chars)"
          />
          <CopyableBox
            text="Faith Tools in Your Language"
            id="subtitle-alt1"
            label="Alternative 1"
          />
          <CopyableBox
            text="AI Bible, Prayer & Sermon Tool"
            id="subtitle-alt2"
            label="Alternative 2"
          />
          <div className="mt-4 border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Google Play Short Description (80 chars)</p>
            <CopyableBox
              text="Read the Bible, generate prayers & sermons with AI. In your language. 🙏"
              id="short-desc-1"
              label="Option 1 (Recommended)"
            />
            <CopyableBox
              text="Multilingual Bible, AI prayer generator & sermon builder for every believer."
              id="short-desc-2"
              label="Option 2"
            />
          </div>
        </Card>

        {/* Section 3: Full Description */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            3. Full App Description
          </h2>

          {/* High-Converting Version */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">⭐ High-Converting Version (Recommended)</h3>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Use This</span>
            </div>
            <CopyableBox
              text={`📱 FaithLight – Bible, Prayer & AI Sermon Builder

Grow your faith in your own language. 🙏

FaithLight is your all-in-one Christian companion to read the Bible, generate prayers, and prepare sermons—now supporting multiple languages including Afaan Oromoo, Amharic, Swahili, Arabic, and more.

✨ Why FaithLight?

FaithLight is designed to make God's Word accessible, personal, and powerful—no matter your language or background.

Whether you are:
🙏 Seeking daily spiritual guidance
📖 Studying the Bible
🎙 Preparing a sermon
❤️ Looking for encouragement

FaithLight is here to help.

📖 Key Features

📚 Bible Companion
Read and explore Bible verses easily
Search by topic, theme, or question
Get meaningful guidance instantly

🙏 AI Prayer Generator
Receive personalized prayers in seconds
Pray in your own language
Perfect for daily devotion or difficult moments

🎙 AI Sermon Builder
Generate sermon outlines quickly
Choose:
  Audience (youth, leaders, general)
  Style (expository, topical, narrative)
  Tone (teaching, devotional, evangelistic)
Ideal for pastors, teachers, and ministry leaders

🌍 Multi-Language Support

FaithLight supports multiple languages so you can grow spiritually in the language closest to your heart:
• English
• Afaan Oromoo
• አማርኛ (Amharic)
• Kiswahili
• العربية (Arabic)
• Français

👉 More languages coming soon

🤖 AI Faith Assistant
Ask any faith-based question
Get clear, Bible-centered answers
Receive guidance, encouragement, and insight

💎 Premium Features (Optional)

Upgrade for more powerful tools:
• Unlimited AI chat
• Unlimited sermon generation
• Save & download sermons
• Advanced Bible insights

❤️ Support the Mission

FaithLight is built to bring God's Word to more people around the world.
You can support this mission through:
• Donations 🙏
• Subscriptions 💎

🌟 Who Is This App For?
• Christians seeking daily growth
• Pastors & church leaders
• Youth & Bible study groups
• Oromo & Amharic-speaking communities
• Anyone who wants to grow closer to God

🚀 Start Your Journey Today

Download FaithLight and:
• Strengthen your faith
• Understand the Bible
• Pray with confidence
• Prepare sermons with ease

🙏 FaithLight
Light for your faith. Guidance for your journey.`}
              id="high-converting-desc"
              label="Copy full high-converting description"
            />
          </div>

          {/* Opening */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Alternative: Opening Paragraph Only</h3>
            <CopyableBox
              text={`FaithLight is a powerful multilingual Bible study app designed to help you read, understand, and explore the Word of God.

With FaithLight, you can read the Bible, ask questions using an AI Bible guide, and strengthen your knowledge through interactive quizzes.`}
              id="opening-para"
              label="Copy text"
            />
          </div>

          {/* Key Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Alternative: Key Features Only</h3>
            <CopyableBox
              text={`📖 Complete Bible Reader
• Browse all books, chapters, and verses
• Quickly search verses like John 3:16 or Isaiah 41:10
• Smooth navigation between chapters

🤖 AI Bible Guide
• Ask questions about the Bible
• Get explanations of scripture
• Discover related Bible verses
• Learn deeper meaning of passages

🧠 Bible Quiz
• Test your Bible knowledge
• Multiple quiz categories
• Instant score and explanations
• Learn while playing

🌍 Multilingual Support
FaithLight supports multiple languages including:
• English
• Afaan Oromoo
• Amharic
• Arabic
• Swahili
• French

Perfect for believers around the world.

⭐ Daily Inspiration
• Verse of the day
• Spiritual encouragement
• Easy access to scripture anytime`}
              id="key-features"
              label="Copy all features"
            />
          </div>

          {/* Closing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Alternative: Closing Section</h3>
            <CopyableBox
              text={`Whether you are studying the Bible, preparing a sermon, or simply looking for spiritual encouragement, FaithLight helps you grow in faith every day.

Download FaithLight today and explore the Bible in a smarter way.`}
              id="closing-para"
              label="Copy text"
            />
          </div>
        </Card>

        {/* Section 4: Keywords */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            4. Keywords for App Store Metadata
          </h2>
          <p className="text-gray-700 mb-4">
            Use these in the App Store keyword field (100 char limit on Apple — prioritize top picks).
          </p>
          <CopyableBox
            text="bible,prayer,sermon,christian,faith,bible app,prayer app,sermon builder,ai bible,daily devotion,afaan oromo bible,amharic bible,swahili bible,arabic bible,ai prayer,ai sermon"
            id="keywords-combined"
            label="⭐ Combined (App Store field — copy/paste ready)"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2">📌 Primary</p>
              <CopyableBox
                text="bible, prayer, sermon, christian, faith, bible app, prayer app, sermon builder, ai bible, daily devotion"
                id="keywords-primary"
                label="Primary Keywords"
              />
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">🌍 Language (Powerful!)</p>
              <CopyableBox
                text="afaan oromo bible, amharic bible, swahili bible, arabic bible, oromo prayer, amharic prayer"
                id="keywords-lang"
                label="Language Keywords"
              />
            </div>
            <div className="bg-violet-50 rounded-xl p-4">
              <p className="text-xs font-bold text-violet-700 uppercase tracking-wide mb-2">🤖 AI Keywords</p>
              <CopyableBox
                text="ai prayer, ai sermon, ai bible assistant, bible ai, christian ai"
                id="keywords-ai"
                label="AI Keywords"
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 italic mt-3">
            Language keywords are your BIGGEST differentiator — they face low competition.
          </p>
        </Card>

        {/* Section 5: Screenshot Captions */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            5. Screenshot Texts (High-Converting — 5–7 Screens)
          </h2>
          <p className="text-gray-700 mb-2">
            First screenshot is the most critical — it decides whether someone downloads or scrolls past.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
            💡 <strong>Pro tip:</strong> Keep text BIG, simple, and emotional. Use the headline + small subtext below it.
          </div>
          <div className="space-y-4">
            {[
              {
                id: 'ss1', num: 1, tag: '🔥 HOOK — Most Important',
                headline: 'Grow Your Faith Daily 🙏',
                sub: 'Bible • Prayer • Sermons in Your Language',
              },
              {
                id: 'ss2', num: 2, tag: '📖 Bible Feature',
                headline: 'Read & Discover the Bible',
                sub: 'Find verses by topic, meaning, or need',
              },
              {
                id: 'ss3', num: 3, tag: '🙏 Prayer Feature',
                headline: 'Generate Powerful Prayers',
                sub: 'Pray anytime, in your own language',
              },
              {
                id: 'ss4', num: 4, tag: '🎙 Sermon Builder',
                headline: 'Prepare Sermons in Seconds',
                sub: 'Perfect for pastors, leaders & teachers',
              },
              {
                id: 'ss5', num: 5, tag: '🌍 Language Advantage — KEY DIFFERENTIATOR',
                headline: 'Faith in Your Language 🌍',
                sub: 'Afaan Oromoo • Amharic • Swahili • Arabic',
              },
              {
                id: 'ss6', num: 6, tag: '🤖 AI Chat',
                headline: 'Ask Anything About Faith',
                sub: 'Get Bible-based answers instantly',
              },
              {
                id: 'ss7', num: 7, tag: '💎 Premium (optional)',
                headline: 'Unlock More with Premium ✨',
                sub: 'Unlimited access & advanced features',
              },
            ].map(({ id, num, tag, headline, sub }) => (
              <div key={id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Screenshot {num} — {tag}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{headline}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{sub}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => copyToClipboard(headline, `${id}-h`)}
                      className="text-xs flex items-center gap-1 text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg px-2 py-1"
                    >
                      {copied === `${id}-h` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      Headline
                    </button>
                    <button
                      onClick={() => copyToClipboard(sub, `${id}-s`)}
                      className="text-xs flex items-center gap-1 text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg px-2 py-1"
                    >
                      {copied === `${id}-s` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      Subtext
                    </button>
                    <button
                      onClick={() => copyToClipboard(`${headline}\n${sub}`, `${id}-both`)}
                      className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg px-2 py-1 bg-indigo-50"
                    >
                      {copied === `${id}-both` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      Both
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 6: App Category */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            6. App Category
          </h2>
          <CopyableBox
            text="Books & Reference"
            id="category-primary"
            label="Primary Category (Recommended)"
          />
          <CopyableBox
            text="Education"
            id="category-alt"
            label="Alternative Category"
          />
        </Card>

        {/* Section 7: Age Rating */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            7. Age Rating
          </h2>
          <div className="space-y-3">
            <CopyableBox
              text="Everyone"
              id="rating-1"
              label="Apple App Store"
            />
            <CopyableBox
              text="4+"
              id="rating-2"
              label="Google Play Store"
            />
          </div>
          <p className="text-sm text-gray-600 italic mt-3">
            Educational religious content is appropriate for all ages.
          </p>
        </Card>

        {/* Section 8: Contact & Links */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            8. Contact & Links
          </h2>
          <CopyableBox
            text="support@faithlight.app"
            id="support-email"
            label="Support Email"
          />
          <CopyableBox
            text="https://faithlight.app/privacy"
            id="privacy-link"
            label="Privacy Policy URL"
          />
          <CopyableBox
            text="https://faithlight.app/terms"
            id="terms-link"
            label="Terms of Service URL"
          />
        </Card>

        {/* Section 9: Launch Tagline */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            9. Launch Tagline
          </h2>
          <p className="text-gray-700 mb-4">
            Great for marketing, social media, or store banner campaigns.
          </p>
          <CopyableBox
            text="Light for your faith. Guidance for your journey."
            id="tagline-1"
            label="Primary Tagline"
          />
          <CopyableBox
            text="Grow your faith in your own language."
            id="tagline-2"
            label="Alternative Tagline"
          />
        </Card>

        {/* Section 10: Submission Checklist */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ✓ Pre-Submission Checklist
          </h2>
          <ul className="space-y-2 text-gray-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>App title optimized with keywords</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>Short description under 80 characters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>Full description with features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>Keywords added for ranking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>Screenshots with captions ready</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>Category selected (Books & Reference)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>Age rating set (Everyone/4+)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>Privacy Policy and Terms URLs provided</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>Support email configured</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}