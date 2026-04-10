import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, CheckCircle2, Lock, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOSPELS = ['Matthew', 'Mark', 'Luke', 'John'];
const OLD_TESTAMENT = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Songs',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'
];
const OT_CHAPTER_COUNTS = {
  Genesis:50,Exodus:40,Leviticus:27,Numbers:36,Deuteronomy:34,Joshua:24,Judges:21,Ruth:4,
  '1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,'1 Chronicles':29,'2 Chronicles':36,
  Ezra:10,Nehemiah:13,Esther:10,Job:42,Psalm:150,Proverbs:31,Ecclesiastes:12,
  'Song of Songs':8,Isaiah:66,Jeremiah:52,Lamentations:5,Ezekiel:48,Daniel:12,
  Hosea:14,Joel:3,Amos:9,Obadiah:1,Jonah:4,Micah:7,Nahum:3,Habakkuk:3,
  Zephaniah:3,Haggai:2,Zechariah:14,Malachi:4
};
const OT_TOTAL_CHAPTERS = Object.values(OT_CHAPTER_COUNTS).reduce((a, b) => a + b, 0);

const MILESTONES = [
  {
    id: 'first_chapter',
    title: 'First Steps',
    desc: 'Read your first Bible chapter',
    icon: '🌱',
    badge: '🌿',
    check: (progress) => progress.totalChapters >= 1,
    color: 'from-green-400 to-emerald-500',
  },
  {
    id: 'psalms_complete',
    title: 'Heart of Worship',
    desc: 'Completed the book of Psalms',
    icon: '🎵',
    badge: '🎶',
    check: (progress) => progress.booksComplete.includes('Psalm'),
    color: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'gospels_start',
    title: 'Walking with Jesus',
    desc: 'Started reading the Gospels',
    icon: '✝️',
    badge: '✨',
    check: (progress) => GOSPELS.some(b => progress.chaptersPerBook[b] >= 1),
    color: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'gospels_complete',
    title: 'Gospel Champion',
    desc: 'Finished all four Gospels',
    icon: '📖',
    badge: '👑',
    check: (progress) => GOSPELS.every(b => progress.booksComplete.includes(b)),
    color: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'ot_halfway',
    title: 'Halfway Through the Old Testament',
    desc: `Read ${Math.floor(OT_TOTAL_CHAPTERS / 2)}+ Old Testament chapters`,
    icon: '📜',
    badge: '🏅',
    check: (progress) => {
      const otRead = OLD_TESTAMENT.reduce((sum, book) => sum + (progress.chaptersPerBook[book] || 0), 0);
      return otRead >= Math.floor(OT_TOTAL_CHAPTERS / 2);
    },
    color: 'from-orange-400 to-red-500',
  },
  {
    id: 'nt_complete',
    title: 'New Testament Complete',
    desc: 'Finished the entire New Testament',
    icon: '🕊️',
    badge: '🌟',
    check: (progress) => {
      const NT_BOOKS = ['Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians',
        'Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians',
        '1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter',
        '1 John','2 John','3 John','Jude','Revelation'];
      return NT_BOOKS.every(b => progress.booksComplete.includes(b));
    },
    color: 'from-purple-400 to-violet-600',
  },
  {
    id: 'ot_complete',
    title: 'Old Testament Scholar',
    desc: 'Finished the entire Old Testament',
    icon: '🔥',
    badge: '🏆',
    check: (progress) => OLD_TESTAMENT.every(b => progress.booksComplete.includes(b)),
    color: 'from-rose-400 to-pink-600',
  },
  {
    id: 'bible_complete',
    title: 'Bible Completionist',
    desc: 'Read the entire Bible!',
    icon: '🌍',
    badge: '💎',
    check: (progress) => progress.totalChapters >= 1189,
    color: 'from-indigo-500 to-purple-700',
  },
];

function CelebrationBurst({ show }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.8] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="text-8xl mb-4"
        >
          🎉
        </motion.div>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold text-white drop-shadow-lg bg-indigo-600 rounded-2xl px-8 py-4"
        >
          Milestone Unlocked!
        </motion.p>
      </div>
    </motion.div>
  );
}

export default function FaithJourneyRoadmap({ userId }) {
  const [celebratingId, setCelebratingId] = useState(null);
  const [seenMilestones, setSeenMilestones] = useState(() => {
    try { return JSON.parse(localStorage.getItem('seen_milestones') || '[]'); } catch { return []; }
  });

  const { data: readingProgress = [] } = useQuery({
    queryKey: ['reading-progress-roadmap', userId],
    queryFn: () => base44.entities.ReadingProgress.filter({ user_id: userId }, '-created_date', 2000).catch(() => []),
    enabled: !!userId,
  });

  // Compute progress stats
  const progress = useMemo(() => {
    const chaptersPerBook = {};
    const chaptersSet = new Set();
    readingProgress.forEach(r => {
      if (!chaptersPerBook[r.book]) chaptersPerBook[r.book] = 0;
      const key = `${r.book}-${r.chapter}`;
      if (!chaptersSet.has(key)) {
        chaptersSet.add(key);
        chaptersPerBook[r.book] = (chaptersPerBook[r.book] || 0) + 1;
      }
    });

    const BOOK_CHAPTERS = {
      Genesis:50,Exodus:40,Leviticus:27,Numbers:36,Deuteronomy:34,Joshua:24,Judges:21,Ruth:4,
      '1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,'1 Chronicles':29,'2 Chronicles':36,
      Ezra:10,Nehemiah:13,Esther:10,Job:42,Psalm:150,Proverbs:31,Ecclesiastes:12,'Song of Songs':8,
      Isaiah:66,Jeremiah:52,Lamentations:5,Ezekiel:48,Daniel:12,Hosea:14,Joel:3,Amos:9,
      Obadiah:1,Jonah:4,Micah:7,Nahum:3,Habakkuk:3,Zephaniah:3,Haggai:2,Zechariah:14,Malachi:4,
      Matthew:28,Mark:16,Luke:24,John:21,Acts:28,Romans:16,'1 Corinthians':16,'2 Corinthians':13,
      Galatians:6,Ephesians:6,Philippians:4,Colossians:4,'1 Thessalonians':5,'2 Thessalonians':3,
      '1 Timothy':6,'2 Timothy':4,Titus:3,Philemon:1,Hebrews:13,James:5,'1 Peter':5,'2 Peter':3,
      '1 John':5,'2 John':1,'3 John':1,Jude:1,Revelation:22
    };

    const booksComplete = Object.entries(chaptersPerBook)
      .filter(([book, count]) => count >= (BOOK_CHAPTERS[book] || 999))
      .map(([book]) => book);

    return { chaptersPerBook, booksComplete, totalChapters: chaptersSet.size };
  }, [readingProgress]);

  // Detect newly unlocked milestones and celebrate
  useEffect(() => {
    MILESTONES.forEach(m => {
      const unlocked = m.check(progress);
      if (unlocked && !seenMilestones.includes(m.id)) {
        setCelebratingId(m.id);
        const updated = [...seenMilestones, m.id];
        setSeenMilestones(updated);
        localStorage.setItem('seen_milestones', JSON.stringify(updated));
        setTimeout(() => setCelebratingId(null), 2500);
      }
    });
  }, [progress]);

  const unlockedCount = MILESTONES.filter(m => m.check(progress)).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-5 h-5" /> Faith Journey Roadmap
          </CardTitle>
          <Badge className="bg-white/20 text-white border-0 text-xs">
            {unlockedCount}/{MILESTONES.length} milestones
          </Badge>
        </div>
        <p className="text-indigo-200 text-xs mt-1">{progress.totalChapters} chapters read · {progress.booksComplete.length} books completed</p>
      </CardHeader>
      <CardContent className="p-4">
        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Overall Progress</span>
            <span>{Math.round((progress.totalChapters / 1189) * 100)}% of the Bible</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (progress.totalChapters / 1189) * 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
            />
          </div>
        </div>

        {/* Milestone roadmap */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-100" />

          <div className="space-y-4">
            {MILESTONES.map((milestone, idx) => {
              const unlocked = milestone.check(progress);
              const isCelebrating = celebratingId === milestone.id;
              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-4 relative"
                >
                  {/* Icon node */}
                  <motion.div
                    animate={isCelebrating ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 shadow-md transition-all ${
                      unlocked
                        ? `bg-gradient-to-br ${milestone.color} shadow-lg`
                        : 'bg-gray-100 border-2 border-dashed border-gray-200'
                    }`}
                  >
                    {unlocked ? milestone.icon : <Lock className="w-4 h-4 text-gray-300" />}
                    {unlocked && (
                      <span className="absolute -top-1 -right-1 text-base">{milestone.badge}</span>
                    )}
                  </motion.div>

                  {/* Content */}
                  <div className={`flex-1 p-3 rounded-xl border transition-all ${
                    unlocked
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100'
                      : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${unlocked ? 'text-indigo-900' : 'text-gray-400'}`}>
                        {milestone.title}
                      </p>
                      {unlocked && (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Unlocked
                        </Badge>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${unlocked ? 'text-indigo-700' : 'text-gray-400'}`}>
                      {milestone.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {unlockedCount === MILESTONES.length && (
          <div className="mt-5 text-center p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl">
            <div className="text-3xl mb-1">💎</div>
            <p className="font-bold text-indigo-800 text-sm">You've completed all milestones!</p>
            <p className="text-xs text-indigo-600 mt-1">You are a true Bible champion. Glory to God!</p>
          </div>
        )}
      </CardContent>

      <AnimatePresence>
        {celebratingId && <CelebrationBurst show={!!celebratingId} />}
      </AnimatePresence>
    </Card>
  );
}