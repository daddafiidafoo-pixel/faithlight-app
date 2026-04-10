import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguageStore } from '@/components/languageStore';
import { Heart, Plus, X, Check, Loader2, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UI = {
  en: {
    title: 'Community Prayer Wall',
    subtitle: 'Lift each other up in prayer',
    post: 'Share a Prayer Request',
    placeholder: 'Share what you need prayer for...',
    namePlaceholder: 'Your name (or leave blank to be anonymous)',
    submit: 'Post Request',
    cancel: 'Cancel',
    prayedFor: 'Prayed',
    praying: 'people praying',
    markPrayed: 'I Prayed',
    anonymous: 'Anonymous',
    noRequests: 'Be the first to share a prayer request.',
    loginPrompt: 'Sign in to post prayer requests',
    loading: 'Loading prayers...',
    justNow: 'just now',
    categories: ['health', 'family', 'faith', 'work', 'relationships', 'gratitude', 'other'],
  },
  om: {
    title: 'Bakka Kadhata Waldaa',
    subtitle: 'Wal kadhannaan jabaadhu',
    post: 'Kadhata Qoodi',
    placeholder: 'Kadhata barbaaddu barreessi...',
    namePlaceholder: 'Maqaa kee (yoo dhiifte maqaa dhabsiisuun ni danda\'ama)',
    submit: 'Maxxansi',
    cancel: 'Haqii',
    prayedFor: 'Kadhatame',
    praying: 'namni kadhataa jiru',
    markPrayed: 'Nan Kadhadhe',
    anonymous: 'Maqaa Dhabsiisuun',
    noRequests: 'Kadhata jalqaba ta\'i.',
    loginPrompt: 'Seenuu kadhataaf maxxansi',
    loading: 'Kadhatoonni fe\'amaa jiru...',
    justNow: 'amma amma',
    categories: ['fayyaa', 'maatii', 'amantii', 'hojii', 'walitti dhufeenya', 'galata', 'kan biroo'],
  },
  am: {
    title: 'የማህበረሰብ ጸሎት ግድግዳ',
    subtitle: 'እርስ በርሳችን ጸሎት እናቅርብ',
    post: 'የጸሎት ጥያቄ ያካፍሉ',
    placeholder: 'ጸሎት የሚፈልጉበትን ያጋሩ...',
    namePlaceholder: 'ስምዎ (ወይም ስም-አልባ ለመሆን ባዶ ያስቀምጡ)',
    submit: 'ጥያቄ ይለጥፉ',
    cancel: 'ሰርዝ',
    prayedFor: 'ጸለይኩ',
    praying: 'ሰዎች ጸልዮዋል',
    markPrayed: 'ጸለይኩ',
    anonymous: 'ስም-አልባ',
    noRequests: 'የጸሎት ጥያቄ ለማቅረብ ቀዳሚ ይሁኑ።',
    loginPrompt: 'ጸሎት ለመለጠፍ ይግቡ',
    loading: 'ጸሎቶች እየተጫኑ ነው...',
    justNow: 'አሁን',
    categories: ['ጤና', 'ቤተሰብ', 'እምነት', 'ሥራ', 'ግንኙነቶች', 'ምስጋና', 'ሌላ'],
  },
};

const getL = (lang) => UI[lang] || UI.en;

function timeAgo(dateStr, lang) {
  const L = getL(lang);
  if (!dateStr) return L.justNow;
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return L.justNow;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function PrayerCard({ post, currentUserEmail, lang, onPray }) {
  const L = getL(lang);
  const hasPrayed = post.prayedByEmails?.includes(currentUserEmail);
  const count = post.prayedCount || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">
            {post.isAnonymous || !post.authorName ? L.anonymous : post.authorName}
          </p>
          <span className="text-xs text-gray-400">{timeAgo(post.created_date, lang)}</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600 font-medium capitalize shrink-0">
          {post.category}
        </span>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-4">{post.body}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Hand className="w-3 h-3" />
          {count} {L.praying}
        </span>
        <button
          onClick={() => onPray(post)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
            hasPrayed
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {hasPrayed ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
          {hasPrayed ? L.prayedFor : L.markPrayed}
        </button>
      </div>
    </motion.div>
  );
}

export default function CommunityPrayerWallPage() {
  const { user, isAuthenticated } = useAuth();
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const L = getL(uiLanguage);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formBody, setFormBody] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('other');
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.CommunityPrayerPost.list('-created_date', 50);
      setPosts(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const handlePray = async (post) => {
    if (!isAuthenticated || !user?.email) return;
    const alreadyPrayed = post.prayedByEmails?.includes(user.email);
    const updatedEmails = alreadyPrayed
      ? post.prayedByEmails.filter(e => e !== user.email)
      : [...(post.prayedByEmails || []), user.email];
    const updatedCount = alreadyPrayed
      ? Math.max(0, (post.prayedCount || 1) - 1)
      : (post.prayedCount || 0) + 1;

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === post.id
        ? { ...p, prayedByEmails: updatedEmails, prayedCount: updatedCount }
        : p
    ));

    await base44.entities.CommunityPrayerPost.update(post.id, {
      prayedByEmails: updatedEmails,
      prayedCount: updatedCount,
    }).catch(() => loadPosts());
  };

  const handleSubmit = async () => {
    if (!formBody.trim() || submitting) return;
    setSubmitting(true);
    try {
      await base44.entities.CommunityPrayerPost.create({
        authorEmail: user?.email || 'anonymous',
        authorName: formName.trim() || '',
        body: formBody.trim(),
        title: formBody.trim().slice(0, 60),
        category: formCategory,
        isAnonymous: !formName.trim(),
        prayedByEmails: [],
        prayedCount: 0,
        status: 'active',
      });
      setFormBody('');
      setFormName('');
      setFormCategory('other');
      setShowForm(false);
      loadPosts();
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F6F1' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">{L.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{L.subtitle}</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 pb-28">
        {/* Post button */}
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-5 flex items-center gap-3 bg-purple-600 text-white rounded-2xl px-5 py-4 font-semibold text-sm hover:bg-purple-700 transition-colors min-h-[52px]"
        >
          <Plus className="w-5 h-5" />
          {L.post}
        </button>

        {/* Post form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl p-4 shadow-sm mb-5"
            >
              <textarea
                value={formBody}
                onChange={e => setFormBody(e.target.value)}
                placeholder={L.placeholder}
                rows={4}
                className="w-full text-sm p-3 rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <input
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder={L.namePlaceholder}
                className="w-full mt-2 text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full mt-2 text-sm p-3 rounded-xl border border-gray-200 focus:outline-none bg-white"
              >
                {['health','family','faith','work','relationships','gratitude','other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 min-h-[44px]">
                  {L.cancel}
                </button>
                <button onClick={handleSubmit} disabled={!formBody.trim() || submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-purple-600 text-white disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {L.submit}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span className="ml-2 text-sm text-gray-400">{L.loading}</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">{L.noRequests}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <PrayerCard
                key={post.id}
                post={post}
                currentUserEmail={user?.email}
                lang={uiLanguage}
                onPray={handlePray}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}