import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MessageSquare, Plus, ThumbsUp, Search, BookOpen, HelpCircle, Loader2, ChevronRight, Users, Tag, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const CATEGORIES = ['General', 'Old Testament', 'New Testament', 'Theology', 'Prophecy', 'Prayer', 'Apologetics', 'Life Application'];

function NewTopicModal({ user, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [type, setType] = useState('discussion');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    await base44.entities.ForumTopic.create({
      title: title.trim(),
      content: body.trim(),
      category,
      type,
      author_id: user.id,
      author_name: user.full_name,
      reply_count: 0,
      upvotes: 0,
      status: 'open',
    });
    setSaving(false);
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Start a New Discussion</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            {['discussion', 'question'].map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}
              >
                {t === 'discussion' ? '💬 Discussion' : '❓ Question'}
              </button>
            ))}
          </div>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
            placeholder="Topic title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${category === c ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            placeholder="Share your thoughts, verse reference, or question..."
            value={body}
            onChange={e => setBody(e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button disabled={!title.trim() || !body.trim() || saving} onClick={handleSubmit} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TopicCard({ topic, onClick }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className="text-xs" style={{ borderColor: '#C7D2FE', color: '#4338CA' }}>
              {topic.category || 'General'}
            </Badge>
            {topic.type === 'question' && (
              <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">❓ Q&A</Badge>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{topic.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2">{topic.content}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{topic.author_name || 'Anonymous'}</span>
        <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{topic.reply_count || 0} replies</span>
        <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" />{topic.upvotes || 0}</span>
      </div>
    </div>
  );
}

function TopicDetail({ topic, user, onBack, qc }) {
  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ['forumReplies', topic.id],
    queryFn: () => base44.entities.ForumReply.filter({ topic_id: topic.id }, 'created_date', 100),
  });

  const postReply = async () => {
    if (!reply.trim() || !user) return;
    setPosting(true);
    await base44.entities.ForumReply.create({
      topic_id: topic.id,
      author_id: user.id,
      author_name: user.full_name,
      content: reply.trim(),
      upvotes: 0,
    });
    await base44.entities.ForumTopic.update(topic.id, { reply_count: (topic.reply_count || 0) + 1 });
    setReply('');
    setPosting(false);
    qc.invalidateQueries(['forumReplies', topic.id]);
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-indigo-600 mb-4 hover:underline">
        ← Back to forum
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="flex gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className="text-xs">{topic.category}</Badge>
          {topic.type === 'question' && <Badge className="text-xs bg-amber-100 text-amber-700">❓ Question</Badge>}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">{topic.title}</h2>
        <p className="text-gray-700 text-sm leading-relaxed">{topic.content}</p>
        <p className="text-xs text-gray-400 mt-3">Posted by {topic.author_name} · {new Date(topic.created_date).toLocaleDateString()}</p>
      </div>

      <h3 className="font-semibold text-gray-800 mb-3 text-sm">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h3>

      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
      ) : (
        <div className="space-y-3 mb-6">
          {replies.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-700">{r.author_name}</span>
                <span className="text-xs text-gray-400">{new Date(r.created_date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Add your reply</p>
          <Textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Share your thoughts or answer..."
            className="mb-3 text-sm"
          />
          <Button
            onClick={postReply}
            disabled={!reply.trim() || posting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post Reply
          </Button>
        </div>
      ) : (
        <p className="text-sm text-center text-gray-500 py-4">
          <button onClick={() => base44.auth.redirectToLogin()} className="text-indigo-600 hover:underline font-medium">Sign in</button> to join the discussion
        </p>
      )}
    </div>
  );
}

export default function BibleForum() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: topics = [], isLoading, refetch } = useQuery({
    queryKey: ['forumTopics', activeTab, selectedCategory],
    queryFn: () => {
      const filter = {};
      if (activeTab === 'qa') filter.type = 'question';
      if (selectedCategory) filter.category = selectedCategory;
      return base44.entities.ForumTopic.filter(filter, '-created_date', 50);
    },
  });

  const filtered = topics.filter(t =>
    !search || t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.content?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedTopic) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <TopicDetail topic={selectedTopic} user={user} onBack={() => setSelectedTopic(null)} qc={qc} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {showNew && user && (
        <NewTopicModal user={user} onClose={() => setShowNew(false)} onCreated={refetch} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Bible Discussion Forum</h1>
          <p className="text-gray-500 text-sm">Ask questions, discuss verses, and explore theology together</p>
        </div>
        {user ? (
          <Button onClick={() => setShowNew(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="w-4 h-4" /> New Topic
          </Button>
        ) : (
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-600 text-white gap-2">
            Sign In to Post
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all"><MessageSquare className="w-4 h-4 mr-1" />All Topics</TabsTrigger>
          <TabsTrigger value="qa"><HelpCircle className="w-4 h-4 mr-1" />Q&A</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search + Category Filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-400 bg-white"
            placeholder="Search topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${!selectedCategory ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'}`}
          >
            All
          </button>
          {CATEGORIES.slice(0, 5).map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(selectedCategory === c ? null : c)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${selectedCategory === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Topics */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No topics yet</p>
          <p className="text-sm mt-1">Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(topic => (
            <TopicCard key={topic.id} topic={topic} onClick={() => setSelectedTopic(topic)} />
          ))}
        </div>
      )}
    </div>
  );
}