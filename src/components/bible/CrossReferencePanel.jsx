import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Loader2, ExternalLink, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

// Curated cross-reference map for common passages
const BUILT_IN_XREFS = {
  'John-3-16': [
    { ref: 'Romans 5:8', text: 'But God demonstrates his own love toward us, in that while we were yet sinners, Christ died for us.' },
    { ref: 'Romans 8:32', text: 'He who didn\'t spare his own Son, but delivered him up for us all...' },
    { ref: '1 John 4:9', text: 'By this God\'s love was revealed in us, that God has sent his one and only Son...' },
  ],
  'Genesis-1-1': [
    { ref: 'John 1:1', text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
    { ref: 'Hebrews 11:3', text: 'By faith we understand that the universe has been framed by the word of God...' },
  ],
  'Psalm-23-1': [
    { ref: 'John 10:11', text: 'I am the good shepherd. The good shepherd lays down his life for the sheep.' },
    { ref: 'Ezekiel 34:23', text: 'I will set up one shepherd over them, and he will feed them...' },
  ],
};

export default function CrossReferencePanel({ book, chapter, verse, verseText, isDarkMode }) {
  const [refs, setRefs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});

  const key = `${book}-${chapter}-${verse}`;
  const builtIn = BUILT_IN_XREFS[key] || [];

  const fetchAIRefs = async () => {
    if (!verseText) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Bible scholar. For ${book} ${chapter}:${verse} — "${verseText}" — list 5 cross-reference Bible verses that thematically or theologically connect to this passage. For each, provide the reference (Book Chapter:Verse) and a brief 1-sentence excerpt. Return JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          cross_references: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ref: { type: 'string' },
                text: { type: 'string' },
                connection: { type: 'string' },
              }
            }
          }
        }
      }
    });
    setRefs(result.cross_references || []);
    setLoading(false);
  };

  const allRefs = refs || builtIn;
  const cardBg = isDarkMode ? '#1E2635' : '#FFFFFF';
  const textColor = isDarkMode ? '#E2E8F0' : '#1E293B';
  const borderColor = isDarkMode ? '#334155' : '#E2E8F0';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: textColor }}>
          <GitBranch className="w-4 h-4 text-purple-500" />
          Cross References
          {book && chapter && verse && (
            <span className="text-xs font-normal opacity-60">{book} {chapter}:{verse}</span>
          )}
        </h4>
        {!refs && verseText && (
          <Button size="sm" variant="outline" onClick={fetchAIRefs} disabled={loading} className="text-xs gap-1">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <GitBranch className="w-3 h-3" />}
            {loading ? 'Loading...' : 'Find AI Refs'}
          </Button>
        )}
      </div>

      {allRefs.length === 0 && !loading && (
        <div className="text-sm text-center py-6 opacity-50" style={{ color: textColor }}>
          <GitBranch className="w-6 h-6 mx-auto mb-2 opacity-40" />
          Select a verse and click "Find AI Refs" to discover cross-references
        </div>
      )}

      <div className="space-y-2">
        {allRefs.map((xref, i) => (
          <div
            key={i}
            className="rounded-xl p-3 border transition-all cursor-pointer"
            style={{ background: cardBg, borderColor }}
            onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                <span className="text-xs font-bold text-purple-600">{xref.ref}</span>
                {xref.connection && (
                  <Badge variant="outline" className="text-xs hidden sm:inline-flex">{xref.connection}</Badge>
                )}
              </div>
              {expanded[i] ? <ChevronUp className="w-3.5 h-3.5 opacity-40" /> : <ChevronDown className="w-3.5 h-3.5 opacity-40" />}
            </div>
            {expanded[i] && (
              <p className="text-xs leading-relaxed mt-2 pl-5" style={{ color: textColor, opacity: 0.8 }}>"{xref.text}"</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}