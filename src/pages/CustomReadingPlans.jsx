import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, Target, CheckCircle2, Circle, Calendar, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Songs',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
  'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
  '2 Corinthians','Galatians','Ephesians','Philippians','Colossians',
  '1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

const CHAPTER_COUNTS = {
  'Genesis':50,'Exodus':40,'Leviticus':27,'Numbers':36,'Deuteronomy':34,'Joshua':24,
  'Judges':21,'Ruth':4,'1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,
  '1 Chronicles':29,'2 Chronicles':36,'Ezra':10,'Nehemiah':13,'Esther':10,'Job':42,
  'Psalm':150,'Proverbs':31,'Ecclesiastes':12,'Song of Songs':8,'Isaiah':66,
  'Jeremiah':52,'Lamentations':5,'Ezekiel':48,'Daniel':12,'Hosea':14,'Joel':3,
  'Amos':9,'Obadiah':1,'Jonah':4,'Micah':7,'Nahum':3,'Habakkuk':3,'Zephaniah':3,
  'Haggai':2,'Zechariah':14,'Malachi':4,'Matthew':28,'Mark':16,'Luke':24,'John':21,
  'Acts':28,'Romans':16,'1 Corinthians':16,'2 Corinthians':13,'Galatians':6,
  'Ephesians':6,'Philippians':4,'Colossians':4,'1 Thessalonians':5,'2 Thessalonians':3,
  '1 Timothy':6,'2 Timothy':4,'Titus':3,'Philemon':1,'Hebrews':13,'James':5,
  '1 Peter':5,'2 Peter':3,'1 John':5,'2 John':1,'3 John':1,'Jude':1,'Revelation':22
};

function generateAssignments(focusBooks, chaptersPerDay) {
  const allChapters = [];
  for (const book of focusBooks) {
    const count = CHAPTER_COUNTS[book] || 1;
    for (let c = 1; c <= count; c++) {
      allChapters.push({ book, chapter: c });
    }
  }
  const sessions = [];
  let i = 0;
  while (i < allChapters.length) {
    sessions.push({ session: sessions.length + 1, chapters: allChapters.slice(i, i + chaptersPerDay), completed: false });
    i += chaptersPerDay;
  }
  return sessions;
}

export default function CustomReadingPlans() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [form, setForm] = useState({ title: '', focus_books: [], chapters_per_session: 1 });
  const [selectedBook, setSelectedBook] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['reading-plans', user?.id],
    queryFn: () => base44.entities.ReadingPlan.filter({ user_id: user.id }, '-created_date', 50),
    enabled: !!user?.id,
  });

  const createPlan = useMutation({
    mutationFn: async (data) => {
      const assignments = generateAssignments(data.focus_books, data.chapters_per_session);
      return base44.entities.ReadingPlan.create({
        user_id: user.id,
        title: data.title,
        plan_type: 'custom',
        focus_books: data.focus_books,
        chapters_per_session: data.chapters_per_session,
        total_chapters: data.focus_books.reduce((s, b) => s + (CHAPTER_COUNTS[b] || 0), 0),
        completed_chapters: 0,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        assignments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reading-plans', user?.id]);
      setShowForm(false);
      setForm({ title: '', focus_books: [], chapters_per_session: 1 });
      toast.success('Reading plan created!');
    },
  });

  const markSession = useMutation({
    mutationFn: async ({ plan, sessionIdx, completed }) => {
      const assignments = [...(plan.assignments || [])];
      assignments[sessionIdx] = { ...assignments[sessionIdx], completed, completed_at: completed ? new Date().toISOString() : null };
      const completedChapters = assignments.filter(a => a.completed).reduce((s, a) => s + (a.chapters?.length || 0), 0);
      const status = completedChapters >= plan.total_chapters ? 'completed' : 'active';
      return base44.entities.ReadingPlan.update(plan.id, { assignments, completed_chapters: completedChapters, status });
    },
    onSuccess: () => queryClient.invalidateQueries(['reading-plans', user?.id]),
  });

  const deletePlan = useMutation({
    mutationFn: (id) => base44.entities.ReadingPlan.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['reading-plans', user?.id]); toast.success('Plan deleted'); },
  });

  const addBook = () => {
    if (selectedBook && !form.focus_books.includes(selectedBook)) {
      setForm(f => ({ ...f, focus_books: [...f.focus_books, selectedBook] }));
      setSelectedBook('');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Sign in to create reading plans</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-600 hover:bg-indigo-700">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reading Plans</h1>
            <p className="text-gray-500 text-sm mt-1">Build custom plans & track your progress</p>
          </div>
          <Button onClick={() => setShowForm(v => !v)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> New Plan
          </Button>
        </div>

        {/* Stats Summary */}
        {plans.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-indigo-600">{plans.filter(p => p.status === 'active').length}</p>
              <p className="text-xs text-gray-500 mt-1">Active Plans</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-green-600">{plans.reduce((s, p) => s + (p.completed_chapters || 0), 0)}</p>
              <p className="text-xs text-gray-500 mt-1">Chapters Done</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-amber-600">{plans.filter(p => p.status === 'completed').length}</p>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </div>
          </div>
        )}

        {/* Create Plan Form */}
        {showForm && (
          <Card className="mb-6 shadow-md border-indigo-100">
            <CardHeader><CardTitle className="text-base">Create New Reading Plan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Plan title (e.g. New Testament in 90 Days)"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Chapters per day</label>
                <Select value={String(form.chapters_per_session)} onValueChange={v => setForm(f => ({ ...f, chapters_per_session: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,7,10].map(n => <SelectItem key={n} value={String(n)}>{n} chapter{n > 1 ? 's' : ''}/day</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Add books</label>
                <div className="flex gap-2">
                  <Select value={selectedBook} onValueChange={setSelectedBook}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select a book" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {BIBLE_BOOKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={addBook} variant="outline" className="shrink-0"><Plus className="w-4 h-4" /></Button>
                </div>
                {form.focus_books.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.focus_books.map(b => (
                      <span key={b} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {b}
                        <button onClick={() => setForm(f => ({ ...f, focus_books: f.focus_books.filter(x => x !== b) }))} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {form.focus_books.length > 0 && (
                <p className="text-xs text-gray-500">
                  📊 {form.focus_books.reduce((s, b) => s + (CHAPTER_COUNTS[b] || 0), 0)} chapters total · ~{Math.ceil(form.focus_books.reduce((s, b) => s + (CHAPTER_COUNTS[b] || 0), 0) / form.chapters_per_session)} days
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button
                  onClick={() => createPlan.mutate(form)}
                  disabled={!form.title || form.focus_books.length === 0 || createPlan.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {createPlan.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Plan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans List */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <Target className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No reading plans yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first plan to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map(plan => {
              const progress = plan.total_chapters > 0 ? Math.round((plan.completed_chapters / plan.total_chapters) * 100) : 0;
              const isExpanded = expandedPlan === plan.id;
              const sessions = plan.assignments || [];
              const todaySession = sessions.find(s => !s.completed);

              return (
                <Card key={plan.id} className="shadow-sm border-gray-100">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            plan.status === 'completed' ? 'bg-green-100 text-green-700' :
                            plan.status === 'paused' ? 'bg-gray-100 text-gray-600' :
                            'bg-indigo-100 text-indigo-700'
                          }`}>{plan.status}</span>
                        </div>
                        <p className="text-xs text-gray-500">{plan.focus_books?.join(', ')}</p>
                      </div>
                      <button onClick={() => deletePlan.mutate(plan.id)} className="text-gray-300 hover:text-red-400 ml-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{plan.completed_chapters} / {plan.total_chapters} chapters</span>
                        <span className="font-medium text-indigo-600">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Today's reading */}
                    {todaySession && plan.status === 'active' && (
                      <div className="bg-indigo-50 rounded-xl p-3 mb-3">
                        <p className="text-xs font-semibold text-indigo-700 mb-2">📖 Next: Session {todaySession.session}</p>
                        <div className="flex flex-wrap gap-2">
                          {todaySession.chapters?.map((ch, i) => (
                            <Link key={i} to={createPageUrl(`BibleReader?book=${encodeURIComponent(ch.book)}&chapter=${ch.chapter}`)}>
                              <span className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
                                {ch.book} {ch.chapter}
                              </span>
                            </Link>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          className="mt-2 bg-indigo-600 hover:bg-indigo-700 h-7 text-xs"
                          onClick={() => markSession.mutate({ plan, sessionIdx: sessions.indexOf(todaySession), completed: true })}
                          disabled={markSession.isPending}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Complete
                        </Button>
                      </div>
                    )}

                    {/* Expand Sessions */}
                    <button
                      onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                      className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? 'Hide' : 'Show all'} sessions ({sessions.length})
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
                        {sessions.map((s, idx) => (
                          <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${s.completed ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                            <button onClick={() => markSession.mutate({ plan, sessionIdx: idx, completed: !s.completed })}>
                              {s.completed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-gray-300" />}
                            </button>
                            <span className="font-medium">Session {s.session}:</span>
                            <span>{s.chapters?.map(c => `${c.book} ${c.chapter}`).join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}