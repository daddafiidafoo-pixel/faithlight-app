import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, Send, Heart, BookOpen, MessageCircle, Users, Hash, Trash2, ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const GROUPS_KEY = 'fl_bible_groups';
const CHAT_PREFIX = 'fl_bible_chat_';

function getGroups() { return JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]'); }
function saveGroups(g) { localStorage.setItem(GROUPS_KEY, JSON.stringify(g)); }
function getChat(groupId) { return JSON.parse(localStorage.getItem(CHAT_PREFIX + groupId) || '[]'); }
function saveChat(groupId, msgs) { localStorage.setItem(CHAT_PREFIX + groupId, JSON.stringify(msgs)); }

const MSG_TYPES = [
  { value: 'message', label: '💬 Message', color: '' },
  { value: 'scripture', label: '📖 Scripture', color: 'bg-indigo-50 border-l-4 border-indigo-400' },
  { value: 'prayer', label: '🙏 Prayer Request', color: 'bg-rose-50 border-l-4 border-rose-400' },
  { value: 'note', label: '📝 Note', color: 'bg-amber-50 border-l-4 border-amber-400' },
];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function MessageBubble({ msg, currentEmail, onLike, onDelete }) {
  const isOwn = msg.author === currentEmail;
  const typeStyle = MSG_TYPES.find(t => t.value === msg.type)?.color || '';
  const typeLabel = MSG_TYPES.find(t => t.value === msg.type)?.label || '';
  const hasLiked = msg.likes?.includes(currentEmail);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {!isOwn && <span className="text-xs text-gray-400 px-1">{msg.authorName || msg.author?.split('@')[0]}</span>}
        <div className={`rounded-2xl px-3 py-2.5 text-sm ${isOwn ? 'bg-indigo-600 text-white' : `bg-white border border-gray-100 shadow-sm text-gray-800 ${typeStyle}`}`}>
          {msg.type !== 'message' && !isOwn && (
            <p className="text-xs font-semibold opacity-70 mb-1">{typeLabel}</p>
          )}
          <p className="leading-relaxed">{msg.text}</p>
        </div>
        <div className={`flex items-center gap-2 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-gray-300">{timeAgo(msg.sentAt)}</span>
          <button
            onClick={() => onLike(msg.id)}
            className={`flex items-center gap-0.5 text-xs transition-colors ${hasLiked ? 'text-rose-500' : 'text-gray-300 hover:text-rose-400'}`}
          >
            <Heart size={11} fill={hasLiked ? 'currentColor' : 'none'} />
            {msg.likes?.length > 0 && <span>{msg.likes.length}</span>}
          </button>
          {isOwn && (
            <button onClick={() => onDelete(msg.id)} className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatRoom({ group, currentUser, onBack }) {
  const [messages, setMessages] = useState(() => getChat(group.id));
  const [text, setText] = useState('');
  const [msgType, setMsgType] = useState('message');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 3 seconds (simulated real-time)
  useEffect(() => {
    const interval = setInterval(() => {
      const latest = getChat(group.id);
      if (latest.length !== messages.length) setMessages(latest);
    }, 3000);
    return () => clearInterval(interval);
  }, [group.id, messages.length]);

  const send = () => {
    if (!text.trim()) return;
    const msg = {
      id: Date.now().toString(),
      text: text.trim(),
      author: currentUser?.email || 'anonymous',
      authorName: currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Anonymous',
      type: msgType,
      sentAt: new Date().toISOString(),
      likes: [],
    };
    const updated = [...messages, msg];
    setMessages(updated);
    saveChat(group.id, updated);
    setText('');
  };

  const handleLike = (msgId) => {
    const email = currentUser?.email;
    if (!email) { toast.error('Sign in to like messages.'); return; }
    const updated = messages.map(m => {
      if (m.id !== msgId) return m;
      const likes = m.likes || [];
      return { ...m, likes: likes.includes(email) ? likes.filter(e => e !== email) : [...likes, email] };
    });
    setMessages(updated);
    saveChat(group.id, updated);
  };

  const handleDelete = (msgId) => {
    const updated = messages.filter(m => m.id !== msgId);
    setMessages(updated);
    saveChat(group.id, updated);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ paddingTop: 'calc(12px + env(safe-area-inset-top))' }}>
        <button onClick={onBack} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-indigo-600 rounded-lg">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 text-sm truncate">{group.name}</h2>
          <p className="text-xs text-gray-400">{group.book} · {group.memberCount || 1} members</p>
        </div>
        <BookOpen size={18} className="text-indigo-400 flex-shrink-0" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No messages yet — start the conversation!</p>
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            currentEmail={currentUser?.email}
            onLike={handleLike}
            onDelete={handleDelete}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Type selector */}
      <div className="bg-white border-t border-gray-100 px-4 pt-2 flex gap-2 overflow-x-auto flex-shrink-0">
        {MSG_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setMsgType(t.value)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${msgType === t.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white px-4 pb-4 pt-2 flex gap-2 flex-shrink-0" style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={msgType === 'scripture' ? 'Share a verse...' : msgType === 'prayer' ? 'Share a prayer request...' : 'Type a message...'}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm min-h-[44px]"
        />
        <button
          onClick={send}
          className="min-h-[44px] min-w-[44px] bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

function NewGroupModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [book, setBook] = useState('');

  const create = () => {
    if (!name.trim()) { toast.error('Enter a group name.'); return; }
    const g = {
      id: Date.now().toString(),
      name: name.trim(),
      book: book.trim() || 'General Study',
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };
    const all = getGroups();
    saveGroups([g, ...all]);
    onCreate(g);
    onClose();
    toast.success('Group created!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">New Study Group</h2>
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Group name (e.g., Wednesday Warriors)"
            className="w-full min-h-[44px] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            value={book}
            onChange={e => setBook(e.target.value)}
            placeholder="Book / topic (e.g., Romans, Faith)"
            className="w-full min-h-[44px] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 min-h-[44px] rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm">Cancel</button>
            <button onClick={create} className="flex-1 min-h-[44px] rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700">Create</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BibleGroupChat() {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setGroups(getGroups());
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const handleDelete = (id) => {
    const updated = groups.filter(g => g.id !== id);
    setGroups(updated);
    saveGroups(updated);
    toast.success('Group deleted.');
  };

  if (activeGroup) {
    return <ChatRoom group={activeGroup} currentUser={currentUser} onBack={() => setActiveGroup(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
            <p className="text-sm text-gray-500">Discuss scripture together</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] bg-indigo-600 text-white rounded-2xl font-semibold text-sm hover:bg-indigo-700"
          >
            <Plus size={15} /> New Group
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No groups yet</p>
            <p className="text-gray-300 text-sm mt-1">Create a group to start studying together</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map(g => {
              const msgs = getChat(g.id);
              const last = msgs[msgs.length - 1];
              return (
                <div key={g.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setActiveGroup(g)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Hash size={18} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{g.name}</p>
                      <p className="text-xs text-gray-400 truncate">{last ? last.text : g.book}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {last && <p className="text-xs text-gray-300">{timeAgo(last.sentAt)}</p>}
                      {msgs.length > 0 && (
                        <span className="text-xs bg-indigo-600 text-white rounded-full px-2 py-0.5">{msgs.length}</span>
                      )}
                    </div>
                  </button>
                  <div className="border-t border-gray-50 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{g.book}</span>
                    <button onClick={() => handleDelete(g.id)} className="text-xs text-gray-300 hover:text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <NewGroupModal
          onClose={() => setShowModal(false)}
          onCreate={g => setGroups(prev => [g, ...prev])}
        />
      )}
    </div>
  );
}