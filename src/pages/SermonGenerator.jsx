import React, { useState } from 'react';
import { Sparkles, BookOpen, Download, Copy, Check, Loader2, ChevronDown, ChevronUp, RefreshCw, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SAVED_KEY = 'fl_saved_sermons';

const TONES = ['Evangelical', 'Expository', 'Topical', 'Evangelistic', 'Devotional'];
const AUDIENCES = ['General Congregation', 'Youth', 'New Believers', 'Mature Christians', 'Seekers'];
const LENGTHS = [
  { value: 'short', label: 'Short (15 min)', points: 3 },
  { value: 'medium', label: 'Medium (30 min)', points: 5 },
  { value: 'long', label: 'Long (45+ min)', points: 7 },
];

function Section({ title, children, accent }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-3">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ borderLeft: `4px solid ${accent}` }}>
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function SermonView({ sermon, onReset, onSave, saved }) {
  const [copied, setCopied] = useState(false);

  const fullText = `SERMON: ${sermon.title}\n${sermon.theme ? `Theme: ${sermon.theme}\n` : ''}${sermon.openingVerse ? `Opening Verse: ${sermon.openingVerse}\n` : ''}
INTRODUCTION:
${sermon.introduction}

${(sermon.mainPoints || []).map((p, i) => `POINT ${i + 1}: ${p.title}\n${p.content}\nSupporting Verses: ${(p.supportingVerses || []).join(', ')}`).join('\n\n')}

ILLUSTRATION:
${sermon.illustration}

APPLICATION:
${sermon.application}

CALL TO ACTION:
${sermon.callToAction}

CLOSING PRAYER:
${sermon.closingPrayer}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(fullText);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-3">
      {/* Title Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border text-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#EEF2FF' }}>
          <BookOpen size={20} style={{ color: '#6366F1' }} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">{sermon.title}</h2>
        {sermon.theme && <p className="text-sm text-indigo-600 font-medium mb-2">{sermon.theme}</p>}
        {sermon.openingVerse && (
          <div className="bg-indigo-50 rounded-xl p-3 text-left mt-3">
            <p className="text-xs font-semibold text-indigo-600 mb-1">📖 Opening Verse</p>
            <p className="text-sm italic text-gray-700">{sermon.openingVerse}</p>
          </div>
        )}
      </div>

      <Section title="📝 Introduction" accent="#6366F1">
        <p className="text-sm text-gray-600 leading-relaxed">{sermon.introduction}</p>
      </Section>

      {(sermon.mainPoints || []).map((point, i) => (
        <Section key={i} title={`${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i]}. ${point.title}`} accent={['#6366F1','#8B5CF6','#06B6D4','#10B981','#F59E0B','#F43F5E','#EC4899'][i % 7]}>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">{point.content}</p>
          {(point.supportingVerses || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {point.supportingVerses.map((v, j) => (
                <span key={j} className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-1 rounded-full border border-indigo-100">{v}</span>
              ))}
            </div>
          )}
        </Section>
      ))}

      {sermon.illustration && (
        <Section title="💡 Illustration" accent="#F59E0B">
          <p className="text-sm text-gray-600 leading-relaxed">{sermon.illustration}</p>
        </Section>
      )}

      {sermon.application && (
        <Section title="🎯 Practical Application" accent="#10B981">
          <p className="text-sm text-gray-600 leading-relaxed">{sermon.application}</p>
        </Section>
      )}

      {sermon.callToAction && (
        <div className="rounded-2xl p-4 border-2 border-indigo-300" style={{ background: 'linear-gradient(135deg,#EEF2FF,#F5F3FF)' }}>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">🚀 Call to Action</p>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">{sermon.callToAction}</p>
        </div>
      )}

      {sermon.closingPrayer && (
        <Section title="🙏 Closing Prayer" accent="#8B5CF6">
          <p className="text-sm text-gray-600 leading-relaxed italic">{sermon.closingPrayer}</p>
        </Section>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button onClick={onReset} className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
          <RefreshCw size={14} /> New Sermon
        </button>
        <button onClick={handleCopy} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ background: copied ? '#10B981' : '#6366F1' }}>
          {copied ? <><Check size={14} />Copied!</> : <><Copy size={14} />Copy All</>}
        </button>
        <button onClick={onSave} className="py-3 px-4 rounded-2xl border-2 text-sm font-semibold flex items-center justify-center gap-1 transition-all"
          style={{ borderColor: saved ? '#10B981' : '#E5E7EB', color: saved ? '#10B981' : '#6B7280', background: saved ? '#F0FDF4' : 'white' }}>
          <Save size={14} />
        </button>
      </div>
    </div>
  );
}

export default function SermonGenerator() {
  const [form, setForm] = useState({ input: '', inputType: 'passage', tone: 'Expository', audience: 'General Congregation', length: 'medium' });
  const [loading, setLoading] = useState(false);
  const [sermon, setSermon] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const numPoints = LENGTHS.find(l => l.value === form.length)?.points || 5;

  const generate = async () => {
    if (!form.input.trim()) return;
    setLoading(true); setError(''); setSaved(false);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a complete ${form.tone} sermon outline for a ${form.audience} audience.
${form.inputType === 'passage' ? `Bible Passage: ${form.input}` : `Topic: ${form.input}`}
Length: ${form.length} sermon with ${numPoints} main points.

Return JSON with:
- title (string): compelling sermon title
- theme (string): central theme in one sentence  
- openingVerse (string): key verse with reference
- introduction (string): 3-4 sentences to open
- mainPoints (array of ${numPoints} objects each with: title, content (2-3 sentences), supportingVerses (array of 2-3 verse references))
- illustration (string): a relatable story or analogy
- application (string): practical application for daily life
- callToAction (string): powerful closing call to action
- closingPrayer (string): short closing prayer`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            theme: { type: 'string' },
            openingVerse: { type: 'string' },
            introduction: { type: 'string' },
            mainPoints: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' }, supportingVerses: { type: 'array', items: { type: 'string' } } } } },
            illustration: { type: 'string' },
            application: { type: 'string' },
            callToAction: { type: 'string' },
            closingPrayer: { type: 'string' }
          }
        }
      });
      if (!result?.title) throw new Error('Invalid response');
      setSermon(result);
    } catch (e) {
      setError('Failed to generate sermon. Please try again.');
    }
    setLoading(false);
  };

  const handleSave = () => {
    try {
      const existing = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
      localStorage.setItem(SAVED_KEY, JSON.stringify([{ ...sermon, savedAt: new Date().toISOString(), input: form.input }, ...existing]));
      setSaved(true);
    } catch {}
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F8FC' }}>
      <div className="px-4 pt-6 pb-5" style={{ background: 'linear-gradient(135deg,#6366F1 0%,#4F46E5 100%)' }}>
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-0.5">AI Sermon Generator</h1>
          <p className="text-indigo-200 text-sm">Generate structured sermon outlines instantly</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5">
        {!sermon ? (
          <div className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

            {/* Input type */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Input Type</p>
              <div className="flex gap-2">
                {[{ v: 'passage', l: '📖 Bible Passage' }, { v: 'topic', l: '💡 Topic' }].map(o => (
                  <button key={o.v} onClick={() => set('inputType', o.v)}
                    className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                    style={{ borderColor: form.inputType === o.v ? '#6366F1' : '#E5E7EB', background: form.inputType === o.v ? '#EEF2FF' : 'white', color: form.inputType === o.v ? '#6366F1' : '#6B7280' }}>
                    {o.l}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                {form.inputType === 'passage' ? (
                  <input value={form.input} onChange={e => set('input', e.target.value)}
                    placeholder="e.g. John 14:1-6 or Romans 8:28-39"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                ) : (
                  <input value={form.input} onChange={e => set('input', e.target.value)}
                    placeholder="e.g. Hope in Difficult Times, The Power of Prayer"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                )}
              </div>
            </div>

            {/* Tone */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sermon Style</p>
              <div className="flex gap-2 flex-wrap">
                {TONES.map(t => (
                  <button key={t} onClick={() => set('tone', t)}
                    className="px-3 py-1.5 rounded-full border-2 text-xs font-medium transition-all"
                    style={{ borderColor: form.tone === t ? '#6366F1' : '#E5E7EB', background: form.tone === t ? '#EEF2FF' : 'white', color: form.tone === t ? '#6366F1' : '#6B7280' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Target Audience</p>
              <div className="flex gap-2 flex-wrap">
                {AUDIENCES.map(a => (
                  <button key={a} onClick={() => set('audience', a)}
                    className="px-3 py-1.5 rounded-full border-2 text-xs font-medium transition-all"
                    style={{ borderColor: form.audience === a ? '#6366F1' : '#E5E7EB', background: form.audience === a ? '#EEF2FF' : 'white', color: form.audience === a ? '#6366F1' : '#6B7280' }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sermon Length</p>
              <div className="grid grid-cols-3 gap-2">
                {LENGTHS.map(l => (
                  <button key={l.value} onClick={() => set('length', l.value)}
                    className="py-3 rounded-xl border-2 text-center transition-all"
                    style={{ borderColor: form.length === l.value ? '#6366F1' : '#E5E7EB', background: form.length === l.value ? '#EEF2FF' : 'white' }}>
                    <p className="text-xs font-semibold" style={{ color: form.length === l.value ? '#6366F1' : '#374151' }}>{l.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={loading || !form.input.trim()}
              className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
              {loading ? <><Loader2 size={18} className="animate-spin" />Generating Sermon...</> : <><Sparkles size={18} />Generate Sermon Outline</>}
            </button>
          </div>
        ) : (
          <SermonView sermon={sermon} onReset={() => setSermon(null)} onSave={handleSave} saved={saved} />
        )}
      </div>
    </div>
  );
}