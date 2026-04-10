import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { generateAssignments, getBooksForPlanType, getAllChapters } from './planGenerator';
import { Loader2, BookOpen, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const ALL_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi',
  'Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians',
  'Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians',
  '1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter',
  '1 John','2 John','3 John','Jude','Revelation'
];

const PLAN_TYPES = [
  { value: 'new_testament', label: 'New Testament', desc: '260 chapters' },
  { value: 'old_testament', label: 'Old Testament', desc: '929 chapters' },
  { value: 'full_bible', label: 'Full Bible', desc: '1,189 chapters' },
  { value: 'book_focus', label: 'Book Focus', desc: 'Choose specific books' },
];

export default function CreatePlanModal({ open, onClose, userId, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    plan_type: 'new_testament',
    focus_books: [],
    frequency: 'daily',
    chapters_per_session: 3,
    start_date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleBook = (book) => {
    const cur = form.focus_books;
    set('focus_books', cur.includes(book) ? cur.filter(b => b !== book) : [...cur, book]);
  };

  const totalChapters = getAllChapters(getBooksForPlanType(form.plan_type, form.focus_books)).length;
  const sessions = Math.ceil(totalChapters / form.chapters_per_session);
  const durationDays = sessions * (form.frequency === 'weekly' ? 7 : 1);

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Please enter a plan title'); return; }
    setSaving(true);
    const assignments = generateAssignments(
      form.plan_type, form.focus_books, form.chapters_per_session, form.frequency, form.start_date
    );
    const endDate = assignments[assignments.length - 1]?.due_date || form.start_date;
    await base44.entities.ReadingPlan.create({
      user_id: userId,
      title: form.title,
      plan_type: form.plan_type,
      focus_books: form.focus_books,
      frequency: form.frequency,
      chapters_per_session: form.chapters_per_session,
      start_date: form.start_date,
      end_date: endDate,
      total_chapters: totalChapters,
      completed_chapters: 0,
      status: 'active',
      assignments,
    });
    setSaving(false);
    toast.success('Reading plan created!');
    onCreated?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Create Reading Plan
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Plan Title</label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. NT in 90 Days" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Plan Type</label>
            <div className="grid grid-cols-2 gap-2">
              {PLAN_TYPES.map(pt => (
                <button key={pt.value} onClick={() => set('plan_type', pt.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${form.plan_type === pt.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}>
                  <p className="font-semibold text-sm text-gray-800">{pt.label}</p>
                  <p className="text-xs text-gray-400">{pt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {form.plan_type === 'book_focus' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Select Books</label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
                {ALL_BOOKS.map(book => (
                  <button key={book} onClick={() => toggleBook(book)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${form.focus_books.includes(book) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                    {book}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Frequency</label>
              <Select value={form.frequency} onValueChange={v => set('frequency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Chapters/Session</label>
              <Select value={String(form.chapters_per_session)} onValueChange={v => set('chapters_per_session', Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,7,10].map(n => <SelectItem key={n} value={String(n)}>{n} chapter{n > 1 ? 's' : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
            <Input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
          </div>

          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="text-indigo-700">
              <strong>{sessions} sessions</strong> · {totalChapters} chapters · ~{durationDays} days
            </span>
          </div>

          <Button onClick={handleCreate} disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating…</> : 'Create Plan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}