import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, MicOff, Video, VideoOff, Phone, Users, Heart, Lock, Globe, Plus, Send, Crown, Zap, MessageCircle, Hand } from 'lucide-react';

const XP_KEY = 'fl_xp_data';
const ROOMS_KEY = 'fl_prayer_rooms';

function addXP(amount, label) {
  const d = JSON.parse(localStorage.getItem(XP_KEY) || '{}');
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(XP_KEY, JSON.stringify({
    ...d, totalXP: (d.totalXP || 0) + amount,
    log: [{ action: 'prayer_room', xp: amount, label, at: today }, ...(d.log || [])].slice(0, 30),
  }));
}

// Mock public rooms
const PUBLIC_ROOMS = [
  { id: 'pr1', name: 'Morning Prayer Circle', host: 'Elder Samuel', participants: 14, category: 'prayer', isLive: true, isPublic: true, language: 'English', topic: 'Intercession for East Africa' },
  { id: 'pr2', name: 'Afaan Oromoo Kadhataa', host: 'Pastor Grace', participants: 8, category: 'prayer', isLive: true, isPublic: true, language: 'Afaan Oromoo', topic: 'Waa Waaqayyo Gaafachuu' },
  { id: 'pr3', name: 'Healing & Restoration', host: 'James W.', participants: 22, category: 'healing', isLive: true, isPublic: true, language: 'English', topic: 'Praying for the sick' },
  { id: 'pr4', name: 'Evening Praise Night', host: 'Worship Team', participants: 31, category: 'worship', isLive: false, isPublic: true, language: 'English', topic: 'Starting in 30 min' },
  { id: 'pr5', name: 'አማርኛ ጸሎት ቤት', host: 'Miriam T.', participants: 6, category: 'prayer', isLive: true, isPublic: true, language: 'አማርኛ', topic: 'ለቤተሰብ ጸሎት' },
];

const CATEGORIES = ['prayer', 'healing', 'worship', 'study', 'intercession'];
const CAT_COLORS = { prayer: '#6c5ce7', healing: '#ef4444', worship: '#f59e0b', study: '#3b82f6', intercession: '#10b981' };
const CAT_EMOJI = { prayer: '🙏', healing: '💜', worship: '🎵', study: '📖', intercession: '🌍' };

function getRooms() {
  try { return JSON.parse(localStorage.getItem(ROOMS_KEY) || '[]'); } catch { return []; }
}

// Simple simulated audio waveform
function AudioWave({ active, color = '#6c5ce7' }) {
  return (
    <div className="flex items-center gap-0.5 h-5">
      {[3, 5, 8, 5, 3, 6, 9, 6, 3].map((h, i) => (
        <div key={i} className="rounded-full transition-all"
          style={{
            width: 3, height: active ? h * 1.5 : 3,
            backgroundColor: active ? color : '#d1d5db',
            animation: active ? `pulse ${0.4 + i * 0.1}s ease-in-out infinite alternate` : 'none',
          }} />
      ))}
    </div>
  );
}

// Participant avatar
function ParticipantBubble({ name, isMuted, isSpeaking, isHost, size = 'md' }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['bg-indigo-400', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-purple-400', 'bg-teal-400'];
  const color = colors[name?.charCodeAt(0) % colors.length];
  const sz = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-sm';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${sz} ${color} rounded-2xl flex items-center justify-center text-white font-bold ${isSpeaking ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}>
        {initials}
        {isHost && <span className="absolute -top-1.5 -right-1.5 text-xs">👑</span>}
        {isMuted && <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-xs">🔇</span>}
      </div>
      <AudioWave active={isSpeaking && !isMuted} />
      <p className="text-xs text-gray-600 font-medium text-center leading-tight max-w-[60px] truncate">{name}</p>
    </div>
  );
}

export default function LivePrayerRoom() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('browse'); // browse | room | create
  const [activeRoom, setActiveRoom] = useState(null);
  const [customRooms, setCustomRooms] = useState(getRooms);
  const [filterCat, setFilterCat] = useState('all');
  const [filterLang, setFilterLang] = useState('all');

  // In-room state
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [joinTime, setJoinTime] = useState(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [xpToast, setXpToast] = useState(null);
  const [prayerCount, setPrayerCount] = useState(0);
  const chatRef = useRef(null);

  // Create room form
  const [createForm, setCreateForm] = useState({ name: '', topic: '', category: 'prayer', isPublic: true, language: 'English' });

  // Simulate participants
  const [roomParticipants] = useState([
    { name: 'Elder Samuel', isMuted: false, isSpeaking: true, isHost: true },
    { name: 'Grace M.', isMuted: true, isSpeaking: false, isHost: false },
    { name: 'James K.', isMuted: false, isSpeaking: false, isHost: false },
    { name: 'Emma R.', isMuted: true, isSpeaking: false, isHost: false },
  ]);

  useEffect(() => { base44.auth.me().then(u => setUser(u)).catch(() => {}); }, []);
  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  // XP timer while in room
  useEffect(() => {
    if (!activeRoom || !joinTime) return;
    const interval = setInterval(() => {
      const mins = Math.floor((Date.now() - joinTime) / 60000);
      const earned = mins * 3; // 3 XP per minute in room
      setXpEarned(earned);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeRoom, joinTime]);

  const showXP = (msg) => { setXpToast(msg); setTimeout(() => setXpToast(null), 2500); };

  const joinRoom = (room) => {
    setActiveRoom(room);
    setJoinTime(Date.now());
    setMessages([{ id: Date.now(), type: 'system', text: `You joined "${room.name}"` }]);
    addXP(10, `Joined ${room.name}`);
    showXP('+10 XP — Joined prayer room! 🙏');
    setView('room');
  };

  const leaveRoom = () => {
    const mins = Math.floor((Date.now() - joinTime) / 60000);
    const totalXP = Math.max(0, mins * 3);
    if (totalXP > 0) { addXP(totalXP, 'Prayer room session'); showXP(`+${totalXP} XP — ${mins} min session! 🙏`); }
    setActiveRoom(null);
    setJoinTime(null);
    setXpEarned(0);
    setIsMuted(true);
    setIsVideoOn(false);
    setHandRaised(false);
    setMessages([]);
    setView('browse');
  };

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    const msg = { id: Date.now(), type: 'chat', from: user?.full_name || 'You', text: msgInput.trim() };
    setMessages(prev => [...prev, msg]);
    setMsgInput('');
  };

  const sendPrayer = () => {
    const msg = { id: Date.now(), type: 'prayer', from: user?.full_name || 'You', text: '🙏 Joined in prayer' };
    setMessages(prev => [...prev, msg]);
    setPrayerCount(c => c + 1);
    addXP(5, 'Prayer reaction in live room');
    showXP('+5 XP — Prayer sent! 🙏');
  };

  const createRoom = () => {
    if (!createForm.name.trim()) return;
    const room = {
      id: 'custom_' + Date.now(),
      ...createForm,
      host: user?.full_name || 'You',
      participants: 1,
      isLive: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [room, ...customRooms];
    setCustomRooms(updated);
    localStorage.setItem(ROOMS_KEY, JSON.stringify(updated));
    addXP(30, `Hosted prayer room: ${room.name}`);
    showXP('+30 XP — Room created! 🎉');
    joinRoom(room);
  };

  const allRooms = [...customRooms, ...PUBLIC_ROOMS];
  const filteredRooms = allRooms.filter(r => {
    const catOk = filterCat === 'all' || r.category === filterCat;
    const langOk = filterLang === 'all' || r.language === filterLang;
    return catOk && langOk;
  });
  const liveCount = allRooms.filter(r => r.isLive).length;

  // ── IN-ROOM VIEW ─────────────────────────────────────────────────────────
  if (view === 'room' && activeRoom) {
    const myEntry = { name: user?.full_name || 'You', isMuted, isSpeaking: !isMuted, isHost: activeRoom.host === (user?.full_name || 'You') };
    const allParticipants = [...roomParticipants, myEntry];
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col pb-0">
        {xpToast && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm">{xpToast}</div>}

        {/* Room header */}
        <div className="bg-gray-800 px-4 py-4 border-b border-gray-700">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <p className="text-white font-bold text-sm">{activeRoom.name}</p>
                {activeRoom.isPublic ? <Globe size={12} className="text-gray-400" /> : <Lock size={12} className="text-gray-400" />}
              </div>
              <p className="text-gray-400 text-xs mt-0.5">{activeRoom.topic} · {allParticipants.length} in room</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded-full font-semibold">
                <Zap size={10} className="inline mr-0.5" /> +{xpEarned} XP
              </span>
              <button onClick={leaveRoom} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700">
                <Phone size={13} /> Leave
              </button>
            </div>
          </div>
        </div>

        {/* Participants grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-xl mx-auto">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {allParticipants.map((p, i) => (
                <div key={i} className="bg-gray-800 rounded-2xl p-4 flex flex-col items-center">
                  <ParticipantBubble {...p} size="lg" />
                </div>
              ))}
            </div>

            {/* Prayer count */}
            {prayerCount > 0 && (
              <div className="bg-gray-800 rounded-2xl p-3 mb-4 flex items-center gap-2">
                <span className="text-xl">🙏</span>
                <p className="text-white text-sm font-semibold">{prayerCount} prayer{prayerCount > 1 ? 's' : ''} sent in this session</p>
              </div>
            )}

            {/* Chat */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden">
              <div ref={chatRef} className="h-36 overflow-y-auto p-3 space-y-2">
                {messages.map(msg => (
                  <div key={msg.id} className={`text-xs ${msg.type === 'system' ? 'text-gray-500 text-center' : msg.type === 'prayer' ? 'text-rose-400 text-center' : 'text-gray-300'}`}>
                    {msg.type === 'chat' && <span className="font-semibold text-gray-100">{msg.from}: </span>}
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 p-2 flex gap-2">
                <input value={msgInput} onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message…"
                  className="flex-1 bg-gray-700 text-white text-xs px-3 py-2 rounded-xl outline-none placeholder-gray-500" />
                <button onClick={sendMessage} className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Send size={13} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-4 safe-area-bottom">
          <div className="max-w-xl mx-auto flex items-center justify-around">
            <button onClick={() => setIsMuted(m => !m)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${isMuted ? 'bg-red-900/40 text-red-400' : 'bg-gray-700 text-white'}`}>
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            <button onClick={() => setIsVideoOn(v => !v)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${isVideoOn ? 'bg-gray-700 text-white' : 'bg-gray-700 text-gray-400'}`}>
              {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
              <span className="text-xs">Video</span>
            </button>
            <button onClick={sendPrayer} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-rose-900/40 text-rose-400 hover:bg-rose-900/60 transition-all">
              <Heart size={20} />
              <span className="text-xs">🙏 Pray</span>
            </button>
            <button onClick={() => setHandRaised(h => !h)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${handRaised ? 'bg-amber-900/40 text-amber-400' : 'bg-gray-700 text-gray-400'}`}>
              <Hand size={20} />
              <span className="text-xs">{handRaised ? 'Lower' : 'Raise'}</span>
            </button>
            <button onClick={leaveRoom} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all">
              <Phone size={20} />
              <span className="text-xs">Leave</span>
            </button>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    );
  }

  // ── CREATE ROOM VIEW ─────────────────────────────────────────────────────
  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {xpToast && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm">{xpToast}</div>}
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <button onClick={() => setView('browse')} className="text-indigo-600 font-semibold text-sm">← Back</button>
            <h1 className="text-lg font-bold text-gray-900">Create Prayer Room</h1>
          </div>
        </div>
        <div className="max-w-xl mx-auto px-4 py-5 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 text-sm text-indigo-700 font-semibold">
            🎉 Hosting a room earns +30 XP + 3 XP per minute you stay
          </div>
          {[['Room Name', 'name', 'Morning Prayer Circle', 'text'], ['Topic / Focus', 'topic', 'Praying for healing and restoration…', 'text']].map(([label, key, ph]) => (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">{label}</label>
              <input value={createForm[key]} onChange={e => setCreateForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={ph}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCreateForm(f => ({ ...f, category: cat }))}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${createForm.category === cat ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
                  style={{ backgroundColor: createForm.category === cat ? CAT_COLORS[cat] : '' }}>
                  {CAT_EMOJI[cat]} {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Language</label>
            <select value={createForm.language} onChange={e => setCreateForm(f => ({ ...f, language: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
              {['English', 'Afaan Oromoo', 'አማርኛ', 'Kiswahili', 'Français', 'العربية'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{createForm.isPublic ? 'Public Room' : 'Private Room'}</p>
              <p className="text-xs text-gray-400">{createForm.isPublic ? 'Anyone can join from browse' : 'Only people with the link can join'}</p>
            </div>
            <button onClick={() => setCreateForm(f => ({ ...f, isPublic: !f.isPublic }))}
              className={`relative w-12 h-6 rounded-full transition-all ${createForm.isPublic ? 'bg-indigo-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${createForm.isPublic ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
          <button onClick={createRoom} disabled={!createForm.name.trim()}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            <Crown size={16} /> Start Prayer Room (+30 XP)
          </button>
        </div>
      </div>
    );
  }

  // ── BROWSE VIEW ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {xpToast && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm">{xpToast}</div>}

      <div className="bg-gradient-to-r from-gray-900 to-indigo-900 px-4 pt-6 pb-8 text-white">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2"><Heart size={20} className="text-rose-400" /> Live Prayer Rooms</h1>
              <p className="text-gray-300 text-xs mt-0.5">{liveCount} rooms live now · Earn XP for attending</p>
            </div>
            <button onClick={() => setView('create')}
              className="flex items-center gap-1.5 bg-indigo-600 px-3 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700">
              <Plus size={15} /> Host
            </button>
          </div>
          <div className="bg-white/10 rounded-2xl px-4 py-2.5 text-xs text-indigo-200 flex items-center gap-2">
            <Zap size={13} className="text-yellow-400" />
            +10 XP to join · +3 XP/min · +5 XP per 🙏 reaction · +30 XP to host
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-3">
        {/* Category filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-4">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            <button onClick={() => setFilterCat('all')} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterCat === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}>All</button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterCat === cat ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
                style={{ backgroundColor: filterCat === cat ? CAT_COLORS[cat] : '' }}>
                {CAT_EMOJI[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Room list */}
        <div className="space-y-3">
          {filteredRooms.map(room => (
            <div key={room.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all hover:shadow-md ${!room.isLive ? 'opacity-70' : ''}`}
              style={{ borderColor: room.isLive ? CAT_COLORS[room.category] + '33' : '#f3f4f6' }}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: CAT_COLORS[room.category] + '15' }}>
                  {CAT_EMOJI[room.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {room.isLive && <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE</span>}
                    {!room.isPublic && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-0.5"><Lock size={9} /> Private</span>}
                    <span className="text-xs text-gray-400">{room.language}</span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{room.name}</p>
                  <p className="text-xs text-gray-500">Host: {room.host} · {room.topic}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Users size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{room.participants} participant{room.participants !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <button onClick={() => room.isLive && joinRoom(room)} disabled={!room.isLive}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${room.isLive ? 'text-white hover:opacity-90' : 'bg-gray-100 text-gray-400'}`}
                  style={{ backgroundColor: room.isLive ? CAT_COLORS[room.category] : '' }}>
                  {room.isLive ? 'Join' : 'Soon'}
                </button>
              </div>
            </div>
          ))}
          {filteredRooms.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <Heart size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No rooms in this category right now.</p>
              <button onClick={() => setView('create')} className="mt-3 text-indigo-600 text-sm font-semibold">Create the first one →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}