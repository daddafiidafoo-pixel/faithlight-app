import React, { useState } from 'react';
import { useTranslatedContent, useAvailableTranslations } from './useTranslatedContent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { Globe } from 'lucide-react';

export default function MultiLanguageLessonView({ lesson, userLanguage = 'en' }) {
  const [selectedLanguage, setSelectedLanguage] = useState(userLanguage);
  const availableLanguages = useAvailableTranslations(lesson.id, 'lesson');
  const translatedContent = useTranslatedContent(lesson.id, 'lesson', selectedLanguage, lesson);

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">Reading in:</span>
        </div>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map(lang => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {translatedContent.isTranslated && (
          <Badge variant="outline" className="ml-2">
            Translated
          </Badge>
        )}
      </div>

      {/* Lesson Content */}
      <div className="bg-white p-6 rounded-lg border">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {translatedContent.title}
        </h1>
        {translatedContent.description && (
          <p className="text-gray-600 mb-6">{translatedContent.description}</p>
        )}
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{translatedContent.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}