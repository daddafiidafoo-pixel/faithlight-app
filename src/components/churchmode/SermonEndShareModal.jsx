import React, { useState, useEffect } from 'react';
import { MessageCircle, Share2, Copy, Check, Users, BookOpen, X, ChevronRight, BarChart2, FileText, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SermonEndShareModal({ session, onClose, onConfirmEnd }) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('share'); // 'share' | 'analytics' | 'summary'
  const [analytics, setAnalytics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const title = session?.title || 'Today\'s Sermon';
  const churchName = session?.churchName || 'Our Church';
  const verseRefs = session?.verseRefs || [];
  const code = session?.code;
  const sessionId = session?.id || session?.sessionId;
  const appUrl = window.location.origin;

  const inviteText = `🙏 *${churchName}* used FaithLight during today's sermon: "${title}"\n\n${verseRefs.length > 0 ? `📖 Scriptures: ${verseRefs.join(', ')}\n\n` : ''}Join us and grow in faith together!\n👉 ${appUrl} → Church Mode → Code: *${code}*`;

  // Load analytics when tab switches
  useEffect(() => {
    if (tab === 'analytics' && !analytics) loadAnalytics();
    if (tab === 'summary' && !summary) loadSummary();
  }, [tab]);

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await base44.functions.invoke('churchmode_getSession', { sessionId });
      const s = res?.data?.session;
      setAnalytics({
        membersJoined: s?.participant_count || 0,
        versesShared: verseRefs.length,
        notesTaken: s?.notes_count || 0,
      });
    } catch {
      setAnalytics({ membersJoined: 0, versesShared: verseRefs.length, notesTaken: 0 });
    }
    setLoadingAnalytics(false);
  };

  const loadSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a brief sermon summary for the following service:
Sermon Title: "${title}"
Church: "${churchName}"
Scripture References: ${verseRefs.join(', ') || 'none specified'}

Produce:
1. A 2–3 sentence sermon summary
2. 3 key takeaway points (short, practical)
3. A closing reflection question

Format as JSON: { summary: string, keyPoints: string[], reflectionQuestion: string }`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            keyPoints: { type: 'array', items: { type: 'string' } },
            reflectionQuestion: { type: 'string' },
          }
        }
      });
      setSummary(res);
    } catch {
      setSummary({
        summary: `Today's sermon "${title}" explored the Scripture passages shared during service.`,
        keyPoints: ['God\'s Word is living and active.', 'Faith is strengthened through community.', 'Apply today\'s message to your daily life.'],
        reflectionQuestion: 'How will you apply what you heard today in your life this week?',
      });
    }
    setLoadingSummary(false);
  };

  const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(inviteText)}`, '_blank');

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${churchName} on FaithLight`, text: inviteText }).catch(() => {});
    } else handleCopyLink();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveSummary = () => {
    if (!summary) return;
    const text = `📖 ${title} — ${churchName}\n\n${summary.summary}\n\nKey Points:\n${summary.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nReflection: ${summary.reflectionQuestion}`;
    navigator.clipboard.writeText(text);
    alert('Sermon summary copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)' }} className="px-6 pt-6 pb-5 text-center relative flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="text-4xl mb-2">🙏</div>
          <h2 className="text-lg font-bold text-white">Service Complete!</h2>
          <p className="text-indigo-200 text-sm">{title}</p>
          {churchName && <p className="text-indigo-300 text-xs">{churchName}</p>}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          {[
            { id: 'share', icon: Share2, label: 'Share' },
            { id: 'analytics', icon: BarChart2, label: 'Analytics' },
            { id: 'summary', icon: FileText, label: 'Summary' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors border-b-2 ${
                tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto flex-1">

          {/* SHARE TAB */}
          {tab === 'share' && (
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm font-bold text-gray-800">Invite Others to FaithLight</p>
              <p className="text-xs text-gray-500">Share today's sermon and help your community discover FaithLight.</p>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-4 whitespace-pre-line">{inviteText}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={handleWhatsApp} className="flex flex-col items-center gap-2 bg-green-500 hover:bg-green-600 rounded-2xl py-4 transition-colors">
                  <MessageCircle className="w-5 h-5 text-white" />
                  <span className="text-white text-xs font-bold">WhatsApp</span>
                </button>
                <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-2xl py-4 transition-colors">
                  <Share2 className="w-5 h-5 text-white" />
                  <span className="text-white text-xs font-bold">Share</span>
                </button>
                <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 bg-gray-700 hover:bg-gray-800 rounded-2xl py-4 transition-colors">
                  {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                  <span className="text-white text-xs font-bold">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {tab === 'analytics' && (
            <div className="px-6 py-5 space-y-5">
              <p className="text-sm font-bold text-gray-800">Session Analytics</p>
              {loadingAnalytics ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: 'Members Joined', value: analytics?.membersJoined ?? '—', icon: Users, color: 'bg-indigo-100 text-indigo-600' },
                    { label: 'Verses Shared', value: analytics?.versesShared ?? verseRefs.length, icon: BookOpen, color: 'bg-amber-100 text-amber-600' },
                    { label: 'Notes Taken', value: analytics?.notesTaken ?? '—', icon: FileText, color: 'bg-green-100 text-green-600' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 text-center pt-1">Use these numbers to track congregation engagement over time.</p>
                </div>
              )}
            </div>
          )}

          {/* SUMMARY TAB */}
          {tab === 'summary' && (
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-800">AI Sermon Summary</p>
                {summary && (
                  <button onClick={handleSaveSummary} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                )}
              </div>
              {loadingSummary ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  <p className="text-xs text-gray-400">Generating sermon summary…</p>
                </div>
              ) : summary ? (
                <div className="space-y-4">
                  {verseRefs.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {verseRefs.map((ref, i) => (
                        <span key={i} className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full">📖 {ref}</span>
                      ))}
                    </div>
                  )}
                  <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                    <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Key Takeaways</p>
                    <div className="space-y-2">
                      {(summary.keyPoints || []).map((point, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-3">
                          <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                          <p className="text-sm text-gray-700">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {summary.reflectionQuestion && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Reflection</p>
                      <p className="text-sm text-gray-700 italic">"{summary.reflectionQuestion}"</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="px-6 pb-5 pt-3 flex-shrink-0 border-t border-gray-100">
          <button
            onClick={onConfirmEnd}
            className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            End Session <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}