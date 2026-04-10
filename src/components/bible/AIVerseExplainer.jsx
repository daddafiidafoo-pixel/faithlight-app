import React, { useState } from 'react';
import { Sparkles, Loader, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../I18nProvider';
import { base44 } from '@/api/base44Client';
import AIExplanationPanel from './AIExplanationPanel';

export default function AIVerseExplainer({ verseRef, verseText, onClose }) {
  const { t } = useI18n();
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  const explainVerse = async () => {
    // Check cache first
    const cacheKey = `ai_explanation_${verseRef}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      setExplanation(JSON.parse(cached));
      setShowPanel(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const prompt = `
        Explain this Bible verse in simple, clear language that anyone can understand:
        
        ${verseRef}
        "${verseText}"
        
        Provide:
        1. A simple explanation (2-3 sentences)
        2. The main meaning or lesson
        3. How it applies to modern life (1 sentence)
        
        Keep the explanation concise and inspiring.
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
      });

      const explanationData = {
        verseRef,
        verseText,
        explanation: response,
        generatedAt: new Date().toISOString(),
      };

      // Cache the explanation
      localStorage.setItem(cacheKey, JSON.stringify(explanationData));
      setExplanation(explanationData);
      setShowPanel(true);
    } catch (err) {
      setError(err.message || 'Failed to generate explanation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={explainVerse}
        disabled={loading}
        variant="outline"
        size="sm"
        className="w-full gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            {t('actions.explaining', 'Explaining...')}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-indigo-600" />
            {t('bible.explainWithAI', 'Explain with AI')}
          </>
        )}
      </Button>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {showPanel && explanation && (
        <AIExplanationPanel
          explanation={explanation}
          onClose={() => setShowPanel(false)}
        />
      )}
    </>
  );
}