import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2, GitCompare } from 'lucide-react';
import { THEOLOGICAL_PERSPECTIVES } from './TheologicalPerspectivePicker';

const COLOR_MAP = {
  indigo: 'border-indigo-300 bg-indigo-50',
  blue:   'border-blue-300 bg-blue-50',
  yellow: 'border-yellow-300 bg-yellow-50',
  green:  'border-green-300 bg-green-50',
  orange: 'border-orange-300 bg-orange-50',
  red:    'border-red-300 bg-red-50',
  purple: 'border-purple-300 bg-purple-50',
  teal:   'border-teal-300 bg-teal-50',
};

const BADGE_MAP = {
  indigo: 'bg-indigo-100 text-indigo-700',
  blue:   'bg-blue-100 text-blue-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  green:  'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  red:    'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  teal:   'bg-teal-100 text-teal-700',
};

// Default perspectives to compare
const DEFAULT_COMPARE = ['evangelical', 'catholic', 'reformed', 'pentecostal'];

export default function TheologicalCompareModal({ open, onClose, question, language = 'en' }) {
  const [selected, setSelected] = useState(DEFAULT_COMPARE);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const runComparison = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const perspectiveLabels = selected.map(id => THEOLOGICAL_PERSPECTIVES.find(p => p.id === id)?.label).join(', ');
      const prompt = `You are a theology expert. For the question or verse below, provide a concise interpretation from each of these theological perspectives: ${perspectiveLabels}.

Question/Verse: "${question}"

For each perspective, write 2-4 sentences that capture how that tradition uniquely reads this passage or topic. Be accurate and respectful. Format your response as JSON like this:
{
  "perspectives": [
    { "id": "evangelical", "interpretation": "..." },
    ...
  ]
}`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            perspectives: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  interpretation: { type: 'string' }
                }
              }
            }
          }
        }
      });
      setResults(res?.perspectives || []);
    } catch (e) {
      setError('Could not load comparisons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-900">Compare Theological Views</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Question preview */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-800 leading-snug">
            <span className="font-semibold">Topic: </span>{question}
          </div>

          {/* Perspective selector */}
          {!results && !loading && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Select up to 4 perspectives to compare
              </p>
              <div className="grid grid-cols-2 gap-2">
                {THEOLOGICAL_PERSPECTIVES.map(p => {
                  const isSelected = selected.includes(p.id);
                  const isDisabled = !isSelected && selected.length >= 4;
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggle(p.id)}
                      disabled={isDisabled}
                      className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all text-sm ${
                        isSelected
                          ? `${COLOR_MAP[p.color]} border-opacity-100`
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <div className="font-semibold text-gray-800 text-xs">{p.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-tight">{p.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <p className="text-sm text-gray-500">Gathering perspectives…</p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          {results && results.map((r) => {
            const meta = THEOLOGICAL_PERSPECTIVES.find(p => p.id === r.id);
            if (!meta) return null;
            return (
              <div key={r.id} className={`rounded-xl border-2 p-4 ${COLOR_MAP[meta.color]}`}>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 ${BADGE_MAP[meta.color]}`}>
                  {meta.label}
                </span>
                <p className="text-sm text-gray-800 leading-relaxed">{r.interpretation}</p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          {results ? (
            <button
              onClick={() => { setResults(null); setError(null); }}
              className="w-full py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
            >
              ← Change perspectives
            </button>
          ) : (
            <button
              onClick={runComparison}
              disabled={selected.length < 2 || loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
              Compare {selected.length} Perspectives
            </button>
          )}
        </div>
      </div>
    </div>
  );
}