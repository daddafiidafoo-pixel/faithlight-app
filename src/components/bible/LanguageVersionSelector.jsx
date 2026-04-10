/**
 * Language & Version Selector
 * Dynamic selector powered by Bible Catalog
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCatalog, getVersionsForLanguage } from '@/components/lib/BibleCatalogProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function LanguageVersionSelector({ 
  onLanguageChange, 
  onVersionChange,
  defaultLanguage = 'en',
  defaultVersion = null,
  showAudioBadge = true,
  showOfflineBadge = true,
}) {
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [selectedVersion, setSelectedVersion] = useState(defaultVersion);

  // Fetch catalog
  const { data: catalog, isLoading: catalogLoading } = useQuery({
    queryKey: ['bibleCatalog'],
    queryFn: getCatalog,
  });

  // Fetch versions for selected language
  const { data: versions = [], isLoading: versionsLoading } = useQuery({
    queryKey: ['bibleVersions', selectedLanguage],
    queryFn: () => getVersionsForLanguage(selectedLanguage),
    enabled: !!selectedLanguage,
  });

  // Set default version when language changes
  useEffect(() => {
    if (versions.length > 0) {
      const defaultVersion = versions.find(v => v.isDefault) || versions[0];
      setSelectedVersion(defaultVersion?.id);
      onVersionChange?.(defaultVersion?.id);
    }
  }, [versions, onVersionChange]);

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    onLanguageChange?.(langCode);
  };

  const handleVersionChange = (versionId) => {
    setSelectedVersion(versionId);
    onVersionChange?.(versionId);
  };

  const languages = catalog?.languages || [];
  const currentLanguage = languages.find(l => l.code === selectedLanguage);

  if (catalogLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading languages...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Language Selector */}
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">
          Language
        </label>
        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map(lang => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Version Selector */}
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">
          Bible Version
        </label>
        {versionsLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading versions...
          </div>
        ) : (
          <Select value={selectedVersion || ''} onValueChange={handleVersionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map(version => (
                <SelectItem key={version.id} value={version.id}>
                  <span className="flex items-center gap-2">
                    {version.name}
                    {showAudioBadge && version.hasAudio && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        🎧 Audio
                      </span>
                    )}
                    {showOfflineBadge && version.offlineAvailable && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        📱 Offline
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Current Selection Info */}
      {currentLanguage && selectedVersion && (
        <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
          <p>
            <strong>{currentLanguage.name}</strong> ({currentLanguage.code})
          </p>
          <p className="mt-1">
            Reading direction: <strong>{currentLanguage.direction === 'rtl' ? 'Right-to-Left' : 'Left-to-Right'}</strong>
          </p>
        </div>
      )}
    </div>
  );
}