import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, Copy, Check, Save, Trash2, ChevronDown, ChevronUp, Wand2, Clock3, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SAVED_KEY = 'fl_saved_sermons';

function getSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; }
}
function setSaved(data) { localStorage.setItem(SAVED_KEY, JSON.stringify(data)); }

function buildPrompt(topic, audience, tone, duration, notes) {
  return `You are a biblical sermon assistant. Generate a structured sermon outline based on the following:

Topic or Bible Reference: "${topic}"
Target Audience: ${audience}
Tone: ${tone}
Duration: ${duration}
Additional Notes: ${notes || 'None'}

Return a JSON object with this exact structure:
{
  "title": "Sermon title",
  "theme": "Central theme or main idea",
  "keyVerse": "Primary scripture reference (e.g. John 3:16)",
  "introduction": "Engaging introduction paragraph (2-3 sentences)",
  "mainPoints": [
    {
      "title": "Point title",
      "explanation": "2-3 sentence explanation",
      "supportingVerse": "Supporting Bible verse reference",
      "illustration": "A brief real-life illustration or story idea",
      "application": "Practical application for the audience"
    }
  ],
  "conclusion": "Closing paragraph with call to action",
  "closingPrayer": "A short closing prayer"
}

Include exactly 3 main points. Make it biblically sound, practical, and appropriate for the audience and tone specified.`;
}

export default function AISermonAssistant() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('Church');
  const [tone, setTone] = useState('Pastoral');
  const [duration, setDuration] = useState('20–30 min');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSavedState] = useState(false);
  const [savedSermons, setSavedSermons] = useState(getSaved);
  const [showSaved, setShowSaved] = useState(false);
  const [expandedPoints, setExpandedPoints] = useState({});

  const canGenerate = topic.trim().length > 0 && !loading;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setResult(null);
    setSavedState(false);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(topic, audience, tone, duration, notes),
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            theme: { type: 'string' },
            keyVerse: { type: 'string' },
            introduction: { type: 'string' },
            mainPoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  explanation: { type: 'string' },
                  supportingVerse: { type: 'string' },
                  illustration: { type: 'string' },
                  application: { type: 'string' },
                },
              },
            },
            conclusion: { type: 'string' },
            closingPrayer: { type: 'string' },
          },
        },
      });
      setResult(response);
      setExpandedPoints({ 0: true, 1: true, 2: true });
    } catch (err) {
      console.error('Sermon generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    const entry = { id: Date.now(), topic, audience, tone, duration, result, savedAt: new Date().toISOString() };
    const updated = [entry, ...getSaved()].slice(0, 20);
    setSaved(updated);
    setSavedSermons(updated);
    setSavedState(true);
    setTimeout(() => setSavedState(false), 2000);
  };

  const handleDelete = (id) => {
    const updated = getSaved().filter(s => s.id !== id);
    setSaved(updated);
    setSavedSermons(updated);
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = [
      `SERMON: ${result.title}`,
      `Theme: ${result.theme}`,
      `Key Verse: ${result.keyVerse}`,
      '',
      'INTRODUCTION:',
      result.introduction,
      '',
      'MAIN POINTS:',
      ...(result.mainPoints || []).flatMap((p, i) => [
        `\n${i + 1}. ${p.title}`,
        p.explanation,
        `   Scripture: ${p.supportingVerse}`,
        `   Illustration: ${p.illustration}`,
        `   Application: ${p.application}`,
      ]),
      '',
      'CONCLUSION:',
      result.conclusion,
      '',
      'CLOSING PRAYER:',
      result.closingPrayer,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const togglePoint = (i) => setExpandedPoints(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">AI Sermon Assistant</h1>
            <p className="text-xs text-slate-500">Generate structured sermon outlines with AI</p>
          </div>
          <button
            onClick={() => setShowSaved(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Saved</span>
            {savedSermons.length > 0 && (
              <span className="bg-violet-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {savedSermons.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Saved Sermons Panel */}
        {showSaved && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Saved Sermons ({savedSermons.length})</h2>
              <button onClick={() => setShowSaved(false)} className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center">✕</button>
            </div>
            {savedSermons.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No saved sermons yet.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {savedSermons.map(s => (
                  <div key={s.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setResult(s.result); setTopic(s.topic); setShowSaved(false); setExpandedPoints({ 0: true, 1: true, 2: true }); }}>
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{s.result?.title || s.topic}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.audience} · {s.tone} · {s.duration}</p>
                      <p className="text-xs text-slate-400">{new Date(s.savedAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleDelete(s.id); }} className="text-slate-300 hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Topic or Bible Reference *</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. John 3:16, Faith in trials, The Good Shepherd..."
              className="w-full h-12 px-4 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Audience
              </label>
              <select value={audience} onChange={e => setAudience(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
                {['Church', 'Youth', 'Adults', 'Children', 'New Believers'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-slate-400" /> Tone
              </label>
              <select value={tone} onChange={e => setTone(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
                {['Pastoral', 'Powerful', 'Teaching', 'Encouraging', 'Evangelistic'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Clock3 className="w-3.5 h-3.5 text-slate-400" /> Duration
              </label>
              <select value={duration} onChange={e => setDuration(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
                {['10–15 min', '20–30 min', '35–45 min', '45–60 min'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Extra Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Occasion, church context, specific message focus, congregation's current needs..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Generating sermon...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Sermon Outline
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Title card */}
            <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-1">Sermon Title</p>
                  <h2 className="text-xl font-black leading-tight">{result.title}</h2>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white/15 rounded-xl p-3">
                      <p className="text-violet-200 text-xs mb-1">Theme</p>
                      <p className="text-sm font-semibold">{result.theme}</p>
                    </div>
                    <div className="bg-white/15 rounded-xl p-3">
                      <p className="text-violet-200 text-xs mb-1">Key Verse</p>
                      <p className="text-sm font-bold">{result.keyVerse}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleCopy} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors min-h-[44px]">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy All'}
                </button>
                <button onClick={handleSave} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors min-h-[44px]">
                  <Save className="w-4 h-4" />
                  {saved ? 'Saved!' : 'Save Notes'}
                </button>
              </div>
            </div>

            {/* Introduction */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">I</span>
                Introduction
              </h3>
              <p className="text-slate-700 leading-relaxed text-sm">{result.introduction}</p>
            </div>

            {/* Main Points */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Main Points</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {(result.mainPoints || []).map((point, i) => (
                  <div key={i}>
                    <button
                      onClick={() => togglePoint(i)}
                      className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left min-h-[44px]"
                    >
                      <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="flex-1 font-semibold text-slate-900 text-sm">{point.title}</p>
                      {expandedPoints[i] ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    </button>
                    {expandedPoints[i] && (
                      <div className="px-5 pb-5 space-y-3">
                        <p className="text-slate-700 text-sm leading-relaxed">{point.explanation}</p>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                          <p className="text-xs font-bold text-amber-700 mb-1">📖 Scripture</p>
                          <p className="text-amber-800 text-sm font-semibold">{point.supportingVerse}</p>
                        </div>
                        {point.illustration && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                            <p className="text-xs font-bold text-blue-700 mb-1">💡 Illustration</p>
                            <p className="text-blue-800 text-sm">{point.illustration}</p>
                          </div>
                        )}
                        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
                          <p className="text-xs font-bold text-violet-700 mb-1">✅ Application</p>
                          <p className="text-violet-800 text-sm">{point.application}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Conclusion */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">C</span>
                Conclusion
              </h3>
              <p className="text-slate-700 leading-relaxed text-sm">{result.conclusion}</p>
            </div>

            {/* Closing Prayer */}
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
              <h3 className="font-bold text-violet-900 mb-3 flex items-center gap-2">🙏 Closing Prayer</h3>
              <p className="text-violet-800 leading-relaxed text-sm italic">{result.closingPrayer}</p>
            </div>

            {/* Bottom actions */}
            <div className="flex gap-3">
              <button onClick={handleCopy} className="flex-1 h-12 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Outline'}
              </button>
              <button onClick={handleSave} className="flex-1 h-12 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 flex items-center justify-center gap-2 transition-colors">
                <Save className="w-4 h-4" />
                {saved ? 'Saved ✓' : 'Save Notes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}