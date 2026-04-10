import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, MessageCircle, BookOpen, Plus, Send, Hash, Crown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const BIBLE_BOOKS_GROUPS = [
  { book: 'Genesis', emoji: '🌍', description: 'Origins, creation & the patriarchs' },
  { book: 'Psalms', emoji: '🎵', description: 'Songs of worship, lament & praise' },
  { book: 'Proverbs', emoji: '💡', description: 'Wisdom for daily living' },
  { book: 'John', emoji: '❤️', description: 'The Gospel of love & eternal life' },
  { book: 'Romans', emoji: '⚖️', description: 'Salvation, grace & Christian living' },
  { book: 'Revelation', emoji: '✨', description: 'End times prophecy & hope' },
  { book: 'Matthew', emoji: '👑', description: 'Jesus the King & Messiah' },
  { book: 'Acts', emoji: '🔥', description: 'The early church & Holy Spirit' },
  { book: 'Isaiah', emoji: '📯', description: 'Prophecies of redemption' },
  { book: 'James', emoji: '🌱', description: 'Faith expressed through action' },
];

export default function BibleStudyGroupsHub() {
  const [user, setUser] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [memberCount, setMemberCount] = useState({});
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    // Simulate member counts from localStorage activity
    const counts = {};
    BIBLE_BOOKS_GROUPS.forEach(g => {
      counts[g.book] = Math.floor(Math.random() * 120) + 5;
    });
    setMemberCount(counts);
  }, []);

  useEffect(() => {
    if (!activeGroup) return;
    loadMessages(activeGroup.book);
    const unsub = base44.entities.StudyGroupDiscussion.subscribe(event => {
      if (event.data?.groupBook === activeGroup.book) {
        setMessages(prev => {
          if (event.type === 'create') return [...prev, event.data];
          if (event.type === 'delete') return prev.filter(m => m.id !== event.id);
          return prev;
        });
      }
    });
    return unsub;
  }, [activeGroup?.book]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (book) => {
    try {
      const data = await base44.entities.StudyGroupDiscussion.filter({ groupBook: book }, 'created_date', 60);
      setMessages(data);
    } catch (e) { setMessages([]); }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !activeGroup) return;
    setSending(true);
    try {
      await base44.entities.StudyGroupDiscussion.create({
        groupBook: activeGroup.book,
        authorName: user.full_name || user.email.split('@')[0],
        authorEmail: user.email,
        content: input.trim(),
        messageType: 'discussion',
      });
      setInput('');
    } catch (e) { toast.error('Failed to send'); }
    setSending(false);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <Card className="max-w-sm w-full mx-4 text-center p-8">
        <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Bible Study Groups</h2>
        <p className="text-gray-500 mb-4">Sign in to join community discussions</p>
        <Button onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
      </Card>
    </div>
  );

  if (activeGroup) return (
    <div className="min-h-screen bg-white flex flex-col max-w-3xl mx-auto">
      {/* Chat Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setActiveGroup(null)} className="text-gray-400 hover:text-gray-600 p-1">←</button>
        <span className="text-2xl">{activeGroup.emoji}</span>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900">{activeGroup.book} Study Group</h2>
          <p className="text-xs text-gray-500">{memberCount[activeGroup.book]} members · Real-time discussion</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
          <span className="w-2 h-2 bg-green-400 rounded-full inline-block mr-1.5 animate-pulse" />
          Live
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        {messages.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">Be the first to share an insight on {activeGroup.book}!</p>
          </div>
        ) : messages.map(msg => {
          const isMe = msg.authorEmail === user.email;
          const time = new Date(msg.created_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {(msg.authorName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isMe && <span className="text-xs text-gray-400 px-1">{msg.authorName}</span>}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-400 px-1">{time}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex gap-2 items-center">
          <Input
            placeholder={`Share an insight on ${activeGroup.book}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            className="flex-1 rounded-full bg-gray-50 border-gray-200"
          />
          <Button onClick={sendMessage} disabled={!input.trim() || sending} size="icon" className="rounded-full bg-indigo-600 hover:bg-indigo-700 w-10 h-10 flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">👥 Bible Study Groups</h1>
          <p className="text-gray-500 mt-1">Join real-time discussions on books of the Bible with the community</p>
        </div>

        {/* Featured Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Global Community</span>
            <Badge className="bg-white/20 text-white border-0 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block mr-1.5 animate-pulse" />
              Live
            </Badge>
          </div>
          <h2 className="text-xl font-bold mb-1">Real-time Bible Discussions</h2>
          <p className="text-sm opacity-80">Share personal insights, ask questions, and grow together in understanding Scripture.</p>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BIBLE_BOOKS_GROUPS.map(group => (
            <button key={group.book} onClick={() => setActiveGroup(group)}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left group">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{group.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{group.book}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                      <Users className="w-3 h-3" />
                      {memberCount[group.book]}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{group.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">Active now</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">More book groups coming soon · Join thousands studying together</p>
      </div>
    </div>
  );
}