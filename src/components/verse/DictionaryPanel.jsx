import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LABELS = {
  en: { definition: 'Definition', explanation: 'Deep Explanation', close: 'Close', loading: 'Loading...' },
  om: { definition: 'Hiika', explanation: 'Ibsa Gadi Fagoo', close: 'Cufi', loading: 'Fe\'amaa jira...' },
};

export default function DictionaryPanel({ word, language = 'en', isOpen, onClose }) {
  const L = LABELS[language] || LABELS.en;
  const [definition, setDefinition] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !word) return;

    setLoading(true);
    setError(null);
    setDefinition(null);
    setExplanation(null);

    // Get AI-powered explanation
    base44.integrations.Core.InvokeLLM({
      prompt: `Provide a brief definition and theological explanation of the word "${word}" in the context of the Bible. Format as JSON with keys: "definition" (2-3 sentences), "explanation" (4-5 sentences of theological context and meaning).`,
      response_json_schema: {
        type: 'object',
        properties: {
          definition: { type: 'string' },
          explanation: { type: 'string' },
        },
      },
    })
      .then(res => {
        const data = res?.data || res;
        setDefinition(data?.definition || '');
        setExplanation(data?.explanation || '');
      })
      .catch(err => {
        setError('Failed to load explanation');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [word, isOpen, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b flex items-center justify-between px-5 py-4">
          <h2 className="text-lg font-bold" style={{ color: '#1F2937' }}>
            {word}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={L.close}
          >
            <X className="w-5 h-5" style={{ color: '#6B7280' }} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 animate-spin" style={{ color: '#8B5CF6' }} />
              <span className="ml-2 text-sm" style={{ color: '#6B7280' }}>{L.loading}</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          ) : (
            <>
              {definition && (
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#8B5CF6' }}>
                    {L.definition}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>
                    {definition}
                  </p>
                </div>
              )}

              {explanation && (
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#8B5CF6' }}>
                    {L.explanation}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>
                    {explanation}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer padding */}
        <div className="h-6" />
      </div>
    </div>
  );
}