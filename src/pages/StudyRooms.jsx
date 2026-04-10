import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Globe, Lock, Play, Pause, SkipForward, SkipBack, Send, Trash2, PenLine, X, Eraser, Loader2, Highlighter, BookOpen, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const SAMPLE_VERSES = [
  { v: 1, text: 'In the beginning God created the heavens and the earth.' },
  { v: 2, text: 'Now the earth was formless and empty, darkness was over the surface of the deep.' },
  { v: 3, text: 'And God said, "Let there be light," and there was light.' },
  { v: 4, text: 'God saw that the light was good, and he separated the light from the darkness.' },
  { v: 5, text: 'God called the light "day," and the darkness he called "night." And there was evening, and there was morning—the first day.' },
];

// ── Synced Audio Player ────────────────────────────────────────────
// Moderator controls playback; state is persisted to DB and all participants subscribe in real-time.
function SharedAudioPlayer({ room, isModerator }) {
  const queryClient = useQueryClient();
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const isSpeakingRef = useRef(false);

  // Remote state fetched from DB (room's audio_state record)
  const { data: audioState } = useQuery({
    queryKey: ['room-audio-state', room.id],
    queryFn: async () => {
      const records = await base44.entities.LiveChatMessage.filter(
        { room_id: room.id, message_type: 'audio_state' }, '-created_date', 1
      ).catch(() => []);
      return records[0] || null;
    },
    refetchInterval: 2000,
  });

  const playing = audioState?.is_playing ?? false;
  const verseIdx = audioState?.verse_index ?? 0;
  const speed = audioState?.playback_speed ?? 1.0;
  const SPEEDS = [0.75, 1.0, 1.25, 1.5];

  // Real-time subscription for instant sync
  useEffect(() => {
    const unsub = base44.entities.LiveChatMessage.subscribe((event) => {
      if (event.data?.room_id === room.id && event.data?.message_type === 'audio_state') {
        queryClient.invalidateQueries({ queryKey: ['room-audio-state', room.id] });
      }
    });
    return unsub;
  }, [room.id]);

  // Publish state change (moderator only)
  const publishState = useCallback(async (patch) => {
    const base = {
      room_id: room.id,
      message_type: 'audio_state',
      is_playing: playing,
      verse_index: verseIdx,
      playback_speed: speed,
      updated_at: new Date().toISOString(),
    };
    await base44.entities.LiveChatMessage.create({ ...base, ...patch });
    queryClient.invalidateQueries({ queryKey: ['room-audio-state', room.id] });
  }, [room.id, playing, verseIdx, speed]);

  // Speak verse locally when state says playing
  useEffect(() => {
    if (!synthRef.current) return;
    if (playing && !isSpeakingRef.current) {
      synthRef.current.cancel();
      const v = SAMPLE_VERSES[verseIdx];
      if (!v) return;
      isSpeakingRef.current = true;
      const u = new SpeechSynthesisUtterance(`Verse ${v.v}. ${v.text}`);
      u.rate = speed;
      u.onend = () => {
        isSpeakingRef.current = false;
        const next = verseIdx + 1;
        if (isModerator && next < SAMPLE_VERSES.length) {
          publishState({ verse_index: next, is_playing: true });
        } else if (isModerator) {
          publishState({ is_playing: false, verse_index: 0 });
        }
      };
      synthRef.current.speak(u);
    } else if (!playing) {
      synthRef.current.cancel();
      isSpeakingRef.current = false;
    }
  }, [playing, verseIdx]);

  useEffect(() => () => { synthRef.current?.cancel(); isSpeakingRef.current = false; }, []);

  const currentVerse = SAMPLE_VERSES[verseIdx] || SAMPLE_VERSES[0];
  const progress = ((verseIdx + 1) / SAMPLE_VERSES.length) * 100;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-indigo-900 rounded-2xl p-5 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/50 uppercase tracking-widest">Synced Audio · {room?.name}</p>
        <div className="flex items-center gap-1.5 text-xs font-medium text-green-300">
          <Radio className="w-3 h-3 animate-pulse" /> Live Sync
        </div>
      </div>

      {/* Verse index indicator */}
      <div className="flex gap-1.5 mb-3">
        {SAMPLE_VERSES.map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i === verseIdx ? 'bg-green-400' : i < verseIdx ? 'bg-white/40' : 'bg-white/15'}`} />
        ))}
      </div>

      {/* Current verse text */}
      <div className="bg-white/10 rounded-xl p-3 mb-4 min-h-[64px]">
        <p className="text-xs text-white/50 mb-1 font-medium">Genesis 1:{currentVerse.v}</p>
        <p className="text-sm text-white/90 italic leading-relaxed">"{currentVerse.text}"</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 justify-center">
        <button
          onClick={() => isModerator && publishState({ verse_index: Math.max(0, verseIdx - 1), is_playing: false })}
          disabled={!isModerator}
          className="p-2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={() => isModerator && publishState({ is_playing: !playing })}
          disabled={!isModerator}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all active:scale-95">
          {playing ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
        </button>
        <button
          onClick={() => isModerator && publishState({ verse_index: Math.min(SAMPLE_VERSES.length - 1, verseIdx + 1), is_playing: false })}
          disabled={!isModerator}
          className="p-2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <SkipForward className="w-5 h-5" />
        </button>
        <button
          onClick={() => { if (!isModerator) return; const i = SPEEDS.indexOf(speed); publishState({ playback_speed: SPEEDS[(i + 1) % SPEEDS.length] }); }}
          disabled={!isModerator}
          className="text-sm font-bold text-green-300 bg-white/10 rounded-lg px-3 py-1.5 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          {speed}×
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-white/40">Verse {verseIdx + 1}</span>
        <span className="text-xs text-white/40">{SAMPLE_VERSES.length} verses</span>
      </div>

      {!isModerator && (
        <p className="text-center text-xs text-white/40 mt-3">🔒 Moderator controls playback for everyone</p>
      )}
    </div>
  );
}

// ── Verse Highlighter Panel ───────────────────────────────────────
function VerseHighlightPanel({ roomId, user, isModerator }) {
  const [savedIds, setSavedIds] = useState(new Set());

  const saveAsFlashcard = async (highlight) => {
    if (savedIds.has(highlight.id)) return;
    await base44.entities.MemoryVerse.create({
      user_id: user.id,
      verse_ref: highlight.verse_ref,
      verse_text: highlight.content,
      translation: 'WEB',
      mastery_level: 'new',
      tags: ['study-room', roomId],
    });
    setSavedIds(prev => new Set([...prev, highlight.id]));
    toast.success(`"${highlight.verse_ref}" saved as flashcard!`);
  };
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');
  const queryClient = useQueryClient();

  const { data: highlights = [] } = useQuery({
    queryKey: ['room-highlights', roomId],
    queryFn: () => base44.entities.LiveChatMessage.filter({ room_id: roomId, message_type: 'highlight' }, '-created_date', 10).catch(() => []),
    refetchInterval: 3000,
  });

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.LiveChatMessage.subscribe((event) => {
      if (event.data?.room_id === roomId && event.data?.message_type === 'highlight') {
        queryClient.invalidateQueries({ queryKey: ['room-highlights', roomId] });
      }
    });
    return unsub;
  }, [roomId]);

  const highlightMutation = useMutation({
    mutationFn: () => base44.entities.LiveChatMessage.create({
      room_id: roomId,
      user_id: user.id,
      sender_name: user.full_name || 'Moderator',
      content: verseText.trim(),
      verse_ref: verseRef.trim(),
      message_type: 'highlight',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-highlights', roomId] });
      setVerseRef(''); setVerseText('');
      toast.success('Verse highlighted for everyone!');
    },
  });

  return (
    <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
        <Highlighter className="w-4 h-4 text-amber-600" />
        <h4 className="text-sm font-extrabold text-amber-900">Shared Verse Highlights</h4>
        {isModerator && <span className="ml-auto text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">Moderator</span>}
      </div>

      {/* Current highlight */}
      {highlights.length > 0 && (
        <div className="px-4 py-3 bg-amber-50/50 border-b border-amber-100">
          <p className="text-xs font-bold text-amber-700 mb-1">📌 Currently Highlighted</p>
          <div className="bg-amber-100 rounded-xl p-3">
            <p className="text-xs font-extrabold text-amber-800 mb-0.5">{highlights[0].verse_ref}</p>
            <p className="text-sm text-amber-900 italic">"{highlights[0].content}"</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-amber-600">Highlighted by {highlights[0].sender_name}</p>
              <button
                onClick={() => saveAsFlashcard(highlights[0])}
                disabled={savedIds.has(highlights[0].id)}
                className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors flex items-center gap-1
                  ${savedIds.has(highlights[0].id) ? 'bg-green-100 text-green-700' : 'bg-amber-200 hover:bg-amber-300 text-amber-800'}`}>
                {savedIds.has(highlights[0].id) ? '✓ Saved' : '🧠 Save Flashcard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All highlights */}
      {highlights.length > 1 && (
        <div className="px-4 py-2 max-h-40 overflow-y-auto space-y-2">
          {highlights.slice(1).map(h => (
            <div key={h.id} className="flex items-start gap-2 py-1.5 border-b border-gray-50">
              <span className="text-amber-500 text-xs">✦</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-700">{h.verse_ref}</p>
                <p className="text-xs text-gray-500 line-clamp-1">"{h.content}"</p>
              </div>
              <button
                onClick={() => saveAsFlashcard(h)}
                disabled={savedIds.has(h.id)}
                className={`text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0 transition-colors
                  ${savedIds.has(h.id) ? 'text-green-600' : 'text-amber-600 hover:text-amber-800'}`}>
                {savedIds.has(h.id) ? '✓' : '🧠'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Moderator controls */}
      {isModerator && (
        <div className="px-4 py-3 border-t border-amber-100 space-y-2">
          <p className="text-xs font-bold text-gray-600">Highlight a verse for everyone</p>
          <Input placeholder="Verse ref (e.g. John 3:16)" value={verseRef} onChange={e => setVerseRef(e.target.value)} className="text-xs h-8" />
          <Input placeholder="Verse text…" value={verseText} onChange={e => setVerseText(e.target.value)} className="text-xs h-8" />
          <Button size="sm" onClick={() => highlightMutation.mutate()} disabled={!verseRef.trim() || !verseText.trim() || highlightMutation.isPending}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-1.5 text-xs">
            <Highlighter className="w-3.5 h-3.5" /> Highlight for Room
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Live Chat ─────────────────────────────────────────────────────
function LiveChat({ roomId, user }) {
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['room-chat', roomId],
    queryFn: () => base44.entities.LiveChatMessage.filter({ room_id: roomId, message_type: 'text' }, 'created_date', 50).catch(() => []),
    refetchInterval: 3000,
  });

  // Real-time
  useEffect(() => {
    const unsub = base44.entities.LiveChatMessage.subscribe((event) => {
      if (event.data?.room_id === roomId && event.data?.message_type === 'text') {
        queryClient.invalidateQueries({ queryKey: ['room-chat', roomId] });
      }
    });
    return unsub;
  }, [roomId]);

  useEffect(() => { setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (text) => base44.entities.LiveChatMessage.create({
      room_id: roomId, user_id: user.id, sender_name: user.full_name || user.email?.split('@')[0] || 'Participant',
      content: text, message_type: 'text',
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['room-chat', roomId] }); setInput(''); },
  });

  return (
    <div className="flex flex-col h-80 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h4 className="text-sm font-bold text-gray-900">💬 Live Discussion</h4>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Start the discussion!</p>}
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
            <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
              {(msg.sender_name || 'U')[0].toUpperCase()}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${msg.user_id === user?.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {msg.user_id !== user?.id && <p className="text-xs font-bold opacity-70 mb-0.5">{msg.sender_name}</p>}
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={e => { e.preventDefault(); if (input.trim()) sendMutation.mutate(input.trim()); }}
        className="flex gap-2 px-3 py-2 border-t border-gray-100">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Share a thought…" className="flex-1 text-sm bg-gray-50 border-gray-200" />
        <Button type="submit" size="icon" disabled={!input.trim() || sendMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

// ── Whiteboard ────────────────────────────────────────────────────
function Whiteboard() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);
  const [color, setColor] = useState('#312E81');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState('pen');

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * (canvas.width / rect.width), y: (clientY - rect.top) * (canvas.height / rect.height) };
  };
  const startDraw = (e) => { drawing.current = true; lastPos.current = getPos(e, canvasRef.current); };
  const draw = (e) => {
    if (!drawing.current) return; e.preventDefault();
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); const pos = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color; ctx.lineWidth = tool === 'eraser' ? 20 : brushSize;
    ctx.lineCap = 'round'; ctx.stroke(); lastPos.current = pos;
  };
  const stopDraw = () => { drawing.current = false; };
  const COLORS = ['#312E81','#7C3AED','#DB2777','#D97706','#059669','#2563EB','#DC2626','#000000'];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
        <div className="flex gap-1">{COLORS.map(c => <button key={c} onClick={() => { setColor(c); setTool('pen'); }} className={`w-5 h-5 rounded-full ${color === c && tool === 'pen' ? 'ring-2 ring-offset-1 ring-indigo-500 scale-110' : ''}`} style={{ background: c }} />)}</div>
        <button onClick={() => setTool(t => t === 'eraser' ? 'pen' : 'eraser')} className={`px-2 py-1 rounded-lg text-xs font-medium ${tool === 'eraser' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}><Eraser className="w-3.5 h-3.5 inline" /> Eraser</button>
        <button onClick={() => { const ctx = canvasRef.current.getContext('2d'); ctx.clearRect(0, 0, 800, 400); }} className="px-2 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-medium ml-auto"><Trash2 className="w-3.5 h-3.5 inline" /> Clear</button>
      </div>
      <canvas ref={canvasRef} width={800} height={400} className="w-full cursor-crosshair touch-none" style={{ background: '#FAFAFA' }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
    </div>
  );
}

// ── Room View ─────────────────────────────────────────────────────
function RoomView({ room, user, onLeave }) {
  const [tab, setTab] = useState('audio');
  const isModerator = room.host_user_id === user?.id || room.created_by === user?.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <h2 className="font-extrabold text-gray-900">{room.name}</h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">● Live</span>
              {room.is_private ? <Lock className="w-3.5 h-3.5 text-gray-400" /> : <Globe className="w-3.5 h-3.5 text-green-500" />}
              {isModerator && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Host</span>}
            </div>
            {room.passage && <p className="text-xs text-indigo-600 font-medium mt-0.5">📖 Studying: {room.passage}</p>}
          </div>
          <button onClick={onLeave} className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl hover:bg-red-100 transition-colors border border-red-100">
            <X className="w-3.5 h-3.5" /> Leave
          </button>
        </div>

        <div className="flex bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
          {[{ id: 'audio', label: '🎧 Audio' }, { id: 'highlights', label: '✦ Highlights' }, { id: 'chat', label: '💬 Chat' }, { id: 'whiteboard', label: '📋 Board' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-indigo-600'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'audio' && <SharedAudioPlayer room={room} isModerator={isModerator} />}
        {tab === 'highlights' && <VerseHighlightPanel roomId={room.id} user={user} isModerator={isModerator} />}
        {tab === 'chat' && <LiveChat roomId={room.id} user={user} />}
        {tab === 'whiteboard' && <Whiteboard />}
      </div>
    </div>
  );
}

// ── Create Room Modal ─────────────────────────────────────────────
function CreateRoomModal({ user, onCreated, onClose }) {
  const [form, setForm] = useState({ name: '', description: '', is_private: false, passage: '' });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    const room = await base44.entities.StudyGroup.create({
      name: form.name, description: form.description, is_private: form.is_private,
      passage: form.passage, host_user_id: user.id, status: 'active', room_type: 'study_room',
    });
    onCreated(room); setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-gray-900">Create Study Room</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleCreate} className="space-y-3">
          <Input placeholder="Room name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="text-sm" />
          <Input placeholder="Passage to study (e.g. John 3)" value={form.passage} onChange={e => setForm(f => ({ ...f, passage: e.target.value }))} className="text-sm" />
          <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="text-sm" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_private} onChange={e => setForm(f => ({ ...f, is_private: e.target.checked }))} className="accent-indigo-600" />
            <span className="text-sm text-gray-700">Private room (invite only)</span>
          </label>
          <Button type="submit" disabled={saving || !form.name.trim()} className="w-full bg-indigo-700 hover:bg-indigo-800 gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Creating…' : 'Create Room'}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function StudyRooms() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {}).finally(() => setAuthChecked(true));
  }, []);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['study-rooms'],
    queryFn: () => base44.entities.StudyGroup.filter({ room_type: 'study_room', status: 'active' }, '-created_date', 20).catch(() => []),
    refetchInterval: 10000,
  });

  if (!authChecked) return null;
  if (activeRoom) return <RoomView room={activeRoom} user={user} onLeave={() => { setActiveRoom(null); queryClient.invalidateQueries({ queryKey: ['study-rooms'] }); }} />;

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-6">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-extrabold mb-2">Study Rooms</h2>
        <p className="text-indigo-200 mb-6">Sign in to join or create a live Bible study room</p>
        <Button onClick={() => base44.auth.redirectToLogin()} className="bg-white text-indigo-700 font-bold">Sign In</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2"><Users className="w-6 h-6 text-indigo-600" /> Study Rooms</h1>
            <p className="text-gray-500 text-sm mt-0.5">Read the Bible together in real-time</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-indigo-700 hover:bg-indigo-800 gap-1.5 text-sm"><Plus className="w-4 h-4" /> New Room</Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[{ icon: '🎧', label: 'Shared Audio' }, { icon: '✦', label: 'Verse Highlights' }, { icon: '💬', label: 'Live Chat' }, { icon: '📋', label: 'Whiteboard' }].map(f => (
            <div key={f.label} className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
              <div className="text-xl mb-1">{f.icon}</div>
              <p className="text-xs font-bold text-gray-600">{f.label}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />)}</div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">📚</div>
            <p className="text-gray-500 font-medium">No study rooms open yet</p>
            <Button onClick={() => setShowCreate(true)} className="mt-4 bg-indigo-700 gap-1.5"><Plus className="w-4 h-4" /> Create Room</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map(room => (
              <div key={room.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                      <h3 className="font-bold text-gray-900 truncate">{room.name}</h3>
                      {room.is_private ? <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> : <Globe className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                      <span className="flex-shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Session Active
                      </span>
                    </div>
                    {room.passage && <p className="text-xs text-indigo-600 font-medium">📖 {room.passage}</p>}
                    {room.description && <p className="text-sm text-gray-500 truncate mt-0.5">{room.description}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-400">Hosted by {room.created_by?.split('@')[0]}</p>
                      {(room.member_ids?.length > 0 || room.participants_count > 0) && (
                        <p className="text-xs text-indigo-500 font-medium flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {room.member_ids?.length || room.participants_count} joined
                        </p>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => setActiveRoom(room)} size="sm" className="bg-indigo-700 hover:bg-indigo-800 flex-shrink-0">Join</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateRoomModal user={user}
          onCreated={(room) => { setShowCreate(false); queryClient.invalidateQueries({ queryKey: ['study-rooms'] }); setActiveRoom(room); }}
          onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}