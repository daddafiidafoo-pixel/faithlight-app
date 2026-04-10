import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Loader2, ChevronDown, ChevronUp, BookOpen, User } from 'lucide-react';

const SCHOLARS = [
  { id: 'henry', name: 'Matthew Henry', era: '1662–1714', style: 'Puritan practical commentary, warm devotional style' },
  { id: 'spurgeon', name: 'Charles Spurgeon', era: '1834–1892', style: 'Evangelical expository preaching, rich illustrations' },
  { id: 'calvin', name: 'John Calvin', era: '1509–1564', style: 'Reformed systematic theology, careful grammatical exegesis' },
  { id: 'wiersbe', name: 'Warren Wiersbe', era: 'Modern', style: 'Clear evangelical exposition with practical application' },
];

export default function ScholarCommentaries({ book, chapter, verse, verseText, isDarkMode }) {
  const [commentaries, setCommentaries] = useState({});
  const [loading, setLoading] = useState({});
  const [expanded, setExpanded] = useState({});

  const fetchCommentary = async (scholar) => {
    if (commentaries[scholar.id] || !verseText) return;
    setLoading(p => ({ ...p, [scholar.id]: true }));
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are writing in the style of ${scholar.name} (${scholar.era}), known for: ${scholar.style}. Write a brief but insightful commentary (3-5 sentences) on ${book} ${chapter}:${verse} — "${verseText}". Capture the scholar's distinctive voice and theological perspective authentically. Do not use modern jargon if the scholar predates it.`,
    });
    setCommentaries(p => ({ ...p, [scholar.id]: result }));
    setLoading(p => ({ ...p, [scholar.id]: false }));
    setExpanded(p => ({ ...p, [scholar.id]: true }));
  };

  const cardBg = isDarkMode ? '#1E2635' : '#FFFFFF';
  const textColor = isDarkMode ? '#E2E8F0' : '#1E293B';
  const borderColor = isDarkMode ? '#334155' : '#E2E8F0';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-amber-600" />
        <h4 className="text-sm font-semibold" style={{ color: textColor }}>Scholar Commentaries</h4>
        {!verseText && (
          <span className="text-xs opacity-50" style={{ color: textColor }}>Select a verse to load commentaries</span>
        )}
      </div>

      <div className="space-y-2">
        {SCHOLARS.map(scholar => (
          <div
            key={scholar.id}
            className="rounded-xl border transition-all"
            style={{ background: cardBg, borderColor }}
          >
            <div
              className="flex items-center justify-between p-3 cursor-pointer"
              onClick={() => {
                if (!commentaries[scholar.id] && verseText) {
                  fetchCommentary(scholar);
                } else {
                  setExpanded(p => ({ ...p, [scholar.id]: !p[scholar.id] }));
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: textColor }}>{scholar.name}</p>
                  <p className="text-xs opacity-50" style={{ color: textColor }}>{scholar.era}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!commentaries[scholar.id] && verseText && (
                  <span className="text-xs text-amber-600 font-medium">Load</span>
                )}
                {loading[scholar.id] && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
                {commentaries[scholar.id] && (
                  expanded[scholar.id] ? <ChevronUp className="w-4 h-4 opacity-40" /> : <ChevronDown className="w-4 h-4 opacity-40" />
                )}
              </div>
            </div>

            {expanded[scholar.id] && commentaries[scholar.id] && (
              <div className="px-4 pb-4 border-t" style={{ borderColor }}>
                <p className="text-sm leading-relaxed mt-3 italic" style={{ color: textColor, opacity: 0.85 }}>
                  "{commentaries[scholar.id]}"
                </p>
                <p className="text-xs mt-2 text-amber-600 font-medium">— {scholar.name} (AI-generated in scholar's style)</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}