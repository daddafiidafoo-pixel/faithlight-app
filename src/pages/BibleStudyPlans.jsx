import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BookOpen, Plus, Trash2, CheckCircle2, Circle, Play, Pause,
  ChevronDown, ChevronUp, Search, Target, TrendingUp, Calendar, X, Edit2, Save, Bell, Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import DiscoverPlans from '../components/study/DiscoverPlans';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah',
  'Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah',
  'Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum',
  'Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John',
  'Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians',
  'Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation',
];

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function calcProgress(items) {
  if (!items || items.length === 0) return 0;
  const done = items.filter(i => i.done).length;
  return Math.round((done / items.length) * 100);
}

function PlanCard({ plan, onDelete, onToggleStatus, onToggleItem, onEdit, onShare }) {
  const [expanded, setExpanded] = useState(false);
  const progress = calcProgress(plan.plan_items);

  return (
    <Card className="border border-gray-200 hover:border-indigo-300 transition-all shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          {/* Progress ring */}
          <div className="relative flex-shrink-0 w-12 h-12">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#4f46e5" strokeWidth="3"
                strokeDasharray={`${progress} ${100 - progress}`} strokeDashoffset="0"
                strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s' }} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-700">{progress}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{plan.title}</h3>
                {plan.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{plan.description}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge className={`text-xs ${STATUS_COLORS[plan.status] || STATUS_COLORS.active}`}>{plan.status}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-gray-400">
                {(plan.plan_items || []).filter(i => i.done).length}/{(plan.plan_items || []).length} items
              </span>
              {plan.duration_days && (
                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                  <Calendar className="w-3 h-3" /> {plan.duration_days} days
                </span>
              )}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide' : 'Show'} items
          </button>
          <div className="flex-1" />
          <button onClick={() => onShare(plan)} className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors" title="Share with community">
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onEdit(plan)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggleStatus(plan)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-amber-600 transition-colors"
            title={plan.status === 'active' ? 'Pause' : 'Resume'}
          >
            {plan.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onDelete(plan.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expanded items */}
        {expanded && (
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
            {(plan.plan_items || []).length === 0 ? (
              <p className="text-xs text-gray-400 italic">No reading items added yet.</p>
            ) : (
              (plan.plan_items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <button onClick={() => onToggleItem(plan, idx)} className="flex-shrink-0">
                    {item.done
                      ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                      : <Circle className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />}
                  </button>
                  <span className={`text-sm flex-1 ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.label}</span>
                  {item.book && (
                    <Link
                      to={createPageUrl(`BibleReader?book=${encodeURIComponent(item.book)}&chapter=${item.chapter || 1}`)}
                      className="text-xs text-indigo-500 hover:underline"
                    >
                      Read →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Create / Edit Plan Modal ─────────────────────────────────────────────────

function PlanModal({ open, onClose, onSave, initial }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [items, setItems] = useState([]);
  // For adding items
  const [addBook, setAddBook] = useState('John');
  const [addChapter, setAddChapter] = useState(1);
  const [addVerseLabel, setAddVerseLabel] = useState('');
  const [addDays, setAddDays] = useState(1);
  const [addReminder, setAddReminder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '');
      setDescription(initial.description || '');
      setDurationDays(initial.duration_days || 7);
      setItems(initial.plan_items || []);
    } else {
      setTitle('');
      setDescription('');
      setDurationDays(7);
      setItems([]);
    }
    setSearchQuery('');
    setSearchResults([]);
  }, [initial, open]);

  const addItem = () => {
    const label = addVerseLabel.trim() || `${addBook} ${addChapter}`;
    setItems(prev => [...prev, { label, book: addBook, chapter: addChapter, done: false, duration_days: addDays, reminder: addReminder }]);
    setAddVerseLabel('');
    setAddDays(1);
    setAddReminder('');
  };

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const resp = await base44.functions.invoke('bibleSearch', { q: searchQuery, limit: 5 });
    setSearchResults((resp.data?.results || []).slice(0, 5));
    setSearching(false);
  };

  const addFromSearch = (r) => {
    setItems(prev => [...prev, { label: r.ref, book: r.book, chapter: r.chapter, verse: r.verse, done: false }]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title, description, duration_days: durationDays, plan_items: items });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Study Plan' : 'Create Study Plan'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Plan Name *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Gospel of John — 30 Days" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Duration (days)</label>
            <Input type="number" min={1} max={365} value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} className="w-28" />
          </div>

          {/* Reading items */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Reading Items</label>

            {/* Add via selector */}
            <div className="flex gap-2 mb-2 flex-wrap">
              <Select value={addBook} onValueChange={setAddBook}>
                <SelectTrigger className="text-sm flex-1 min-w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-52">
                  {BIBLE_BOOKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={String(addChapter)} onValueChange={v => setAddChapter(Number(v))}>
                <SelectTrigger className="text-sm w-24"><SelectValue placeholder="Ch." /></SelectTrigger>
                <SelectContent className="max-h-48">
                  {Array.from({ length: 50 }, (_, i) => i + 1).map(c => <SelectItem key={c} value={String(c)}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input value={addVerseLabel} onChange={e => setAddVerseLabel(e.target.value)} placeholder="Custom label (optional)" className="text-sm flex-1 min-w-[120px]" />
            </div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <Input type="number" min={1} max={30} value={addDays} onChange={e => setAddDays(Number(e.target.value))} className="text-sm w-16" title="Days to spend on this item" />
                <span className="text-xs text-gray-400">day(s)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-gray-400" />
                <Input type="time" value={addReminder} onChange={e => setAddReminder(e.target.value)} className="text-sm w-28" title="Daily reminder time (optional)" />
                <span className="text-xs text-gray-400">reminder</span>
              </div>
              <Button onClick={addItem} size="sm" variant="outline" className="gap-1 ml-auto">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>

            {/* Add via search */}
            <div className="flex gap-2 mb-3">
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder='Search scripture to add (e.g. "love", John 3:16)'
                className="text-sm flex-1"
              />
              <Button onClick={handleSearch} size="sm" variant="outline" disabled={searching} className="gap-1">
                <Search className="w-3.5 h-3.5" /> {searching ? '...' : 'Search'}
              </Button>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg divide-y mb-3 max-h-36 overflow-y-auto">
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => addFromSearch(r)} className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors">
                    <span className="text-xs font-bold text-indigo-700">{r.ref}</span>
                    <span className="text-xs text-gray-500 ml-2 line-clamp-1">{r.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Current items */}
            {items.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                    <span className="text-xs w-5 text-center text-gray-400">{idx + 1}.</span>
                    <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                    <button onClick={() => removeItem(idx)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={!title.trim() || saving} className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Plan'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BibleStudyPlans() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sharingPlanId, setSharingPlanId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      loadPlans(u.id);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const loadPlans = async (uid) => {
    setLoading(true);
    const data = await base44.entities.StudyPlan.filter({ user_id: uid }, '-created_date');
    setPlans(data);
    setLoading(false);
  };

  const handleSave = async (formData) => {
    if (editingPlan) {
      await base44.entities.StudyPlan.update(editingPlan.id, formData);
    } else {
      await base44.entities.StudyPlan.create({ ...formData, user_id: user.id, status: 'active', progress_percentage: 0 });
    }
    setEditingPlan(null);
    loadPlans(user.id);
  };

  const handleDelete = async (id) => {
    await base44.entities.StudyPlan.delete(id);
    loadPlans(user.id);
  };

  const handleToggleStatus = async (plan) => {
    const next = plan.status === 'active' ? 'paused' : 'active';
    await base44.entities.StudyPlan.update(plan.id, { status: next });
    loadPlans(user.id);
  };

  const handleToggleItem = async (plan, idx) => {
    const items = [...(plan.plan_items || [])];
    items[idx] = { ...items[idx], done: !items[idx].done };
    const progress = Math.round((items.filter(i => i.done).length / items.length) * 100);
    const status = progress === 100 ? 'completed' : plan.status;
    await base44.entities.StudyPlan.update(plan.id, { plan_items: items, progress_percentage: progress, status });
    loadPlans(user.id);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleShare = async (plan) => {
    setSharingPlanId(plan.id);
    try {
      // Determine category based on topics
      let category = 'topical';
      if (plan.description?.toLowerCase().includes('book')) category = 'book';
      if (plan.description?.toLowerCase().includes('character')) category = 'character';
      if (plan.description?.toLowerCase().includes('doctrine')) category = 'doctrine';
      
      await base44.entities.SharedStudyPlan.create({
        creator_id: user.id,
        creator_name: user.full_name,
        study_plan_id: plan.id,
        title: plan.title,
        description: plan.description,
        duration_days: plan.duration_days,
        topics: plan.topics || [],
        plan_items: (plan.plan_items || []).map(i => ({ label: i.label, book: i.book, chapter: i.chapter, verse: i.verse })),
        item_count: (plan.plan_items || []).length,
        category,
        difficulty: 'intermediate',
        shares: 0,
        views: 0,
      });
      toast.success('Plan shared to Community Showcase!');
    } catch (e) {
      toast.error('Failed to share plan');
      console.error(e);
    }
    setSharingPlanId(null);
  };

  const filtered = plans.filter(p => filter === 'all' || p.status === filter);

  const stats = {
    active: plans.filter(p => p.status === 'active').length,
    completed: plans.filter(p => p.status === 'completed').length,
    total_items: plans.reduce((s, p) => s + (p.plan_items || []).length, 0),
    done_items: plans.reduce((s, p) => s + (p.plan_items || []).filter(i => i.done).length, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
                <Target className="w-6 h-6 text-white" />
              </div>
              Bible Study Plans
            </h1>
            <p className="text-gray-500 mt-1">Create personalized plans, discover popular plans, and track your progress.</p>
          </div>
          <Button onClick={() => { setEditingPlan(null); setShowModal(true); }} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> New Plan
          </Button>
        </div>

        <Tabs defaultValue="my_plans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:w-80">
            <TabsTrigger value="my_plans">My Plans</TabsTrigger>
            <TabsTrigger value="discover">Discover Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <DiscoverPlans user={user} onPlanAdded={() => loadPlans(user.id)} />
          </TabsContent>

          <TabsContent value="my_plans" className="space-y-5">

        {/* Stats bar */}
        {plans.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Active Plans', value: stats.active, icon: Play, color: 'text-green-600' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-blue-600' },
              { label: 'Total Items', value: stats.total_items, icon: BookOpen, color: 'text-indigo-600' },
              { label: 'Items Read', value: stats.done_items, icon: TrendingUp, color: 'text-emerald-600' },
            ].map(s => (
              <Card key={s.label} className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        {plans.length > 0 && (
          <div className="flex gap-2 mb-5">
            {['all', 'active', 'paused', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${
                  filter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* Plan list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mr-3" />
            Loading plans...
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="text-center py-16">
              <Target className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                {plans.length === 0 ? 'No study plans yet' : `No ${filter} plans`}
              </p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Create a plan to organize your Bible reading and track progress.</p>
              {plans.length === 0 && (
                <Button onClick={() => setShowModal(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4" /> Create Your First Plan
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onToggleItem={handleToggleItem}
                onEdit={handleEdit}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Modal */}
      <PlanModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingPlan(null); }}
        onSave={handleSave}
        initial={editingPlan}
      />
    </div>
  );
}