import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Book, Search, Plus, Star, Tag, Calendar, Edit3, Trash2, Filter, Heart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import JournalEntryEditor from '../components/journal/JournalEntryEditor';
import JournalEntryCard from '../components/journal/JournalEntryCard';

const MOODS = ['grateful', 'hopeful', 'struggling', 'peaceful', 'curious', 'convicted', 'joyful'];
const MOOD_EMOJI = { grateful: '🙏', hopeful: '✨', struggling: '💙', peaceful: '🕊️', curious: '🔍', convicted: '⚡', joyful: '😊' };

export default function VerseJournalHub() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [filterFav, setFilterFav] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); loadEntries(u?.email); }).catch(() => setLoading(false));
  }, []);

  const loadEntries = async (email) => {
    if (!email) { setLoading(false); return; }
    try {
      const data = await base44.entities.PrayerJournalEntry.filter({ userEmail: email }, '-created_date', 100);
      setEntries(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async (entry) => {
    try {
      if (editingEntry?.id) {
        await base44.entities.PrayerJournalEntry.update(editingEntry.id, entry);
        toast.success('Entry updated!');
      } else {
        await base44.entities.PrayerJournalEntry.create({ ...entry, userEmail: user.email });
        toast.success('Journal entry saved!');
      }
      setShowEditor(false);
      setEditingEntry(null);
      loadEntries(user.email);
    } catch (e) { toast.error('Failed to save entry'); }
  };

  const handleDelete = async (id) => {
    await base44.entities.PrayerJournalEntry.delete(id);
    toast.success('Entry deleted');
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleToggleFav = async (entry) => {
    await base44.entities.PrayerJournalEntry.update(entry.id, { isFavorite: !entry.isFavorite });
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, isFavorite: !e.isFavorite } : e));
  };

  const filtered = entries.filter(e => {
    const matchSearch = !search || e.verseReference?.toLowerCase().includes(search.toLowerCase()) || e.noteContent?.toLowerCase().includes(search.toLowerCase()) || (e.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchMood = filterMood === 'all' || e.mood === filterMood;
    const matchFav = !filterFav || e.isFavorite;
    return matchSearch && matchMood && matchFav;
  });

  const stats = {
    total: entries.length,
    favorites: entries.filter(e => e.isFavorite).length,
    thisWeek: entries.filter(e => new Date(e.created_date) > new Date(Date.now() - 7 * 86400000)).length,
    moods: MOODS.reduce((a, m) => ({ ...a, [m]: entries.filter(e => e.mood === m).length }), {})
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <Card className="max-w-sm w-full mx-4 text-center p-8">
        <Book className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Verse Journal</h2>
        <p className="text-gray-500 mb-4">Sign in to access your spiritual journal</p>
        <Button onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📖 My Verse Journal</h1>
            <p className="text-gray-500 mt-1">Reflections, prayers & insights on Scripture</p>
          </div>
          <Button onClick={() => { setEditingEntry(null); setShowEditor(true); }} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> New Entry
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center p-4 border-indigo-100">
            <div className="text-3xl font-bold text-indigo-600">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">Total Entries</div>
          </Card>
          <Card className="text-center p-4 border-yellow-100">
            <div className="text-3xl font-bold text-yellow-500">{stats.favorites}</div>
            <div className="text-xs text-gray-500 mt-1">Favorites</div>
          </Card>
          <Card className="text-center p-4 border-green-100">
            <div className="text-3xl font-bold text-green-600">{stats.thisWeek}</div>
            <div className="text-xs text-gray-500 mt-1">This Week</div>
          </Card>
        </div>

        {/* Mood Overview */}
        {entries.length > 0 && (
          <Card className="mb-6 p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Spiritual Mood History</p>
            <div className="flex flex-wrap gap-2">
              {MOODS.filter(m => stats.moods[m] > 0).map(m => (
                <button key={m} onClick={() => setFilterMood(filterMood === m ? 'all' : m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterMood === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50'}`}>
                  {MOOD_EMOJI[m]} {m} <span className="opacity-60">({stats.moods[m]})</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Search & Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search verses, notes, tags..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterMood} onValueChange={setFilterMood}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Mood" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Moods</SelectItem>
              {MOODS.map(m => <SelectItem key={m} value={m}>{MOOD_EMOJI[m]} {m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant={filterFav ? 'default' : 'outline'} onClick={() => setFilterFav(!filterFav)} className="gap-2">
            <Star className="w-4 h-4" /> Favorites
          </Button>
        </div>

        {/* Entries */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading your journal...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Book className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{entries.length === 0 ? 'Start Your Journey' : 'No entries found'}</h3>
            <p className="text-gray-400 mb-6">{entries.length === 0 ? 'Write your first reflection on a Bible verse' : 'Try adjusting your search or filters'}</p>
            {entries.length === 0 && <Button onClick={() => setShowEditor(true)} className="bg-indigo-600 hover:bg-indigo-700">Write First Entry</Button>}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}</p>
            {filtered.map(entry => (
              <JournalEntryCard key={entry.id} entry={entry}
                onEdit={() => { setEditingEntry(entry); setShowEditor(true); }}
                onDelete={() => handleDelete(entry.id)}
                onToggleFav={() => handleToggleFav(entry)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={v => { setShowEditor(v); if (!v) setEditingEntry(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Entry' : 'New Journal Entry'}</DialogTitle>
          </DialogHeader>
          <JournalEntryEditor initialEntry={editingEntry} onSave={handleSave} onCancel={() => { setShowEditor(false); setEditingEntry(null); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}