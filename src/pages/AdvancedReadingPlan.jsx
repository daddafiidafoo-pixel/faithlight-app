import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookOpen, Plus, CheckCircle2, Circle, ChevronRight, Flame, Target,
  Bell, BellOff, Download, Sparkles, Loader2, Calendar, Trash2, Edit2,
  WifiOff, TrendingUp, Clock, Star, RefreshCw, ArrowLeft, Play
} from 'lucide-react';
import { toast } from 'sonner';

// ── Preset plan templates ────────────────────────────────────────────────────
const PLAN_TEMPLATES = [
  {
    id: 'chronological',
    label: 'Chronological Bible',
    icon: '📅',
    description: 'Read the Bible in the order events occurred historically.',
    duration_days: 365,
    category: 'chronological',
    items: [
      { label: 'Day 1: Genesis 1–2', book: 'Genesis', chapter: 1 },
      { label: 'Day 2: Genesis 3–5', book: 'Genesis', chapter: 3 },
      { label: 'Day 3: Genesis 6–9', book: 'Genesis', chapter: 6 },
      { label: 'Day 4: Genesis 10–11', book: 'Genesis', chapter: 10 },
      { label: 'Day 5: Job 1–5', book: 'Job', chapter: 1 },
    ]
  },
  {
    id: 'nt_90',
    label: 'New Testament in 90 Days',
    icon: '✝️',
    description: 'Complete the New Testament in 3 months.',
    duration_days: 90,
    category: 'book',
    items: [
      { label: 'Matthew 1–2', book: 'Matthew', chapter: 1 },
      { label: 'Matthew 3–4', book: 'Matthew', chapter: 3 },
      { label: 'Matthew 5–6', book: 'Matthew', chapter: 5 },
      { label: 'Matthew 7–8', book: 'Matthew', chapter: 7 },
      { label: 'Matthew 9–10', book: 'Matthew', chapter: 9 },
      { label: 'Matthew 11–12', book: 'Matthew', chapter: 11 },
      { label: 'Matthew 13–14', book: 'Matthew', chapter: 13 },
    ]
  },
  {
    id: 'psalms_proverbs',
    label: 'Psalms & Proverbs',
    icon: '🎵',
    description: 'A month in the wisdom literature of the Bible.',
    duration_days: 31,
    category: 'thematic',
    items: [
      { label: 'Psalm 1–5', book: 'Psalm', chapter: 1 },
      { label: 'Proverbs 1', book: 'Proverbs', chapter: 1 },
      { label: 'Psalm 6–10', book: 'Psalm', chapter: 6 },
      { label: 'Proverbs 2', book: 'Proverbs', chapter: 2 },
      { label: 'Psalm 11–15', book: 'Psalm', chapter: 11 },
      { label: 'Proverbs 3', book: 'Proverbs', chapter: 3 },
      { label: 'Psalm 16–20', book: 'Psalm', chapter: 16 },
    ]
  },
  {
    id: 'gospels',
    label: 'The Four Gospels',
    icon: '🕊️',
    description: 'Journey through the life of Jesus in all four gospels.',
    duration_days: 60,
    category: 'thematic',
    items: [
      { label: 'Matthew 1', book: 'Matthew', chapter: 1 },
      { label: 'Matthew 2', book: 'Matthew', chapter: 2 },
      { label: 'Mark 1', book: 'Mark', chapter: 1 },
      { label: 'Mark 2', book: 'Mark', chapter: 2 },
      { label: 'Luke 1', book: 'Luke', chapter: 1 },
      { label: 'Luke 2', book: 'Luke', chapter: 2 },
      { label: 'John 1', book: 'John', chapter: 1 },
    ]
  },
  {
    id: 'genesis',
    label: 'Genesis Deep Dive',
    icon: '🌱',
    description: 'Study the foundation of Scripture in 50 days.',
    duration_days: 50,
    category: 'book',
    items: Array.from({ length: 50 }, (_, i) => ({
      label: `Genesis ${i + 1}`,
      book: 'Genesis',
      chapter: i + 1
    }))
  },
  {
    id: 'paul_epistles',
    label: "Paul's Letters",
    icon: '✉️',
    description: "Read all of Paul's epistles in canonical order.",
    duration_days: 45,
    category: 'thematic',
    items: [
      { label: 'Romans 1', book: 'Romans', chapter: 1 },
      { label: 'Romans 2', book: 'Romans', chapter: 2 },
      { label: 'Romans 3', book: 'Romans', chapter: 3 },
      { label: '1 Corinthians 1', book: '1 Corinthians', chapter: 1 },
      { label: '1 Corinthians 2', book: '1 Corinthians', chapter: 2 },
      { label: 'Galatians 1', book: 'Galatians', chapter: 1 },
      { label: 'Ephesians 1', book: 'Ephesians', chapter: 1 },
    ]
  }
];

const CATEGORY_COLORS = {
  chronological: 'bg-amber-100 text-amber-800 border-amber-300',
  thematic: 'bg-purple-100 text-purple-800 border-purple-300',
  book: 'bg-blue-100 text-blue-800 border-blue-300',
  custom: 'bg-green-100 text-green-800 border-green-300'
};

const CATEGORY_LABELS = {
  chronological: 'Chronological',
  thematic: 'Thematic',
  book: 'Book Study',
  custom: 'Custom'
};

function today() { return new Date().toDateString(); }

function getLocalProgress(planId) {
  try {
    const raw = localStorage.getItem(`reading_plan_progress_${planId}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function setLocalProgress(planId, data) {
  localStorage.setItem(`reading_plan_progress_${planId}`, JSON.stringify(data));
}

function getDaysSinceStart(startDate) {
  if (!startDate) return 0;
  const diff = new Date() - new Date(startDate);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 64, strokeWidth = 5 }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  const color = pct >= 100 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#6366f1';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
    </svg>
  );
}

// ── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, onOpen, onDelete }) {
  const progress = getLocalProgress(plan.id);
  const doneCount = Object.keys(progress).filter(k => progress[k]).length;
  const totalItems = (plan.plan_items || []).length;
  const pct = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;
  const daysIn = getDaysSinceStart(plan.created_date);
  const todayKey = `day_${today()}`;
  const readToday = !!progress[todayKey];

  return (
    <Card className="border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group" onClick={() => onOpen(plan)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <ProgressRing pct={pct} size={56} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">{pct}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{plan.title}</h3>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={(e) => { e.stopPropagation(); onDelete(plan.id); }} className="p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[plan.category || 'custom']}`}>
                {CATEGORY_LABELS[plan.category || 'custom']}
              </Badge>
              <span className="text-xs text-gray-500">{doneCount}/{totalItems} readings</span>
              {plan.duration_days && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{plan.duration_days}d plan
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              {readToday ? (
                <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />Read today
                </span>
              ) : (
                <span className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />Day {daysIn + 1} ready
                </span>
              )}
              {plan.reminder_enabled && (
                <span className="text-xs text-indigo-500 flex items-center gap-1">
                  <Bell className="w-3 h-3" />{plan.reminder_time || '08:00'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
          <div className="bg-indigo-500 rounded-full h-1.5 transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Plan Detail Modal ────────────────────────────────────────────────────────
function PlanDetailModal({ plan, onClose, onProgressUpdate }) {
  const [progress, setProgress] = useState(() => getLocalProgress(plan?.id));
  const [downloading, setDownloading] = useState({});

  if (!plan) return null;
  const items = plan.plan_items || [];
  const doneCount = Object.keys(progress).filter(k => progress[k]).length;
  const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  const toggleItem = (idx) => {
    const key = `item_${idx}`;
    const updated = { ...progress, [key]: !progress[key] };
    // mark today
    if (!progress[key]) updated[`day_${today()}`] = true;
    setProgress(updated);
    setLocalProgress(plan.id, updated);
    onProgressUpdate?.();
    if (!progress[key] && doneCount + 1 === items.length) {
      toast.success('🎉 Plan completed! Congratulations!');
    }
  };

  const downloadChapter = async (item) => {
    const key = `${item.book}_${item.chapter}`;
    setDownloading(d => ({ ...d, [key]: true }));
    try {
      const cacheKey = `bible_${item.book}_${item.chapter}_WEB`;
      if (localStorage.getItem(cacheKey)) {
        toast.success('Already downloaded!');
      } else {
        const data = await base44.entities.BibleVerse.filter({ book: item.book, chapter: item.chapter, translation: 'WEB' }, 'verse', 200);
        if (data.length) {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          toast.success(`${item.book} ${item.chapter} saved offline`);
        } else {
          toast.error('No verses found to download');
        }
      }
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(d => ({ ...d, [key]: false }));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            {plan.title}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
        </DialogHeader>

        {/* Progress header */}
        <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg">
          <div className="relative flex-shrink-0">
            <ProgressRing pct={pct} size={52} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-700">{pct}%</span>
          </div>
          <div>
            <p className="font-semibold text-indigo-900 text-sm">{doneCount} of {items.length} readings done</p>
            <p className="text-xs text-indigo-600">{items.length - doneCount} remaining · {plan.duration_days || '?'} day plan</p>
          </div>
          {pct >= 100 && (
            <span className="ml-auto text-2xl">🎉</span>
          )}
        </div>

        {/* Readings list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {items.map((item, idx) => {
            const key = `item_${idx}`;
            const done = !!progress[key];
            const dlKey = `${item.book}_${item.chapter}`;
            const isOffline = !!localStorage.getItem(`bible_${item.book}_${item.chapter}_WEB`);
            return (
              <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${done ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100 hover:border-indigo-200'}`}>
                <button onClick={() => toggleItem(idx)} className="flex-shrink-0">
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                    : <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-400 transition-colors" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.label}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isOffline && <WifiOff className="w-3 h-3 text-green-400" title="Available offline" />}
                  <button
                    onClick={() => downloadChapter(item)}
                    disabled={downloading[dlKey]}
                    className="p-1 rounded hover:bg-indigo-50 transition-colors"
                    title="Download offline"
                  >
                    {downloading[dlKey]
                      ? <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      : <Download className="w-3.5 h-3.5 text-gray-400 hover:text-indigo-500" />
                    }
                  </button>
                  {item.book && item.chapter && (
                    <Link
                      to={createPageUrl(`BibleReader?book=${encodeURIComponent(item.book)}&chapter=${item.chapter}`)}
                      onClick={onClose}
                      className="p-1 rounded hover:bg-indigo-50 transition-colors"
                      title="Read now"
                    >
                      <Play className="w-3.5 h-3.5 text-indigo-400 hover:text-indigo-600" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Create Plan Modal ────────────────────────────────────────────────────────
function CreatePlanModal({ open, onClose, onCreate }) {
  const [tab, setTab] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', duration_days: 30, category: 'custom', reminder_enabled: false, reminder_time: '08:00' });
  const [generating, setGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreateFromTemplate = async (tpl) => {
    setSaving(true);
    try {
      await onCreate({
        title: tpl.label,
        description: tpl.description,
        duration_days: tpl.duration_days,
        category: tpl.category,
        plan_items: tpl.items,
        reminder_enabled: false,
        reminder_time: '08:00',
        status: 'active',
        progress_percentage: 0,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAIPlan = async () => {
    if (!aiTopic.trim()) { toast.error('Enter a topic or theme'); return; }
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a structured Bible reading plan on the topic: "${aiTopic}".
Return a JSON object with:
- title: string (descriptive plan name)
- description: string (1-2 sentences about the plan)
- duration_days: number (realistic, 7-60 days)
- category: "thematic" or "book" or "chronological"
- items: array of up to 20 objects: { label: string, book: string, chapter: number }
  (book must be exact Bible book name, chapter a valid number)`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            duration_days: { type: 'number' },
            category: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  book: { type: 'string' },
                  chapter: { type: 'number' }
                }
              }
            }
          }
        }
      });
      setSelectedTemplate(result);
      toast.success('AI plan generated!');
    } catch {
      toast.error('Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAIPlan = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      await onCreate({
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        duration_days: selectedTemplate.duration_days,
        category: selectedTemplate.category || 'thematic',
        plan_items: selectedTemplate.items,
        reminder_enabled: form.reminder_enabled,
        reminder_time: form.reminder_time,
        status: 'active',
        progress_percentage: 0,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCustom = async () => {
    if (!form.title.trim()) { toast.error('Enter a plan title'); return; }
    setSaving(true);
    try {
      await onCreate({ ...form, plan_items: [], status: 'active', progress_percentage: 0 });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            Create Reading Plan
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="template">📚 Templates</TabsTrigger>
            <TabsTrigger value="ai"><Sparkles className="w-3.5 h-3.5 mr-1" />AI Generate</TabsTrigger>
            <TabsTrigger value="custom">✏️ Custom</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="template" className="space-y-3 mt-0">
              {PLAN_TEMPLATES.map(tpl => (
                <div key={tpl.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer group" onClick={() => handleCreateFromTemplate(tpl)}>
                  <span className="text-2xl flex-shrink-0">{tpl.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{tpl.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{tpl.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[tpl.category]}`}>{CATEGORY_LABELS[tpl.category]}</Badge>
                      <span className="text-xs text-gray-400">{tpl.duration_days} days</span>
                    </div>
                  </div>
                  {saving ? <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="ai" className="space-y-4 mt-0">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Enter a theme or topic</label>
                <div className="flex gap-2">
                  <Input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g. faith, forgiveness, the life of David..." className="flex-1" onKeyDown={(e) => e.key === 'Enter' && handleGenerateAIPlan()} />
                  <Button onClick={handleGenerateAIPlan} disabled={generating} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generating ? 'Generating…' : 'Generate'}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">AI will create a personalized reading plan with Bible passages.</p>
              </div>

              {selectedTemplate && (
                <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/50">
                  <h3 className="font-bold text-indigo-900 text-base">{selectedTemplate.title}</h3>
                  <p className="text-sm text-indigo-700 mt-1">{selectedTemplate.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{selectedTemplate.duration_days} days</Badge>
                    <Badge variant="outline" className="text-xs">{(selectedTemplate.items || []).length} readings</Badge>
                  </div>
                  <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                    {(selectedTemplate.items || []).map((it, i) => (
                      <p key={i} className="text-xs text-gray-600 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                        {it.label}
                      </p>
                    ))}
                  </div>

                  {/* Reminder settings */}
                  <div className="mt-4 pt-3 border-t border-indigo-200 flex items-center gap-3">
                    <Bell className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <label className="text-sm text-indigo-800 flex-1">Daily reminder</label>
                    <input type="time" value={form.reminder_time} onChange={(e) => setForm(f => ({ ...f, reminder_time: e.target.value }))} className="text-xs border rounded px-2 py-1" />
                    <input type="checkbox" checked={form.reminder_enabled} onChange={(e) => setForm(f => ({ ...f, reminder_enabled: e.target.checked }))} className="rounded" />
                  </div>

                  <Button onClick={handleSaveAIPlan} disabled={saving} className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add This Plan
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-3 mt-0">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Plan Title *</label>
                <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="My Reading Plan" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What this plan is about…" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Duration (days)</label>
                  <Input type="number" min="1" value={form.duration_days} onChange={(e) => setForm(f => ({ ...f, duration_days: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                  <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="chronological">Chronological</SelectItem>
                      <SelectItem value="thematic">Thematic</SelectItem>
                      <SelectItem value="book">Book Study</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <Bell className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <label className="text-sm text-gray-700 flex-1">Enable daily reminder</label>
                <input type="time" value={form.reminder_time} onChange={(e) => setForm(f => ({ ...f, reminder_time: e.target.value }))} className="text-xs border rounded px-2 py-1" />
                <input type="checkbox" checked={form.reminder_enabled} onChange={(e) => setForm(f => ({ ...f, reminder_enabled: e.target.checked }))} className="rounded" />
              </div>
              <Button onClick={handleSaveCustom} disabled={saving || !form.title.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Plan
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdvancedReadingPlan() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['studyPlans', user?.id, refreshKey],
    queryFn: () => base44.entities.StudyPlan.filter({ user_id: user.id }, '-created_date', 50),
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.StudyPlan.create({ ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studyPlans']);
      toast.success('Reading plan created!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StudyPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['studyPlans']);
      toast.success('Plan deleted');
    }
  });

  const activePlans = plans.filter(p => p.status !== 'completed' && p.status !== 'paused');
  const completedPlans = plans.filter(p => p.status === 'completed');
  const pausedPlans = plans.filter(p => p.status === 'paused');

  // Streak calculation
  const streak = (() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const key = d.toDateString();
      const readSomething = plans.some(p => {
        const prog = getLocalProgress(p.id);
        return prog[`day_${key}`];
      });
      if (!readSomething) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Please log in to access your reading plans</p>
          <Button className="mt-4" onClick={() => base44.auth.redirectToLogin()}>Log In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('BibleReader')}>
              <Button variant="ghost" size="icon" className="hover:bg-indigo-50">
                <ArrowLeft className="w-5 h-5 text-indigo-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                Reading Plans
              </h1>
              <p className="text-sm text-gray-500">Track your journey through Scripture</p>
            </div>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Plan</span>
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-indigo-700">{activePlans.length}</p>
              <p className="text-xs text-indigo-600">Active Plans</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-amber-500" />
                <p className="text-2xl font-bold text-amber-700">{streak}</p>
              </div>
              <p className="text-xs text-amber-600">Day Streak</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{completedPlans.length}</p>
              <p className="text-xs text-green-600">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Plans tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active {activePlans.length > 0 && <span className="ml-1 text-xs bg-indigo-100 text-indigo-700 rounded-full px-1.5">{activePlans.length}</span>}</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : activePlans.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-600">No active reading plans</p>
                <p className="text-sm text-gray-400 mt-1">Start a plan to begin your reading journey</p>
                <Button onClick={() => setShowCreate(true)} className="mt-4 gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4" /> Create Your First Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activePlans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} onOpen={setSelectedPlan} onDelete={(id) => deleteMutation.mutate(id)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedPlans.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No completed plans yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedPlans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} onOpen={setSelectedPlan} onDelete={(id) => deleteMutation.mutate(id)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="paused">
            {pausedPlans.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No paused plans</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pausedPlans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} onOpen={setSelectedPlan} onDelete={(id) => deleteMutation.mutate(id)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover">
            <div className="grid sm:grid-cols-2 gap-3">
              {PLAN_TEMPLATES.map(tpl => (
                <Card key={tpl.id} className="border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{tpl.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{tpl.label}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{tpl.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[tpl.category]}`}>{CATEGORY_LABELS[tpl.category]}</Badge>
                          <span className="text-xs text-gray-400">{tpl.duration_days} days</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 gap-1"
                      onClick={() => {
                        createMutation.mutate({
                          title: tpl.label, description: tpl.description,
                          duration_days: tpl.duration_days, category: tpl.category,
                          plan_items: tpl.items, reminder_enabled: false,
                          reminder_time: '08:00', status: 'active', progress_percentage: 0
                        });
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" /> Start This Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreatePlanModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(data) => createMutation.mutateAsync(data)}
      />
      {selectedPlan && (
        <PlanDetailModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onProgressUpdate={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
}