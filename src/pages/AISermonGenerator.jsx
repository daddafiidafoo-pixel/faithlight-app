import React, { useState } from 'react';
import { Sparkles, BookOpen, Copy, Download, RefreshCw, ChevronDown, ChevronUp, Check, Mic, Target, List, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SERMON_STYLES = [
  { value: 'expository', label: '📜 Expository', desc: 'Verse-by-verse teaching' },
  { value: 'topical', label: '🎯 Topical', desc: 'Theme-centered message' },
  { value: 'evangelistic', label: '❤️ Evangelistic', desc: 'Gospel-focused outreach' },
  { value: 'narrative', label: '📖 Narrative', desc: 'Story-driven approach' },
];

const AUDIENCES = ['General congregation', 'Youth group', 'Men\'s group', 'Women\'s group', 'New believers', 'Leadership'];
const DURATIONS = ['15 minutes', '30 minutes', '45 minutes', '60 minutes'];

const SUGGESTED_TOPICS = ['The Power of Prayer', 'Walking in Faith', 'God\'s Grace and Forgiveness', 'The Great Commission', 'Finding Peace in Storms', 'Living with Purpose'];

function SermonSection({ title, icon: Icon, color, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
        style={{ borderBottom: open ? '1px solid #F3F4F6' : 'none' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
            <Icon size={16} style={{ color }} />
          </div>
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function SermonDisplay({ sermon, onReset }) {
  const [copied, setCopied] = useState(false);

  const fullText = `SERMON: ${sermon.title}
Scripture: ${sermon.scripture}
Theme: ${sermon.theme}

INTRODUCTION:
${sermon.introduction}

${sermon.mainPoints?.map((p, i) => `POINT ${i + 1}: ${p.title}
${p.content}
Supporting Verses: ${p.verses?.join(', ')}`).join('\n\n')}

ILLUSTRATION:
${sermon.illustration}

CONCLUSION:
${sermon.conclusion}

CALL TO ACTION:
${sermon.callToAction}

CLOSING PRAYER:
${sermon.closingPrayer}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border text-center">
        <div className="text-4xl mb-2">⛪</div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">{sermon.title}</h2>
        <p className="text-sm text-purple-600 font-medium">{sermon.scripture}</p>
        {sermon.theme && <p className="text-xs text-gray-400 mt-1">Theme: {sermon.theme}</p>}
        <div className="flex gap-3 mt-4 justify-center">
          <button onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            {copied ? <><Check size={14} className="text-green-500" /> Copied!</> : <><Copy size={14} /> Copy All</>}
          </button>
          <button onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #8B5CF6)' }}>
            <Sparkles size={14} /> New Sermon
          </button>
        </div>
      </div>

      {/* Introduction */}
      <SermonSection title="Introduction" icon={Mic} color="#6C5CE7">
        <p className="text-sm text-gray-700 leading-relaxed">{sermon.introduction}</p>
      </SermonSection>

      {/* Main Points */}
      {sermon.mainPoints?.map((point, i) => (
        <SermonSection key={i} title={`Point ${i + 1}: ${point.title}`} icon={Target} color="#0284C7">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">{point.content}</p>
          {point.verses?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {point.verses.map(v => (
                <span key={v} className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
                  <BookOpen size={10} />{v}
                </span>
              ))}
            </div>
          )}
        </SermonSection>
      ))}

      {/* Illustration */}
      {sermon.illustration && (
        <SermonSection title="Illustration" icon={List} color="#F59E0B" defaultOpen={false}>
          <p className="text-sm text-gray-700 leading-relaxed italic">{sermon.illustration}</p>
        </SermonSection>
      )}

      {/* Conclusion */}
      <SermonSection title="Conclusion" icon={Heart} color="#10B981">
        <p className="text-sm text-gray-700 leading-relaxed">{sermon.conclusion}</p>
      </SermonSection>

      {/* Call to Action */}
      {sermon.callToAction && (
        <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-purple-200 flex items-center justify-center">
              <Target size={14} className="text-purple-700" />
            </div>
            <p className="font-bold text-purple-800 text-sm">Call to Action</p>
          </div>
          <p className="text-sm text-purple-700 leading-relaxed">{sermon.callToAction}</p>
        </div>
      )}

      {/* Closing Prayer */}
      {sermon.closingPrayer && (
        <SermonSection title="Closing Prayer" icon={Heart} color="#EC4899" defaultOpen={false}>
          <p className="text-sm text-gray-700 leading-relaxed italic">"{sermon.closingPrayer}"</p>
        </SermonSection>
      )}
    </div>
  );
}

export default function AISermonGenerator() {
  const [input, setInput] = useState('');
  const [style, setStyle] = useState('expository');
  const [audience, setAudience] = useState('General congregation');
  const [duration, setDuration] = useState('30 minutes');
  const [loading, setLoading] = useState(false);
  const [sermon, setSermon] = useState(null);
  const [error, setError] = useState('');

  const generateSermon = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setSermon(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a complete, structured sermon based on the following:
- Passage or Topic: "${input}"
- Style: ${style}
- Audience: ${audience}
- Duration: ${duration}

Create a professional, spiritually rich sermon outline. Return JSON with:
- title (string): compelling sermon title
- scripture (string): primary scripture reference
- theme (string): central theme in 5-7 words
- introduction (string): engaging opening paragraph ~100 words
- mainPoints (array of 3 objects, each with: title, content ~80 words, verses array of 2-3 supporting references)
- illustration (string): a relatable story or analogy ~80 words
- conclusion (string): summary paragraph ~80 words
- callToAction (string): 2-3 sentences inviting response
- closingPrayer (string): a short closing prayer`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            scripture: { type: 'string' },
            theme: { type: 'string' },
            introduction: { type: 'string' },
            mainPoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  verses: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            illustration: { type: 'string' },
            conclusion: { type: 'string' },
            callToAction: { type: 'string' },
            closingPrayer: { type: 'string' }
          }
        },
        model: 'claude_sonnet_4_6'
      });
      if (!result?.title) throw new Error('Invalid response');
      setSermon(result);
    } catch (e) {
      setError('Failed to generate sermon. Please try again.');
      console.error(e);
    }
    setLoading(false);
  };

  if (sermon) return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F8FC' }}>
      <div className="px-4 pt-6 pb-4" style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #EC4899 100%)' }}>
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Sermon Ready</h1>
          <p className="text-purple-200 text-sm">AI-generated outline · {duration}</p>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 py-5">
        <SermonDisplay sermon={sermon} onReset={() => setSermon(null)} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F8FC' }}>
      <div className="px-4 pt-6 pb-5" style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #EC4899 100%)' }}>
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-white">AI Sermon Generator</h1>
          <p className="text-purple-200 text-sm">Generate a complete sermon outline instantly</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

        {/* Input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
            Bible Passage or Topic *
          </label>
          <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            placeholder="e.g. John 3:16-21 · The Power of Prayer · Walking in Faith · Romans 8:28"
            rows={3} value={input} onChange={e => setInput(e.target.value)} />
          <div className="flex flex-wrap gap-2 mt-3">
            {SUGGESTED_TOPICS.map(t => (
              <button key={t} onClick={() => setInput(t)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">Sermon Style</label>
          <div className="grid grid-cols-2 gap-2">
            {SERMON_STYLES.map(s => (
              <button key={s.value} onClick={() => setStyle(s.value)}
                className="py-3 px-3 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: style === s.value ? '#6C5CE7' : '#E5E7EB',
                  backgroundColor: style === s.value ? '#EDE9FE' : 'white',
                }}>
                <p className="text-sm font-medium" style={{ color: style === s.value ? '#6C5CE7' : '#374151' }}>{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Audience & Duration */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Target Audience</label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map(a => (
                <button key={a} onClick={() => setAudience(a)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all"
                  style={{
                    borderColor: audience === a ? '#6C5CE7' : '#E5E7EB',
                    backgroundColor: audience === a ? '#EDE9FE' : 'white',
                    color: audience === a ? '#6C5CE7' : '#6B7280',
                  }}>{a}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Duration</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className="flex-1 py-2 rounded-xl border-2 text-xs font-medium transition-all"
                  style={{
                    borderColor: duration === d ? '#6C5CE7' : '#E5E7EB',
                    backgroundColor: duration === d ? '#EDE9FE' : 'white',
                    color: duration === d ? '#6C5CE7' : '#6B7280',
                  }}>{d}</button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={generateSermon} disabled={loading || !input.trim()}
          className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #EC4899)' }}>
          {loading ? <><RefreshCw size={18} className="animate-spin" /> Generating Sermon...</>
            : <><Sparkles size={18} /> Generate Sermon Outline</>}
        </button>

        {loading && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">Crafting your sermon outline with AI...</p>
            <p className="text-xs text-gray-400 mt-1">This may take 10-20 seconds</p>
          </div>
        )}
      </div>
    </div>
  );
}