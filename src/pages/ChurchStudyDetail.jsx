import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Church, BookOpen, MessageCircle, Copy, Check, Send, Users, Share2 } from 'lucide-react';

function Section({ icon, title, subtitle, bg, children }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: 20,
      boxShadow: '0px 4px 12px rgba(0,0,0,0.05)', marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: bg || '#EEF2FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</p>
          {subtitle && <p style={{ fontSize: 12, color: '#9CA3AF', margin: '1px 0 0' }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function ChurchStudyDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const studyId = urlParams.get('id');

  const [study, setStudy] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!studyId) return;
    Promise.all([
      base44.entities.ChurchStudy.filter({ id: studyId }),
      base44.entities.ChurchStudyComment.filter({ study_id: studyId }, '-created_date', 50),
    ]).then(([studyData, commentsData]) => {
      if (studyData?.length > 0) setStudy(studyData[0]);
      setComments(commentsData || []);
    }).finally(() => setLoading(false));

    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) base44.auth.me().then(setUser).catch(() => {});
    }).catch(() => {});
  }, [studyId]);

  const copyCode = () => {
    navigator.clipboard?.writeText(study.join_code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const shareStudy = () => {
    const text = `Join our church study on FaithLight!\n${study.church_name} — ${study.passage_reference}\nJoin code: ${study.join_code}`;
    if (navigator.share) {
      navigator.share({ title: `${study.church_name} Study`, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const sendComment = async () => {
    if (!commentText.trim() || !user || sending) return;
    setSending(true);
    try {
      const comment = await base44.entities.ChurchStudyComment.create({
        study_id: studyId,
        user_id: user.id,
        user_name: user.full_name || 'Member',
        content: commentText.trim(),
      });
      setComments(prev => [comment, ...prev]);
      setCommentText('');
    } catch { /* silently fail */ }
    setSending(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F7F8FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6C5CE7', fontSize: 15 }}>Loading study...</p>
    </div>
  );

  if (!study) return (
    <div style={{ minHeight: '100vh', background: '#F7F8FC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <Church size={52} color="#D1D5DB" />
      <p style={{ color: '#6B7280', fontSize: 15 }}>Study not found.</p>
      <Link to={createPageUrl('ChurchStudyMode')} style={{ color: '#6C5CE7', fontWeight: 600 }}>Browse Studies →</Link>
    </div>
  );

  return (
    <div style={{ background: '#F7F8FC', minHeight: '100vh' }}>

      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #8E7CFF 100%)', padding: '32px 20px 28px' }}>
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Church size={28} color="white" />
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>Church Study</p>
              <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>{study.church_name}</h1>
            </div>
          </div>

          {study.week_title && (
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{study.week_title}</p>
          )}
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: '0 0 20px' }}>
            Led by {study.pastor_name}
          </p>

          {/* Code + Share row */}
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={copyCode}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: 'white', flex: 1,
              }}
            >
              {codeCopied ? <Check size={14} /> : <Copy size={14} />}
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', fontFamily: 'monospace' }}>
                {study.join_code}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginLeft: 'auto' }}>
                {codeCopied ? 'Copied!' : 'Copy code'}
              </span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={shareStudy}
              style={{
                width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 10, cursor: 'pointer', color: 'white',
              }}
            >
              {shareCopied ? <Check size={16} /> : <Share2 size={16} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '24px 20px 112px' }}>

        {/* Passage */}
        <Section icon={<BookOpen size={18} color="#6C5CE7" />} title="This Week's Passage" bg="#EEF2FF">
          <p style={{ fontSize: 24, fontWeight: 800, color: '#6C5CE7', margin: '0 0 10px' }}>
            {study.passage_reference}
          </p>
          {study.passage_text && (
            <p style={{ fontSize: 15, color: '#374151', lineHeight: '26px', fontStyle: 'italic', margin: 0 }}>
              "{study.passage_text}"
            </p>
          )}
        </Section>

        {/* Pastor's Insight */}
        {study.pastor_insight && (
          <Section icon="💬" title="Pastor's Insight" subtitle={`— ${study.pastor_name}`} bg="#F0FDF4">
            <p style={{ fontSize: 15, color: '#374151', lineHeight: '26px', margin: 0 }}>
              {study.pastor_insight}
            </p>
          </Section>
        )}

        {/* Discussion Questions */}
        {study.discussion_questions?.length > 0 && (
          <Section icon="❓" title="Discussion Questions" bg="#FFFBEB">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {study.discussion_questions.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 999, background: '#6C5CE7',
                    color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 15, color: '#374151', lineHeight: '22px', margin: 0 }}>{q}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Prayer Focus */}
        {study.prayer_focus && (
          <Section icon="🙏" title="Prayer Focus" bg="#FDF2F8">
            <p style={{ fontSize: 15, color: '#374151', lineHeight: '26px', margin: 0 }}>
              {study.prayer_focus}
            </p>
          </Section>
        )}

        {/* Member count */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          marginBottom: 28, color: '#9CA3AF', fontSize: 13,
        }}>
          <Users size={14} />
          <span>{study.member_count || 1} believers studying this passage</span>
        </div>

        {/* Comments */}
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={20} color="#6C5CE7" />
          Church Discussion
          <span style={{ fontSize: 14, fontWeight: 400, color: '#9CA3AF' }}>({comments.length})</span>
        </h2>

        {/* Comment input */}
        {user ? (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(135deg, #6C5CE7, #8E7CFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0, marginTop: 4,
            }}>
              {(user.full_name || 'A')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 8 }}>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendComment()}
                placeholder="Share your reflection..."
                style={{
                  flex: 1, height: 44, borderRadius: 12, border: '1.5px solid #E5E7EB',
                  padding: '0 14px', fontSize: 14, outline: 'none', background: 'white',
                  fontFamily: 'inherit',
                }}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={sendComment}
                disabled={!commentText.trim() || sending}
                style={{
                  width: 44, height: 44, borderRadius: 12, border: 'none', flexShrink: 0,
                  background: commentText.trim() ? '#6C5CE7' : '#E5E7EB',
                  color: 'white', cursor: commentText.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Send size={17} />
              </motion.button>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#F5F3FF', borderRadius: 14, padding: '14px 18px',
            marginBottom: 20, textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, color: '#7C3AED', margin: 0 }}>
              <button
                onClick={() => base44.auth.redirectToLogin()}
                style={{ background: 'none', border: 'none', color: '#6C5CE7', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                Sign in
              </button>
              {' '}to join the church discussion
            </p>
          </div>
        )}

        {/* Comment list */}
        {comments.length === 0 ? (
          <p style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
            Be the first to share a reflection!
          </p>
        ) : comments.map((comment, i) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            style={{
              background: 'white', borderRadius: 14, padding: '14px 16px',
              marginBottom: 10, boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                background: 'linear-gradient(135deg, #6C5CE7, #8E7CFF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 13, fontWeight: 700,
              }}>
                {(comment.user_name || 'A')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{comment.user_name}</span>
              <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>
                {new Date(comment.created_date).toLocaleDateString()}
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: '22px', margin: 0 }}>{comment.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}