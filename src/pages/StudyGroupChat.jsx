import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, BookOpen, Heart, MessageSquare, Users, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TranslationFeedbackBubble from '@/components/chat/TranslationFeedbackBubble';
import OfflineStatusBar from '@/components/offline/OfflineStatusBar';

const MESSAGE_TYPES = ['message', 'verse', 'prayer', 'note'];

const TYPE_STYLES = {
  message: { bg: 'bg-white', border: 'border-gray-100', label: null },
  verse: { bg: 'bg-indigo-50', border: 'border-indigo-200', label: '📖 Verse' },
  prayer: { bg: 'bg-rose-50', border: 'border-rose-200', label: '🙏 Prayer Request' },
  note: { bg: 'bg-amber-50', border: 'border-amber-200', label: '📝 Study Note' },
};

function MessageBubble({ msg, isOwn }) {
  const style = TYPE_STYLES[msg.messageType] || TYPE_STYLES.message;
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 border shadow-sm ${style.bg} ${style.border}`}>
        {!isOwn && (
          <p className="text-xs font-semibold text-indigo-600 mb-1">{msg.authorName || 'Member'}</p>
        )}
        {style.label && (
          <p className="text-xs font-semibold text-gray-500 mb-1">{style.label}</p>
        )}
        {msg.verseReference && (
          <p className="text-xs text-indigo-500 font-medium mb-1">📍 {msg.verseReference}</p>
        )}
        <p className="text-sm text-gray-800 leading-relaxed">{msg.content}</p>
        <p className="text-[10px] text-gray-400 mt-1 text-right">
          {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        {msg.messageType === 'verse' && msg.verseReference && (
          <TranslationFeedbackBubble
            verseReference={msg.verseReference}
            originalText={msg.content}
            translatedText={msg.content}
            language="en"
          />
        )}
      </div>
    </div>
  );
}

function PostTypeSelector({ selected, onChange }) {
  const icons = { message: MessageSquare, verse: BookOpen, prayer: Heart, note: Plus };
  return (
    <div className="flex gap-1.5 mb-2">
      {MESSAGE_TYPES.map(type => {
        const Icon = icons[type];
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${selected === type ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Icon className="w-3 h-3" />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

export default function StudyGroupChat() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [verseRef, setVerseRef] = useState('');
  const [msgType, setMsgType] = useState('message');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (!u) { setLoading(false); return; }
        const g = await base44.entities.StudyGroup.filter({ memberEmails: u.email });
        setGroups(g || []);
        if (g?.length > 0) setSelectedGroup(g[0]);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Load messages for selected group + real-time subscription
  useEffect(() => {
    if (!selectedGroup) return;
    let unsubscribe;

    const loadMessages = async () => {
      const msgs = await base44.entities.StudyGroupPost.filter(
        { groupId: selectedGroup.id },
        'created_date',
        100
      );
      setMessages(msgs || []);
    };

    loadMessages();

    unsubscribe = base44.entities.StudyGroupPost.subscribe((event) => {
      if (event.data?.groupId !== selectedGroup.id) return;
      if (event.type === 'create') {
        setMessages(prev => [...prev, event.data]);
      } else if (event.type === 'delete') {
        setMessages(prev => prev.filter(m => m.id !== event.id));
      }
    });

    return () => unsubscribe?.();
  }, [selectedGroup]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!content.trim() || !selectedGroup || !user) return;
    setSending(true);
    try {
      await base44.entities.StudyGroupPost.create({
        groupId: selectedGroup.id,
        discussionId: selectedGroup.id, // top-level group feed
        authorEmail: user.email,
        authorName: user.full_name || user.email.split('@')[0],
        content: content.trim(),
        messageType: msgType,
        verseReference: msgType === 'verse' ? verseRef.trim() : undefined,
        likes: 0,
        likedByEmails: [],
      });
      setContent('');
      setVerseRef('');
      setMsgType('message');
    } catch (e) {
      console.error('Send error:', e);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <Users className="w-12 h-12 text-indigo-300" />
        <h2 className="text-xl font-bold text-gray-800">Sign in to chat</h2>
        <button onClick={() => base44.auth.redirectToLogin()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm">Sign In</button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <Users className="w-12 h-12 text-indigo-300" />
        <h2 className="text-xl font-bold text-gray-800">No study groups yet</h2>
        <p className="text-gray-500 text-sm">Join or create a study group to start chatting.</p>
        <button onClick={() => navigate('/StudyGroups')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm">Browse Groups</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Offline status */}
      <div className="px-4 pt-2 shrink-0">
        <OfflineStatusBar />
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 truncate">{selectedGroup?.name}</h1>
          <p className="text-xs text-gray-400">{selectedGroup?.memberEmails?.length || 0} members</p>
        </div>
        {/* Group switcher */}
        {groups.length > 1 && (
          <select
            value={selectedGroup?.id || ''}
            onChange={e => setSelectedGroup(groups.find(g => g.id === e.target.value))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700"
          >
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
            <MessageSquare className="w-10 h-10 text-gray-300" />
            <p className="text-gray-500 text-sm">No messages yet. Start the discussion!</p>
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} isOwn={msg.authorEmail === user.email} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-4 shrink-0">
        <PostTypeSelector selected={msgType} onChange={setMsgType} />
        {msgType === 'verse' && (
          <input
            type="text"
            value={verseRef}
            onChange={e => setVerseRef(e.target.value)}
            placeholder="Verse reference (e.g. John 3:16)"
            className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              msgType === 'verse' ? 'Share this verse...' :
              msgType === 'prayer' ? 'Share a prayer request...' :
              msgType === 'note' ? 'Add a study note...' :
              'Type a message...'
            }
            rows={2}
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={sendMessage}
            disabled={!content.trim() || sending}
            className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}