import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BookOpen, Mic, MicOff, Plus, Trash2, TrendingUp, Heart, Smile, Frown, Meh, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const MOODS = [
  { key: 'grateful', emoji: '🙏', label: 'Grateful', score: 90 },
  { key: 'joyful', emoji: '😊', label: 'Joyful', score: 80 },
  { key: 'peaceful', emoji: '😌', label: 'Peaceful', score: 70 },
  { key: 'hopeful', emoji: '✨', label: 'Hopeful', score: 60 },
  { key: 'curious', emoji: '🤔', label: 'Curious', score: 50 },
  { key: 'convicted', emoji: '💪', label: 'Convicted', score: 40 },
  { key: 'struggling', emoji: '😔', label: 'Struggling', score: 20 },
];

const MOOD_COLORS = {
  grateful: '#22C55E', joyful: '#F59E0B', peaceful: '#6366F1',
  hopeful: '#3B82F6', curious: '#8B5CF6', convicted: '#F97316', struggling: '#EF4444',
};

function MoodIcon({ mood, size = 16 }) {
  const score = MOODS.find(m => m.key === mood)?.score ?? 50;
  if (score >= 70) return <Smile size={size} className="text-green-500" />;
  if (score >= 40) return <Meh size={size} className="text-amber-500" />;
  return <Frown size={size} className="text-red-400" />;
}

function VoiceRecorder({ onSave }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const handleSave = async () => {
    if (!audioBlob) return;
    setUploading(true);
    try {
      const file = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onSave(file_url);
      setAudioBlob(null);
      setAudioUrl(null);
      toast.success('Voice note saved!');
    } catch {
      toast.error('Could not upload voice note');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
      {!recording && !audioUrl && (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
        >
          <Mic size={16} /> Record Voice Note
        </button>
      )}
      {recording && (
        <button
          onClick={stopRecording}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold animate-pulse"
        >
          <MicOff size={16} /> Stop Recording
        </button>
      )}
      {audioUrl && !recording && (
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <audio src={audioUrl} controls className="flex-1 min-w-0 h-9" />
          <button onClick={handleSave} disabled={uploading} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : 'Attach'}
          </button>
          <button onClick={() => { setAudioBlob(null); setAudioUrl(null); }} className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm">
            Discard
          </button>
        </div>
      )}
    </div>
  );
}

function JournalEntryCard({ entry, onDelete }) {
  const mood = MOODS.find(m => m.key === entry.mood);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-indigo-700">{entry.verseReference}</span>
            {mood && (
              <Badge style={{ backgroundColor: MOOD_COLORS[entry.mood] + '20', color: MOOD_COLORS[entry.mood], border: 'none' }} className="text-xs">
                {mood.emoji} {mood.label}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{entry.created_date ? format(new Date(entry.created_date), 'MMMM d, yyyy') : ''}</p>
        </div>
        <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>
      {entry.verseText && (
        <blockquote className="text-sm italic text-gray-500 border-l-3 border-indigo-200 pl-3 mb-3 leading-relaxed line-clamp-2">
          "{entry.verseText}"
        </blockquote>
      )}
      <p className="text-sm text-gray-700 leading-relaxed">{entry.reflection}</p>
      {entry.tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-3">
          {entry.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      )}
      {entry.voiceNoteUrl && (
        <div className="mt-3">
          <audio src={entry.voiceNoteUrl} controls className="w-full h-9" />
        </div>
      )}
    </div>
  );
}

function SentimentGraph({ entries }) {
  const data = entries
    .slice()
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .map(e => ({
      date: e.created_date ? format(new Date(e.created_date), 'MMM d') : '',
      score: MOODS.find(m => m.key === e.mood)?.score ?? 50,
      mood: e.mood,
    }));

  if (data.length < 2) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <TrendingUp className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-400">Write at least 2 journal entries to see your spiritual growth trend</p>
      </div>
    );
  }

  const avg = Math.round(data.reduce((s, d) => s + d.score, 0) / data.length);
  const trend = data[data.length - 1].score - data[0].score;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" /> Spiritual Sentiment
        </h3>
        <div className="flex gap-3">
          <div className="text-center">
            <p className="text-lg font-black text-indigo-600">{avg}</p>
            <p className="text-xs text-gray-400">Avg</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-black ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'}{Math.abs(trend)}
            </p>
            <p className="text-xs text-gray-400">Trend</p>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
            formatter={(v, _, { payload }) => [MOODS.find(m => m.key === payload?.mood)?.label || v, 'Mood']}
          />
          <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2.5} dot={{ fill: '#6366F1', r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-2 mt-3">
        {MOODS.map(m => (
          <span key={m.key} className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: MOOD_COLORS[m.key] }} />
            {m.emoji} {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BibleJournal() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  // Form state
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState('peaceful');
  const [tags, setTags] = useState('');
  const [voiceNoteUrl, setVoiceNoteUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: entries = [], refetch } = useQuery({
    queryKey: ['journal-entries', user?.email],
    queryFn: () => base44.entities.VerseJournalEntry.filter({ userEmail: user.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const handleSave = async () => {
    if (!verseRef.trim() || !reflection.trim()) {
      toast.error('Please add a verse reference and your reflection');
      return;
    }
    setSaving(true);
    try {
      await base44.entities.VerseJournalEntry.create({
        userEmail: user.email,
        verseReference: verseRef.trim(),
        verseText: verseText.trim(),
        reflection: reflection.trim(),
        mood,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        voiceNoteUrl: voiceNoteUrl || undefined,
        isPrivate: true,
      });
      setVerseRef(''); setVerseText(''); setReflection(''); setTags(''); setVoiceNoteUrl('');
      refetch();
      toast.success('Journal entry saved! 📖');
    } catch {
      toast.error('Could not save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.VerseJournalEntry.delete(id);
    refetch();
    toast.success('Entry deleted');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-4 py-10 text-white">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bible Journal</h1>
            <p className="text-indigo-200 text-sm">{entries.length} reflection{entries.length !== 1 ? 's' : ''} written</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-4">
        <Tabs defaultValue="write">
          <TabsList className="grid grid-cols-3 w-full bg-white shadow-sm">
            <TabsTrigger value="write">✍️ Write</TabsTrigger>
            <TabsTrigger value="entries">📖 Entries</TabsTrigger>
            <TabsTrigger value="growth">📊 Growth</TabsTrigger>
          </TabsList>

          {/* Write Tab */}
          <TabsContent value="write" className="space-y-4 mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
              <h2 className="font-bold text-gray-900">New Reflection</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Verse Reference *</label>
                  <Input placeholder="e.g. John 3:16" value={verseRef} onChange={e => setVerseRef(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Tags (comma-separated)</label>
                  <Input placeholder="faith, prayer, hope" value={tags} onChange={e => setTags(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Verse Text</label>
                <Textarea
                  placeholder="Paste the verse here..."
                  value={verseText}
                  onChange={e => setVerseText(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Your Reflection *</label>
                <Textarea
                  placeholder="What does this verse mean to you today? What is God speaking to you through it?"
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  rows={5}
                  className="resize-none text-sm"
                />
              </div>

              {/* Mood selector */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">How are you feeling?</label>
                <div className="flex gap-2 flex-wrap">
                  {MOODS.map(m => (
                    <button
                      key={m.key}
                      onClick={() => setMood(m.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        mood === m.key
                          ? 'text-white border-transparent shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                      style={mood === m.key ? { backgroundColor: MOOD_COLORS[m.key] } : {}}
                    >
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice note */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">Voice Note (optional)</label>
                {voiceNoteUrl ? (
                  <div className="flex items-center gap-2">
                    <audio src={voiceNoteUrl} controls className="flex-1 h-9" />
                    <button onClick={() => setVoiceNoteUrl('')} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                  </div>
                ) : (
                  <VoiceRecorder onSave={setVoiceNoteUrl} />
                )}
              </div>

              <Button
                onClick={handleSave}
                disabled={saving || !verseRef.trim() || !reflection.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Save to Journal
              </Button>
            </div>
          </TabsContent>

          {/* Entries Tab */}
          <TabsContent value="entries" className="mt-4 space-y-3">
            {entries.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-semibold text-gray-500">No entries yet</p>
                <p className="text-sm text-gray-400 mt-1">Write your first reflection above</p>
              </div>
            ) : (
              entries.map(entry => (
                <JournalEntryCard key={entry.id} entry={entry} onDelete={() => handleDelete(entry.id)} />
              ))
            )}
          </TabsContent>

          {/* Growth / Sentiment Tab */}
          <TabsContent value="growth" className="mt-4 space-y-4">
            <SentimentGraph entries={entries} />

            {/* Mood breakdown */}
            {entries.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" /> Mood Breakdown
                </h3>
                {MOODS.map(m => {
                  const count = entries.filter(e => e.mood === m.key).length;
                  if (count === 0) return null;
                  return (
                    <div key={m.key} className="flex items-center gap-3 mb-2">
                      <span className="text-sm w-28 text-gray-600">{m.emoji} {m.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(count / entries.length) * 100}%`, backgroundColor: MOOD_COLORS[m.key] }} />
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}