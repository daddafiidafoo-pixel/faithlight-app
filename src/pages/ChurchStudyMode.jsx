import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Church, Plus, Users, BookOpen, Hash, ChevronRight, X } from 'lucide-react';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'Amharic' },
  { code: 'om', label: 'Afaan Oromoo' },
  { code: 'ar', label: 'Arabic' },
  { code: 'fr', label: 'French' },
  { code: 'sw', label: 'Swahili' },
];

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const EMPTY_FORM = {
  church_name: '', pastor_name: '', week_title: '',
  passage_reference: '', passage_text: '', pastor_insight: '',
  discussion_questions: '', prayer_focus: '', language: 'en', is_public: true,
};

export default function ChurchStudyMode() {
  const navigate = useNavigate();
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { loadStudies(); }, []);

  const loadStudies = async () => {
    try {
      const data = await base44.entities.ChurchStudy.filter({ is_active: true, is_public: true }, '-created_date', 20);
      setStudies(data || []);
    } catch { setStudies([]); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    const code = joinCode.trim().toUpperCase();
    try {
      const found = await base44.entities.ChurchStudy.filter({ join_code: code, is_active: true });
      if (found?.length > 0) {
        navigate(createPageUrl('ChurchStudyDetail') + `?id=${found[0].id}`);
      } else {
        setJoinError('Study not found. Double-check the code and try again.');
      }
    } catch { setJoinError('Error finding study. Please try again.'); }
  };

  const handleCreate = async () => {
    if (!form.church_name || !form.pastor_name || !form.passage_reference) return;
    setCreating(true);
    try {
      const questions = form.discussion_questions
        .split('\n').map(q => q.trim()).filter(Boolean);
      const study = await base44.entities.ChurchStudy.create({
        ...form,
        discussion_questions: questions,
        join_code: generateCode(),
        is_active: true,
        member_count: 1,
      });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      navigate(createPageUrl('ChurchStudyDetail') + `?id=${study.id}`);
    } catch { /* handle silently */ }
    finally { setCreating(false); }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div style={{ background: '#F7F8FC', minHeight: '100vh' }}>
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '24px 20px 112px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
            ⛪ Church Study Mode
          </h1>
          <p style={{ fontSize: 15, color: '#6B7280', margin: 0 }}>
            Join your church's weekly Bible study
          </p>
        </div>

        {/* Join with Code */}
        <div style={{
          background: 'white', borderRadius: 16, padding: 20,
          boxShadow: '0px 4px 12px rgba(0,0,0,0.05)', marginBottom: 16,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Hash size={18} color="#6C5CE7" /> Join with Code
          </h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="Enter code e.g. ABC123"
              style={{
                flex: 1, height: 46, borderRadius: 12, border: '1.5px solid #E5E7EB',
                padding: '0 14px', fontSize: 16, fontWeight: 700, letterSpacing: '0.12em',
                outline: 'none', color: '#111827', fontFamily: 'monospace',
              }}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleJoin}
              style={{
                height: 46, padding: '0 22px', borderRadius: 12, border: 'none',
                background: '#6C5CE7', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer',
              }}
            >
              Join
            </motion.button>
          </div>
          {joinError && (
            <p style={{ color: '#EF4444', fontSize: 13, marginTop: 8, margin: '8px 0 0' }}>{joinError}</p>
          )}
        </div>

        {/* Pastor CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreate(true)}
          style={{
            width: '100%', borderRadius: 16, border: '2px dashed #C4B5FD',
            background: '#F5F3FF', padding: '16px 20px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32,
            textAlign: 'left',
          }}
        >
          <div style={{
            width: 46, height: 46, borderRadius: 12, background: '#6C5CE7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Plus size={22} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#6C5CE7', margin: 0 }}>Start a Church Study</p>
            <p style={{ fontSize: 13, color: '#7C3AED', margin: '2px 0 0' }}>
              Pastors: create a weekly study for your congregation
            </p>
          </div>
        </motion.button>

        {/* Active Studies */}
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>
          Active Church Studies
        </h2>

        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} style={{
              height: 88, background: 'white', borderRadius: 16, marginBottom: 12,
              opacity: 0.5, animation: 'pulse 1.5s infinite',
            }} />
          ))
        ) : studies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
            <Church size={44} style={{ marginBottom: 12, opacity: 0.35 }} />
            <p style={{ fontSize: 15, margin: '0 0 6px' }}>No active studies yet.</p>
            <p style={{ fontSize: 13 }}>Be the first to start one for your church!</p>
          </div>
        ) : studies.map((study, i) => (
          <motion.div
            key={study.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(createPageUrl('ChurchStudyDetail') + `?id=${study.id}`)}
            style={{
              background: 'white', borderRadius: 16, padding: '14px 16px',
              boxShadow: '0px 4px 12px rgba(0,0,0,0.05)', marginBottom: 12,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <div style={{
              width: 50, height: 50, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #6C5CE7, #8E7CFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Church size={24} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {study.church_name}
              </p>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {study.week_title || study.passage_reference}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={12} color="#9CA3AF" />
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{study.passage_reference}</span>
                <span style={{ color: '#D1D5DB', margin: '0 2px' }}>·</span>
                <Users size={12} color="#9CA3AF" />
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{study.member_count || 1}</span>
              </div>
            </div>
            <ChevronRight size={18} color="#D1D5DB" />
          </motion.div>
        ))}
      </div>

      {/* Create Study Bottom Sheet */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowCreate(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'flex-end',
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              style={{
                width: '100%', background: 'white',
                borderRadius: '22px 22px 0 0',
                padding: '24px 20px 52px',
                maxHeight: '92vh', overflowY: 'auto',
              }}
            >
              {/* Handle */}
              <div style={{ width: 36, height: 4, borderRadius: 99, background: '#E5E7EB', margin: '0 auto 20px' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Create Church Study</h2>
                <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
                  <X size={22} />
                </button>
              </div>

              {/* Text fields */}
              {[
                { key: 'church_name', label: 'Church Name *', placeholder: 'Grace Community Church' },
                { key: 'pastor_name', label: "Pastor's Name *", placeholder: 'Pastor Daniel' },
                { key: 'week_title', label: 'Week Title', placeholder: 'Week 4: Faith in Difficult Times' },
                { key: 'passage_reference', label: 'Passage Reference *', placeholder: 'Philippians 4:10-20' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
                  <input
                    value={form[key]}
                    onChange={set(key)}
                    placeholder={placeholder}
                    style={{
                      width: '100%', height: 46, borderRadius: 12, border: '1.5px solid #E5E7EB',
                      padding: '0 14px', fontSize: 14, outline: 'none', color: '#111827',
                      boxSizing: 'border-box', fontFamily: 'inherit',
                    }}
                  />
                </div>
              ))}

              {/* Textareas */}
              {[
                { key: 'pastor_insight', label: "Pastor's Insight", placeholder: "Paul teaches us that contentment is a learned discipline...", rows: 3 },
                { key: 'discussion_questions', label: 'Discussion Questions (one per line)', placeholder: "What does contentment mean in your life today?\nWhen have you experienced God's strength in weakness?", rows: 4 },
                { key: 'prayer_focus', label: 'Prayer Focus', placeholder: 'Pray for trust in God during seasons of uncertainty...', rows: 2 },
              ].map(({ key, label, placeholder, rows }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
                  <textarea
                    value={form[key]}
                    onChange={set(key)}
                    placeholder={placeholder}
                    rows={rows}
                    style={{
                      width: '100%', borderRadius: 12, border: '1.5px solid #E5E7EB',
                      padding: '10px 14px', fontSize: 14, outline: 'none', color: '#111827',
                      resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
                      lineHeight: '22px',
                    }}
                  />
                </div>
              ))}

              {/* Language */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Primary Language</label>
                <select
                  value={form.language}
                  onChange={set('language')}
                  style={{
                    width: '100%', height: 46, borderRadius: 12, border: '1.5px solid #E5E7EB',
                    padding: '0 14px', fontSize: 14, outline: 'none', color: '#111827',
                    background: 'white', boxSizing: 'border-box',
                  }}
                >
                  {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={creating || !form.church_name || !form.pastor_name || !form.passage_reference}
                style={{
                  width: '100%', height: 54, borderRadius: 14, border: 'none',
                  background: (!form.church_name || !form.pastor_name || !form.passage_reference) ? '#C4B5FD' : '#6C5CE7',
                  color: 'white', fontSize: 16, fontWeight: 700,
                  cursor: creating ? 'wait' : 'pointer',
                }}
              >
                {creating ? 'Creating...' : '✓ Create Study & Get Join Code'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}