import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, CheckCircle2, Heart, MessageCircle, Send, Copy, Users, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

function PrayerCard({ prayer, user, onMarkAnswered, onAddComment }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [markingAnswered, setMarkingAnswered] = useState(false);
  const [answeredNote, setAnsweredNote] = useState('');

  const hasPrayed = (prayer.praying_user_ids || []).includes(user?.id);

  const loadComments = async () => {
    if (loadingComments || comments.length > 0) return;
    setLoadingComments(true);
    const data = await base44.entities.CirclePrayerComment.filter({ prayer_id: prayer.id }, 'created_date');
    setComments(data);
    setLoadingComments(false);
  };

  const handleToggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(v => !v);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const c = await base44.entities.CirclePrayerComment.create({
      prayer_id: prayer.id,
      circle_id: prayer.circle_id,
      author_id: user.id,
      author_name: user.full_name,
      content: commentText.trim(),
      is_encouragement: true,
    });
    setComments(prev => [...prev, c]);
    setCommentText('');
    onAddComment(prayer.id);
  };

  const statusBg = prayer.status === 'answered' ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white';

  return (
    <div className={`rounded-2xl border shadow-sm p-4 ${statusBg}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
              {(prayer.author_name || 'U').charAt(0).toUpperCase()}
            </span>
            <span className="text-sm font-semibold text-gray-800">{prayer.author_name || 'Someone'}</span>
            <span className="text-xs text-gray-400">{format(new Date(prayer.created_date || Date.now()), 'MMM d')}</span>
            {prayer.status === 'answered' && (
              <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Answered!
              </span>
            )}
          </div>
          {prayer.title && <h4 className="font-bold text-gray-900 text-sm mt-1.5">{prayer.title}</h4>}
        </div>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed mb-3"
        dangerouslySetInnerHTML={{ __html: prayer.content?.replace(/\n/g, '<br/>') }} />

      {prayer.answered_note && (
        <div className="bg-green-100 rounded-xl px-3 py-2 mb-3 text-sm text-green-800">
          <span className="font-semibold">🎉 Answered: </span>{prayer.answered_note}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Encourage
        </button>

        {prayer.status !== 'answered' && user?.id === prayer.author_id && !markingAnswered && (
          <button
            onClick={() => setMarkingAnswered(true)}
            className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-semibold transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Answered
          </button>
        )}
      </div>

      {/* Mark answered form */}
      {markingAnswered && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <Input
            placeholder="How was this prayer answered? (optional)"
            value={answeredNote}
            onChange={e => setAnsweredNote(e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => { onMarkAnswered(prayer, answeredNote); setMarkingAnswered(false); }}
              className="bg-green-600 hover:bg-green-700 text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm
            </Button>
            <Button size="sm" variant="outline" onClick={() => setMarkingAnswered(false)} className="text-xs">Cancel</Button>
          </div>
        </div>
      )}

      {/* Comments */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          {loadingComments && <div className="h-8 bg-gray-100 animate-pulse rounded-lg" />}
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0 mt-0.5">
                {(c.author_name || 'U').charAt(0).toUpperCase()}
              </span>
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-xs font-semibold text-gray-700">{c.author_name} </span>
                <span className="text-xs text-gray-600">{c.content}</span>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="Encourage in prayer..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleComment())}
              className="flex-1 text-sm"
            />
            <Button size="sm" onClick={handleComment} disabled={!commentText.trim()} className="bg-indigo-600 hover:bg-indigo-700 px-3">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CircleDetailView({ circle, user, onBack }) {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrayer, setNewPrayer] = useState({ title: '', content: '' });
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.CirclePrayer.filter({ circle_id: circle.id }, '-created_date');
      setPrayers(data);
      setLoading(false);
    };
    load();
  }, [circle.id]);

  const handleAddPrayer = async () => {
    if (!newPrayer.content.trim()) return;
    const created = await base44.entities.CirclePrayer.create({
      circle_id: circle.id,
      author_id: user.id,
      author_name: user.full_name,
      title: newPrayer.title,
      content: newPrayer.content,
      praying_user_ids: [],
    });
    setPrayers(prev => [created, ...prev]);
    setNewPrayer({ title: '', content: '' });
    setShowAddForm(false);
  };

  const handleMarkAnswered = async (prayer, note) => {
    const updated = await base44.entities.CirclePrayer.update(prayer.id, {
      status: 'answered',
      answered_note: note,
      answered_date: new Date().toISOString(),
    });
    setPrayers(prev => prev.map(p => p.id === prayer.id ? updated : p));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(circle.invite_code);
    setCopiedCode(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
              {circle.cover_emoji || '🙏'}
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{circle.name}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {(circle.member_ids || []).length} members
                </span>
                <button onClick={copyCode} className="text-xs text-indigo-600 font-mono flex items-center gap-1 hover:underline">
                  #{circle.invite_code} {copiedCode ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(v => !v)} size="sm" className="bg-indigo-700 hover:bg-indigo-800 gap-1">
            <Plus className="w-3.5 h-3.5" /> Share
          </Button>
        </div>

        {/* Add prayer form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 mb-5 space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">Share a Prayer Request</h3>
            <Input placeholder="Title (optional)" value={newPrayer.title} onChange={e => setNewPrayer(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Write your prayer request..." value={newPrayer.content} onChange={e => setNewPrayer(f => ({ ...f, content: e.target.value }))} className="min-h-[100px]" />
            <div className="flex gap-2">
              <Button onClick={handleAddPrayer} disabled={!newPrayer.content.trim()} className="bg-indigo-700 hover:bg-indigo-800 flex-1 text-sm">
                Share with Circle
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}><X className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Prayers */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />)}</div>
        ) : prayers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Heart className="w-12 h-12 mx-auto mb-3 text-indigo-200" />
            <p className="font-medium text-gray-600">No prayers shared yet</p>
            <p className="text-sm mt-1">Be the first to share a prayer request</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prayers.map(prayer => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                user={user}
                onMarkAnswered={handleMarkAnswered}
                onAddComment={(pid) => {
                  setPrayers(prev => prev.map(p => p.id === pid ? { ...p, _commentCount: (p._commentCount || 0) + 1 } : p));
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}