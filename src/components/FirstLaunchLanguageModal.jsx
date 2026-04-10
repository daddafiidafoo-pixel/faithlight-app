import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LANGUAGES, detectDeviceLanguage } from '../functions/languageConfig.js';

// Handle LANGUAGES in case it's a promise or object
const getLANGUAGES = async () => {
  if (Array.isArray(LANGUAGES)) return LANGUAGES;
  return [];
};
import { Globe } from 'lucide-react';

export default function FirstLaunchLanguageModal({ isOpen, onLanguageSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedLang, setDetectedLang] = useState('en');

  useEffect(() => {
    if (isOpen) {
      setDetectedLang(detectDeviceLanguage());
    }
  }, [isOpen]);

  const filteredLanguages = Array.isArray(LANGUAGES) 
    ? LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const detectedLanguage = Array.isArray(LANGUAGES) ? LANGUAGES.find((l) => l.code === detectedLang) : null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Welcome to FaithLight 🌍
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Auto-detected message */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-900 font-medium">
              We detected your language as:{' '}
              <span className="font-bold text-blue-600">
                {detectedLanguage?.name} ({detectedLanguage?.nativeName})
              </span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              You can change this anytime in Settings
            </p>
          </div>

          {/* Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">Or select another language:</label>
            <Input
              placeholder="Search by language name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-3"
              autoFocus
            />

            {/* Languages grid */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-2">
              {filteredLanguages.slice(0, 20).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageSelect(lang.code)}
                  className={`p-2 rounded text-left text-sm transition-all ${
                    lang.code === detectedLang
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-xs opacity-75">{lang.nativeName}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => onLanguageSelect(detectedLang)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Use {detectedLanguage?.name}
            </Button>
            <Button
              onClick={() => onLanguageSelect('en')}
              variant="outline"
              className="flex-1"
            >
              English
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}