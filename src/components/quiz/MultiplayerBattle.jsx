import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Swords, Trophy, Clock, CheckCircle2, XCircle, User, Search } from 'lucide-react';
import { toast } from 'sonner';

// Minimal question pack for multiplayer (no BibleBook fetch needed — passed from parent)
function buildMatchQuestions(books, count = 8) {
  if (!books || books.length < 5) return [];
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const rand = arr => arr[Math.floor(Math.random() * arr.length)];
  const makeOpts = (correct, wrongs) => {
    const opts = shuffle([correct, ...wrongs.slice(0, 3)]);
    return { options: opts, correctIndex: opts.indexOf(correct) };
  };

  const qs = [];
  const all = books;

  // OT/NT questions
  for (let i = 0; i < 3; i++) {
    const b = rand(all);
    const { options, correctIndex } = makeOpts(
      b.testament === 'OT' ? 'Old Testament' : 'New Testament',
      [b.testament === 'OT' ? 'New Testament' : 'Old Testament', 'Apocrypha', 'Both Testaments']
    );
    qs.push({ id: qs.length, question: `Which Testament is ${b.name} in?`, options, correctIndex, explanation: `${b.name} is in the ${b.testament === 'OT' ? 'Old' : 'New'} Testament.` });
  }

  // Category questions
  const withCat = all.filter(b => b.category);
  const allCats = [...new Set(withCat.map(b => b.category))];
  for (let i = 0; i < 3 && withCat.length >= 4; i++) {
    const b = rand(withCat);
    const { options, correctIndex } = makeOpts(b.category, shuffle(allCats.filter(c => c !== b.category)));
    qs.push({ id: qs.length, question: `${b.name} belongs to which category?`, options, correctIndex, explanation: `${b.name} is ${b.category}.` });
  }

  // Author questions
  const withAuth = all.filter(b => b.author);
  const allAuths = [...new Set(withAuth.map(b => b.author))];
  for (let i = 0; i < 2 && withAuth.length >= 4; i++) {
    const b = rand(withAuth);
    const { options, correctIndex } = makeOpts(b.author, shuffle(allAuths.filter(a => a !== b.author)));
    qs.push({ id: qs.length, question: `Who wrote ${b.name}?`, options, correctIndex, explanation: `${b.name} was written by ${b.author}.` });
  }

  return shuffle(qs).slice(0, count).map((q, i) => ({ ...q, id: i }));
}

function StatusBadge({ status }) {
  const config = {
    invited: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    active: { label: 'Active', className: 'bg-green-100 text-green-700' },
    p1_done: { label: 'Waiting', className: 'bg-blue-100 text-blue-700' },
    p2_done: { label: 'Waiting', className: 'bg-blue-100 text-blue-700' },
    finished: { label: 'Finished', className: 'bg-gray-100 text-gray-700' },
    expired: { label: 'Expired', className: 'bg-red-100 text-red-700' },
    declined: { label: 'Declined', className: 'bg-red-100 text-red-700' },
  };
  const c = config[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.className}`}>{c.label}</span>;
}

// ─── Play Phase ───────────────────────────────────────────────────────────────
function PlayPhase({ match, user, questions, onDone }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [startMs] = useState(Date.now());

  const q = questions[current];

  const handleSelect = (idx) => {
    if (feedback) return;
    setSelected(idx);
    setFeedback(true);
    const correct = idx === q.correctIndex;
    setAnswers(prev => [...prev, { question_idx: current, answer_idx: idx, is_correct: correct, time_ms: Date.now() - startMs }]);

    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(c => c + 1);
        setSelected(null);
        setFeedback(false);
      } else {
        const score = answers.filter(a => a.is_correct).length + (correct ? 1 : 0);
        const totalMs = Date.now() - startMs;
        onDone({ score, answers: [...answers, { question_idx: current, answer_idx: idx, is_correct: correct, time_ms: Date.now() - startMs }], totalMs });
      }
    }, 900);
  };

  if (!q) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Question {current + 1} / {questions.length}</span>
        <div className="w-32 bg-gray-200 rounded-full h-1.5">
          <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${((current) / questions.length) * 100}%` }} />
        </div>
      </div>
      <Card>
        <CardContent className="p-5">
          <p className="text-base font-semibold text-gray-800 mb-4">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              let cls = 'border border-gray-200 bg-white text-gray-700 hover:border-indigo-300';
              if (feedback) {
                if (i === q.correctIndex) cls = 'border-green-400 bg-green-50 text-green-800';
                else if (i === selected) cls = 'border-red-400 bg-red-50 text-red-700';
              } else if (selected === i) cls = 'border-indigo-500 bg-indigo-50 text-indigo-700';
              return (
                <button key={i} onClick={() => handleSelect(i)} disabled={feedback}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-all ${cls}`}>
                  {opt}
                </button>
              );
            })}
          </div>
          {feedback && <p className="mt-3 text-xs text-gray-500 italic">{q.explanation}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────
function MatchCard({ match, user, books, onPlay, onRespond }) {
  const isP1 = match.player1_id === user.id;
  const myName = isP1 ? match.player1_name : match.player2_name;
  const opName = isP1 ? match.player2_name : match.player1_name;
  const myScore = isP1 ? match.p1_score : match.p2_score;
  const theirScore = isP1 ? match.p2_score : match.p1_score;

  const myTurn = (match.status === 'active' && isP1) || (match.status === 'p1_done' && !isP1);
  const waiting = (match.status === 'p1_done' && isP1) || (match.status === 'p2_done' && !isP1);
  const inviteForMe = match.status === 'invited' && !isP1;

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-sm text-gray-800">{opName}</span>
          </div>
          <StatusBadge status={match.status} />
        </div>

        {match.status === 'finished' && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400">You</p>
              <p className={`text-2xl font-bold ${myScore > theirScore ? 'text-green-600' : 'text-gray-700'}`}>{myScore}</p>
            </div>
            <div className="text-gray-300 font-bold">vs</div>
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400">{opName}</p>
              <p className={`text-2xl font-bold ${theirScore > myScore ? 'text-green-600' : 'text-gray-700'}`}>{theirScore}</p>
            </div>
          </div>
        )}
        {match.status === 'finished' && match.winner_id && (
          <p className="text-xs text-center font-medium mb-2">
            {match.winner_id === user.id ? '🏆 You won!' : `${opName} won`}
          </p>
        )}

        <div className="flex gap-2">
          {inviteForMe && (
            <>
              <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => onRespond(match, 'accept')}>Accept</Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onRespond(match, 'decline')}>Decline</Button>
            </>
          )}
          {myTurn && (
            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => onPlay(match)}>
              <Swords className="w-3.5 h-3.5 mr-1" /> Play Now
            </Button>
          )}
          {waiting && <p className="text-xs text-gray-400 flex-1 text-center py-1">Waiting for {opName}...</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MultiplayerBattle({ user, books }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [playingMatch, setPlayingMatch] = useState(null);
  const [matchQuestions, setMatchQuestions] = useState([]);

  const { data: myMatches = [] } = useQuery({
    queryKey: ['quiz-matches', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const [asP1, asP2] = await Promise.all([
        base44.entities.QuizMatch.filter({ player1_id: user.id }, '-created_date', 20).catch(() => []),
        base44.entities.QuizMatch.filter({ player2_id: user.id }, '-created_date', 20).catch(() => []),
      ]);
      const merged = [...asP1, ...asP2];
      merged.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      return merged;
    },
    enabled: !!user,
    refetchInterval: 15000, // poll every 15s for updates
  });

  const { data: searchResults = [], isFetching: searching } = useQuery({
    queryKey: ['user-search', search],
    queryFn: () => search.length >= 2
      ? base44.entities.User.filter({}).catch(() => []).then(users => users.filter(u => u.id !== user?.id && (u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))).slice(0, 5))
      : [],
    enabled: search.length >= 2,
  });

  const challengeMutation = useMutation({
    mutationFn: async (opponent) => {
      const qs = buildMatchQuestions(books, 8);
      if (!qs.length) throw new Error('Could not build questions');
      const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      return base44.entities.QuizMatch.create({
        player1_id: user.id, player1_name: user.full_name,
        player2_id: opponent.id, player2_name: opponent.full_name,
        status: 'invited',
        question_seed: JSON.stringify(qs),
        p1_score: 0, p2_score: 0, p1_time_ms: 0, p2_time_ms: 0,
        expires_at: expires
      });
    },
    onSuccess: (match) => {
      toast.success('Challenge sent!');
      setSearch('');
      queryClient.invalidateQueries({ queryKey: ['quiz-matches', user.id] });
    },
    onError: () => toast.error('Failed to send challenge'),
  });

  const respondMutation = useMutation({
    mutationFn: async ({ match, action }) => {
      if (action === 'decline') {
        return base44.entities.QuizMatch.update(match.id, { status: 'declined' });
      }
      // Accept
      return base44.entities.QuizMatch.update(match.id, { status: 'active' });
    },
    onSuccess: (_, { action }) => {
      toast.success(action === 'accept' ? 'Challenge accepted! Play when ready.' : 'Challenge declined.');
      queryClient.invalidateQueries({ queryKey: ['quiz-matches', user.id] });
    },
  });

  const handlePlay = (match) => {
    const qs = JSON.parse(match.question_seed || '[]');
    if (!qs.length) { toast.error('No questions in this match'); return; }
    setMatchQuestions(qs);
    setPlayingMatch(match);
  };

  const handleDone = async ({ score, totalMs }) => {
    if (!playingMatch) return;
    const isP1 = playingMatch.player1_id === user.id;
    const wasP1Done = playingMatch.status === 'p1_done';

    let newStatus;
    const updates = {};
    if (isP1) {
      updates.p1_score = score;
      updates.p1_time_ms = totalMs;
      newStatus = playingMatch.status === 'p2_done' ? 'finished' : 'p1_done';
    } else {
      updates.p2_score = score;
      updates.p2_time_ms = totalMs;
      newStatus = playingMatch.status === 'p1_done' ? 'finished' : 'p2_done';
    }
    updates.status = newStatus;

    // Compute winner if finished
    if (newStatus === 'finished') {
      const p1s = isP1 ? score : playingMatch.p1_score;
      const p2s = isP1 ? playingMatch.p2_score : score;
      const p1t = isP1 ? totalMs : playingMatch.p1_time_ms;
      const p2t = isP1 ? playingMatch.p2_time_ms : totalMs;
      if (p1s > p2s) updates.winner_id = playingMatch.player1_id;
      else if (p2s > p1s) updates.winner_id = playingMatch.player2_id;
      else updates.winner_id = p1t <= p2t ? playingMatch.player1_id : playingMatch.player2_id; // tie-break: time
    }

    await base44.entities.QuizMatch.update(playingMatch.id, updates).catch(() => null);
    setPlayingMatch(null);
    setMatchQuestions([]);
    queryClient.invalidateQueries({ queryKey: ['quiz-matches', user.id] });
    toast.success(`Done! You scored ${score}/${matchQuestions.length}`);
  };

  if (playingMatch) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Swords className="w-4 h-4" /> Battle vs {playingMatch.player1_id === user.id ? playingMatch.player2_name : playingMatch.player1_name}</h3>
          <Button size="sm" variant="outline" onClick={() => { setPlayingMatch(null); setMatchQuestions([]); }}>Quit</Button>
        </div>
        <PlayPhase match={playingMatch} user={user} questions={matchQuestions} onDone={handleDone} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Challenge bar */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Swords className="w-4 h-4" /> Challenge Someone</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <Input className="pl-8 text-sm" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {searching && <p className="text-xs text-gray-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Searching...</p>}
          {searchResults.map(u => (
            <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{u.full_name}</span>
              </div>
              <Button size="sm" onClick={() => challengeMutation.mutate(u)} disabled={challengeMutation.isPending}>
                {challengeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Challenge'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Active matches */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">My Battles ({myMatches.length})</h3>
        {myMatches.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No battles yet — challenge someone above!</p>}
        <div className="space-y-3">
          {myMatches.map(m => (
            <MatchCard key={m.id} match={m} user={user} books={books}
              onPlay={handlePlay}
              onRespond={(match, action) => respondMutation.mutate({ match, action })} />
          ))}
        </div>
      </div>
    </div>
  );
}