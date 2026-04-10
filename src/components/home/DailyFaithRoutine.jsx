/**
 * DailyFaithRoutine
 * 3–5 minute guided daily spiritual routine.
 * Steps: Verse → AI Explanation → Reflection → Prayer
 * Persists today's completion to localStorage.
 */
import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, Heart, Flame, CheckCircle2, Clock, ChevronRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useAIOrchestrator } from '../hooks/useAIOrchestrator';
import ReactMarkdown from 'react-markdown';

const STEPS = [
  { id: 'verse',       icon: BookOpen, label: 'Read the Verse',         minutes: 1, color: '#6C5CE7', bg: '#EEF2FF' },
  { id: 'explain',     icon: Brain,    label: '3-min AI Explanation',   minutes: 2, color: '#0284C7', bg: '#E0F2FE' },
  { id: 'reflection',  icon: Heart,    label: 'Reflection Question',    minutes: 1, color: '#DB2777', bg: '#FCE7F3' },
  { id: 'prayer',      icon: Flame,    label: 'Prayer',                 minutes: 1, color: '#D97706', bg: '#FEF3C7' },
];

const todayKey = () => `fl_routine_${new Date().toISOString().split('T')[0]}`;

export default function DailyFaithRoutine({ verse, user, language = 'en' }) {
  const navigate = useNavigate();
  const { generate, loading } = useAIOrchestrator();

  const [completedSteps, setCompletedSteps] = useState(() => {
    try { return JSON.parse(localStorage.getItem(todayKey()) || '[]'); } catch { return []; }
  });
  const [activeStep, setActiveStep] = useState(null);
  const [aiContent, setAiContent] = useState({});
  const [expanded, setExpanded] = useState(false);

  const allDone = completedSteps.length === STEPS.length;
  const pct = Math.round((completedSteps.length / STEPS.length) * 100);

  const markDone = (id) => {
    const next = completedSteps.includes(id) ? completedSteps : [...completedSteps, id];
    setCompletedSteps(next);
    localStorage.setItem(todayKey(), JSON.stringify(next));
    setActiveStep(null);
  };

  const handleStepTap = async (step) => {
    if (activeStep === step.id) { setActiveStep(null); return; }
    setActiveStep(step.id);

    if (!verse) return;

    if (step.id === 'explain' && !aiContent.explain) {
      const result = await generate('verse_explain', { reference: verse.reference, verseText: verse.verseText, language }, { userId: user?.id });
      if (result) setAiContent(p => ({ ...p, explain: result }));
    }
    if (step.id === 'reflection' && !aiContent.reflection) {
      const result = await generate('verse_reflect', { reference: verse.reference, verseText: verse.verseText, language }, { userId: user?.id });
      if (result) setAiContent(p => ({ ...p, reflection: result }));
    }
    if (step.id === 'prayer' && !aiContent.prayer) {
      const topic = verse?.theme || verse?.reference || 'today\'s verse';
      const result = await generate('prayer', { topic, language }, { userId: user?.id });
      if (result) setAiContent(p => ({ ...p, prayer: result }));
    }
  };

  const resetToday = () => {
    localStorage.removeItem(todayKey());
    setCompletedSteps([]);
    setActiveStep(null);
    setAiContent({});
  };

  const totalMin = STEPS.reduce((s, step) => s + step.minutes, 0);

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #F3F4F6', boxShadow: '0px 4px 14px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>🌅</span>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Daily Faith Routine</p>
            {allDone && <span style={{ background: '#D1FAE5', color: '#059669', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>✓ Done</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#9CA3AF', fontSize: 12 }}>
              <Clock size={11} /> {totalMin} min · {completedSteps.length}/{STEPS.length} steps
            </div>
            {!allDone && (
              <div style={{ height: 4, width: 80, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6C5CE7, #8E7CFF)', borderRadius: 99, transition: 'width 0.4s' }} />
              </div>
            )}
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={18} color="#9CA3AF" />
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 18px 18px', borderTop: '1px solid #F3F4F6' }}>

              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const done = completedSteps.includes(step.id);
                const isActive = activeStep === step.id;
                const content = aiContent[step.id === 'explain' ? 'explain' : step.id === 'reflection' ? 'reflection' : step.id === 'prayer' ? 'prayer' : null];
                const isLoading = loading && isActive && !content;

                return (
                  <div key={step.id} style={{ marginTop: 12 }}>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStepTap(step)}
                      style={{
                        width: '100%', borderRadius: 14, padding: '12px 14px',
                        border: `1.5px solid ${isActive ? step.color : done ? '#D1FAE5' : '#F3F4F6'}`,
                        background: done ? '#F0FDF4' : isActive ? step.bg : '#FAFAFA',
                        display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: done ? '#D1FAE5' : step.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {done ? <CheckCircle2 size={18} color="#059669" /> : <Icon size={18} color={step.color} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: done ? '#059669' : '#111827', margin: '0 0 2px' }}>{step.label}</p>
                        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{step.minutes} min</p>
                      </div>
                      {!done && <ChevronRight size={14} color="#9CA3AF" style={{ transform: isActive ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />}
                    </motion.button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                          <div style={{ background: step.bg, borderRadius: '0 0 14px 14px', padding: '14px 16px', border: `1.5px solid ${step.color}`, borderTop: 'none' }}>

                            {/* VERSE */}
                            {step.id === 'verse' && verse && (
                              <div>
                                <p style={{ fontSize: 16, fontStyle: 'italic', color: '#111827', lineHeight: '26px', margin: '0 0 8px' }}>"{verse.verseText}"</p>
                                <p style={{ fontSize: 13, fontWeight: 600, color: step.color, margin: '0 0 12px' }}>— {verse.reference}</p>
                                <motion.button whileTap={{ scale: 0.97 }} onClick={() => markDone(step.id)}
                                  style={{ background: step.color, color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                  ✓ I've read this
                                </motion.button>
                              </div>
                            )}

                            {/* AI steps */}
                            {(step.id === 'explain' || step.id === 'reflection' || step.id === 'prayer') && (
                              <div>
                                {isLoading ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 13 }}>
                                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${step.color}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                                    Generating...
                                  </div>
                                ) : content ? (
                                  <div>
                                    <div style={{ fontSize: 13, color: '#374151', lineHeight: '22px', marginBottom: 12 }}>
                                      <ReactMarkdown>{content}</ReactMarkdown>
                                    </div>
                                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => markDone(step.id)}
                                      style={{ background: step.color, color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                      ✓ Done
                                    </motion.button>
                                  </div>
                                ) : (
                                  <p style={{ color: '#9CA3AF', fontSize: 13 }}>Tap to load…</p>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {allDone && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 14, background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', borderRadius: 14, padding: '14px 18px', textAlign: 'center' }}>
                  <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎉</p>
                  <p style={{ fontWeight: 700, color: '#065F46', fontSize: 14, margin: '0 0 4px' }}>Routine complete! Well done.</p>
                  <p style={{ color: '#6B7280', fontSize: 12, margin: '0 0 10px' }}>Come back tomorrow to keep your streak</p>
                  <button onClick={resetToday} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto' }}>
                    <RefreshCw size={11} /> Reset (testing)
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}