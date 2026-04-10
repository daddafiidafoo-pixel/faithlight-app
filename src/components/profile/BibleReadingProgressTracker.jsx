import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Clock, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

const BIBLE_BOOKS_CHAPTERS = {
  'Genesis':50,'Exodus':40,'Leviticus':27,'Numbers':36,'Deuteronomy':34,
  'Joshua':24,'Judges':21,'Ruth':4,'1 Samuel':31,'2 Samuel':24,
  '1 Kings':22,'2 Kings':25,'Psalms':150,'Proverbs':31,'Isaiah':66,
  'Jeremiah':52,'Matthew':28,'Mark':16,'Luke':24,'John':21,
  'Acts':28,'Romans':16,'1 Corinthians':16,'Galatians':6,'Ephesians':6,
  'Philippians':4,'Hebrews':13,'James':5,'Revelation':22,
};

const TOTAL_BIBLE_CHAPTERS = 1189;

const HIGHLIGHT_COLORS = {
  yellow: '#FCD34D',
  pink: '#F472B6',
  green: '#86EFAC',
  blue: '#60A5FA',
};

export default function BibleReadingProgressTracker({ userId }) {
  const [showAllBooks, setShowAllBooks] = useState(false);

  // Fetch reading progress
  const { data: readingProgress = [] } = useQuery({
    queryKey: ['reading-progress', userId],
    queryFn: () => base44.entities.ReadingProgress.filter({ user_id: userId }, '-completed_date', 500).catch(() => []),
    enabled: !!userId,
  });

  // Fetch reading sessions / daily logs
  const { data: readingSessions = [] } = useQuery({
    queryKey: ['reading-sessions', userId],
    queryFn: () => base44.entities.ReadingSessionLog.filter({ user_id: userId }, '-date', 30).catch(() => []),
    enabled: !!userId,
  });

  // Fetch user streak
  const { data: streak } = useQuery({
    queryKey: ['user-streak-reading', userId],
    queryFn: () => base44.entities.UserStreak.filter({ userEmail: userId }, '-updated_date', 1).then(d => d[0]).catch(() => null),
    enabled: !!userId,
  });

  // Fetch highlights
  const { data: highlights = [] } = useQuery({
    queryKey: ['all-highlights', userId],
    queryFn: () => base44.entities.VerseHighlight.filter({ user_id: userId }, '-created_date', 200).catch(() => []),
    enabled: !!userId,
  });

  // Compute stats
  const uniqueChaptersRead = new Set(readingProgress.map(r => `${r.book}-${r.chapter}`)).size;
  const percentComplete = Math.min(100, ((uniqueChaptersRead / TOTAL_BIBLE_CHAPTERS) * 100).toFixed(1));

  // Books with progress
  const bookProgress = {};
  readingProgress.forEach(r => {
    if (!bookProgress[r.book]) bookProgress[r.book] = new Set();
    bookProgress[r.book].add(r.chapter);
  });

  const booksStarted = Object.keys(bookProgress);
  const booksCompleted = booksStarted.filter(book => {
    const total = BIBLE_BOOKS_CHAPTERS[book] || 1;
    return bookProgress[book].size >= total;
  });

  // Daily streak chart — last 14 days
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const session = readingSessions.find(s => s.date === dateStr);
    return {
      day: format(d, 'MMM d'),
      chapters: session?.chaptersRead || 0,
      minutes: session?.minutesSpent || 0,
    };
  });

  const totalMinutes = readingSessions.reduce((sum, s) => sum + (s.minutesSpent || 0), 0);

  // Highlight breakdown by color
  const highlightsByColor = highlights.reduce((acc, h) => {
    acc[h.color] = (acc[h.color] || 0) + 1;
    return acc;
  }, {});

  const booksToShow = showAllBooks ? booksStarted : booksStarted.slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card className="border-indigo-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Bible Reading Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Big number */}
          <div className="text-center py-3">
            <p className="text-5xl font-bold text-indigo-600">{percentComplete}%</p>
            <p className="text-sm text-gray-500 mt-1">of the Bible completed</p>
            <p className="text-xs text-gray-400">{uniqueChaptersRead} of {TOTAL_BIBLE_CHAPTERS} chapters read</p>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-700"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-indigo-700">{booksStarted.length}</p>
              <p className="text-xs text-gray-500">Books Started</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-700">{booksCompleted.length}</p>
              <p className="text-xs text-gray-500">Books Finished</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-amber-700">{highlights.length}</p>
              <p className="text-xs text-gray-500">Highlights</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Activity Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" /> Daily Reading Activity
            <Badge variant="outline" className="ml-auto text-xs">Last 14 Days</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={last14Days} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(v, name) => [v, name === 'chapters' ? 'Chapters' : 'Minutes']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="chapters" radius={[4, 4, 0, 0]}>
                {last14Days.map((entry, i) => (
                  <Cell key={i} fill={entry.chapters > 0 ? '#6366F1' : '#E5E7EB'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {totalMinutes} total minutes</span>
            <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> {streak?.currentStreak || 0} day streak</span>
          </div>
        </CardContent>
      </Card>

      {/* Book Completion */}
      {booksStarted.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" /> Book Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {booksToShow.map(book => {
              const chaptersRead = bookProgress[book].size;
              const total = BIBLE_BOOKS_CHAPTERS[book] || 28;
              const pct = Math.min(100, Math.round((chaptersRead / total) * 100));
              const done = pct >= 100;
              return (
                <div key={book} className="flex items-center gap-3">
                  <div className="w-24 text-xs font-medium text-gray-700 truncate">{book}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-indigo-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-xs text-gray-500">{pct}%</div>
                  {done && <Badge className="text-xs bg-green-100 text-green-700 border-0">✓</Badge>}
                </div>
              );
            })}
            {booksStarted.length > 6 && (
              <button
                onClick={() => setShowAllBooks(v => !v)}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 mt-2 font-medium"
              >
                {showAllBooks ? <><ChevronUp className="w-3 h-3" /> Show Less</> : <><ChevronDown className="w-3 h-3" /> Show All {booksStarted.length} Books</>}
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Highlights by Color */}
      {highlights.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Highlights Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(highlightsByColor).map(([color, count]) => (
                <div key={color} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${HIGHLIGHT_COLORS[color]}30`, color: '#374151' }}>
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: HIGHLIGHT_COLORS[color] }} />
                  {count} {color}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}