import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, BookOpen, Heart, Plus, Send, CheckCircle, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PRESET_CHALLENGES = [
  { title: 'Read Psalms in 30 Days', icon: '📖', category: 'reading',  goal_days: 30, description: 'Journey through all 150 Psalms together, one chapter at a time.' },
  { title: '21-Day Prayer Challenge', icon: '🙏', category: 'prayer',  goal_days: 21, description: 'Commit to 10 minutes of prayer every morning for 21 days.' },
  { title: 'New Testament in 90 Days', icon: '✝️', category: 'reading', goal_days: 90, description: 'Read through the entire New Testament as a community.' },
  { title: 'Memorize 7 Verses in 7 Days', icon: '🧠', category: 'memory', goal_days: 7, description: 'Hide God\'s word in your heart — one verse per day for a week.' },
  { title: 'Proverbs Daily Wisdom', icon: '💡', category: 'reading', goal_days: 31, description: 'One chapter of Proverbs each day for a month of wisdom.' },
];

function ChallengeCard({ challenge, user, onJoin, onPost }) {
  const [joined, setJoined] = useState(false);
  const [memberRecord, setMemberRecord] = useState(null);
  const [showFeed, setShowFeed] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [progress, setProgress] = useState(0);

  const memberCount = challenge.member_count || 0;
  const progressPct = Math.min(100, Math.round((challenge.days_completed || 0) / (challenge.goal_days || 30) * 100));

  useEffect(() => {
    if (!user) return;
    base44.entities.CommunityChallengeMember.filter({ challenge_id: challenge.id, user_id: user.id }, null, 1)
      .then(r => {
        if (r?.[0]) { setJoined(true); setMemberRecord(r[0]); setProgress(r[0].days_completed || 0); }
      }).catch(() => {});
  }, [challenge.id, user?.id]);

  const handleJoin = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    const record = await base44.entities.CommunityChallengeMember.create({
      challenge_id: challenge.id,
      user_id: user.id,
      days_completed: 0,
      joined_date: new Date().toISOString(),
    });
    await base44.entities.CommunityChallenge.update(challenge.id, { member_count: memberCount + 1 });
    setJoined(true);
    setMemberRecord(record);
    toast.success('Joined challenge! 🎉');
    onJoin?.();
  };

  const handleCheckIn = async () => {
    if (!memberRecord) return;
    const newDays = progress + 1;
    await base44.entities.CommunityChallengeMember.update(memberRecord.id, { days_completed: newDays });
    setProgress(newDays);
    toast.success(`Day ${newDays} checked in! ✅`);
  };

  const loadPosts = async () => {
    setLoadingPosts(true);
    const data = await base44.entities.CommunityPost.filter({ group_id: challenge.id }, '-created_date', 20).catch(() => []);
    setPosts(data);
    setLoadingPosts(false);
  };

  const toggleFeed = () => {
    if (!showFeed) loadPosts();
    setShowFeed(v => !v);
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    const post = await base44.entities.CommunityPost.create({
      group_id: challenge.id,
      user_id: user.id,
      user_name: user.full_name || 'Anonymous',
      content: newPost.trim(),
      created_date: new Date().toISOString(),
    });
    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setPosting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white', borderRadius: 20,
        border: '1px solid #F3F4F6',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.06)',
        overflow: 'hidden', marginBottom: 16,
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>{challenge.icon || '🎯'}</span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{challenge.title}</h3>
              <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{challenge.goal_days} days · {memberCount} joined</p>
            </div>
          </div>
          {joined ? (
            <button
              onClick={handleCheckIn}
              style={{
                background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0',
                borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              ✓ Check In
            </button>
          ) : (
            <button
              onClick={handleJoin}
              style={{
                background: '#6C5CE7', color: 'white', border: 'none',
                borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Join
            </button>
          )}
        </div>

        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px', lineHeight: '20px' }}>{challenge.description}</p>

        {/* Group progress bar */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>Community Progress</span>
            <span style={{ fontSize: 11, color: '#6C5CE7', fontWeight: 700 }}>{progressPct}%</span>
          </div>
          <div style={{ height: 8, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #6C5CE7, #8E7CFF)', borderRadius: 99 }}
            />
          </div>
        </div>

        {/* My progress (if joined) */}
        {joined && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>My Progress</span>
              <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>{progress}/{challenge.goal_days} days</span>
            </div>
            <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#10B981', borderRadius: 99, width: `${Math.min(100, (progress / challenge.goal_days) * 100)}%`, transition: 'width 0.4s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Discussion toggle */}
      <div style={{ borderTop: '1px solid #F9FAFB' }}>
        <button
          onClick={toggleFeed}
          style={{
            width: '100%', padding: '12px 20px', background: 'none', border: 'none',
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            color: '#6B7280', fontSize: 13, fontWeight: 600,
          }}
        >
          <MessageCircle size={14} />
          Discussion {posts.length > 0 ? `(${posts.length})` : ''}
          <span style={{ marginLeft: 'auto', fontSize: 12 }}>{showFeed ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {showFeed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 16px 16px' }}>
                {/* Post input */}
                {user && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                      value={newPost}
                      onChange={e => setNewPost(e.target.value)}
                      placeholder="Share an insight…"
                      onKeyDown={e => e.key === 'Enter' && handlePost()}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 10,
                        border: '1px solid #E5E7EB', fontSize: 13, outline: 'none',
                      }}
                    />
                    <button
                      onClick={handlePost}
                      disabled={posting || !newPost.trim()}
                      style={{
                        background: '#6C5CE7', color: 'white', border: 'none',
                        borderRadius: 10, width: 36, height: 36, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, opacity: posting || !newPost.trim() ? 0.5 : 1,
                      }}
                    >
                      <Send size={14} />
                    </button>
                  </div>
                )}

                {loadingPosts ? (
                  <div style={{ textAlign: 'center', padding: 12 }}><Loader2 size={16} className="animate-spin text-indigo-400 mx-auto" /></div>
                ) : posts.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '8px 0' }}>No posts yet — share the first insight!</p>
                ) : (
                  <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {posts.map(post => (
                      <div key={post.id} style={{ background: '#F9FAFB', borderRadius: 12, padding: '10px 12px' }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '0 0 3px' }}>{post.user_name || 'Community Member'}</p>
                        <p style={{ fontSize: 13, color: '#4B5563', margin: 0, lineHeight: '18px' }}>{post.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function CommunityChallenges() {
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);

      let existing = await base44.entities.CommunityChallenge.list('-created_date', 20).catch(() => []);

      // Seed preset challenges if none exist
      if (existing.length === 0) {
        const created = await Promise.all(
          PRESET_CHALLENGES.map(c => base44.entities.CommunityChallenge.create({ ...c, member_count: 0, days_completed: 0, is_active: true }))
        );
        existing = created;
      }

      setChallenges(existing);
      setLoading(false);
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">🏆 Community Challenges</h1>
          <p className="text-gray-500 text-sm mt-1">Join shared spiritual goals and grow together</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          challenges.map(c => (
            <ChallengeCard key={c.id} challenge={c} user={user} onJoin={() => setChallenges(prev => prev.map(x => x.id === c.id ? { ...x, member_count: (x.member_count || 0) + 1 } : x))} />
          ))
        )}

        {!user && (
          <div className="mt-6 text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm mb-4">Sign in to join challenges and track your progress</p>
            <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-600 hover:bg-indigo-700">
              Sign In to Join
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}