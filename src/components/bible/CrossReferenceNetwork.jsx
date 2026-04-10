import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ExternalLink, X, GitBranch, ChevronRight } from 'lucide-react';

// Static cross-reference seed data for common passages
const STATIC_XREFS = {
  'John 3:16': {
    concepts: ['Salvation', 'God\'s Love', 'Eternal Life', 'Faith', 'Jesus as Son'],
    refs: [
      { ref: 'Romans 5:8', snippet: 'God demonstrates his own love for us...', concept: 'God\'s Love' },
      { ref: 'Romans 6:23', snippet: 'The gift of God is eternal life...', concept: 'Eternal Life' },
      { ref: '1 John 4:9', snippet: 'God sent his only Son...', concept: 'God\'s Love' },
      { ref: 'Ephesians 2:8', snippet: 'By grace you have been saved, through faith...', concept: 'Salvation' },
      { ref: 'Isaiah 53:5', snippet: 'He was pierced for our transgressions...', concept: 'Jesus as Son' },
    ]
  },
  'Psalm 23:1': {
    concepts: ['God as Shepherd', 'Provision', 'Peace', 'Trust'],
    refs: [
      { ref: 'John 10:11', snippet: 'I am the good shepherd...', concept: 'God as Shepherd' },
      { ref: 'Philippians 4:19', snippet: 'God will meet all your needs...', concept: 'Provision' },
      { ref: 'Isaiah 40:11', snippet: 'He tends his flock like a shepherd...', concept: 'God as Shepherd' },
    ]
  },
};

const CONCEPT_COLORS = [
  '#6366F1', '#0891B2', '#059669', '#D97706', '#DC2626',
  '#7C3AED', '#DB2777', '#EA580C', '#0284C7', '#16A34A',
];

function ConceptNode({ concept, color, selected, onClick, refCount }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 text-center transition-all min-w-16 ${selected ? 'scale-105 shadow-md' : 'hover:scale-102 hover:shadow-sm'}`}
      style={{ borderColor: selected ? color : '#E5E7EB', background: selected ? `${color}15` : '#FAFAFA' }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm" style={{ background: color }}>
        {refCount}
      </div>
      <span className="text-xs font-bold leading-tight" style={{ color: selected ? color : '#374151' }}>{concept}</span>
    </button>
  );
}

function RefCard({ xref, color, onNavigate }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-start gap-3 hover:border-indigo-200 transition-all">
      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-extrabold" style={{ color }}>{xref.ref}</span>
          <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{xref.concept}</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{xref.snippet}</p>
      </div>
      {onNavigate && (
        <button onClick={() => onNavigate(xref.ref)} className="flex-shrink-0 text-gray-300 hover:text-indigo-500 transition-colors">
          <ExternalLink className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function CrossReferenceNetwork({ book, chapter, verse, verseText, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [open, setOpen] = useState(false);

  const ref = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;

  const fetchNetwork = async () => {
    if (!verseText && !ref) return;
    setLoading(true);
    setData(null);
    setSelectedConcept(null);

    // Try static first
    const staticKey = Object.keys(STATIC_XREFS).find(k => ref.includes(k.split(' ')[0]) && ref.includes(k.split(':')[0].split(' ')[1]));
    if (staticKey && STATIC_XREFS[staticKey]) {
      setData(STATIC_XREFS[staticKey]);
      setLoading(false);
      return;
    }

    try {
      const prompt = `For the Bible passage "${ref}" with text: "${(verseText || '').slice(0, 200)}", identify:
1. 4-5 core theological concepts (single words or short phrases, e.g. "Grace", "Redemption", "Faith")
2. For each concept, find 2-3 related cross-reference verses from different Bible books

Return JSON: {"concepts":["Concept1","Concept2"],"refs":[{"ref":"Book X:Y","snippet":"Short quote...","concept":"Concept1"},...]}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            concepts: { type: 'array', items: { type: 'string' } },
            refs: { type: 'array', items: { type: 'object', properties: { ref: { type: 'string' }, snippet: { type: 'string' }, concept: { type: 'string' } } } }
          }
        }
      });
      setData(result);
    } catch {
      setData({ concepts: ['Faith', 'Salvation', 'Grace'], refs: [{ ref: 'Romans 3:23', snippet: 'For all have sinned and fall short...', concept: 'Salvation' }] });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && !data && !loading) fetchNetwork();
  }, [open]);

  const filteredRefs = data?.refs?.filter(r => !selectedConcept || r.concept === selectedConcept) || [];

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${open ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
      >
        <GitBranch className="w-3.5 h-3.5" />
        Cross-References
        {open && <X className="w-3.5 h-3.5 ml-1" onClick={e => { e.stopPropagation(); setOpen(false); }} />}
      </button>

      {open && (
        <div className="mt-3 bg-slate-50 rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-indigo-500" /> Theological Network · {ref}
            </h4>
            {data && (
              <button onClick={fetchNetwork} disabled={loading} className="text-xs text-gray-400 hover:text-indigo-600">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '↻ Refresh'}
              </button>
            )}
          </div>

          {loading && (
            <div className="flex items-center gap-2 py-4 justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span className="text-sm text-gray-500">Mapping cross-references…</span>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Concept nodes */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setSelectedConcept(null)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${!selectedConcept ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                  All ({data.refs?.length || 0})
                </button>
                {(data.concepts || []).map((concept, i) => {
                  const color = CONCEPT_COLORS[i % CONCEPT_COLORS.length];
                  const count = (data.refs || []).filter(r => r.concept === concept).length;
                  return (
                    <ConceptNode key={concept} concept={concept} color={color}
                      selected={selectedConcept === concept} refCount={count}
                      onClick={() => setSelectedConcept(selectedConcept === concept ? null : concept)} />
                  );
                })}
              </div>

              {/* Connection visual */}
              {selectedConcept && (
                <div className="mb-3 flex items-center gap-2">
                  <div className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-lg">{ref}</div>
                  <div className="flex-1 h-px bg-indigo-200 relative">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                      <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 rounded-full">{selectedConcept}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{filteredRefs.length} passages</div>
                </div>
              )}

              {/* Reference cards */}
              <div className="space-y-2">
                {filteredRefs.map((xref, i) => {
                  const conceptIdx = (data.concepts || []).indexOf(xref.concept);
                  const color = CONCEPT_COLORS[conceptIdx >= 0 ? conceptIdx % CONCEPT_COLORS.length : i % CONCEPT_COLORS.length];
                  return <RefCard key={i} xref={xref} color={color} onNavigate={onNavigate} />;
                })}
              </div>

              {filteredRefs.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No cross-references for this concept.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}