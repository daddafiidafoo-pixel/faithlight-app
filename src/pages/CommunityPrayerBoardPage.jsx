import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, MessageCircle, Check, Plus, X, Send, Shield, Bookmark, BookmarkCheck, User, Reply, BarChart2, Map as MapIcon, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { saveItem, unsaveItem, isSaved } from '@/pages/Saved';
import { useLanguageStore } from '@/stores/languageStore';
import { t } from '@/lib/i18n';
import { useI18n } from '@/components/I18nProvider';
import { AccessibleSelect } from '@/components/ui/accessible-select';
import PullToRefresh from '@/components/PullToRefresh';
import VerseBadge from '@/components/VerseBadge';
import BibleVerseSearchModal from '@/components/bible/BibleVerseSearchModal';
import AttachedVerseCard from '@/components/bible/AttachedVerseCard';
import PrayerNotificationCenter, { addPrayerNotification } from '@/components/prayer/PrayerNotificationCenter';
import PrayerRichEditor, { stripHtml } from '@/components/prayer/PrayerRichEditor';
import PrayerCommunityDashboard from '@/components/prayer/PrayerCommunityDashboard';
import PraiseReports from '@/components/prayer/PraiseReports';
import PrayerCircles from '@/components/prayer/PrayerCircles';
import PrayerReminder, { PrayerReminderChecker } from '@/components/prayer/PrayerReminder';
import PrayerMapView from '@/components/prayer/PrayerMapView';
import PrayerRequestForm from '@/components/prayer/PrayerRequestForm';
import PrayerStreakDisplay from '@/components/gamification/PrayerStreakDisplay';
import MilestoneAnimation from '@/components/gamification/MilestoneAnimation';
import { updatePrayerStreak, getMilestones, getNextMilestone } from '@/lib/prayerStreakService';
import CommunityImpactDashboard from '@/components/prayer/CommunityImpactDashboard';
import DailyPrayerReminder from '@/components/notifications/DailyPrayerReminder';
import VoicePrayerRecorder from '@/components/prayer/VoicePrayerRecorder';
import { useAudioPlayerStore } from '@/components/audio/useAudioPlayerStore';

const CATEGORY_KEYS = ['all', 'health', 'family', 'faith', 'work', 'relationships', 'gratitude', 'other'];

// Voice Prayer Player Component
function VoicePrayerPlayer({ audioUrl, title, uiLang }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const loadAudio = useAudioPlayerStore(s => s.loadTrack);

  const handlePlay = async () => {
    try {
      setIsPlaying(true);
      await loadAudio({
        url: audioUrl,
        title: title || '🎙️ Voice Prayer',
        artist: 'Community Prayer',
      });
    } catch {
      toast.error('Unable to play audio');
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3 p-2.5 bg-rose-50 rounded-lg border border-rose-100">
      <button
        onClick={handlePlay}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
        aria-label="Play voice prayer"
      >
        <span className="text-xs font-bold">▶</span>
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700">Voice Prayer</p>
        <p className="text-xs text-gray-500">Click to listen</p>
      </div>
    </div>
  );
}

// Get category labels using translation keys
const getCategoryLabel = (key, uiLang) => {
  return t(uiLang, `communityPrayerBoard.categories.${key}`) || key;
};

// eslint-disable-next-line no-unused-vars
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getComments(postId) {
  return JSON.parse(localStorage.getItem(`fl_prayer_comments_${postId}`) || '[]');
}
function setComments(postId, comments) {
  localStorage.setItem(`fl_prayer_comments_${postId}`, JSON.stringify(comments));
}
function getPrayerHistory(email) {
  return JSON.parse(localStorage.getItem(`fl_prayer_history_${email}`) || '[]');
}
function addToPrayerHistory(email, postTitle) {
  const history = getPrayerHistory(email);
  const entry = { title: postTitle, prayedAt: new Date().toISOString() };
  const updated = [entry, ...history].slice(0, 50);
  localStorage.setItem(`fl_prayer_history_${email}`, JSON.stringify(updated));
}

// ───────── Prayer History Panel ─────────
function PrayerHistoryPanel({ email, onClose, uiLang }) {
  const history = getPrayerHistory(email);
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-gray-900">{t(uiLang, 'communityPrayerBoard.historyTitle')}</h2>
          <button onClick={onClose} aria-label={t(uiLang, 'common.close')} className="min-h-[44px] min-w-[44px] p-0 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={18} /></button>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
          {history.length === 0 ? (
            <p className="text-center text-gray-400 py-8">{t(uiLang, 'communityPrayerBoard.historyEmpty')}</p>
          ) : (
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Heart size={14} className="text-rose-400 flex-shrink-0" fill="currentColor" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{h.title}</p>
                    <p className="text-xs text-gray-400">{timeAgo(h.prayedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ───────── Direct Message Panel ─────────
function DMPanel({ fromEmail, toEmail, toName, onClose, uiLang }) {
  const [messages, setMessages] = useState(() => {
    const key = `fl_dm_${[fromEmail, toEmail].sort().join('_')}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  });
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    const msg = { from: fromEmail, text: text.trim(), sentAt: new Date().toISOString() };
    const key = `fl_dm_${[fromEmail, toEmail].sort().join('_')}`;
    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    setText('');
    toast.success(t(uiLang, 'communityPrayerBoard.toastMessageSent'));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
              {toName?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{toName}</p>
              <p className="text-xs text-gray-400">{t(uiLang, 'communityPrayerBoard.spiritualEncouragement')}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label={t(uiLang, 'common.close')} className="min-h-[44px] min-w-[44px] p-0 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">{t(uiLang, 'communityPrayerBoard.sendWordOfEncouragement')}</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === fromEmail ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                m.from === fromEmail ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={t(uiLang, 'communityPrayerBoard.typeMessage')}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm min-h-[44px]"
          />
          <button onClick={send} aria-label={t(uiLang, 'common.send')} className="min-h-[44px] min-w-[44px] px-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────── Post Card ─────────
function PostCard({ post, currentEmail, onPray, onAnswer, uiLang }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [comments, setCommentsState] = useState(() => getComments(post.id));
  const [showDM, setShowDM] = useState(false);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [dbVerse, setDbVerse] = useState(null);

  const hasPrayed = post.prayedByEmails?.includes(currentEmail);
  const displayName = post.isAnonymous ? 'Anonymous' : (post.authorName || post.authorEmail?.split('@')[0] || 'Someone');

  // Load attached verse from DB
  const loadAttachedVerse = useCallback(() => {
    base44.entities.AttachedVerse.filter({ parent_type: 'prayer_request', parent_id: post.id })
      .then(results => { if (results.length > 0) setDbVerse(results[0]); })
      .catch(() => {});
  }, [post.id]);

  useEffect(() => {
    loadAttachedVerse();
  }, [loadAttachedVerse]);

  const addComment = () => {
    const plain = stripHtml(commentText).trim();
    if (!plain) return;
    const c = {
      id: Date.now(),
      text: commentText,
      author: currentEmail || 'Anonymous',
      replyTo: replyTo ? replyTo.id : null,
      replyToAuthor: replyTo ? replyTo.author : null,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };
    const updated = [...comments, c];
    setCommentsState(updated);
    setComments(post.id, updated);
    setCommentText('');
    setReplyTo(null);
    toast.success(t(uiLang, 'communityPrayerBoard.toastEncouragementSent'));
    // Notify post author
    if (post.authorEmail && post.authorEmail !== currentEmail) {
      addPrayerNotification({
        forEmail: post.authorEmail,
        type: 'comment',
        message: `${currentEmail?.split('@')[0] || 'Someone'} left encouragement on your prayer: "${post.title}"`,
      });
    }
  };

  const likeComment = (commentId) => {
    if (!currentEmail) return;
    const updated = comments.map(c => {
      if (c.id !== commentId) return c;
      const likedBy = c.likedBy || [];
      const hasLiked = likedBy.includes(currentEmail);
      return {
        ...c,
        likedBy: hasLiked ? likedBy.filter(e => e !== currentEmail) : [...likedBy, currentEmail],
        likes: hasLiked ? (c.likes || 1) - 1 : (c.likes || 0) + 1,
      };
    });
    setCommentsState(updated);
    setComments(post.id, updated);
  };

  const topComments = comments.filter(c => !c.replyTo);
  const getReplies = (commentId) => comments.filter(c => c.replyTo === commentId);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${post.status === 'answered' ? 'border-green-200' : 'border-gray-100'}`}>
      {post.status === 'answered' && (
        <div className="bg-green-50 px-4 py-1.5 flex items-center gap-1.5">
          <Check size={12} className="text-green-600" />
          <span className="text-xs font-semibold text-green-700">{t(uiLang, 'communityPrayerBoard.prayerAnswered')}</span>
        </div>
      )}
      <div className="p-4">
        {/* Author row */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                {post.isAnonymous ? '?' : displayName[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-800">{displayName}</span>
              {post.isAnonymous && <Shield size={11} className="text-gray-400" />}
            </div>
            <span className="text-xs text-gray-400 ml-9">{timeAgo(post.created_date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{getCategoryLabel(post.category, uiLang) || post.category}</span>
            {/* DM button — only if not anonymous and not own post */}
            {!post.isAnonymous && post.authorEmail && currentEmail && post.authorEmail !== currentEmail && (
              <button
                onClick={() => setShowDM(true)}
                aria-label={t(uiLang, 'communityPrayerBoard.sendEncouragement')}
                className="min-h-[44px] min-w-[44px] rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors flex items-center justify-center"
              >
                <MessageCircle size={16} />
              </button>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm mb-1">{post.title}</h3>
        <div className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: post.body }} />

        {/* Audio player for voice prayers */}
        {post.audioUrl && (
          <VoicePrayerPlayer audioUrl={post.audioUrl} title={post.title} uiLang={uiLang} />
        )}

        {/* Actions */}
         <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 flex-wrap">
           <button
             onClick={() => {
               onPray(post);
               if (!hasPrayed && currentEmail) addToPrayerHistory(currentEmail, post.title);
             }}
             className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all min-h-[44px] ${
               hasPrayed ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-500'
             }`}
           >
             <Heart size={13} fill={hasPrayed ? 'currentColor' : 'none'} />
             {post.prayedCount || 0} {t(uiLang, 'communityPrayerBoard.prayingFor')}
           </button>

          <button
            onClick={() => setCommentsOpen(o => !o)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-all min-h-[44px]"
          >
            <Reply size={13} />
            {comments.length > 0 ? `${comments.length} ${t(uiLang, 'common.reply')}` : t(uiLang, 'common.reply')}
          </button>

          <button
            onClick={() => {
              const id = `prayer_${post.id}`;
              if (isSaved(id)) { unsaveItem(id); toast(t(uiLang, 'communityPrayerBoard.toastUnsaved')); }
              else { saveItem({ id, type: 'prayer', title: post.title, body: post.body }); toast.success(t(uiLang, 'communityPrayerBoard.toastSaved')); }
            }}
            className="ml-auto min-h-[44px] min-w-[44px] p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            aria-label={t(uiLang, 'common.bookmark')}
          >
            {isSaved(`prayer_${post.id}`)
              ? <BookmarkCheck size={15} className="text-indigo-600" />
              : <Bookmark size={15} className="text-gray-400" />}
          </button>

          {currentEmail && (
            <PrayerReminder postId={post.id} postTitle={post.title} />
          )}

          {currentEmail === post.authorEmail && post.status !== 'answered' && (
            <button
              onClick={() => onAnswer(post)}
              className="flex items-center gap-1 text-xs text-green-600 font-semibold hover:underline min-h-[44px] px-2"
            >
              <Check size={11} /> {t(uiLang, 'communityPrayerBoard.markAnswered')}
            </button>
          )}
        </div>

        {/* Attached verse from DB */}
        {dbVerse && <AttachedVerseCard verse={dbVerse} uiLang={uiLang} />}

        {/* Comments / replies */}
         {commentsOpen && (
           <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
            {topComments.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-1">{t(uiLang, 'communityPrayerBoard.beFirst')}</p>
            )}
            {topComments.map(c => (
              <div key={c.id}>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-500 flex-shrink-0">
                    {c.author[0]?.toUpperCase()}
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                    <p className="text-xs font-semibold text-gray-700">{c.author}</p>
                    <div className="text-xs text-gray-600 prose prose-xs max-w-none" dangerouslySetInnerHTML={{ __html: c.text }} />
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => likeComment(c.id)}
                        aria-label={`Like comment${(c.likedBy || []).includes(currentEmail) ? ', liked' : ''}`}
                        className={`min-h-[44px] min-w-[44px] flex items-center gap-0.5 text-xs transition-colors justify-center ${
                          (c.likedBy || []).includes(currentEmail) ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'
                        }`}
                      >
                        <Heart size={12} fill={(c.likedBy || []).includes(currentEmail) ? 'currentColor' : 'none'} />
                        {c.likes > 0 ? c.likes : ''}
                      </button>
                      <button
                        onClick={() => setReplyTo(c)}
                        aria-label={`Reply to ${c.author}`}
                        className="min-h-[44px] min-w-[44px] text-xs text-gray-400 hover:text-indigo-500 transition-colors flex items-center justify-center"
                      >
                        {t(uiLang, 'common.reply')}
                      </button>
                      <span className="text-xs text-gray-300">{timeAgo(c.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {/* Nested replies */}
                {getReplies(c.id).map(reply => (
                  <div key={reply.id} className="flex gap-2 ml-8 mt-1">
                    <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center text-xs font-bold text-purple-400 flex-shrink-0">
                      {reply.author[0]?.toUpperCase()}
                    </div>
                    <div className="bg-purple-50/50 rounded-xl px-3 py-2 flex-1">
                      <p className="text-xs font-semibold text-gray-700">{reply.author}</p>
                      <p className="text-xs text-gray-500 mb-0.5">↩ to {reply.replyToAuthor}</p>
                      <p className="text-xs text-gray-600">{reply.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Input */}
            {replyTo && (
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-lg">
                <p className="text-xs text-indigo-600 flex-1">{t(uiLang, 'communityPrayerBoard.replyingTo')} <strong>{replyTo.author}</strong></p>
                <button onClick={() => setReplyTo(null)} aria-label={t(uiLang, 'common.close')} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600"><X size={12} /></button>
              </div>
            )}
            <div className="mt-2 space-y-2">
              <PrayerRichEditor
                value={commentText}
                onChange={setCommentText}
                placeholder={replyTo
                  ? `Reply to ${replyTo.author}…`
                  : t(uiLang, 'communityPrayerBoard.addEncouragement')}
                minHeight={64}
              />
              <button onClick={addComment} className="w-full min-h-[44px] bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5">
                <Send size={13} /> {t(uiLang, 'communityPrayerBoard.sendEncouragement')}
              </button>
            </div>
            <button
              onClick={() => setShowVerseModal(true)}
              className="w-full min-h-[44px] mt-2 py-2 rounded-xl border border-indigo-200 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5"
            >
              📖 {t(uiLang, 'verse.addVerse') || (uiLang === 'om' ? 'Aayata Macaafa Qulqulluu Dabaluu' : 'Add Bible Verse')}
            </button>
          </div>
        )}
      </div>

      {showDM && currentEmail && (
        <DMPanel
          fromEmail={currentEmail}
          toEmail={post.authorEmail}
          toName={displayName}
          onClose={() => setShowDM(false)}
          uiLang={uiLang}
        />
      )}

      {showVerseModal && (
        <BibleVerseSearchModal
          uiLang={uiLang}
          parentType="prayer_request"
          parentId={post.id}
          currentEmail={currentEmail}
          onAttached={(record) => {
            setDbVerse(record);
            setShowVerseModal(false);
          }}
          onClose={() => setShowVerseModal(false)}
        />
      )}
      </div>
      );
      }

      // ───────── New Post Modal ─────────
function NewPostModal({ onClose, onPosted, currentEmail, currentName, uiLang }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('other');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showVerseSearch, setShowVerseSearch] = useState(false);
  const [attachedVerse, setAttachedVerse] = useState(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const submit = async () => {
     if (!title.trim() || !stripHtml(body).trim()) { toast.error(t(uiLang, 'communityPrayerBoard.toastFillFields')); return; }
     setSaving(true);
     try {
       const post = await base44.entities.CommunityPrayerPost.create({
         authorEmail: currentEmail || 'anonymous@faithlight.app',
         authorName: currentName || 'Anonymous',
         title: title.trim(),
         body: body.trim(),
         category: category.toLowerCase(),
         isAnonymous,
         prayedByEmails: [],
         prayedCount: 0,
         status: 'active',
         hasAttachedVerse: !!attachedVerse,
       });

       // Persist the attached verse — record from BibleVerseSearchModal (pre-filled fields)
       if (attachedVerse && post?.id) {
         // If it already has an id, it was saved with parentId=null — update its parent
         if (attachedVerse.id) {
           await base44.entities.AttachedVerse.update(attachedVerse.id, {
             parent_type: 'prayer_request',
             parent_id: post.id,
           });
         } else {
           await base44.entities.AttachedVerse.create({
             parent_type: 'prayer_request',
             parent_id: post.id,
             language_code: attachedVerse.language_code || 'en',
             bible_id: attachedVerse.bible_id || 'ENGESV',
             audio_fileset_id: attachedVerse.audio_fileset_id || null,
             book_id: attachedVerse.book_id || '',
             book_name: attachedVerse.book_name || '',
             chapter: attachedVerse.chapter || 1,
             verse_start: attachedVerse.verse_start || 1,
             verse_end: attachedVerse.verse_end || 1,
             reference_text: attachedVerse.reference_text || '',
             verse_text: attachedVerse.verse_text || '',
             created_by: currentEmail || '',
           });
         }
       }

       toast.success(t(uiLang, 'communityPrayerBoard.toastPosted'));
       onPosted(post);
       onClose();
     } catch { toast.error(t(uiLang, 'communityPrayerBoard.toastFailPost')); }
     finally { setSaving(false); }
   };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{t(uiLang, 'communityPrayerBoard.shareRequest')}</h2>
          <button onClick={onClose} aria-label={t(uiLang, 'common.close')} className="min-h-[44px] min-w-[44px] p-0 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={t(uiLang, 'communityPrayerBoard.titlePlaceholder')}
            className="w-full min-h-[44px] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <PrayerRichEditor
            value={body}
            onChange={setBody}
            placeholder={t(uiLang, 'communityPrayerBoard.bodyPlaceholder')}
            minHeight={96}
          />
          <div className="min-h-[44px]">
            <AccessibleSelect
              value={category}
              onValueChange={setCategory}
              label="Category"
              options={CATEGORY_KEYS.filter(c => c !== 'all').map(c => ({
                value: c,
                label: getCategoryLabel(c, uiLang),
              }))}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <button
              type="button"
              role="switch"
              aria-checked={isAnonymous}
              aria-label={t(uiLang, 'communityPrayerBoard.postAnonymously')}
              onClick={() => setIsAnonymous(a => !a)}
              className={`w-12 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 relative flex-shrink-0 ${isAnonymous ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isAnonymous ? 'left-7' : 'left-1'}`} />
            </button>
            <span className="text-sm text-gray-700">{t(uiLang, 'communityPrayerBoard.postAnonymously')}</span>
            {isAnonymous && <Shield size={13} className="text-indigo-600" />}
          </label>

          {/* Verse search modal */}
          {showVerseSearch && (
            <BibleVerseSearchModal
              uiLang={uiLang}
              parentType={null}
              parentId={null}
              currentEmail={currentEmail}
              onAttached={(record) => {
                setAttachedVerse(record);
                setShowVerseSearch(false);
              }}
              onClose={() => setShowVerseSearch(false)}
            />
          )}

          {attachedVerse && (
            <VerseBadge verse={attachedVerse} onRemove={() => setAttachedVerse(null)} />
          )}

          <div className="flex gap-2">
            <button
               onClick={() => setShowVerseSearch(true)}
               className="flex-1 min-h-[44px] py-2 rounded-xl border-2 border-indigo-200 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5"
             >
               📖 {attachedVerse ? t(uiLang, 'verse.change') : t(uiLang, 'verse.addVerse') || 'Add Scripture'}
             </button>
            <button
              onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
              className="flex-1 min-h-[44px] py-2 rounded-xl border-2 border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
            >
              🎙️ Voice Prayer
            </button>
          </div>

          {showVoiceRecorder && (
            <VoicePrayerRecorder
              onRecorded={(post) => {
                onPosted(post);
                onClose();
                setShowVoiceRecorder(false);
              }}
              currentEmail={currentEmail}
              currentName={currentName}
              category={category}
              isAnonymous={isAnonymous}
              uiLang={uiLang}
            />
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 min-h-[44px] py-2 rounded-xl bg-gray-800 text-white font-semibold text-sm hover:bg-gray-900 transition-colors flex items-center justify-center"
            >
              {t(uiLang, 'common.cancel')}
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="flex-1 min-h-[44px] py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {saving ? t(uiLang, 'communityPrayerBoard.posting') : t(uiLang, 'communityPrayerBoard.postButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────── Main Page ─────────
export default function CommunityPrayerBoardPage() {
  const { lang: i18nLang } = useI18n();
  const uiLanguageFromStore = useLanguageStore(s => s.uiLanguage);
  // Prefer the live i18n language so the board reacts to language changes immediately
  const uiLanguage = i18nLang || uiLanguageFromStore;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [showMilestoneAnimation, setShowMilestoneAnimation] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.CommunityPrayerPost.list('-created_date', 50);
      setPosts(res || []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  };

  const handlePray = async (post) => {
    if (!currentUser) { toast.error(t(uiLanguage, 'communityPrayerBoard.toastSignInRequired')); return; }
    const hasPrayed = post.prayedByEmails?.includes(currentUser.email);
    const updatedEmails = hasPrayed
      ? post.prayedByEmails.filter(e => e !== currentUser.email)
      : [...(post.prayedByEmails || []), currentUser.email];
    try {
      await base44.entities.CommunityPrayerPost.update(post.id, {
        prayedByEmails: updatedEmails,
        prayedCount: updatedEmails.length,
      });
      setPosts(p => p.map(x => x.id === post.id ? { ...x, prayedByEmails: updatedEmails, prayedCount: updatedEmails.length } : x));
      if (!hasPrayed) {
        toast.success(t(uiLanguage, 'communityPrayerBoard.toastPrayed'));
        
        // Update prayer streak
        const updatedStreak = updatePrayerStreak(currentUser.email);
        const milestones = getMilestones(updatedStreak.streak);
        const justHitMilestone = milestones.length > 0 && milestones[milestones.length - 1] === updatedStreak.streak;
        
        if (justHitMilestone) {
          setMilestone(updatedStreak.streak);
          setShowMilestoneAnimation(true);
        }
        
        // Notify post author
        if (post.authorEmail && post.authorEmail !== currentUser.email) {
          addPrayerNotification({
            forEmail: post.authorEmail,
            type: 'prayed',
            message: `${currentUser.full_name || currentUser.email?.split('@')[0] || 'Someone'} prayed for your request: "${post.title}"`,
          });
        }
      }
    } catch { toast.error(t(uiLanguage, 'communityPrayerBoard.toastFailUpdate')); }
  };

  const handleAnswer = async (post) => {
    try {
      await base44.entities.CommunityPrayerPost.update(post.id, { status: 'answered' });
      setPosts(p => p.map(x => x.id === post.id ? { ...x, status: 'answered' } : x));
      toast.success(t(uiLanguage, 'communityPrayerBoard.toastAnswered'));
    } catch { toast.error(t(uiLanguage, 'communityPrayerBoard.toastFailUpdate')); }
  };

  const filtered = posts.filter(p => {
    if (p.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = p.title?.toLowerCase().includes(query);
      const matchesBody = p.body?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesBody) return false;
    }
    return true;
  });

  const handleRefresh = useCallback(async () => {
    await loadPosts();
  }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={loading}>
    <div className="min-h-screen bg-gray-50 pb-24">
      <PrayerReminderChecker />
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
         <div className="flex items-center justify-between mb-5">
           <div>
             <h1 className="text-2xl font-bold text-gray-900">{t(uiLanguage, 'communityPrayerBoard.title')}</h1>
             <p className="text-gray-500 text-sm">{t(uiLanguage, 'communityPrayerBoard.subtitle')}</p>
             {currentUser && <PrayerStreakDisplay userEmail={currentUser.email} uiLang={uiLanguage} />}
           </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDashboard(true)}
              aria-label="Community Dashboard"
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-white border border-gray-200 hover:border-indigo-300 text-gray-500 hover:text-indigo-600 transition-all flex items-center justify-center"
            >
              <BarChart2 size={15} />
            </button>
            {currentUser && (
              <>
                <PrayerNotificationCenter currentEmail={currentUser.email} />
                <button
                  onClick={() => setShowHistory(true)}
                  aria-label={t(uiLanguage, 'communityPrayerBoard.historyTitle')}
                  className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-white border border-gray-200 hover:border-indigo-300 text-gray-500 hover:text-indigo-600 transition-all flex items-center justify-center"
                >
                  <User size={15} />
                </button>
              </>
            )}
            <button
               onClick={() => setShowModal(true)}
               aria-label={t(uiLanguage, 'communityPrayerBoard.request')}
               className="flex items-center gap-1.5 px-4 py-3 min-h-[44px] min-w-[44px] bg-indigo-600 text-white rounded-2xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
             >
               <Plus size={15} /> {t(uiLanguage, 'communityPrayerBoard.request')}
             </button>
          </div>
        </div>

        {/* Global Search */}
        <div className="mb-4 relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t(uiLanguage, 'communityPrayerBoard.searchPlaceholder') || 'Search prayer requests...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
          />
        </div>

        {/* Community Impact Dashboard */}
        <CommunityImpactDashboard uiLang={uiLanguage} />

        {/* Prayer Request Form */}
        <PrayerRequestForm
          onSubmit={(newRequest) => setPosts(prev => [newRequest, ...prev])}
          currentUser={currentUser}
          uiLang={uiLanguage}
        />

        {/* Map View */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{t(uiLanguage, 'prayer.map') || 'Prayer Map'}</h2>
          <button
            onClick={() => setShowMap(!showMap)}
            aria-label={showMap ? t(uiLanguage, 'common.hide') : t(uiLanguage, 'common.show')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-indigo-300 rounded-lg text-gray-700 hover:text-indigo-600 font-medium text-sm transition-colors"
          >
            <MapIcon size={16} />
            {showMap ? t(uiLanguage, 'common.hide') : t(uiLanguage, 'common.show')}
          </button>
        </div>
        {showMap && (
          <div className="mb-6">
            <PrayerMapView onRequestSelect={(req) => {
              // Scroll to request in list
              const element = document.getElementById(`request-${req.id}`);
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }} />
          </div>
        )}

        {/* Praise Reports */}
        <PraiseReports currentUser={currentUser} />

        {/* Prayer Circles */}
        <PrayerCircles currentUser={currentUser} />

        {/* Praise Reports */}
        <PraiseReports currentUser={currentUser} uiLang={uiLanguage} />

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t(uiLanguage, 'communityPrayerBoard.prayerRequests') || 'Prayer Requests'}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mb-4">
          {['active', 'answered'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 min-h-[44px] py-2 rounded-xl font-semibold text-sm capitalize transition-all flex items-center justify-center ${
                statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {s === 'active' ? t(uiLanguage, 'communityPrayerBoard.filterActive') : t(uiLanguage, 'communityPrayerBoard.filterAnswered')}
            </button>
          ))}
        </div>

        {/* Category filter with label */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            {t(uiLanguage, 'communityPrayerBoard.filterByCategory') || 'Filter by Category'}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {CATEGORY_KEYS.map(key => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                aria-label={`Filter by ${getCategoryLabel(key, uiLanguage)}`}
                aria-pressed={categoryFilter === key}
                className={`flex-shrink-0 min-h-[44px] px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center whitespace-nowrap ${
                    categoryFilter === key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
              >
                {getCategoryLabel(key, uiLanguage)}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">{t(uiLanguage, 'common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">{t(uiLanguage, 'communityPrayerBoard.emptyState.title')}</p>
            <p className="text-gray-300 text-sm">{t(uiLanguage, 'communityPrayerBoard.emptyState.subtitle')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => (
              <div key={post.id} id={`request-${post.id}`}>
                <PostCard
                  post={post}
                  currentEmail={currentUser?.email}
                  onPray={handlePray}
                  onAnswer={handleAnswer}
                  uiLang={uiLanguage}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewPostModal
          onClose={() => setShowModal(false)}
          onPosted={p => setPosts(prev => [p, ...prev])}
          currentEmail={currentUser?.email}
          currentName={currentUser?.full_name}
          uiLang={uiLanguage}
        />
      )}

      {showHistory && currentUser && (
        <PrayerHistoryPanel email={currentUser.email} onClose={() => setShowHistory(false)} uiLang={uiLanguage} />
      )}

      {showDashboard && (
         <PrayerCommunityDashboard posts={posts} onClose={() => setShowDashboard(false)} />
       )}

       {showMilestoneAnimation && (
         <MilestoneAnimation milestone={milestone} onComplete={() => setShowMilestoneAnimation(false)} />
       )}
      </div>
      </PullToRefresh>
      );
      }