import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguageStore } from '@/components/languageStore';
import { Loader2 } from 'lucide-react';

/**
 * Generates and displays AI devotional reflection for a Bible verse
 * Automatically translates to user's selected language
 */
export default function DevotionalReflection({ verseReference, verseText, bookName }) {
  const aiLanguage = useLanguageStore(s => s.aiLanguage);
  const [reflection, setReflection] = useState(null);
  const [error, setError] = useState(null);

  // Generate reflection in selected language
  const { isLoading } = useQuery({
    queryKey: ['devotional', verseReference, aiLanguage],
    queryFn: async () => {
      try {
        setError(null);
        
        // Map language codes to full names for prompt
        const languageMap = {
          'en': 'English',
          'sw': 'Swahili',
          'om': 'Oromo',
          'ar': 'Arabic',
          'fr': 'French',
          'am': 'Amharic',
          'ti': 'Tigrinya',
        };

        const langName = languageMap[aiLanguage] || 'English';

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a compassionate Bible study teacher. Generate a short, personal devotional reflection (3-4 sentences) on this Bible verse:

Reference: ${verseReference}
Text: "${verseText}"

The reflection should:
1. Explain the spiritual meaning
2. Connect to daily life and faith
3. Include a prayer or action point

Write ONLY in ${langName}. Do not use any other language.`,
          model: 'gemini_3_flash',
        });

        setReflection(response);
        return response;
      } catch (err) {
        console.error('Error generating reflection:', err);
        setError('Could not generate reflection. Please try again.');
        throw err;
      }
    },
    enabled: !!verseReference && !!verseText,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 px-4">
        <Loader2 className="animate-spin w-5 h-5 text-primary mr-2" />
        <span className="text-muted-foreground">Generating reflection...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-primary mb-4">Today's Reflection</h3>
      <p className="text-foreground leading-relaxed text-base whitespace-pre-wrap">
        {reflection}
      </p>
    </div>
  );
}