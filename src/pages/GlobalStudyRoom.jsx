import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Send, Heart, Share2, Sparkles } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { createPageUrl } from '@/utils';
import { format, formatDistanceToNow } from 'date-fns';

const LANG_FLAGS = { en: '🇺🇸', om: '🇪🇹', am: '🇪🇹', ar: '🇸🇦', fr: '🇫🇷', sw: '🇰🇪' };
const LANG_NAMES = { en: 'English', om: 'Oromo', am: 'Amharic', ar: 'Arabic', fr: 'French', sw: 'Swahili' };

export default function GlobalStudyRoom() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [study, setStudy] = useState(null);
  const [messages, setMessages] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [prayerInput, setPrayerInput] = useState('');
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const roomId = `global-${todayKey}`;

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      base44.entities.StudyRoomMessage.filter({ roomId }).then(msgs => setMessages(msgs || [])).catch(() => {});
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const [currentUser, studies] = await Promise.all([
        base44.auth.me().catch(() => null),
        base44.entities.GlobalDailyStudy.filter({ dateKey: todayKey })
      ]);
      setUser(currentUser);

      if (studies?.length > 0) {
        setStudy(studies[0]);
      } else {
        await generateTodayStudy();
      }

      const [msgs, prayerList] = await Promise.all([
        base44.entities.StudyRoomMessage.filter({ roomId }),
        base44.entities.StudyRoomPrayer.filter({ roomId })
      ]);
      setMessages(msgs || []);
      setPrayers(prayerList || []);
    } catch (err) {
      console.error('Failed to load global study:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateTodayStudy = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an inspiring daily Bible study passage for today ${todayKey}. Pick a meaningful verse from the New Testament. Provide the full verse text accurately translated in English, Afaan Oromoo, Amharic, Arabic, French, and Swahili. Also provide a short inspiring topic name (3–5 words) and a reflection question in English.`,
        response_json_schema: {
          type: 'object',
          properties: {
            reference: { type: 'string' },
            topic: { type: 'string' },
            verseText_en: { type: 'string' },
            verseText_om: { type: 'string' },
            verseText_am: { type: 'string' },
            verseText_ar: { type: 'string' },
            verseText_fr: { type: 'string' },
            verseText_sw: { type: 'string' },
            reflectionQuestion_en: { type: 'string' }
          }
        }
      });

      const newStudy = await base44.entities.GlobalDailyStudy.create({
        dateKey: todayKey,
        ...response,
        participantCount: 0
      });
      setStudy(newStudy);
    } catch (err) {
      console.error('Failed to generate study:', err);
      setStudy({
        reference: 'Romans 8:28',
        topic: 'All Things Work Together',
        verseText_en: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
        verseText_om: 'Wanti hunduu warra Waaqayyoon jaallatan, warra karoora Isaa irratti waamaman, gaarii akka ta\'uuf kan hojjetu Waaqayyoo ta\'uu beekna.',
        verseText_am: 'እናውቃለን ደግሞ ለእግዚአብሔር ለሚወዱት፥ እንደ አሳቡም ለተጠሩት ሁሉ ነገር ለበጎ ያደርጋሉ።',
        reflectionQuestion_en: 'How has God turned a difficult situation in your life into something good?',
        participantCount: 0
      });
    } finally {
      setGenerating(false);
    }
  };

  const getVerseText = () => {
    if (!study) return '';
    return study[`verseText_${lang}`] || study.verseText_en || '';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !user || sending) return;
    setSending(true);
    try {
      const msg = await base44.entities.StudyRoomMessage.create({
        roomId,
        userId: user.id,
        messageType: 'text',
        content: messageInput,
        language: lang
      });
      setMessages(prev => [...prev, msg]);
      setMessageInput('');

      if (study?.id) {
        await base44.entities.GlobalDailyStudy.update(study.id, {
          participantCount: (study.participantCount || 0) + 1
        }).catch(() => {});
        setStudy(prev => prev ? { ...prev, participantCount: (prev.participantCount || 0) + 1 } : prev);
      }
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setSending(false);
    }
  };

  const handlePostPrayer = async () => {
    if (!prayerInput.trim() || !user) return;
    try {
      const p = await base44.entities.StudyRoomPrayer.create({
        roomId,
        userId: user.id,
        title: 'Global Study Prayer',
        content: prayerInput,
        isAnonymous: false,
        status: 'new',
        prayerCount: 0
      });
      setPrayers(prev => [...prev, p]);
      setPrayerInput('');
      setShowPrayerForm(false);
    } catch (err) {
      console.error('Failed to post prayer:', err);
    }
  };

  const handlePrayForRequest = async (prayer) => {
    if (!user) return;
    await base44.entities.StudyRoomPrayer.update(prayer.id, { prayerCount: (prayer.prayerCount || 0) + 1 }).catch(() => {});
    setPrayers(prev => prev.map(p => p.id === prayer.id ? { ...p, prayerCount: (p.prayerCount || 0) + 1 } : p));
  };

  const handleShare = () => {
    if (!study) return;
    const text = `📖 Global Bible Study\n\n${study.reference}\n\n"${getVerseText()}"\n\n🌍 Join ${((study.participantCount || 0) + 12847).toLocaleString()} believers on FaithLight`;
    if (navigator.share) {
      navigator.share({ title: `FaithLight: ${study.reference}`, text });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #3730a3 100%)' }}>
        <div className="text-center text-white space-y-4">
          <span className="text-6xl">🌍</span>
          <div className="w-8 h-8 border-2 border-white/50 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-indigo-200 text-sm">{generating ? "Preparing today's global study…" : "Loading…"}</p>
        </div>
      </div>
    );
  }

  const participantDisplay = ((study?.participantCount || 0) + 12847).toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Header */}
      <div className="text-white pb-6 shadow-xl" style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #3730a3 60%, #4f46e5 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-indigo-300 hover:text-white text-sm mb-5 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="space-y-3">
            {/* Badge */}
            <div className="flex items-center gap-2">
              <span className="text-3xl">🌍</span>
              <div>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Global Study Today</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-300 text-sm font-semibold">{participantDisplay} believers studying</span>
                </div>
              </div>
            </div>

            {/* Verse */}
            {study && (
              <>
                <div>
                  <h1 className="text-2xl font-bold">{study.reference}</h1>
                  {study.topic && <p className="text-indigo-300 text-sm mt-0.5">{study.topic}</p>}
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/15">
                  <p className="text-white/95 text-base italic leading-relaxed">"{getVerseText()}"</p>
                  <p className="text-indigo-300 text-xs mt-2 font-medium">{LANG_FLAGS[lang]} {LANG_NAMES[lang]}</p>
                </div>
              </>
            )}

            {/* Language flags */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Studying in:</span>
              <div className="flex gap-1 text-base">
                {Object.values(LANG_FLAGS).map((f, i) => (
                  <span key={i} className="opacity-75">{f}</span>
                ))}
              </div>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm bg-white/15 hover:bg-white/25 px-4 py-2 rounded-full transition-all"
            >
              <Share2 className="w-4 h-4" />
              {copied ? 'Copied!' : 'Share Insight'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto w-full px-4 pt-4 pb-24 flex-1">
        <Tabs defaultValue="discussion" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discussion">💬 Discussion</TabsTrigger>
            <TabsTrigger value="prayer">🙏 Prayer</TabsTrigger>
          </TabsList>

          {/* ── DISCUSSION ── */}
          <TabsContent value="discussion" className="mt-4 space-y-3">
            {study?.reflectionQuestion_en && (
              <div className="bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">💡 Today's Reflection</p>
                <p className="text-sm text-indigo-900 leading-relaxed">{study.reflectionQuestion_en}</p>
              </div>
            )}

            <div className="bg-white rounded-xl border h-80 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                  <span className="text-5xl">🌍</span>
                  <p className="text-gray-400 text-sm font-medium">Be the first to share your reflection!</p>
                  <p className="text-gray-300 text-xs">Believers from around the world will join you</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <GlobalMessage key={msg.id || i} message={msg} isOwn={msg.userId === user?.id} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {user ? (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Share your reflection with the world…"
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700" disabled={sending}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Sign in to join the global discussion
              </button>
            )}
          </TabsContent>

          {/* ── PRAYER ── */}
          <TabsContent value="prayer" className="mt-4 space-y-3">
            {user && (
              showPrayerForm ? (
                <div className="bg-white rounded-xl border p-4 space-y-3">
                  <textarea
                    value={prayerInput}
                    onChange={(e) => setPrayerInput(e.target.value)}
                    placeholder="Share a prayer for the global community…"
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPrayerForm(false)} className="flex-1">Cancel</Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex-1" onClick={handlePostPrayer}>Post Prayer</Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowPrayerForm(true)} className="w-full bg-purple-600 hover:bg-purple-700 gap-2">
                  <Heart className="w-4 h-4" /> Add Prayer
                </Button>
              )
            )}

            {prayers.length === 0 ? (
              <div className="text-center py-16 text-gray-400 space-y-2">
                <span className="text-5xl">🙏</span>
                <p className="text-sm">No prayers yet — add yours</p>
              </div>
            ) : (
              [...prayers].reverse().map((p, i) => (
                <div key={p.id || i} className="bg-white rounded-xl border p-4 border-l-4 border-l-purple-400">
                  <p className="text-sm text-gray-800 leading-relaxed">{p.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-purple-400" /> {p.prayerCount || 0} praying
                    </span>
                    {user && (
                      <button
                        onClick={() => handlePrayForRequest(p)}
                        className="text-xs text-purple-600 font-bold hover:text-purple-800 bg-purple-50 px-3 py-1 rounded-full transition-colors"
                      >
                        Amen 🙏
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function GlobalMessage({ message, isOwn }) {
  const flag = LANG_FLAGS[message.language] || '🌍';
  const langName = LANG_NAMES[message.language] || '';
  const timestamp = message.created_date
    ? formatDistanceToNow(new Date(message.created_date), { addSuffix: true })
    : '';

  return (
    <div className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-base">
        {flag}
      </div>
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[78%]`}>
        {!isOwn && langName && (
          <span className="text-[10px] text-gray-400 mb-0.5 font-medium">{langName}</span>
        )}
        <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isOwn ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}>
          {message.content}
        </div>
        {timestamp && <span className="text-[10px] text-gray-400 mt-0.5">{timestamp}</span>}
      </div>
    </div>
  );
}