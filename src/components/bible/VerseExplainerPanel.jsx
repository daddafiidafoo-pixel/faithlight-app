import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Loader, Lightbulb, History, MapPin } from 'lucide-react';
import { useI18n } from '../I18nProvider';

export default function VerseExplainerPanel({ verse_reference, verse_text, onClose }) {
  const { lang } = useI18n();
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadExplanation = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('generateVerseExplanation', {
        verse_reference,
        verse_text,
        language: lang,
      });
      setExplanation(response);
    } catch (err) {
      console.error('Explanation error:', err);
      setError('Failed to generate explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!explanation && !loading) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900">Understand This Verse</h3>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-700">
          Get AI-powered insights including historical context, theological meaning, and practical application.
        </p>
        <Button
          onClick={loadExplanation}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <Lightbulb className="w-4 h-4" />
          Explain This Verse
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-center space-y-3">
        <Loader className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
        <p className="text-sm text-gray-700">Generating explanation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <p className="text-sm text-red-700">{error}</p>
        <Button
          onClick={loadExplanation}
          variant="outline"
          className="w-full gap-2 text-red-600"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Historical Context */}
      {explanation?.historical_context && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 text-sm mb-1">Historical Context</h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                {explanation.historical_context}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Theological Insight */}
      {explanation?.theological_insight && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 text-sm mb-1">Theological Insight</h4>
              <p className="text-sm text-purple-800 leading-relaxed">
                {explanation.theological_insight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Practical Application */}
      {explanation?.practical_application && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">💡</span>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 text-sm mb-1">Practical Application</h4>
              <p className="text-sm text-green-800 leading-relaxed">
                {explanation.practical_application}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => setExplanation(null)}
          variant="outline"
          className="w-full"
        >
          Generate New Explanation
        </Button>
        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        )}
      </div>
    </div>
  );
}