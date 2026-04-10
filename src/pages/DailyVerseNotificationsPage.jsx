import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguageStore } from '@/components/languageStore';
import { Bell, BellOff, Check, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const UI = {
  en: {
    title: 'Daily Verse Notification',
    subtitle: 'Get the verse of the day delivered to you',
    enable: 'Enable Notifications',
    disable: 'Disable',
    timeLabel: 'Notification Time',
    save: 'Save Settings',
    saved: 'Saved!',
    testSend: 'Send Test Notification',
    sending: 'Sending...',
    sent: 'Sent! Check your email.',
    emailLabel: 'Send to email',
    desc: 'We\'ll send the daily verse to your email at the time you choose.',
    noAuth: 'Sign in to set up daily verse notifications.',
    emailInput: 'Email address',
    enabled: 'Notifications active',
    disabled: 'Notifications off',
  },
  om: {
    title: 'Beeksisa Aayata Guyyaa',
    subtitle: 'Aayata guyyaa yeroo barbaadde kee',
    enable: 'Beeksisa Dandeessisi',
    disable: 'Dhabi',
    timeLabel: 'Yeroo Beeksisaa',
    save: 'Qusadhu',
    saved: 'Qusatame!',
    testSend: 'Beeksisa Yaali Ergii',
    sending: 'Ergamaa jira...',
    sent: 'Ergame! Imeelii kee ilaali.',
    emailLabel: 'Imeelitti ergii',
    desc: 'Aayata guyyaa yeroo filatte imeeliidhaan siif ergina.',
    noAuth: 'Seeni beeksisa qindaawsudhaaf.',
    emailInput: 'Imeelii',
    enabled: 'Beeksisni hojii irra jira',
    disabled: 'Beeksisni cufame',
  },
  am: {
    title: 'ዕለታዊ ቃል ማሳወቂያ',
    subtitle: 'ዕለታዊ ቃሉን በሚፈልጉት ሰዓት ያግኙ',
    enable: 'ማሳወቂያ አንቃ',
    disable: 'አጥፋ',
    timeLabel: 'የማሳወቂያ ሰዓት',
    save: 'አስቀምጥ',
    saved: 'ተቀምጧል!',
    testSend: 'ሙከራ ማሳወቂያ ላክ',
    sending: 'እየተላከ ነው...',
    sent: 'ተልኳል! ኢሜይልዎን ይፈትሹ።',
    emailLabel: 'ወደ ኢሜይል ላክ',
    desc: 'ዕለታዊ ቃሉን በሚፈልጉት ሰዓት ወደ ኢሜይልዎ እንልካለን።',
    noAuth: 'ዕለታዊ ቃል ማሳወቂያ ለማዋቀር ይግቡ።',
    emailInput: 'ኢሜይል አድራሻ',
    enabled: 'ማሳወቂያ ንቁ ነው',
    disabled: 'ማሳወቂያ ጠፍቷል',
  },
};

const getL = (lang) => UI[lang] || UI.en;

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  return { value: String(i).padStart(2, '0') + ':00', label: `${h}:00 ${ampm}` };
});

export default function DailyVerseNotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const L = getL(uiLanguage);

  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('07:00');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // Load existing settings from DailyReminderSettings entity
  useEffect(() => {
    if (!isAuthenticated || !user?.email) { setLoading(false); return; }
    setEmail(user.email);
    base44.entities.DailyReminderSettings
      .filter({ user_email: user.email }, null, 1)
      .then(rows => {
        if (rows[0]) {
          setEnabled(rows[0].is_enabled ?? false);
          setTime(rows[0].reminder_time || '07:00');
          setEmail(rows[0].email || user.email);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.email]);

  const handleSave = async () => {
    if (!isAuthenticated || saving) return;
    setSaving(true);
    setSavedMsg('');
    try {
      const existing = await base44.entities.DailyReminderSettings.filter({ user_email: user.email }, null, 1);
      const data = { user_email: user.email, is_enabled: enabled, reminder_time: time, email };
      if (existing[0]) {
        await base44.entities.DailyReminderSettings.update(existing[0].id, data);
      } else {
        await base44.entities.DailyReminderSettings.create(data);
      }
      setSavedMsg(L.saved);
      setTimeout(() => setSavedMsg(''), 3000);
    } catch {}
    setSaving(false);
  };

  const handleTestSend = async () => {
    if (sending) return;
    setSending(true);
    setSentMsg('');
    try {
      await base44.functions.invoke('sendDailyVerseEmail', {
        email,
        language: uiLanguage,
        test: true,
      });
      setSentMsg(L.sent);
      setTimeout(() => setSentMsg(''), 5000);
    } catch {
      setSentMsg('Could not send. Please try again.');
    }
    setSending(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F6F1' }}>
        <div className="text-center px-6">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-500">{L.noAuth}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F6F1' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">{L.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{L.subtitle}</p>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 pb-28 space-y-5">

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </div>
        ) : (
          <>
            {/* Toggle card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${enabled ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    {enabled ? <Bell className="w-5 h-5 text-purple-600" /> : <BellOff className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{enabled ? L.enabled : L.disabled}</p>
                    <p className="text-xs text-gray-400">{L.emailLabel}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEnabled(v => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-300'}`}
                  aria-label="Toggle notifications"
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </motion.div>

            {/* Time picker */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                {L.timeLabel}
              </label>
              <select
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                {HOURS.map(h => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </motion.div>

            {/* Email input */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">{L.emailInput}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <p className="text-xs text-gray-400 mt-2">{L.desc}</p>
            </motion.div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-purple-600 text-white font-semibold text-sm flex items-center justify-center gap-2 min-h-[52px] hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : savedMsg
                ? <><Check className="w-4 h-4" /> {savedMsg}</>
                : L.save
              }
            </button>

            {/* Test send */}
            <button
              onClick={handleTestSend}
              disabled={sending || !email}
              className="w-full py-3.5 rounded-2xl border-2 border-purple-200 text-purple-600 font-semibold text-sm flex items-center justify-center gap-2 min-h-[48px] hover:bg-purple-50 disabled:opacity-50 transition-colors"
            >
              {sending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {L.sending}</>
                : sentMsg
                ? <><Check className="w-4 h-4 text-green-500" /> {sentMsg}</>
                : <><Bell className="w-4 h-4" /> {L.testSend}</>
              }
            </button>
          </>
        )}
      </div>
    </div>
  );
}