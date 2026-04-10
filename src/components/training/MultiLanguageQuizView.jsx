import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useTranslatedContent, useAvailableTranslations } from './useTranslatedContent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

export default function MultiLanguageQuizView({ quiz, question, userLanguage = 'en' }) {
  const [selectedLanguage, setSelectedLanguage] = useState(userLanguage);
  const availableLanguages = useAvailableTranslations(question.id, 'question');
  const translatedQuestion = useTranslatedContent(question.id, 'question', selectedLanguage, {
    title: question.question,
    content: question.question,
  });

  // For questions, parse field_mappings for translated options if available
  const [translatedOptions, setTranslatedOptions] = useState(question.options);

  React.useEffect(() => {
    const fetchQuestionTranslation = async () => {
      if (selectedLanguage === 'en') {
        setTranslatedOptions(question.options);
        return;
      }

      try {
        const results = await base44.entities.TrainingContentTranslation.filter({
          content_id: question.id,
          content_type: 'question',
          language_code: selectedLanguage,
          status: 'published',
        });

        if (results.length > 0 && results[0].field_mappings?.options) {
          setTranslatedOptions(results[0].field_mappings.options);
        } else {
          setTranslatedOptions(question.options);
        }
      } catch {
        setTranslatedOptions(question.options);
      }
    };

    fetchQuestionTranslation();
  }, [selectedLanguage, question.id, question.options]);

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">Language:</span>
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
      </div>

      {/* Question */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {translatedQuestion.content}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {translatedOptions.map((option, index) => (
            <label key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="answer"
                value={index}
                className="w-4 h-4"
              />
              <span className="ml-3 text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}