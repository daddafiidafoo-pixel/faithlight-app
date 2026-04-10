import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, BookHeart, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function VerseReflectionModal({ verse, book, chapter, user, isDarkMode, onClose }) {
  const [question, setQuestion] = useState('');
  const [loadingQ, setLoadingQ] = useState(false);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const verseRef = `${book} ${chapter}:${verse?.verse}`;
  const verseText = verse?.text || '';

  React.useEffect(() => {
    if (verse) generateQuestion();
  }, [verse]);

  const generateQuestion = async () => {
    setLoadingQ(true);
    setQuestion('');
    setSaved(false);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a spiritual growth coach. Based on this Bible verse, generate exactly ONE short, personal, reflective question that helps the reader apply this verse to their own life today.

Verse: ${verseRef} — "${verseText}"

The question should:
- Be personal (use "you" or "your")
- Be open-ended and introspective
- Be 1–2 sentences max
- Connect the verse's theme to real daily life

Return ONLY the question, nothing else.`,
      });
      setQuestion(typeof result === 'string' ? result.trim() : result?.content || result?.text || '');
    } catch {
      setQuestion('How does this verse speak to your heart today, and what one small action can you take in response?');
    } finally {
      setLoadingQ(false);
    }
  };

  const handleSave = async () => {
    if (!answer.trim() || !user) return;
    setSaving(true);
    try {
      await base44.entities.PrayerRequest.create({
        userEmail: user.email,
        title: `Reflection on ${verseRef}`,
        body: `📖 Verse: "${verseText}"\n\n❓ Question: ${question}\n\n✍️ My Reflection:\n${answer}`,
        category: 'faith',
        status: 'active',
        tags: ['reflection', book],
      });
      setSaved(true);
      toast.success('Reflection saved to your Prayer Journal!');
    } catch {
      toast.error('Could not save reflection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const bg = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const text = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const muted = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const border = isDarkMode ? '#2A2F2C' : '#E6E6E6';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: bg, maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: text }}>Reflection Prompt</p>
                <p className="text-xs" style={{ color: muted }}>{verseRef}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:opacity-60 transition-opacity" style={{ color: muted }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Verse */}
          <div className="mx-5 p-4 rounded-xl mb-4" style={{ backgroundColor: isDarkMode ? '#252B27' : '#F8F7F4', border: `1px solid ${border}` }}>
            <p className="text-sm italic leading-relaxed" style={{ color: muted }}>
              "{verseText}"
            </p>
            <p className="text-xs font-semibold mt-2" style={{ color: isDarkMode ? '#8FB996' : '#6B8E6E' }}>{verseRef}</p>
          </div>

          {/* AI Question */}
          <div className="mx-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#6366F1' }} />
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6366F1' }}>AI Reflection Question</p>
              <button onClick={generateQuestion} className="ml-auto text-xs underline opacity-60 hover:opacity-100" style={{ color: muted }}>
                New question
              </button>
            </div>
            {loadingQ ? (
              <div className="flex items-center gap-2 py-3">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#6366F1' }} />
                <span className="text-sm" style={{ color: muted }}>Generating a personal question…</span>
              </div>
            ) : (
              <p className="text-sm font-medium leading-relaxed" style={{ color: text }}>{question}</p>
            )}
          </div>

          {/* Answer input */}
          <div className="mx-5 mb-5">
            <p className="text-xs font-semibold mb-2" style={{ color: muted }}>Your Reflection</p>
            <Textarea
              placeholder="Write your thoughts here… This will be saved privately to your Prayer Journal."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={4}
              className="resize-none text-sm"
              style={{ backgroundColor: isDarkMode ? '#252B27' : '#F8F7F4', borderColor: border, color: text }}
              disabled={saved}
            />

            {!user && (
              <p className="text-xs mt-2 text-amber-600">Sign in to save your reflection to your Prayer Journal.</p>
            )}

            <div className="flex gap-2 mt-3">
              <Button variant="outline" className="flex-1" onClick={onClose} style={{ borderColor: border, color: muted }}>
                Close
              </Button>
              {saved ? (
                <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white">
                  <Check className="w-4 h-4" /> Saved!
                </Button>
              ) : (
                <Button
                  className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleSave}
                  disabled={saving || !answer.trim() || !user || loadingQ}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookHeart className="w-4 h-4" />}
                  Save to Journal
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}