import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Wand2, Lightbulb, Copy, Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const MODES = [
  { id: 'GENERATE', label: 'Generate', icon: Sparkles },
  { id: 'IMPROVE',  label: 'Improve',  icon: Wand2 },
  { id: 'IDEAS',    label: 'Ideas',    icon: Lightbulb },
];
const TONES = ['Friendly', 'Professional', 'Neutral', 'Firm'];
const LENGTHS = ['Short', 'Medium', 'Long'];

const LENGTH_GUIDE = { Short: '1–2 short paragraphs', Medium: '2–3 paragraphs', Long: '4–6 paragraphs' };

// Simple client-side violation precheck
function detectViolations(text) {
  if (!text) return [];
  const t = text.toLowerCase();
  const flags = [];
  if (/(idiot|stupid|hate you|shut up|loser|dumb)/.test(t)) flags.push('Possible insulting language detected.');
  if (/https?:\/\/\S+/.test(t) && /(free|giveaway|win money|click here|earn cash)/.test(t)) flags.push('Possible spam/promotional wording detected.');
  return flags;
}

// Parse the LLM JSON output safely
function safeParseLLMJson(raw) {
  try {
    const cleaned = String(raw ?? '').trim().replace(/^```json\s*/i, '').replace(/```$/, '');
    const obj = JSON.parse(cleaned);
    return {
      text: typeof obj.text === 'string' ? obj.text : '',
      suggestions: Array.isArray(obj.suggestions) ? obj.suggestions.slice(0, 10) : [],
      titles: Array.isArray(obj.titles) ? obj.titles.slice(0, 10) : [],
      warnings: Array.isArray(obj.warnings) ? obj.warnings.slice(0, 5) : [],
    };
  } catch {
    return { text: String(raw || ''), suggestions: [], titles: [], warnings: ['AI output was unstructured — showing raw text.'] };
  }
}

export default function AIWritingAssistPanel({ type = 'POST', category = '', draft = '', onApply }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('IMPROVE');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Friendly');
  const [length, setLength] = useState('Medium');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const clientWarnings = mode === 'IMPROVE' ? detectViolations(draft) : detectViolations(topic);

  const run = async () => {
    if (mode !== 'IMPROVE' && !topic.trim()) { toast.error('Please enter a topic first'); return; }
    if (mode === 'IMPROVE' && !draft.trim()) { toast.error('Nothing to improve — add some content first'); return; }

    setLoading(true);
    setResult(null);

    const modeInstructions = {
      GENERATE: `Write a new ${type.toLowerCase()} about the given topic.`,
      IMPROVE: `Improve the draft below. Preserve the author's intent and key facts. Do not add claims not in the draft. Fix tone, clarity, and grammar.`,
      IDEAS: `Generate talking points, title ideas, and an example paragraph for the given topic.`,
    };

    const prompt = `You are a writing assistant for a faith-based Bible education community called FaithLight.

Task: ${modeInstructions[mode]}
Type: ${type}${category ? ` (category: ${category})` : ''}
Tone: ${tone}
Length: ${length} (${LENGTH_GUIDE[length]})
${topic ? `Topic: ${topic}` : ''}
${draft ? `Draft:\n"""\n${draft.slice(0, 2000)}\n"""` : ''}
${instructions ? `Extra instructions: ${instructions}` : ''}

Community rules: Be respectful, Bible-centered, appropriate for all ages, no hate speech, no spam.

Return ONLY valid JSON (no extra text, no markdown) with this exact shape:
{
  "text": "the generated or improved content",
  "suggestions": ["tip 1", "tip 2"],
  "titles": ["title option 1", "title option 2"],
  "warnings": ["guideline concern if any"]
}
For IDEAS mode: put talking points in suggestions, title options in titles, a short example in text.
For IMPROVE/GENERATE: put the content in text, quick tips in suggestions, leave titles for POST type only.
warnings should only appear if the input contains potential guideline violations.`;

    const raw = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          suggestions: { type: 'array', items: { type: 'string' } },
          titles: { type: 'array', items: { type: 'string' } },
          warnings: { type: 'array', items: { type: 'string' } },
        },
      },
    }).catch(e => { toast.error('AI request failed'); return null; });

    setLoading(false);
    if (raw) setResult(typeof raw === 'object' ? raw : safeParseLLMJson(raw));
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/50">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI Writing Assistant
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Mode tabs */}
          <div className="flex gap-1 bg-white rounded-lg p-1 border border-purple-100">
            {MODES.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMode(m.id); setResult(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mode === m.id ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                <m.icon className="w-3 h-3" />
                {m.label}
              </button>
            ))}
          </div>

          {/* Topic */}
          {mode !== 'IMPROVE' && (
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Topic (e.g., Tips for daily Bible reading…)"
              className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            />
          )}

          {/* Client-side violation warnings */}
          {clientWarnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <ul className="space-y-0.5">
                {clientWarnings.map((w, i) => <li key={i} className="text-xs text-amber-700">{w}</li>)}
              </ul>
            </div>
          )}

          {/* Tone + Length */}
          <div className="flex gap-2">
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="flex-1 h-8 text-xs border-purple-200"><SelectValue /></SelectTrigger>
              <SelectContent>{TONES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={length} onValueChange={setLength}>
              <SelectTrigger className="flex-1 h-8 text-xs border-purple-200"><SelectValue /></SelectTrigger>
              <SelectContent>{LENGTHS.map(l => <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* Extra instructions */}
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="Extra instructions (optional): include 3 bullet points, avoid jargon…"
            rows={2}
            className="w-full px-3 py-2 text-xs border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white resize-none"
          />

          <Button
            type="button"
            onClick={run}
            disabled={loading}
            size="sm"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {loading ? 'Working…' : 'Run AI'}
          </Button>

          {/* Results */}
          {result && (
            <div className="space-y-3 pt-1">
              {result.warnings?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800 mb-1">Guideline note:</p>
                    <ul className="space-y-0.5">
                      {result.warnings.map((w, i) => <li key={i} className="text-xs text-amber-700">• {w}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {result.text && (
                <div className="space-y-2">
                  <div className="relative">
                    <textarea readOnly value={result.text} rows={5}
                      className="w-full px-3 py-2 text-sm bg-white border border-purple-200 rounded-lg resize-none" />
                    <button type="button" onClick={() => handleCopy(result.text)}
                      className="absolute top-2 right-2 p-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-600">
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm"
                      onClick={() => { onApply(result.text, 'replace'); toast.success('Draft replaced'); }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs">
                      Replace draft
                    </Button>
                    <Button type="button" size="sm" variant="outline"
                      onClick={() => { onApply(result.text, 'append'); toast.success('Appended'); }}
                      className="flex-1 text-xs border-purple-200 text-purple-700 hover:bg-purple-50">
                      Append
                    </Button>
                  </div>
                </div>
              )}

              {result.titles?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">Title suggestions:</p>
                  <div className="space-y-1">
                    {result.titles.map((title, i) => (
                      <button key={i} type="button"
                        onClick={() => { onApply(title, 'title'); toast.success('Title applied'); }}
                        className="block w-full text-left text-xs px-3 py-2 bg-white border border-purple-100 rounded-lg hover:bg-purple-50 text-gray-700 transition-colors">
                        {title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {result.suggestions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">
                    {mode === 'IDEAS' ? 'Talking points:' : 'Tips:'}
                  </p>
                  <ul className="space-y-1">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-2">
                        <span className="text-purple-400 flex-shrink-0">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}