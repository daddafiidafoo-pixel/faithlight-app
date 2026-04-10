import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Sun, Clock, Loader2, Check } from 'lucide-react';

const LANGUAGES = {
  en: {
    title: 'Daily Reminders',
    subtitle: 'Build a consistent faith habit',
    todaysTopic: "Today's Focus",
    verse: 'Bible Verse',
    topic: 'Prayer Topic',
    reminderTime: 'Reminder Time',
    enableReminders: 'Enable Reminders',
    save: 'Save Settings',
    loading: 'Loading...',
    marked: 'Marked as seen',
    noVerse: 'Check back tomorrow for a new verse',
  },
  om: {
    title: 'Yaadannoo Guyyaa',
    subtitle: 'Jiidha amantii inni jiru uumi',
    todaysTopic: 'Murtoo Guyyaa',
    verse: 'Aayata Macaaba',
    topic: 'Murtoo Kadhannaa',
    reminderTime: 'Yeroo Yaadannoo',
    enableReminders: 'Yaadannoo Bulchi',
    save: 'Saagi',
    loading: 'Hojii...',
    marked: 'Argate jedhe',
    noVerse: 'Guyyaa kam caali fudhadhu',
  },
  am: {
    title: 'ዕለታዊ ማስታወቂያ',
    subtitle: 'ሃይማንተ ልምድ ይገንቡ',
    todaysTopic: 'የዛሬ ትኩረት',
    verse: 'ስሪት',
    topic: 'ጸሎት ርዕስ',
    reminderTime: 'ማስታወቂያ ጊዜ',
    enableReminders: 'ማስታወቂያ አንቃ',
    save: 'ጥበቅ',
    loading: 'ይጫናል...',
    marked: 'ታይቷል',
    noVerse: 'ነገ ለአዲስ ጥቅስ ይመለሱ',
  },
};

const DAILY_TOPICS = {
  en: [
    { verse: 'John 3:16', topic: 'God\'s love for us' },
    { verse: 'Psalm 23:1-3', topic: 'Finding peace and rest' },
    { verse: 'Proverbs 3:5-6', topic: 'Trusting God\'s guidance' },
    { verse: 'Matthew 6:33', topic: 'Seeking God first' },
    { verse: '1 John 4:9', topic: 'God\'s grace' },
    { verse: 'Philippians 4:6-7', topic: 'Peace through prayer' },
    { verse: 'Joshua 1:9', topic: 'Be strong and courageous' },
  ],
  om: [
    { verse: 'Yuuhannaa 3:16', topic: 'Jaalalcha Waaqayyo' },
    { verse: 'Faarfannaa 23:1-3', topic: 'Nagaa akka argattan' },
    { verse: 'Seenaa 3:5-6', topic: 'Amanachuu Waaqayyo' },
    { verse: 'Maattiyoos 6:33', topic: 'Mura Waaqayyo' },
    { verse: '1 Yuuhannaa 4:9', topic: 'Midhaa Waaqayyo' },
    { verse: 'Philiphiyos 4:6-7', topic: 'Nagaa kadhannaa' },
    { verse: 'Iosuwaa 1:9', topic: 'Jabina fi Huggana' },
  ],
  am: [
    { verse: 'ዮሐንስ 3:16', topic: 'የእግዚአብሔር ፍቅር' },
    { verse: 'ዖሪት 23:1-3', topic: 'ሰላም ማግኘት' },
    { verse: 'ምሳሌ 3:5-6', topic: 'እግዚአብሔርን ማመን' },
    { verse: 'ማቴዎስ 6:33', topic: 'የእግዚአብሔር ንግሥት' },
    { verse: '1 ዮሐንስ 4:9', topic: 'የእግዚአብሔር ምህረት' },
    { verse: 'ፊልንጤዎስ 4:6-7', topic: 'ጸሎትን ያሸናፋል' },
    { verse: 'ዮሐሻፀ 1:9', topic: 'ጠንካራ እና 담' },
  ],
};

export default function DailyReminderDashboard() {
  const [language, setLanguage] = useState('en');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [isEnabled, setIsEnabled] = useState(true);

  const L = LANGUAGES[language];
  const queryClient = useQueryClient();

  // Get today's topic
  const getTodaysTopic = () => {
    const today = new Date();
    const dayIndex = today.getDay();
    const topics = DAILY_TOPICS[language];
    return topics[dayIndex % topics.length];
  };

  const todaysTopic = getTodaysTopic();

  const { data: reminderSettings, isLoading } = useQuery({
    queryKey: ['reminderSettings', language],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      const settings = await base44.entities.DailyReminderSettings.filter({
        userEmail: user.email,
      });
      return settings[0] || null;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      if (!user) throw new Error('User not authenticated');
      
      if (reminderSettings) {
        return await base44.entities.DailyReminderSettings.update(reminderSettings.id, {
          reminderTime,
          isEnabled,
          language,
        });
      } else {
        return await base44.entities.DailyReminderSettings.create({
          userEmail: user.email,
          language,
          reminderTime,
          isEnabled,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminderSettings'] });
    },
  });

  useEffect(() => {
    if (reminderSettings) {
      setReminderTime(reminderSettings.reminderTime || '09:00');
      setIsEnabled(reminderSettings.isEnabled ?? true);
    }
  }, [reminderSettings]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full">
              <Sun size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{L.title}</h1>
              <p className="text-slate-600 text-sm">{L.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Today's Topic Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sun size={20} className="text-amber-600" /> {L.todaysTopic}
          </h2>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">{L.verse}</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{todaysTopic.verse}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">{L.topic}</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{todaysTopic.topic}</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">{L.reminderTime}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
              <label className="text-slate-700 font-medium">{L.enableReminders}</label>
            </div>

            {isEnabled && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Pick a time</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> {L.loading}
                </>
              ) : (
                <>
                  <Check size={20} /> {L.save}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="en">English</option>
            <option value="om">Afaan Oromoo</option>
            <option value="am">አማርኛ</option>
          </select>
        </div>
      </div>
    </div>
  );
}