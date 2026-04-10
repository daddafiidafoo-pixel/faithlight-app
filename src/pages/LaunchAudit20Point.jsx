import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, AlertCircle, Download } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';

const CHECKLIST_ITEMS = [
  {
    id: 1,
    section: 'Core App Functionality',
    title: 'App launches without crashing',
    subtitle: 'Home screen loads within 3 seconds',
    testSteps: ['Launch the app', 'Observe if home screen appears within 3 seconds', 'Check for crashes or errors'],
  },
  {
    id: 2,
    section: 'Core App Functionality',
    title: 'App icon and splash screen appear correctly',
    subtitle: 'Visual branding check',
    testSteps: ['Check app icon matches FaithLight brand', 'Observe splash screen on launch', 'Verify colors and logo are crisp'],
  },
  {
    id: 3,
    section: 'Core App Functionality',
    title: 'Navigation tabs work',
    subtitle: 'Home, Bible, AI Guide, Quiz, Settings',
    testSteps: ['Click Home tab', 'Click Bible tab', 'Click AI Guide tab', 'Click Quiz tab', 'Click Settings tab', 'Verify no errors'],
  },
  {
    id: 4,
    section: 'Core App Functionality',
    title: 'No blank screens or loading errors',
    subtitle: 'Each tab loads properly',
    testSteps: ['Check all tabs load with content', 'Verify no 404 or error pages', 'Look for infinite loading spinners'],
  },
  {
    id: 5,
    section: 'Bible Reader',
    title: 'Users can open any Bible book',
    subtitle: 'Test Genesis, Psalms, John, Isaiah',
    testSteps: ['Go to Bible tab', 'Click book selector', 'Choose Genesis', 'Verify chapters appear'],
  },
  {
    id: 6,
    section: 'Bible Reader',
    title: 'Chapter navigation works',
    subtitle: 'Navigate between chapters',
    testSteps: ['Open Genesis chapter 1', 'Navigate to chapter 2', 'Navigate back to chapter 1', 'Verify smooth navigation'],
  },
  {
    id: 7,
    section: 'Bible Reader',
    title: 'Verses display correctly',
    subtitle: 'Genesis 1:1, Psalm 23:1, John 3:16, Isaiah 41:10',
    testSteps: [
      'Open Genesis 1:1 - verify text displays',
      'Open Psalm 23:1 - verify text displays',
      'Open John 3:16 - verify text displays',
      'Open Isaiah 41:10 - verify text displays',
    ],
  },
  {
    id: 8,
    section: 'Bible Reader',
    title: 'Verse search works',
    subtitle: 'Test Book → Chapter → Verse',
    testSteps: [
      'Go to Bible search',
      'Select book: Isaiah',
      'Enter chapter: 41',
      'Enter verse: 10',
      'Verify Isaiah 41:10 appears',
    ],
  },
  {
    id: 9,
    section: 'AI Bible Guide',
    title: 'Users can ask Bible questions',
    subtitle: 'Ask "Who is Jesus?" and "Explain John 3:16"',
    testSteps: [
      'Go to AI Guide tab',
      'Type "Who is Jesus?"',
      'Press enter',
      'Type "Explain John 3:16"',
      'Press enter',
      'Verify both questions submit',
    ],
  },
  {
    id: 10,
    section: 'AI Bible Guide',
    title: 'AI responses appear without errors',
    subtitle: 'Check for loading and response display',
    testSteps: [
      'Ask a question in AI Guide',
      'Wait for response',
      'Verify no error messages',
      'Verify response text is readable',
    ],
  },
  {
    id: 11,
    section: 'AI Bible Guide',
    title: 'Loading indicator appears while AI generates answer',
    subtitle: 'Visual feedback during AI processing',
    testSteps: [
      'Ask a question',
      'Observe loading spinner/indicator appears',
      'Wait for response',
      'Verify spinner disappears when done',
    ],
  },
  {
    id: 12,
    section: 'Quiz System',
    title: 'Quiz starts correctly',
    subtitle: 'Quiz loads and displays first question',
    testSteps: [
      'Go to Quiz tab',
      'Select a category',
      'Select difficulty',
      'Verify first question appears',
    ],
  },
  {
    id: 13,
    section: 'Quiz System',
    title: 'Questions load',
    subtitle: 'All questions display properly',
    testSteps: [
      'Answer all quiz questions',
      'Verify each question displays',
      'Verify answer options appear',
      'No blank screens',
    ],
  },
  {
    id: 14,
    section: 'Quiz System',
    title: 'Score calculation works',
    subtitle: 'Verify score displays as X/10',
    testSteps: [
      'Complete a quiz',
      'Check results screen',
      'Verify score shows (e.g., 7/10)',
      'Verify percentage displayed',
    ],
  },
  {
    id: 15,
    section: 'Quiz System',
    title: 'Retry quiz button works',
    subtitle: 'Can retake quiz after completion',
    testSteps: [
      'Complete a quiz',
      'Click "Retry Quiz" button',
      'Verify quiz restarts',
      'Verify new questions (or reshuffled)',
    ],
  },
  {
    id: 16,
    section: 'Multilingual System',
    title: 'Language switching works',
    subtitle: 'English, Oromo, Amharic, Arabic, Swahili, French',
    testSteps: [
      'Go to Settings',
      'Find language selector',
      'Switch to English',
      'Switch to Afaan Oromoo',
      'Switch to Amharic',
      'Switch to Arabic',
      'Switch to Swahili',
      'Switch to French',
      'Verify UI changes each time',
    ],
  },
  {
    id: 17,
    section: 'Multilingual System',
    title: 'Afaan Oromoo translations correct',
    subtitle: 'Book=Kitaaba, Chapter=Boqonnaa, Verse=Luqqisa, Search=Barbaadi',
    testSteps: [
      'Switch language to Afaan Oromoo',
      'Check Bible tab shows "Kitaaba" for book selector',
      'Check chapter selector shows "Boqonnaa"',
      'Check verse selector shows "Luqqisa"',
      'Check search button shows "Barbaadi"',
    ],
  },
  {
    id: 18,
    section: 'User Features',
    title: 'Bookmarks save correctly',
    subtitle: 'Users can bookmark verses',
    testSteps: [
      'Open a verse (e.g., John 3:16)',
      'Click bookmark button',
      'Navigate away',
      'Come back to same verse',
      'Verify bookmark is still marked',
    ],
  },
  {
    id: 19,
    section: 'User Features',
    title: 'Saved verses remain after restarting app',
    subtitle: 'Offline persistence check',
    testSteps: [
      'Bookmark a verse',
      'Close app completely',
      'Reopen app',
      'Go to saved verses',
      'Verify verse is still there',
    ],
  },
  {
    id: 20,
    section: 'Store Requirements',
    title: 'Legal pages included',
    subtitle: 'Privacy Policy, Terms of Use, Disclaimer',
    testSteps: [
      'Go to Settings',
      'Click "About" section',
      'Verify Privacy Policy link exists and works',
      'Verify Terms of Service link exists and works',
      'Verify Disclaimer link exists and works',
    ],
  },
];

export default function LaunchAudit20Point() {
  const { lang, t } = useI18n();
  const [completed, setCompleted] = useState({});
  const [filter, setFilter] = useState('all');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('faithlight_audit_20');
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  // Save to localStorage
  const toggleItem = (id) => {
    const updated = { ...completed, [id]: !completed[id] };
    setCompleted(updated);
    localStorage.setItem('faithlight_audit_20', JSON.stringify(updated));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progressPercent = (completedCount / CHECKLIST_ITEMS.length) * 100;
  const isFullyComplete = completedCount === CHECKLIST_ITEMS.length;

  const groupedItems = CHECKLIST_ITEMS.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            FaithLight 20-Point Launch Audit
          </h1>
          <p className="text-gray-600">
            Complete all items to verify app readiness for store submission
          </p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-indigo-600"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Progress</h2>
            <span className="text-2xl font-bold text-indigo-600">
              {completedCount}/{CHECKLIST_ITEMS.length}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-indigo-600 to-blue-600"
            />
          </div>
          <p className="text-sm text-gray-600">{Math.round(progressPercent)}% complete</p>

          {isFullyComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-green-700 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                ✅ FaithLight is ready for store submission!
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Print Checklist
          </Button>
          <Button
            onClick={() => {
              setCompleted({});
              localStorage.removeItem('faithlight_audit_20');
            }}
            variant="outline"
            className="gap-2"
          >
            Reset All
          </Button>
        </div>

        {/* Checklist by Section */}
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([ sectionName, items ], sectionIdx) => (
            <motion.div
              key={sectionName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + sectionIdx * 0.05 }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-3 text-indigo-700">
                {sectionName}
              </h2>

              <div className="space-y-2">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => toggleItem(item.id)}
                    className={`bg-white rounded-lg p-4 cursor-pointer transition-all border-l-4 ${
                      completed[item.id]
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 mt-1">
                        {completed[item.id] ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300 hover:text-indigo-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`font-semibold text-sm ${
                              completed[item.id] ? 'text-green-700 line-through' : 'text-gray-900'
                            }`}>
                              {item.id}. {item.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                          </div>
                          <span className="text-xs font-medium text-gray-400 ml-2">
                            {completed[item.id] ? '✓' : '○'}
                          </span>
                        </div>

                        {/* Test Steps - Hidden by default, click to expand */}
                        <details className="mt-2 text-xs text-gray-600">
                          <summary className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-700">
                            View test steps
                          </summary>
                          <ul className="mt-2 ml-4 space-y-1 list-disc text-gray-600">
                            {item.testSteps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final Result */}
        {isFullyComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-green-700 mb-2">
              🎉 Ready for Launch!
            </h3>
            <p className="text-green-600 mb-4">
              All 20 items verified. FaithLight is ready for:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="font-semibold text-green-700">1️⃣ Google Play Store</p>
                <p className="text-xs text-gray-600 mt-1">Submit first</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="font-semibold text-green-700">2️⃣ Apple App Store</p>
                <p className="text-xs text-gray-600 mt-1">Submit second</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Last updated: March 9, 2026</p>
          <p className="mt-1">Test on actual device for most accurate results</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white; }
          .no-print { display: none; }
          div { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}