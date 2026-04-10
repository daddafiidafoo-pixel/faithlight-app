import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, Send, BookOpen, Heart, Users, Globe, Lock, Calendar, Sparkles } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { createPageUrl } from '@/utils';
import ChatMessageBubble from '@/components/studyrooms/ChatMessageBubble';
import VersePostCard from '@/components/studyrooms/VersePostCard';
import PrayerRequestCard from '@/components/studyrooms/PrayerRequestCard';
import { format } from 'date-fns';

export default function StudyRoomDetail() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('id');

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [verses, setVerses] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [verseInput, setVerseInput] = useState({ reference: '', text: '', note: '' });
  const [prayerInput, setPrayerInput] = useState({ title: '', content: '', isAnonymous: false });
  const [showVerseForm, setShowVerseForm] = useState(false);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me().catch(() => null);
        setUser(currentUser);

        const [roomData, msgs, verseList, prayerList, memberList] = await Promise.all([
          base44.entities.StudyRoom.read(roomId),
          base44.entities.StudyRoomMessage.filter({ roomId }),
          base44.entities.StudyRoomVerse.filter({ roomId }),
          base44.entities.StudyRoomPrayer.filter({ roomId }),
          base44.entities.StudyRoomMember.filter({ roomId })
        ]);

        setRoom(roomData);
        setMessages(msgs || []);
        setVerses(verseList || []);
        setPrayers(prayerList || []);
        setMembers(memberList || []);
      } catch (err) {
        console.error('Failed to load room:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(async () => {
      const msgs = await base44.entities.StudyRoomMessage.filter({ roomId }).catch(() => []);
      setMessages(msgs || []);
    }, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const memberMap = {};
  members.forEach(m => { memberMap[m.userId] = m; });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !user || sendingMsg) return;
    setSendingMsg(true);
    try {
      const msg = await base44.entities.StudyRoomMessage.create({
        roomId,
        userId: user.id,
        messageType: 'text',
        content: messageInput,
        language: room?.language || 'English'
      });
      setMessages(prev => [...prev, msg]);
      setMessageInput('');
      await base44.entities.StudyRoom.update(roomId, { lastActivityAt: new Date().toISOString() });
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleShareVerse = async (e) => {
    e.preventDefault();
    if (!verseInput.reference.trim() || !verseInput.text.trim() || !user) return;
    try {
      await Promise.all([
        base44.entities.StudyRoomVerse.create({
          roomId,
          userId: user.id,
          reference: verseInput.reference,
          verseText: verseInput.text,
          language: room?.language || 'English',
          note: verseInput.note
        }),
        base44.entities.StudyRoomMessage.create({
          roomId,
          userId: user.id,
          messageType: 'verse',
          content: verseInput.text,
          verseReference: verseInput.reference,
          verseText: verseInput.text,
          language: room?.language || 'English'
        })
      ]);
      const [verseList, msgs] = await Promise.all([
        base44.entities.StudyRoomVerse.filter({ roomId }),
        base44.entities.StudyRoomMessage.filter({ roomId })
      ]);
      setVerses(verseList || []);
      setMessages(msgs || []);
      setVerseInput({ reference: '', text: '', note: '' });
      setShowVerseForm(false);
    } catch (err) {
      console.error('Failed to share verse:', err);
    }
  };

  const handlePrayerRequest = async (e) => {
    e.preventDefault();
    if (!prayerInput.title.trim() || !prayerInput.content.trim() || !user) return;
    try {
      const prayer = await base44.entities.StudyRoomPrayer.create({
        roomId,
        userId: user.id,
        title: prayerInput.title,
        content: prayerInput.content,
        isAnonymous: prayerInput.isAnonymous,
        status: 'new',
        prayerCount: 0
      });
      setPrayers(prev => [...prev, prayer]);
      setPrayerInput({ title: '', content: '', isAnonymous: false });
      setShowPrayerForm(false);
    } catch (err) {
      console.error('Failed to create prayer:', err);
    }
  };

  const handlePray = async (prayer) => {
    if (!user) return;
    await base44.entities.StudyRoomPrayer.update(prayer.id, {
      prayerCount: (prayer.prayerCount || 0) + 1
    });
    setPrayers(prev => prev.map(p => p.id === prayer.id ? { ...p, prayerCount: (p.prayerCount || 0) + 1 } : p));
  };

  const handleSummarize = async () => {
    if (!messages.length || summarizing) return;
    setSummarizing(true);
    try {
      const convo = messages.slice(-30).map(m => `${memberMap[m.userId]?.userName || 'User'}: ${m.content}`).join('\n');
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this Bible study room discussion in 3–5 sentences. Be encouraging and spiritual.\n\n${convo}`,
      });
      setSummary(res);
    } catch (err) {
      console.error('Summarize failed:', err);
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading room…</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">Room not found</p>
          <Button className="mt-4" onClick={() => navigate(createPageUrl('StudyRooms'))}>
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  const getUserName = (userId) => memberMap[userId]?.userName || (user?.id === userId ? user?.full_name?.split(' ')[0] : 'User');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('StudyRooms'))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg text-gray-900 truncate">{room.name}</h1>
            <p className="text-xs text-gray-500">{room.language} · {members.length} {t('room.members', 'members')}</p>
          </div>
          <Badge variant={room.privacy === 'private' ? 'secondary' : 'outline'} className="hidden sm:flex items-center gap-1">
            {room.privacy === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {room.privacy}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-4 pb-24 flex-1">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">{t('room.chatTab', 'Chat')}</TabsTrigger>
            <TabsTrigger value="verses">{t('room.versesTab', 'Verses')}</TabsTrigger>
            <TabsTrigger value="prayer">{t('room.prayerTab', 'Prayer')}</TabsTrigger>
            <TabsTrigger value="about">{t('room.aboutTab', 'About')}</TabsTrigger>
          </TabsList>

          {/* ── CHAT TAB ── */}
          <TabsContent value="chat" className="mt-4 flex flex-col gap-3">
            {/* AI Summary */}
            {room.allowAISummaries && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSummarize}
                  disabled={summarizing || messages.length === 0}
                  className="gap-2 text-indigo-600 border-indigo-200"
                >
                  <Sparkles className="w-4 h-4" />
                  {summarizing ? 'Summarizing…' : t('room.summarizeChat', 'Summarize Discussion')}
                </Button>
              </div>
            )}

            {summary && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-indigo-900">
                <p className="font-semibold mb-1 flex items-center gap-1"><Sparkles className="w-4 h-4" /> AI Summary</p>
                <p>{summary}</p>
              </div>
            )}

            {/* Message list */}
            <div className="bg-white rounded-lg border p-4 h-96 overflow-y-auto space-y-1">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <ChatMessageBubble
                    key={msg.id || i}
                    message={msg}
                    isOwn={msg.userId === user?.id}
                    userName={getUserName(msg.userId)}
                    role={memberMap[msg.userId]?.role}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {user ? (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={t('room.messagePlaceholder', 'Write a message…')}
                  className="flex-1"
                />
                {room.allowVerseSharing && (
                  <Button type="button" variant="outline" size="icon" onClick={() => setShowVerseForm(true)} title={t('room.shareVerse', 'Share Verse')}>
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </Button>
                )}
                <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700" disabled={sendingMsg}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <p className="text-center text-sm text-gray-500 py-2">Sign in to send messages</p>
            )}
          </TabsContent>

          {/* ── VERSES TAB ── */}
          <TabsContent value="verses" className="mt-4 space-y-4">
            {user && room.allowVerseSharing && (
              <Button onClick={() => setShowVerseForm(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                <BookOpen className="w-4 h-4" />
                {t('room.shareVerse', 'Share Verse')}
              </Button>
            )}
            {verses.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{t('room.noVerses', 'No verses shared yet')}</p>
              </div>
            ) : (
              [...verses].reverse().map((v, i) => (
                <VersePostCard key={v.id || i} verse={v} userName={getUserName(v.userId)} />
              ))
            )}
          </TabsContent>

          {/* ── PRAYER TAB ── */}
          <TabsContent value="prayer" className="mt-4 space-y-4">
            {user && room.allowPrayerRequests && (
              <Button onClick={() => setShowPrayerForm(true)} className="w-full bg-purple-600 hover:bg-purple-700 gap-2">
                <Heart className="w-4 h-4" />
                {t('room.addPrayerRequest', 'Add Prayer Request')}
              </Button>
            )}
            {prayers.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{t('room.noPrayers', 'No prayer requests yet')}</p>
              </div>
            ) : (
              [...prayers].reverse().map((p, i) => (
                <PrayerRequestCard
                  key={p.id || i}
                  prayer={p}
                  userName={p.isAnonymous ? t('prayer.anonymous', 'Anonymous') : getUserName(p.userId)}
                  onPray={user ? () => handlePray(p) : null}
                />
              ))
            )}
          </TabsContent>

          {/* ── ABOUT TAB ── */}
          <TabsContent value="about" className="mt-4">
            <div className="bg-white rounded-lg border divide-y">
              {/* Room info */}
              <div className="p-5 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>
                {room.description && <p className="text-gray-700">{room.description}</p>}

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{room.category}</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />{room.language}
                  </Badge>
                  <Badge variant={room.privacy === 'private' ? 'secondary' : 'outline'} className="flex items-center gap-1">
                    {room.privacy === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    {room.privacy}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>{members.length} / {room.maxMembers || 100} members</span>
                  </div>
                  {room.created_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>{format(new Date(room.created_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-700 mb-3">Room Features</h3>
                <div className="space-y-2 text-sm">
                  <FeatureRow label="Prayer Requests" enabled={room.allowPrayerRequests} />
                  <FeatureRow label="Verse Sharing" enabled={room.allowVerseSharing} />
                  <FeatureRow label="AI Summaries" enabled={room.allowAISummaries} />
                </div>
              </div>

              {/* Rules */}
              {room.rules && (
                <div className="p-5">
                  <h3 className="font-semibold text-gray-700 mb-2">Rules</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{room.rules}</p>
                </div>
              )}

              {/* Members */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Members ({members.length})
                </h3>
                <div className="space-y-2">
                  {members.slice(0, 15).map((m, i) => (
                    <div key={m.id || i} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                          {(m.userName || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-800 flex-1">{m.userName || 'Member'}</span>
                      {m.role !== 'member' && (
                        <Badge variant="secondary" className="text-xs capitalize">{m.role}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite code */}
              {room.privacy === 'private' && room.inviteCode && memberMap[user?.id] && (
                <div className="p-5">
                  <h3 className="font-semibold text-gray-700 mb-2">Invite Code</h3>
                  <div className="bg-gray-50 rounded border px-4 py-2 font-mono text-lg tracking-widest text-center text-indigo-700">
                    {room.inviteCode}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── VERSE MODAL ── */}
      {showVerseForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('room.shareVerse', 'Share Verse')}</h3>
            <form onSubmit={handleShareVerse} className="space-y-3">
              <Input
                value={verseInput.reference}
                onChange={(e) => setVerseInput({ ...verseInput, reference: e.target.value })}
                placeholder="Reference (e.g. John 3:16)"
                required
              />
              <Textarea
                value={verseInput.text}
                onChange={(e) => setVerseInput({ ...verseInput, text: e.target.value })}
                placeholder="Verse text"
                rows={3}
                required
              />
              <Input
                value={verseInput.note}
                onChange={(e) => setVerseInput({ ...verseInput, note: e.target.value })}
                placeholder="Add a note (optional)"
              />
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowVerseForm(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">Share</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PRAYER MODAL ── */}
      {showPrayerForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('room.addPrayerRequest', 'Add Prayer Request')}</h3>
            <form onSubmit={handlePrayerRequest} className="space-y-3">
              <Input
                value={prayerInput.title}
                onChange={(e) => setPrayerInput({ ...prayerInput, title: e.target.value })}
                placeholder="Prayer title"
                required
              />
              <Textarea
                value={prayerInput.content}
                onChange={(e) => setPrayerInput({ ...prayerInput, content: e.target.value })}
                placeholder="Share your prayer request…"
                rows={4}
                required
              />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={prayerInput.isAnonymous}
                  onChange={(e) => setPrayerInput({ ...prayerInput, isAnonymous: e.target.checked })}
                  className="rounded"
                />
                Post anonymously
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowPrayerForm(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">Post Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureRow({ label, enabled }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );
}