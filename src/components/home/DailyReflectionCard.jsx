import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Lightbulb, Heart, BookMarked, Loader2, RefreshCw, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../I18nProvider';
import { base44 } from '@/api/base44Client';
import { getDailyVerse } from '../lib/dailyVerseList';

const CACHE_KEY_BASE = 'faithlight_ai_reflection_v2';
const CACHE_TTL_MS = 20 * 60 * 60 * 1000; // 20 hours

function cacheKey(lang) { return `${CACHE_KEY_BASE}_${lang || 'en'}`; }

function loadCache(date, lang) {
  try {
    const raw = localStorage.getItem(cacheKey(lang));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.date !== date || Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch { return null; }
}

function saveCache(date, data, lang) {
  try { localStorage.setItem(cacheKey(lang), JSON.stringify({ date, ts: Date.now(), data })); } catch {}
}

export default function DailyReflectionCard({ user }) {
  const { t, lang } = useI18n();
  const [reflection, setReflection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const verse = getDailyVerse(lang);

  useEffect(() => {
    setReflection(null);
    const cached = loadCache(today, lang);
    if (cached) { setReflection(cached); setExpanded(true); }
  }, [today, lang]);

  const generate = async () => {
    setLoading(true);
    setSaved(false);

    const langInstructions = {
      om: 'Respond ENTIRELY in Afaan Oromoo only. Do not use English at all.',
      am: 'Respond ENTIRELY in Amharic (አማርኛ) only. Do not use English at all.',
      ar: 'Respond ENTIRELY in Arabic only. Do not use English at all.',
      sw: 'Respond ENTIRELY in Kiswahili only. Do not use English at all.',
      fr: 'Respond ENTIRELY in French only. Do not use English at all.',
      es: 'Respond ENTIRELY in Spanish only. Do not use English at all.',
      pt: 'Respond ENTIRELY in Portuguese only. Do not use English at all.',
    };
    const langInstruction = langInstructions[lang] || 'Respond in English.';

    const prompt = `You are a compassionate Christian devotional writer. ${langInstruction}

Today's Verse of the Day is: "${verse.text}" — ${verse.ref}

Write a spiritual reflection with exactly these 4 sections (use these exact headings):
**REFLECTION**
Write 3 short paragraphs (2-3 sentences each) that help a reader meditate on the verse's meaning, historical context, and personal significance.

**PRAYER**
Write one heartfelt, personal prayer (4-5 sentences) inspired by the verse.

**APPLICATION**
Write one practical, concrete tip the reader can apply to their day based on this verse (2-3 sentences).

**SUMMARY**
One sentence that captures the essence of today's reflection.

Keep the tone warm, encouraging, and accessible. No academic jargon.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    
    // Parse sections
    const parse = (label) => {
      const regex = new RegExp(`\\*\\*${label}\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
      return (result.match(regex)?.[1] || '').trim();
    };

    const data = {
      verseRef: verse.ref,
      verseText: verse.text,
      reflection: parse('REFLECTION'),
      prayer: parse('PRAYER'),
      application: parse('APPLICATION'),
      summary: parse('SUMMARY'),
      generatedAt: new Date().toISOString(),
    };

    setReflection(data);
    saveCache(today, data, lang);
    setExpanded(true);
    setLoading(false);
  };

  const saveToJournal = async () => {
    if (!user || !reflection) return;
    setSaving(true);
    const content = `## Verse of the Day — ${reflection.verseRef}\n\n> "${reflection.verseText}"\n\n### Reflection\n${reflection.reflection}\n\n### Prayer\n${reflection.prayer}\n\n### Application\n${reflection.application}`;
    await base44.entities.StudyNote.create({
      user_id: user.id,
      title: `Daily Reflection — ${today}`,
      content,
      note_type: 'devotional',
      verse_ref: reflection.verseRef,
      created_date_local: today,
    }).catch(() => {});
    setSaved(true);
    setSaving(false);
  };

  return (
    <div className="mb-5 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-2xl border border-violet-200 dark:border-violet-800/40 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-violet-100 dark:bg-violet-900/40 p-1.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
            {t('home.aiReflection', 'AI Reflection of the Day')}
          </span>
        </div>
        {reflection && (
          <button onClick={() => { setReflection(null); saveCache(today, null, lang); generate(); }}
            className="text-violet-400 hover:text-violet-600 transition-colors" title="Regenerate">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Verse teaser */}
      <div className="mx-4 mb-3 bg-white dark:bg-slate-800/60 rounded-xl px-4 py-3 border border-violet-100 dark:border-violet-800/30">
        <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1">
          {t('home.verseOfDay', 'Verse of the Day')}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-200 italic leading-relaxed">"{verse.text}"</p>
        <p className="text-xs text-violet-500 font-semibold mt-1">— {verse.ref}</p>
      </div>

      {/* No reflection yet */}
      {!reflection && !loading && (
        <div className="px-4 pb-4">
          <Button onClick={generate} disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2 font-semibold">
            <Sparkles className="w-4 h-4" />
            {t('home.generateReflection', 'Generate Reflection')}
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-4 pb-6 flex flex-col items-center gap-3 pt-2">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
            {t('home.generatingReflection', 'Generating your reflection…')}
          </p>
        </div>
      )}

      {/* Generated reflection */}
      {reflection && !loading && (
        <div className="px-4 pb-4 space-y-3">
          {/* Summary pill */}
          {reflection.summary && (
            <p className="text-xs text-violet-700 dark:text-violet-300 italic bg-violet-100 dark:bg-violet-900/30 rounded-xl px-3 py-2 leading-relaxed">
              ✦ {reflection.summary}
            </p>
          )}

          {/* Accordion sections */}
          {[
            { icon: BookOpen, label: t('daily.reflection', 'Reflection'), key: 'reflection', color: 'text-indigo-600' },
            { icon: Heart, label: t('daily.prayer', 'Prayer'), key: 'prayer', color: 'text-rose-500' },
            { icon: Lightbulb, label: t('daily.application', 'Application'), key: 'application', color: 'text-amber-600' },
          ].map(({ icon: Icon, label, key, color }) => (
            reflection[key] ? (
              <div key={key} className="bg-white dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setExpanded(e => e === key ? null : key)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left"
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex-1">{label}</span>
                  <span className="text-gray-400 text-xs">{expanded === key ? '▲' : '▼'}</span>
                </button>
                {expanded === key && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {reflection[key]}
                    </p>
                  </div>
                )}
              </div>
            ) : null
          ))}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {user && (
              <Button
                onClick={saveToJournal}
                disabled={saving || saved}
                variant="outline"
                className={`flex-1 gap-2 border-violet-300 dark:border-violet-700 font-semibold text-sm transition-all ${saved ? 'bg-green-50 text-green-700 border-green-300' : 'text-violet-700 dark:text-violet-300 hover:bg-violet-50'}`}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{t('common.saving', 'Saving…')}</>
                ) : saved ? (
                  <><Check className="w-4 h-4" />{t('daily.savedToJournal', 'Saved!')}</>
                ) : (
                  <><BookMarked className="w-4 h-4" />{t('daily.saveToJournal', 'Save')}</>
                )}
              </Button>
            )}
            <Button
              onClick={async () => {
                const text = `${reflection.verseRef}: "${reflection.verseText}"\n\n${reflection.summary}\n\nFaithLight · faithlight.app`;
                if (navigator.share) {
                  await navigator.share({ title: 'Daily Reflection — FaithLight', text }).catch(() => {});
                } else {
                  await navigator.clipboard.writeText(text);
                }
              }}
              variant="outline"
              className="flex-1 gap-2 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 font-semibold text-sm"
            >
              <Share2 className="w-4 h-4" /> {t('common.share', 'Share')}
            </Button>
            <a href="/BibleReader" className="flex-1">
              <Button className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm">
                <BookOpen className="w-4 h-4" /> {t('daily.startReading', 'Start Reading')}
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}