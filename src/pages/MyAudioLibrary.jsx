import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle2, Bookmark, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

const BOOK_NAMES = [
  '', 'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah',
  'Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah',
  'Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum',
  'Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John',
  'Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians',
  'Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation',
];

function pct(item) {
  if (item.is_completed) return 100;
  if (!item.duration_seconds || item.duration_seconds === 0) return 0;
  return Math.min(100, Math.round((item.last_position_seconds / item.duration_seconds) * 100));
}

function formatTime(secs) {
  if (!secs) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ChapterCard({ item, onMarkFinished, onResume }) {
  const progress = pct(item);
  const bookName = BOOK_NAMES[item.book_id] || `Book ${item.book_id}`;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <p className="font-semibold text-gray-900 truncate">
              {bookName} {item.chapter}
            </p>
            {item.is_completed && (
              <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{item.language_code?.toUpperCase()}</span>
            <span>•</span>
            <span>{item.is_completed ? 'Fully listened' : `${progress}% • ${formatTime(item.last_position_seconds)} / ${formatTime(item.duration_seconds)}`}</span>
            {item.last_listened_at && (
              <>
                <span>•</span>
                <span>{new Date(item.last_listened_at).toLocaleDateString()}</span>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${item.is_completed ? 'bg-green-500' : 'bg-indigo-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end flex-shrink-0">
          <Button
            size="sm"
            onClick={() => onResume(item)}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Play className="w-3 h-3 fill-white" />
            {item.is_completed ? 'Play again' : 'Resume'}
          </Button>
          {!item.is_completed && (
            <button
              onClick={() => onMarkFinished(item)}
              className="text-xs text-gray-400 hover:text-green-600 transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" /> Mark done
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function MyAudioLibrary() {
  const [user, setUser] = useState(null);
  const [allProgress, setAllProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('recent');

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const data = await base44.entities.AudioListenProgress.filter(
          { user_id: u.id }, '-last_listened_at', 100
        );
        setAllProgress(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const lists = useMemo(() => {
    const recent = [...allProgress].sort((a, b) =>
      new Date(b.last_listened_at || 0) - new Date(a.last_listened_at || 0)
    ).slice(0, 20);

    const inProgress = allProgress.filter(i => !i.is_completed && (i.last_position_seconds || 0) > 0);
    const completed = allProgress.filter(i => i.is_completed);

    // Next up: next chapter after the most recently played
    const lastPlayed = recent[0];
    let nextUp = [];
    if (lastPlayed) {
      const next = allProgress.find(
        i => i.book_id === lastPlayed.book_id &&
          i.chapter === lastPlayed.chapter + 1 &&
          i.language_code === lastPlayed.language_code &&
          !i.is_completed
      );
      if (next) nextUp = [next];
      // Also add other in-progress items
      inProgress.filter(i => i.id !== lastPlayed?.id && i.id !== next?.id)
        .slice(0, 3)
        .forEach(i => { if (!nextUp.find(n => n.id === i.id)) nextUp.push(i); });
    }

    return { recent, inProgress, completed, nextUp };
  }, [allProgress]);

  const handleResume = (item) => {
    // Navigate to AudioBibleV2 with params to resume
    window.location.href = createPageUrl(`AudioBibleV2?book_id=${item.book_id}&chapter=${item.chapter}&lang=${item.language_code}&t=${Math.floor(item.last_position_seconds || 0)}`);
  };

  const handleMarkFinished = async (item) => {
    await base44.entities.AudioListenProgress.update(item.id, {
      is_completed: true,
      completed_at: new Date().toISOString(),
      last_position_seconds: item.duration_seconds || item.last_position_seconds,
    });
    setAllProgress(prev => prev.map(i => i.id === item.id ? { ...i, is_completed: true } : i));
    toast.success('Marked as completed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-6">
        <BookOpen className="w-12 h-12 text-indigo-300" />
        <h2 className="text-xl font-semibold text-gray-700">Sign in to view your audio library</h2>
        <Button onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
      </div>
    );
  }

  const tabs = [
    { key: 'recent', label: 'Recently Played', icon: Clock, list: lists.recent },
    { key: 'inprogress', label: 'In Progress', icon: Play, list: lists.inProgress },
    { key: 'next', label: 'Next Up', icon: ChevronRight, list: lists.nextUp },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, list: lists.completed },
  ];

  const activeList = tabs.find(t => t.key === tab)?.list || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Audio Library</h1>
          <p className="text-gray-500 text-sm mt-1">
            {allProgress.length} chapters • {lists.completed.length} completed
          </p>
        </div>
        <Link to={createPageUrl('AudioBibleV2')}>
          <Button variant="outline" className="gap-2">
            <Play className="w-4 h-4" /> Browse Audio
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon, list }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
              tab === key ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {list.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {list.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeList.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nothing here yet</p>
          {tab === 'recent' && (
            <p className="text-sm mt-2">
              <Link to={createPageUrl('AudioBibleV2')} className="text-indigo-600 hover:underline">
                Start listening to the audio Bible
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {activeList.map(item => (
            <ChapterCard
              key={item.id}
              item={item}
              onResume={handleResume}
              onMarkFinished={handleMarkFinished}
            />
          ))}
        </div>
      )}
    </div>
  );
}