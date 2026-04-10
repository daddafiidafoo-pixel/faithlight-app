import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { listLanguageVersions } from '@/components/lib/providerRouter';
import { BookOpen, Download } from 'lucide-react';

// Helper functions for Bible catalog
function getAvailableBibleLanguages() {
  return [
    { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
    { code: 'om', label: 'Afaan Oromoo', nativeLabel: 'Afaan Oromoo', flag: '🇪🇹' },
    { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ', flag: '🇪🇹' },
    { code: 'sw', label: 'Kiswahili', nativeLabel: 'Kiswahili', flag: '🇹🇿' },
    { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
    { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇵🇹' },
    { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸' },
    { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦' }
  ];
}

function getVersionsForLanguage(langCode) {
  const versions = listLanguageVersions(langCode);
  return versions.map(v => ({
    id: v.versionId,
    label: v.label,
    source: ['offline', 'api'] // Placeholder; real implementation would check catalog
  }));
}

function getDefaultBibleVersion(langCode) {
  const versions = getVersionsForLanguage(langCode);
  return versions.length > 0 ? versions[0].id : null;
}

export default function BibleLanguageSelector({ user, onSaved }) {
  const [bibleLanguage, setBibleLanguage] = useState('en');
  const [bibleVersionId, setBibleVersionId] = useState('en_kjv');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved preference from user settings or localStorage
    const saved = localStorage.getItem('faithlight_bible_language') || 'en';
    const savedVersion = localStorage.getItem('faithlight_bible_version') || 'en_kjv';
    setBibleLanguage(saved);
    setBibleVersionId(savedVersion);
  }, []);

  const handleLanguageChange = (langCode) => {
    setBibleLanguage(langCode);
    // Auto-select default version for this language
    const defaultVersion = getDefaultBibleVersion(langCode);
    if (defaultVersion) {
      setBibleVersionId(defaultVersion);
    }
  };

  const handleVersionChange = (versionId) => {
    setBibleVersionId(versionId);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (immediate)
      localStorage.setItem('faithlight_bible_language', bibleLanguage);
      localStorage.setItem('faithlight_bible_version', bibleVersionId);

      // Save to user profile if authenticated
      if (user?.id) {
        await base44.auth.updateMe({
          bible_language: bibleLanguage,
          bible_version_id: bibleVersionId,
        }).catch(() => {
          // Fail silently if API call fails (offline or not authenticated)
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (onSaved) onSaved();
    } finally {
      setSaving(false);
    }
  };

  const availableLanguages = getAvailableBibleLanguages();
  const versions = getVersionsForLanguage(bibleLanguage);

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" /> Bible Language & Version
        </CardTitle>
        <CardDescription>Choose your preferred Bible language and translation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bible Language Selection */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Bible Language</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-3 border-2 rounded-xl text-left transition-all ${
                  bibleLanguage === lang.code
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="text-xl mb-1">{lang.flag}</div>
                <div className="text-sm font-semibold text-gray-900">{lang.nativeLabel}</div>
                <div className="text-xs text-gray-400">{lang.code.toUpperCase()}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Version Selection */}
        {versions.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Translation</p>
            <div className="space-y-2">
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => handleVersionChange(version.id)}
                  className={`w-full p-3 border-2 rounded-xl text-left transition-all ${
                    bibleVersionId === version.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{version.label}</span>
                    <span className="text-xs text-gray-400">
                      {version.source.includes('offline') && version.source.includes('api')
                        ? 'Offline + Online'
                        : version.source.includes('offline')
                        ? 'Offline only'
                        : 'Online only'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2 w-full"
          >
            {saved ? '✓ Saved' : 'Save Bible Preferences'}
          </Button>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-semibold">💡 Tip</p>
          <p className="text-xs mt-0.5">
            Your Bible language is separate from your app language. You can use the app in one language and read the Bible in another.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}