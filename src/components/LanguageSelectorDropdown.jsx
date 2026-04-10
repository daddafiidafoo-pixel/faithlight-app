import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LANGUAGES } from '../functions/languageConfig.js';
import { Globe } from 'lucide-react';

export default function LanguageSelectorDropdown({ selectedLanguage, onLanguageChange, showLabel = true }) {
  const [searchQuery, setSearchQuery] = useState('');

  const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage);
  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {showLabel && (
        <label className="text-sm font-medium flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Language
        </label>
      )}
      
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {currentLang ? (
              <div className="flex items-center gap-2">
                <span>{currentLang.name}</span>
                <span className="text-xs opacity-60">({currentLang.nativeName})</span>
              </div>
            ) : (
              'Select a language'
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="w-full">
          {/* Search input in dropdown */}
          <div className="p-2 border-b">
            <Input
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* Language list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredLanguages.length === 0 ? (
              <div className="p-2 text-sm text-gray-600">No languages found</div>
            ) : (
              filteredLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span>{lang.name}</span>
                    <span className="text-xs opacity-60">{lang.nativeName}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}