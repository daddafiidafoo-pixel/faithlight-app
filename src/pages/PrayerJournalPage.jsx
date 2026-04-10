import React, { useState, useEffect, useCallback } from 'react';
import { useLanguageStore } from '@/stores/languageStore';
import { t as tr } from '@/lib/i18n';
import PullToRefresh from '@/components/PullToRefresh';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AccessibleSelect } from '@/components/ui/accessible-select';
import {
  Plus, Search, CheckCircle2, Circle, Pencil, Trash2,
  ChevronDown, ChevronUp, Heart, Loader2, Calendar, X, BookOpen, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CATEGORIES = ['health', 'family', 'faith', 'work', 'relationships', 'gratitude', 'finances', 'other'];
const CATEGORY_COLORS = {
  health: 'bg-red-100 text-red-700',
  family: 'bg-blue-100 text-blue-700',
  faith: 'bg-purple-100 text-purple-700',
  work: 'bg-yellow-100 text-yellow-700',
  relationships: 'bg-pink-100 text-pink-700',
  gratitude: 'bg-green-100 text-green-700',
  finances: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
};

const EMPTY_FORM = {
  title: '',
  content: '',
  date: new Date().toISOString().split('T')[0],
  category: 'other',
  isAnswered: false,
  answeredNote: '',
};

function JournalEntryCard({ entry, onEdit, onDelete, onToggleAnswered }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className={`transition-all duration-200 ${entry.isAnswered ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggleAnswered(entry)}
            className="mt-0.5 flex-shrink-0"
            title={entry.isAnswered ? 'Mark as active' : 'Mark as answered'}
          >
            {entry.isAnswered
              ? <CheckCircle2 className="w-5 h-5 text-green-500" />
              : <Circle className="w-5 h-5 text-gray-300 hover:text-green-400 transition-colors" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className={`font-semibold text-sm ${entry.isAnswered ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {entry.title}
              </h3>
              <Badge className={`text-xs capitalize px-2 py-0.5 border-0 ${CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other}`}>
                {entry.category}
              </Badge>
              {entry.isAnswered && (
                <Badge className="text-xs bg-green-100 text-green-700 border-0">Answered ✓</Badge>
              )}
            </div>

            <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
              <Calendar className="w-3 h-3" />
              {entry.date ? format(new Date(entry.date + 'T00:00:00'), 'MMMM d, yyyy') : '—'}
            </p>

            {entry.content && (
              <div>
                <p className={`text-sm text-gray-600 leading-relaxed whitespace-pre-wrap ${!expanded ? 'line-clamp-3' : ''}`}>
                  {entry.content}
                </p>
                {entry.content.length > 150 && (
                  <button
                    onClick={() => setExpanded(v => !v)}
                    className="text-xs text-indigo-500 hover:text-indigo-700 mt-1 flex items-center gap-1"
                  >
                    {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
                  </button>
                )}
              </div>
            )}

            {entry.isAnswered && entry.answeredNote && (
              <div className="mt-2 p-2.5 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs font-semibold text-green-700 mb-0.5">🙏 How God answered:</p>
                <p className="text-xs text-green-600 leading-relaxed">{entry.answeredNote}</p>
              </div>
            )}
          </div>

          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(entry)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-500 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EntryForm({ initial, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  return (
    <Card className="border-indigo-200 shadow-lg">
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded outline-none" tabIndex="0">
        <Heart className="w-4 h-4 text-rose-500" />
        {initial?.id ? 'Edit Prayer Entry' : 'New Prayer Entry'}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Title *</Label>
          <Input
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="What are you praying about?"
            className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          />
        </div>

        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Date</Label>
          <Input
            type="date"
            value={form.date}
            onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
          />
        </div>

        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Prayer</Label>
          <Textarea
            value={form.content}
            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            placeholder="Write your prayer here..."
            rows={5}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Category</Label>
            <AccessibleSelect
              value={form.category}
              onValueChange={v => setForm(p => ({ ...p, category: v }))}
              label="Category"
              options={CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
            />
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAnswered}
                onChange={e => setForm(p => ({ ...p, isAnswered: e.target.checked }))}
                className="w-4 h-4 accent-green-600"
              />
              <span className="text-sm text-gray-700 font-medium">Answered ✓</span>
            </label>
          </div>
        </div>

        {form.isAnswered && (
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">How was it answered? (optional)</Label>
            <Textarea
              value={form.answeredNote || ''}
              onChange={e => setForm(p => ({ ...p, answeredNote: e.target.value }))}
              placeholder="Share how God answered this prayer..."
              rows={2}
              className="resize-none"
            />
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            onClick={() => onSave(form)}
            disabled={isSaving || !form.title.trim() || !form.content.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {initial?.id ? 'Update Entry' : 'Save Prayer'}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PrayerJournalPage() {
  const queryClient = useQueryClient();
  const uiLang = useLanguageStore(s => s.uiLanguage);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin(window.location.href));
  }, []);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['prayer-journal', user?.email],
    queryFn: () => base44.entities.PrivatePrayerJournal.filter({ userEmail: user.email }, '-created_date', 200),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PrivatePrayerJournal.create({ ...data, userEmail: user.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-journal'] });
      setShowForm(false);
      toast.success(tr(uiLang, 'journal.prayerSaved') || 'Prayer saved 🙏');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PrivatePrayerJournal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-journal'] });
      setEditingEntry(null);
      toast.success(tr(uiLang, 'journal.prayerUpdated') || 'Prayer updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PrivatePrayerJournal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-journal'] });
      toast.success(tr(uiLang, 'journal.entryRemoved') || 'Entry removed');
    },
  });

  const handleSave = (form) => {
    if (editingEntry?.id) {
      updateMutation.mutate({ id: editingEntry.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleToggleAnswered = (entry) => {
    updateMutation.mutate({
      id: entry.id,
      data: {
        isAnswered: !entry.isAnswered,
        answeredDate: !entry.isAnswered ? new Date().toISOString().split('T')[0] : null,
      },
    });
  };

  const filtered = entries.filter(e => {
    const matchSearch = !search ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.content?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || e.category === filterCategory;
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && !e.isAnswered) ||
      (filterStatus === 'answered' && e.isAnswered);
    return matchSearch && matchCat && matchStatus;
  });

  const activeCount = entries.filter(e => !e.isAnswered).length;
  const answeredCount = entries.filter(e => e.isAnswered).length;

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['prayer-journal'] });
  }, [queryClient]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={isLoading}>
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Skip to content link */}
      <a href="#prayer-journal-content" className="skip-to-content">Skip to main content</a>
      
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 pt-10 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white rounded" tabIndex="0">
            <Heart className="w-6 h-6 text-rose-300" /> {tr(uiLang, 'journal.title')}
          </h1>
          <div className="flex items-center justify-between mb-4">
            <p className="text-violet-200 text-sm">{tr(uiLang, 'journal.privateSpace') || 'Your private space to talk with God'}</p>
            <Link to="/DailyReflection"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs text-white font-semibold transition-colors">
              <Sparkles size={13} className="text-yellow-300" /> AI Reflection
            </Link>
          </div>
          <div className="flex gap-3">
            {[
              { label: tr(uiLang, 'communityPrayerBoard.filterActive'), count: activeCount, color: 'bg-white/20' },
              { label: tr(uiLang, 'communityPrayerBoard.filterAnswered'), count: answeredCount, color: 'bg-green-500/30' },
              { label: tr(uiLang, 'journal.total') || 'Total', count: entries.length, color: 'bg-white/10' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl px-4 py-2 text-center`}>
                <p className="text-xl font-bold text-white">{s.count}</p>
                <p className="text-xs text-violet-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main id="prayer-journal-content" className="max-w-2xl mx-auto px-4 -mt-10 space-y-4">
        {/* Add Button */}
        {!showForm && !editingEntry && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 shadow-md font-semibold gap-2 h-12"
          >
            <Plus className="w-5 h-5" /> {tr(uiLang, 'journal.addEntry')}
          </Button>
        )}

        {showForm && (
          <EntryForm
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            isSaving={createMutation.isPending}
          />
        )}

        {editingEntry && (
          <EntryForm
            initial={editingEntry}
            onSave={handleSave}
            onCancel={() => setEditingEntry(null)}
            isSaving={updateMutation.isPending}
          />
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-3 pb-3 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={tr(uiLang, 'journal.searchPlaceholder') || 'Search prayers...'}
                className="pl-9"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Status filter pills */}
              {[
                { value: 'all', label: tr(uiLang, 'common.viewAll') || 'All' },
                { value: 'active', label: `🕊 ${tr(uiLang, 'communityPrayerBoard.filterActive')}` },
                { value: 'answered', label: `✓ ${tr(uiLang, 'communityPrayerBoard.filterAnswered')}` },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    filterStatus === opt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <AccessibleSelect
                value={filterCategory}
                onValueChange={setFilterCategory}
                label="Category"
                placeholder="All Categories"
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
                ]}
                className="w-36"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        {!isLoading && entries.length > 0 && (
          <p className="text-xs text-gray-400 px-1">
            {filtered.length} / {entries.length}
          </p>
        )}

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">
              {entries.length === 0
                ? tr(uiLang, 'journal.noEntries')
                : tr(uiLang, 'journal.noMatchFilters') || 'No entries match your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(entry => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onEdit={(e) => { setEditingEntry(e); setShowForm(false); }}
                onDelete={(id) => deleteMutation.mutate(id)}
                onToggleAnswered={handleToggleAnswered}
              />
            ))}
          </div>
        )}
        </main>
        </div>
        </PullToRefresh>
        );
        }