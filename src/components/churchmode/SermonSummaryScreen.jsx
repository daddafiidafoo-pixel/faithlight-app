import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Share2, BookOpen, Loader2, MessageCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SermonSummaryScreen({ session, onClose }) {
  const navigate = useNavigate();
  const [aiSummary, setAiSummary] = useState('');
  const [suggestedReading, setSuggestedReading] = useState([]);
  const [loadingAI, setLoadingAI] = useState(true);
  const [verseImageUrl, setVerseImageUrl] = useState('');

  const title = session?.title || 'Sermon';
  const verseRefs = session?.verseRefs || [];
  const churchName = session?.churchName || '';
  const primaryVerse = verseRefs[0] || '';

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setLoadingAI(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `A sermon titled "${title}" was preached${churchName ? ` at ${churchName}` : ''}. Scripture references used: ${verseRefs.join(', ') || 'not specified'}.

Please provide:
1. A warm, 2-3 sentence summary of what this sermon message was likely about based on the title and scriptures.
2. A 7-day suggested reading plan (one scripture per day) that continues this sermon's theme for personal study during the week.

Be encouraging, pastoral in tone, and practical.`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            weeklyPlan: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  reference: { type: 'string' },
                  focus: { type: 'string' },
                }
              }
            }
          }
        }
      });
      setAiSummary(result.summary || '');
      setSuggestedReading(result.weeklyPlan || []);
    } catch {
      setAiSummary("Today's message was a blessing. Continue reflecting on the scriptures shared and let them guide your week.");
    }
    setLoadingAI(false);
  };

  const handleShare = () => {
    const appUrl = window.location.origin;
    const text = `🙏 Just attended "${title}"${churchName ? ` at ${churchName}` : ''}\n\n${verseRefs.length > 0 ? `📖 ${verseRefs.join(' · ')}\n\n` : ''}Follow along with your church on FaithLight:\n👉 ${appUrl}`;
    if (navigator.share) {
      navigator.share({ title: `Sermon: ${title}`, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
    }
  };

  const handleWhatsApp = () => {
    const appUrl = window.location.origin;
    const text = encodeURIComponent(`🙏 Just attended "${title}"${churchName ? ` at ${churchName}` : ''}!\n\n${verseRefs.length > 0 ? `📖 ${verseRefs.join(' · ')}\n\n` : ''}Follow along with your church on FaithLight:\n👉 ${appUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="text-center space-y-2 pb-2">
          <div className="text-5xl mb-3">🙏</div>
          <h1 className="text-2xl font-bold text-white">Sermon Complete</h1>
          <p className="text-indigo-300 text-sm font-medium">{title}</p>
          {churchName && <p className="text-xs text-indigo-400">{churchName}</p>}
        </div>

        {/* AI Summary */}
        <div className="bg-white/10 rounded-2xl p-5 border border-white/15">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✨</span>
            <h2 className="font-semibold text-white text-sm">Today's Message</h2>
          </div>
          {loadingAI ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
              <span className="text-sm text-indigo-300">Preparing your sermon summary…</span>
            </div>
          ) : (
            <p className="text-indigo-100 text-sm leading-relaxed">{aiSummary}</p>
          )}
        </div>

        {/* Verse card */}
        {verseRefs.length > 0 && (
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 shadow-lg">
            <p className="text-xs text-amber-100 font-semibold uppercase tracking-wide mb-2">Key Scripture</p>
            <p className="text-white font-bold text-lg mb-1">{verseRefs[0]}</p>
            {verseRefs.length > 1 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {verseRefs.slice(1).map((ref, i) => (
                  <span key={i} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{ref}</span>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate(createPageUrl('BibleReaderPage'))}
              className="mt-3 flex items-center gap-1.5 text-xs text-amber-100 font-semibold hover:text-white transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" /> Open in Bible Reader <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 rounded-xl py-3.5 font-semibold text-sm text-white transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Share on WhatsApp
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 rounded-xl py-3.5 font-semibold text-sm text-white transition-colors"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* Continue this study */}
        {!loadingAI && suggestedReading.length > 0 && (
          <div className="bg-white/10 rounded-2xl p-5 border border-white/15">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-indigo-300" />
              <h2 className="font-semibold text-white text-sm">Continue This Study This Week</h2>
            </div>
            <div className="space-y-2.5">
              {suggestedReading.map((day, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-500/40 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-200">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-indigo-300 font-medium">{day.day}</p>
                    <p className="text-sm font-semibold text-white">{day.reference}</p>
                    {day.focus && <p className="text-xs text-indigo-300 mt-0.5">{day.focus}</p>}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate(createPageUrl('GuidedStudy'))}
              className="mt-4 w-full py-3 bg-indigo-500 hover:bg-indigo-400 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
            >
              Open Guided Study <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* AI Explain button */}
        <button
          onClick={() => navigate(createPageUrl('AIBibleCompanion'))}
          className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
        >
          ✨ Ask AI About This Sermon
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-3 text-indigo-400 hover:text-indigo-200 text-sm transition-colors"
        >
          Close & Return Home
        </button>
      </div>
    </div>
  );
}