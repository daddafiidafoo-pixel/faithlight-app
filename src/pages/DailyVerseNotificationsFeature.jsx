import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, Monitor, Clock, Check, X, RefreshCw, BookOpen, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PREFS_KEY = 'fl_verse_notification_prefs';
const LAST_VERSE_KEY = 'fl_last_daily_verse';

const SAMPLE_VERSES = [
  { ref: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.' },
  { ref: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.' },
  { ref: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.' },
  { ref: 'John 3:16', text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.' },
  { ref: 'Romans 8:28', text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.' },
  { ref: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart, and do not lean on your own understanding.' },
  { ref: 'Isaiah 40:31', text: 'But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.' },
  { ref: 'Matthew 11:28', text: 'Come to me, all who labor and are heavy laden, and I will give you rest.' },
];

function getDefaultPrefs() {
  return {
    emailEnabled: false,
    browserEnabled: false,
    email: '',
    time: '08:00',
    language: 'en',
    subscribed: false,
  };
}

function loadPrefs() {
  try { return { ...getDefaultPrefs(), ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; } catch { return getDefaultPrefs(); }
}
function savePrefs(p) { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); }

function getTodayVerse() {
  const today = new Date().toDateString();
  try {
    const stored = JSON.parse(localStorage.getItem(LAST_VERSE_KEY) || '{}');
    if (stored.date === today) return stored.verse;
  } catch {}
  const verse = SAMPLE_VERSES[Math.floor(Math.random() * SAMPLE_VERSES.length)];
  localStorage.setItem(LAST_VERSE_KEY, JSON.stringify({ date: today, verse }));
  return verse;
}

async function requestBrowserPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function sendTestBrowserNotification(verse) {
  if (Notification.permission === 'granted') {
    new Notification('📖 Daily Bible Verse', {
      body: `"${verse.text}" — ${verse.ref}`,
      icon: '/favicon.ico',
    });
  }
}

export default function DailyVerseNotificationsFeature() {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [todayVerse, setTodayVerse] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [browserGranted, setBrowserGranted] = useState(Notification?.permission === 'granted');
  const [aiVerse, setAiVerse] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => { setTodayVerse(getTodayVerse()); }, []);

  const updatePref = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    savePrefs({ ...prefs, subscribed: prefs.emailEnabled || prefs.browserEnabled });
    if (prefs.browserEnabled && !browserGranted) {
      const granted = await requestBrowserPermission();
      setBrowserGranted(granted);
      if (!granted) updatePref('browserEnabled', false);
    }
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestBrowser = async () => {
    const granted = await requestBrowserPermission();
    setBrowserGranted(granted);
    if (granted && todayVerse) sendTestBrowserNotification(todayVerse);
  };

  const handleSendEmail = async () => {
    if (!prefs.email || !todayVerse) return;
    setSendingEmail(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: prefs.email,
        subject: `📖 Your Daily Bible Verse — ${todayVerse.ref}`,
        body: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;">
          <h2 style="color:#6C5CE7;margin-bottom:8px;">Your Daily Bible Verse</h2>
          <div style="background:#F3F0FF;border-left:4px solid #6C5CE7;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="font-style:italic;font-size:18px;color:#1F2937;margin:0 0 8px 0;">"${todayVerse.text}"</p>
            <p style="font-weight:bold;color:#6C5CE7;margin:0;">— ${todayVerse.ref}</p>
          </div>
          <p style="color:#6B7280;font-size:14px;">May this verse guide your day. Open FaithLight to read more.</p>
        </div>`
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch (e) { console.error(e); }
    setSendingEmail(false);
  };

  const handleAIVerse = async () => {
    setLoadingAI(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: 'Give me an encouraging Bible verse for today with a short 1-sentence reflection. Respond as JSON with keys: ref (string), text (string), reflection (string).',
        response_json_schema: {
          type: 'object',
          properties: {
            ref: { type: 'string' },
            text: { type: 'string' },
            reflection: { type: 'string' }
          }
        }
      });
      setAiVerse(res);
    } catch (e) { console.error(e); }
    setLoadingAI(false);
  };

  const verse = aiVerse || todayVerse;

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F8FC' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-6" style={{ background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)' }}>
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-1">Daily Verse Alerts</h1>
          <p className="text-blue-100 text-sm">Stay connected to scripture every day</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-4">
        {/* Today's Verse Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={16} style={{ color: '#0284C7' }} />
              <span className="text-sm font-semibold text-gray-700">Today's Verse</span>
            </div>
            <button onClick={handleAIVerse} disabled={loadingAI}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 transition-colors">
              {loadingAI ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {loadingAI ? 'Loading...' : 'AI Verse'}
            </button>
          </div>
          {verse && (
            <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
              <p className="text-sm italic text-gray-700 leading-relaxed mb-2">"{verse.text}"</p>
              <p className="text-xs font-bold text-blue-600">— {verse.ref}</p>
              {aiVerse?.reflection && (
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-blue-200">{aiVerse.reflection}</p>
              )}
            </div>
          )}
        </div>

        {/* Browser Notifications */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#FEF3C7' }}>
                <Monitor size={18} style={{ color: '#D97706' }} />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Browser Alerts</p>
                <p className="text-xs text-gray-400">{browserGranted ? 'Permission granted ✓' : 'Requires permission'}</p>
              </div>
            </div>
            <button onClick={() => updatePref('browserEnabled', !prefs.browserEnabled)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: prefs.browserEnabled ? '#0284C7' : '#E5E7EB' }}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.browserEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          {prefs.browserEnabled && (
            <button onClick={handleTestBrowser}
              className="w-full py-2 rounded-xl text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors">
              Send Test Notification
            </button>
          )}
        </div>

        {/* Email Notifications */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                <Mail size={18} style={{ color: '#16A34A' }} />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Email Delivery</p>
                <p className="text-xs text-gray-400">Verse delivered to your inbox</p>
              </div>
            </div>
            <button onClick={() => updatePref('emailEnabled', !prefs.emailEnabled)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: prefs.emailEnabled ? '#16A34A' : '#E5E7EB' }}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.emailEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          {prefs.emailEnabled && (
            <div className="space-y-3">
              <input
                type="email"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                placeholder="your@email.com"
                value={prefs.email}
                onChange={e => updatePref('email', e.target.value)}
              />
              <button onClick={handleSendEmail} disabled={sendingEmail || !prefs.email}
                className="w-full py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: emailSent ? '#16A34A' : '#0284C7' }}>
                {sendingEmail ? 'Sending...' : emailSent ? '✓ Email Sent!' : "Send Today's Verse Now"}
              </button>
            </div>
          )}
        </div>

        {/* Preferred Time */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#EDE9FE' }}>
              <Clock size={18} style={{ color: '#6C5CE7' }} />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Preferred Time</p>
              <p className="text-xs text-gray-400">When to receive your daily verse</p>
            </div>
          </div>
          <input type="time" value={prefs.time} onChange={e => updatePref('time', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
        </div>

        {/* Save Button */}
        <button onClick={handleSave} disabled={saving}
          className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          style={{ background: saved ? '#16A34A' : 'linear-gradient(135deg, #6C5CE7, #8B5CF6)' }}>
          {saving ? <RefreshCw size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Bell size={16} />}
          {saving ? 'Saving...' : saved ? 'Preferences Saved!' : 'Save Notification Settings'}
        </button>
      </div>
    </div>
  );
}