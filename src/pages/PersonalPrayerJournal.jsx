import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Plus, Search, Filter, CheckCircle2, Circle, Pencil, Trash2,
  ChevronDown, ChevronUp, Heart, Loader2, Calendar, Tag, X, BookOpen, Bell
} from 'lucide-react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
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

const EMPTY_FORM = { title: '', body: '', category: 'other', status: 'active', reminderFrequency: 'none' };

function PrayerCard({ prayer, onEdit, onDelete, onToggleAnswered }) {
  const [expanded, setExpanded] = useState(false);
  const answered = prayer.status === 'answered';

  return (
    <Card className={`transition-all ${answered ? 'opacity-75 border-green-200' : 'border-gray-200'}`}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggleAnswered(prayer)}
            className="mt-0.5 flex-shrink-0"
            title={answered ? 'Mark as active' : 'Mark as answered'}
          >
            {answered
              ? <CheckCircle2 className="w-5 h-5 text-green-500" />
              : <Circle className="w-5 h-5 text-gray-300 hover:text-green-400 transition-colors" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold text-sm ${answered ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {prayer.title}
              </h3>
              <Badge className={`text-xs capitalize px-2 py-0.5 ${CATEGORY_COLORS[prayer.category] || CATEGORY_COLORS.other}`}>
                {prayer.category}
              </Badge>
              {answered && <Badge className="text-xs bg-green-100 text-green-700 border-0">Answered ✓</Badge>}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {prayer.created_date ? format(new Date(prayer.created_date), 'MMM d, yyyy') : '—'}
            </p>

            {/* Body preview */}
            {prayer.body && (
              <div className="mt-2">
                <p className={`text-sm text-gray-600 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
                  {prayer.body}
                </p>
                {prayer.body.length > 120 && (
                  <button
                    onClick={() => setExpanded(v => !v)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 flex items-center gap-1"
                  >
                    {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
                  </button>
                )}
              </div>
            )}

            {/* Answer notes */}
            {answered && prayer.answerNotes && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs font-medium text-green-700 mb-0.5">🙏 How God answered:</p>
                <p className="text-xs text-green-600">{prayer.answerNotes}</p>
              </div>
            )}
          </div>

          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onEdit(prayer)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(prayer.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PrayerForm({ initial, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [showAnswerNote, setShowAnswerNote] = useState(initial?.status === 'answered');

  return (
    <Card className="border-indigo-200 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          {initial?.id ? 'Edit Prayer' : 'New Prayer Request'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs text-gray-600">Title *</Label>
          <Input
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="What are you praying for?"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600">Prayer Details</Label>
          <Textarea
            value={form.body}
            onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
            placeholder="Write your full prayer..."
            rows={4}
            className="mt-1 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Category</Label>
            <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-600">Status</Label>
            <Select value={form.status} onValueChange={v => { setForm(p => ({ ...p, status: v })); setShowAnswerNote(v === 'answered'); }}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="answered">Answered ✓</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showAnswerNote && (
          <div>
            <Label className="text-xs text-gray-600">How was it answered? (optional)</Label>
            <Textarea
              value={form.answerNotes || ''}
              onChange={e => setForm(p => ({ ...p, answerNotes: e.target.value }))}
              placeholder="Share how God answered this prayer..."
              rows={2}
              className="mt-1 resize-none"
            />
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            onClick={() => onSave(form)}
            disabled={isSaving || !form.title.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 flex-1"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {initial?.id ? 'Update Prayer' : 'Save Prayer'}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PersonalPrayerJournal() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin(window.location.href));
  }, []);

  const { data: prayers = [], isLoading } = useQuery({
    queryKey: ['personal-prayers', user?.email],
    queryFn: () => base44.entities.PrayerRequest.filter({ userEmail: user.email }, '-created_date', 100).catch(() => []),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PrayerRequest.create({ ...data, userEmail: user.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-prayers'] });
      setShowForm(false);
      toast.success('Prayer saved 🙏');
    },
    onError: () => toast.error('Failed to save prayer'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PrayerRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-prayers'] });
      setEditingPrayer(null);
      toast.success('Prayer updated');
    },
    onError: () => toast.error('Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PrayerRequest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-prayers'] });
      toast.success('Prayer removed');
    },
  });

  const handleSave = (form) => {
    if (editingPrayer?.id) {
      updateMutation.mutate({ id: editingPrayer.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (prayer) => {
    setEditingPrayer(prayer);
    setShowForm(false);
  };

  const handleToggleAnswered = (prayer) => {
    const newStatus = prayer.status === 'answered' ? 'active' : 'answered';
    updateMutation.mutate({
      id: prayer.id,
      data: { status: newStatus, answerDate: newStatus === 'answered' ? new Date().toISOString() : null },
    });
  };

  // Filter & sort
  const filtered = prayers
    .filter(p => {
      const matchSearch = !searchTerm || p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || p.body?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'all' || p.category === filterCategory;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'oldest') return new Date(a.created_date) - new Date(b.created_date);
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      return 0;
    });

  const activePrayers = prayers.filter(p => p.status === 'active').length;
  const answeredPrayers = prayers.filter(p => p.status === 'answered').length;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 pt-8 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-300" /> Prayer Journal
              </h1>
              <p className="text-violet-200 text-sm">A personal space to bring your heart before God</p>
            </div>
            <Link to="/PrayerTimeSettings" className="flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors text-white text-xs px-3 py-2.5 rounded-xl font-medium min-h-[44px] min-w-[44px]">
              <Bell className="w-3.5 h-3.5" /> Reminders
            </Link>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold text-white">{activePrayers}</p>
              <p className="text-xs text-violet-200">Active</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold text-white">{answeredPrayers}</p>
              <p className="text-xs text-violet-200">Answered</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold text-white">{prayers.length}</p>
              <p className="text-xs text-violet-200">Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 space-y-4">
        {/* Add Button */}
        {!showForm && !editingPrayer && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 shadow-md font-semibold gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Prayer
          </Button>
        )}

        {/* New Prayer Form */}
        {showForm && (
          <PrayerForm
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            isSaving={createMutation.isPending}
          />
        )}

        {/* Edit Form */}
        {editingPrayer && (
          <PrayerForm
            initial={editingPrayer}
            onSave={handleSave}
            onCancel={() => setEditingPrayer(null)}
            isSaving={updateMutation.isPending}
          />
        )}

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-4 pb-3 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search prayers..."
                className="pl-9 h-11"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-36 text-xs h-11">
                  <Tag className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 text-xs h-11">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 text-xs h-11">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="category">By Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Prayer List */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              {prayers.length === 0 ? 'No prayers yet. Add your first one!' : 'No prayers match your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(prayer => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
                onToggleAnswered={handleToggleAnswered}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}