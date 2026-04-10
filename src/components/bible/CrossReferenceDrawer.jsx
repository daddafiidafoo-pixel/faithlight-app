import React, { useEffect, useState } from 'react';
import { X, Link2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CrossReferenceDrawer({ verse, isOpen, onClose, onVerseSelect }) {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && verse) {
      fetchCrossReferences();
    }
  }, [isOpen, verse]);

  const fetchCrossReferences = async () => {
    setLoading(true);
    try {
      // Fetch from a Bible API or use local data
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Find 5-7 cross-references related to "${verse.book} ${verse.chapter}:${verse.verse}". 
                 Return a JSON array with objects containing: { book: string, chapter: number, verse: number, theme: string }
                 Only return the JSON array, no other text.`,
        response_json_schema: {
          type: 'object',
          properties: {
            references: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  book: { type: 'string' },
                  chapter: { type: 'number' },
                  verse: { type: 'number' },
                  theme: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setReferences(result.data?.references || []);
    } catch (error) {
      console.error('Failed to fetch cross-references:', error);
      setReferences([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-80 h-full bg-white shadow-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Cross-References</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : references.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-8">
              No cross-references found
            </p>
          ) : (
            <div className="space-y-3">
              {references.map((ref, idx) => (
                <button
                  key={idx}
                  onClick={() => onVerseSelect(ref)}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="font-semibold text-slate-900">
                    {ref.book} {ref.chapter}:{ref.verse}
                  </div>
                  {ref.theme && (
                    <div className="text-xs text-slate-500 mt-1">{ref.theme}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}