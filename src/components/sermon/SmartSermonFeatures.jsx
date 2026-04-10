import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2 } from 'lucide-react';

/**
 * SmartSermonFeatures - AI-powered sermon enhancements
 */
export default function SmartSermonFeatures({ sermon, language }) {
  const [summary, setSummary] = useState(null);
  const [keyPoints, setKeyPoints] = useState(null);
  const [prayer, setPrayer] = useState(null);
  const [verses, setVerses] = useState(null);
  const [loading, setLoading] = useState(null);

  const generateFeature = async (featureType) => {
    setLoading(featureType);
    try {
      const prompts = {
        summary: `Summarize this sermon in 2-3 sentences:\n\n${sermon}`,
        keyPoints: `Extract 3-5 key bullet points from this sermon:\n\n${sermon}`,
        prayer: `Based on this sermon, write a short closing prayer (5-7 sentences) in ${language}:\n\n${sermon}`,
        verses: `Suggest 3-4 additional Bible verses related to the main themes of this sermon:\n\n${sermon}`,
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[featureType],
        model: 'gpt_5_mini',
      });

      if (featureType === 'summary') setSummary(response);
      else if (featureType === 'keyPoints') setKeyPoints(response);
      else if (featureType === 'prayer') setPrayer(response);
      else if (featureType === 'verses') setVerses(response);
    } catch (err) {
      console.error(`[SmartSermonFeatures] Error generating ${featureType}:`, err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <p className="text-sm font-semibold text-gray-900">Smart Features</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Summary */}
        <button
          onClick={() => generateFeature('summary')}
          disabled={loading === 'summary'}
          aria-label="Generate sermon summary"
          className="p-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          {loading === 'summary' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading === 'summary' ? 'Generating...' : 'Summary'}
        </button>

        {/* Key Points */}
        <button
          onClick={() => generateFeature('keyPoints')}
          disabled={loading === 'keyPoints'}
          aria-label="Extract key points"
          className="p-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          {loading === 'keyPoints' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading === 'keyPoints' ? 'Extracting...' : 'Key Points'}
        </button>

        {/* Prayer */}
        <button
          onClick={() => generateFeature('prayer')}
          disabled={loading === 'prayer'}
          aria-label="Generate closing prayer"
          className="p-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          {loading === 'prayer' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading === 'prayer' ? 'Generating...' : 'Prayer'}
        </button>

        {/* Verses */}
        <button
          onClick={() => generateFeature('verses')}
          disabled={loading === 'verses'}
          aria-label="Suggest related verses"
          className="p-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          {loading === 'verses' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading === 'verses' ? 'Suggesting...' : 'Verses'}
        </button>
      </div>

      {/* Display results */}
      {summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-900 mb-2">Summary</p>
          <p className="text-sm text-blue-800 leading-relaxed">{summary}</p>
        </div>
      )}

      {keyPoints && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-green-900 mb-2">Key Points</p>
          <div className="text-sm text-green-800 whitespace-pre-wrap">{keyPoints}</div>
        </div>
      )}

      {prayer && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-purple-900 mb-2">Closing Prayer</p>
          <p className="text-sm text-purple-800 leading-relaxed italic">{prayer}</p>
        </div>
      )}

      {verses && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-amber-900 mb-2">Related Verses</p>
          <div className="text-sm text-amber-800 whitespace-pre-wrap">{verses}</div>
        </div>
      )}
    </div>
  );
}