import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle, Download, Printer, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AppStoreSubmissionChecklist() {
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('appstore_checklist');
    return saved ? JSON.parse(saved) : getDefaultChecklist();
  });

  function getDefaultChecklist() {
    return {
      identity: [
        { id: 'app_name', label: 'App name: FaithLight – AI Bible Guide', completed: false },
        { id: 'ios_icon', label: 'iOS app icon (1024 × 1024 PNG)', completed: false },
        { id: 'android_icon', label: 'Android app icon (512 × 512 PNG)', completed: false },
        { id: 'splash_screen', label: 'Splash screen loads correctly', completed: false },
        { id: 'name_conflict', label: 'No conflicting app names in store', completed: false },
      ],
      legal: [
        { id: 'privacy_policy', label: 'Privacy Policy included in app (Settings → About)', completed: false },
        { id: 'terms_of_use', label: 'Terms of Use included in app', completed: false },
        { id: 'disclaimer', label: 'Disclaimer included in app', completed: false },
        { id: 'privacy_explains_data', label: 'Privacy Policy explains data collection', completed: false },
        { id: 'privacy_explains_ai', label: 'Privacy Policy explains AI feature data handling', completed: false },
        { id: 'privacy_explains_analytics', label: 'Privacy Policy explains analytics/crash reporting', completed: false },
      ],
      permissions: [
        { id: 'no_unnecessary_perms', label: 'No unnecessary permissions requested', completed: false },
        { id: 'no_contacts', label: 'Contacts permission not requested', completed: false },
        { id: 'no_location', label: 'Location permission not requested', completed: false },
        { id: 'no_camera', label: 'Camera permission not requested', completed: false },
      ],
      ai: [
        { id: 'ai_in_description', label: 'AI feature transparency in app description', completed: false },
        { id: 'ai_no_harmful', label: 'AI content verified for safety', completed: false },
        { id: 'ai_no_misleading', label: 'AI does not generate misleading theology', completed: false },
      ],
      content: [
        { id: 'no_hate_speech', label: 'No hate speech or violent content', completed: false },
        { id: 'verses_accurate', label: 'Bible verses verified for accuracy', completed: false },
        { id: 'translations_correct', label: 'Translations are correct', completed: false },
        { id: 'no_hallucination', label: 'AI content verified (no hallucinations)', completed: false },
      ],
      performance: [
        { id: 'app_launches', label: 'App launches without crashes', completed: false },
        { id: 'no_blank_screens', label: 'No blank screens on load', completed: false },
        { id: 'no_console_errors', label: 'No console errors', completed: false },
        { id: 'loading_states', label: 'Loading states exist and display correctly', completed: false },
        { id: 'error_handling', label: 'Network errors are handled gracefully', completed: false },
      ],
      testing: [
        { id: 'test_launch_close', label: 'Tested app launch/close repeatedly', completed: false },
        { id: 'test_language_switch', label: 'Tested language switching', completed: false },
        { id: 'test_tab_switching', label: 'Tested switching tabs quickly', completed: false },
        { id: 'test_airplane_mode', label: 'Tested in airplane mode', completed: false },
      ],
      offline: [
        { id: 'bible_works_offline', label: 'Bible reader works offline', completed: false },
        { id: 'no_crash_offline', label: 'App does not crash when offline', completed: false },
        { id: 'offline_message', label: 'Shows message for offline AI features', completed: false },
      ],
      multilingual: [
        { id: 'test_en', label: 'English tested', completed: false },
        { id: 'test_om', label: 'Afaan Oromoo tested', completed: false },
        { id: 'test_am', label: 'Amharic tested', completed: false },
        { id: 'test_ar', label: 'Arabic tested (RTL layout)', completed: false },
        { id: 'test_sw', label: 'Swahili tested', completed: false },
        { id: 'test_fr', label: 'French tested', completed: false },
        { id: 'layout_integrity', label: 'Layout does not break in any language', completed: false },
      ],
      metadata: [
        { id: 'app_description', label: 'App description written and clear', completed: false },
        { id: 'keywords', label: 'Keywords defined (Bible, Study, AI, etc.)', completed: false },
        { id: 'support_email', label: 'Support email configured', completed: false },
        { id: 'privacy_url', label: 'Privacy policy URL provided', completed: false },
      ],
      screenshots: [
        { id: 'screenshot_home', label: 'Home screen screenshot ready', completed: false },
        { id: 'screenshot_bible', label: 'Bible reader screenshot ready', completed: false },
        { id: 'screenshot_ai_guide', label: 'AI Bible Guide screenshot ready', completed: false },
        { id: 'screenshot_quiz', label: 'Quiz page screenshot ready', completed: false },
        { id: 'screenshot_language', label: 'Language selector screenshot ready', completed: false },
      ],
      rating: [
        { id: 'age_rating', label: 'Age rating set (4+ or Everyone)', completed: false },
        { id: 'content_rating_reviewed', label: 'Content rating reviewed', completed: false },
      ],
      versioning: [
        { id: 'version_number', label: 'Version set to 1.0.0', completed: false },
        { id: 'build_number', label: 'Build number set to 1', completed: false },
      ],
      storeSpecific: [
        { id: 'https_verified', label: '[iOS] App uses HTTPS', completed: false },
        { id: 'no_broken_links', label: '[iOS] No broken links in app', completed: false },
        { id: 'no_placeholder', label: '[iOS] No placeholder content', completed: false },
        { id: 'latest_ios', label: '[iOS] Works on latest iOS version', completed: false },
        { id: 'data_safety_form', label: '[Android] Data Safety form completed', completed: false },
        { id: 'privacy_link', label: '[Android] Privacy policy link provided', completed: false },
        { id: 'target_sdk', label: '[Android] Target SDK version requirement met', completed: false },
      ],
      finalTest: [
        { id: 'fresh_install', label: 'Fresh app install tested', completed: false },
        { id: 'lang_oromo', label: 'Changed language to Afaan Oromoo', completed: false },
        { id: 'ai_guide_open', label: 'Opened AI Bible Guide', completed: false },
        { id: 'ai_search', label: 'Searched for scripture (tested: Isaayyaas 41:10)', completed: false },
        { id: 'quiz_started', label: 'Started a quiz', completed: false },
        { id: 'bookmark_saved', label: 'Saved a bookmark', completed: false },
        { id: 'app_restart', label: 'Restarted app and verified persistence', completed: false },
      ],
    };
  }

  const toggleItem = (category, id) => {
    setChecklist(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  useEffect(() => {
    localStorage.setItem('appstore_checklist', JSON.stringify(checklist));
  }, [checklist]);

  const categories = [
    { key: 'identity', title: '1. App Identity & Branding' },
    { key: 'legal', title: '2. Required Legal Pages' },
    { key: 'permissions', title: '3. Permissions Check' },
    { key: 'ai', title: '4. AI Feature Transparency' },
    { key: 'content', title: '5. Content Safety' },
    { key: 'performance', title: '6. Performance & Stability' },
    { key: 'testing', title: '7. Manual Testing' },
    { key: 'offline', title: '8. Offline Handling' },
    { key: 'multilingual', title: '9. Multilingual Testing' },
    { key: 'metadata', title: '10. App Store Metadata' },
    { key: 'screenshots', title: '11. App Screenshots' },
    { key: 'rating', title: '12. Age Rating' },
    { key: 'versioning', title: '13. Version & Build Numbers' },
    { key: 'storeSpecific', title: '14. Store-Specific Checks' },
    { key: 'finalTest', title: '15. Final Test Script' },
  ];

  const totalItems = Object.values(checklist).flat().length;
  const completedItems = Object.values(checklist).flat().filter(item => item.completed).length;
  const progress = Math.round((completedItems / totalItems) * 100);

  const resetChecklist = () => {
    if (confirm('Reset all items? This cannot be undone.')) {
      setChecklist(getDefaultChecklist());
      localStorage.removeItem('appstore_checklist');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            App Store Submission Checklist
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Complete this checklist before submitting FaithLight to Apple App Store or Google Play Store.
          </p>

          {/* Progress */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
              <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {completedItems} of {totalItems} items completed
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="gap-2"
            >
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button
              onClick={resetChecklist}
              variant="outline"
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <RotateCw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Checklist Sections */}
        <div className="space-y-6">
          {categories.map(category => (
            <Card key={category.key} className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{category.title}</h2>
              <div className="space-y-3">
                {checklist[category.key].map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(category.key, item.id)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 flex-shrink-0 mt-0.5 group-hover:text-gray-400" />
                    )}
                    <span className={`flex-1 ${item.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Recommended Launch Strategy */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <div className="flex gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <h3 className="text-lg font-bold text-gray-900">Recommended Launch Strategy</h3>
          </div>
          <ol className="space-y-3 text-gray-800 ml-9">
            <li>
              <strong>Submit first to Google Play Store</strong>
              <p className="text-sm text-gray-700">Approval is typically faster (3-7 days)</p>
            </li>
            <li>
              <strong>Then submit to Apple App Store</strong>
              <p className="text-sm text-gray-700">Approval typically takes 1-3 days</p>
            </li>
          </ol>
        </Card>

        {/* Completion Message */}
        {progress === 100 && (
          <Card className="p-6 mt-8 bg-green-50 border-green-200">
            <div className="flex gap-3 items-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-green-900 text-lg">All items complete!</h3>
                <p className="text-sm text-green-800">You're ready to submit FaithLight to the app stores.</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}