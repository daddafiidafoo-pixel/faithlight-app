import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Volume2, VolumeX, RefreshCw, Clock, Bell, CheckCircle2, Loader2, BookOpen, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TIME_SLOTS = [
  { value: '05:30', label: '5:30 AM – Dawn Prayer' },
  { value: '06:00', label: '6:00 AM – Early Morning' },
  { value: '07:00', label: '7:00 AM – Morning' },
  { value: '08:00', label: '8:00 AM – Morning' },
  { value: '09:00', label: '9:00 AM – Mid Morning' },
];

function PrayerDisplay({ prayer, onSpeak, speaking, onStop }) {
  const sections = prayer.split('\n\n').filter(Boolean);

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest">Your Morning Prayer</p>
          <h2 className="text-lg font-extrabold mt-0.5">~3 min devotional</h2>
        </div>
        <button
          onClick={speaking ? onStop : onSpeak}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${speaking ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-400 hover:bg-amber-500 text-gray-900'}`}>
          {speaking ? <><VolumeX className="w-4 h-4" /> Stop</> : <><Volume2 className="w-4 h-4" /> Listen</>}
        </button>
      </div>

      {/* Animated speaking indicator */}
      {speaking && (
        <div className="flex items-center gap-2 mb-4 bg-white/10 rounded-xl px-3 py-2">
          <div className="flex gap-0.5 items-end h-5">
            {[1,2,3,4,5].map(i => (
              <span key={i} className="w-1 bg-amber-400 rounded-full animate-pulse"
                style={{ height: `${[60,90,70,100,55][i-1]}%`, animationDelay: `${i*0.1}s` }} />
            ))}
          </div>
          <span className="text-xs text-white/70 font-medium">Reading your prayer…</span>
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {sections.map((section, i) => {
          const isHeader = section.startsWith('**') || section.length < 50;
          return (
            <div key={i} className={isHeader ? '' : 'bg-white/5 rounded-xl p-3 border border-white/10'}>
              <p className={`leading-relaxed ${isHeader ? 'text-amber-300 font-bold text-sm uppercase tracking-wide' : 'text-white/90 text-sm'}`}>
                {section.replace(/\*\*/g, '')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DailyPrayerGenerator() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [prayer, setPrayer] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('07:00');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {}).finally(() => setAuthChecked(true));
    return () => synthRef.current?.cancel();
  }, []);

  // Load recent journal entries
  const { data: journals = [] } = useQuery({
    queryKey: ['journal-for-prayer', user?.id],
    enabled: !!user,
    queryFn: () => base44.entities.StudyNote.filter({ user_id: user.id }, '-created_date', 10),
  });

  // Load recent highlights
  const { data: highlights = [] } = useQuery({
    queryKey: ['highlights-for-prayer', user?.id],
    enabled: !!user,
    queryFn: () => base44.entities.VerseHighlight.filter({ user_id: user.id }, '-created_date', 10),
  });

  // Load saved notification settings
  useEffect(() => {
    if (!user) return;
    base44.entities.NotificationSettings.filter({ user_id: user.id }, '-created_date', 1)
      .then(r => {
        if (r[0]?.prayer_reminder_enabled) {
          setScheduleEnabled(true);
          if (r[0]?.prayer_reminder_time) setScheduleTime(r[0].prayer_reminder_time);
        }
      }).catch(() => {});
  }, [user]);

  const generatePrayer = async () => {
    setGenerating(true);
    setPrayer(null);

    const journalContext = journals.slice(0, 5).map(j =>
      `Journal (${j.verse_ref || 'reflection'}): ${j.reflection?.slice(0, 150)}`
    ).join('\n');

    const highlightContext = highlights.slice(0, 5).map(h =>
      `Highlighted verse ${h.reference}: "${h.verse_text?.slice(0, 120)}"`
    ).join('\n');

    const prompt = `You are a pastoral prayer writer. Based on this user's recent Bible study and journal reflections, write a warm, personal, 3-minute morning prayer.

USER'S RECENT CONTEXT:
${journalContext || '(No journal entries yet — write a general morning devotional prayer)'}

HIGHLIGHTED SCRIPTURES:
${highlightContext || '(No highlights yet)'}

INSTRUCTIONS:
- Start with adoration/praise
- Include a section of thanksgiving using themes from their highlights
- Add a personal petition section reflecting their journal struggles and hopes
- Include a commitment/dedication section
- End with a blessing declaration
- Use second-person to address God directly
- Keep it warm, conversational, and deeply personal
- Format with clear section headers wrapped in **header** markers
- Total length: approximately 300-400 words
- Do NOT include any meta-commentary — only the prayer text itself`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setPrayer(result);
    } catch (err) {
      setPrayer("Lord, thank You for this new day. As I open Your Word and reflect on Your faithfulness, fill my heart with gratitude and purpose. Guide my steps, strengthen my faith, and let Your light shine through everything I do today. In Jesus' name, Amen.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSpeak = () => {
    if (!prayer || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(prayer.replace(/\*\*/g, ''));
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const handleStop = () => {
    synthRef.current?.cancel();
    setSpeaking(false);
  };

  const saveSchedule = async () => {
    if (!user) return;
    const existing = await base44.entities.NotificationSettings.filter({ user_id: user.id }, '-created_date', 1).catch(() => []);
    const data = { user_id: user.id, prayer_reminder_enabled: scheduleEnabled, prayer_reminder_time: scheduleTime };
    if (existing[0]) {
      await base44.entities.NotificationSettings.update(existing[0].id, data);
    } else {
      await base44.entities.NotificationSettings.create({ ...data, verse_of_day_enabled: false, verse_of_day_time: '08:00' });
    }
    setScheduleSaved(true);
    setTimeout(() => setScheduleSaved(false), 2500);

    // Request push permission if enabling
    if (scheduleEnabled && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  if (!authChecked) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🙏</div>
          <h2 className="text-2xl font-extrabold mb-2">Daily Prayer Generator</h2>
          <p className="text-indigo-200 mb-6">Sign in to generate personalized prayers from your study</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-white text-indigo-700 font-bold">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-lg mx-auto px-4 py-8 pb-24 space-y-5">

        {/* Header */}
        <div className="text-center py-2">
          <div className="text-4xl mb-2">🙏</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Daily Prayer Generator</h1>
          <p className="text-gray-500 text-sm mt-1">AI-crafted from your journal & highlighted verses</p>
        </div>

        {/* Context summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <PenLine className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-xs text-gray-400">Journal entries</p>
              <p className="text-lg font-extrabold text-gray-900">{journals.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="text-xs text-gray-400">Highlighted verses</p>
              <p className="text-lg font-extrabold text-gray-900">{highlights.length}</p>
            </div>
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={generatePrayer}
          disabled={generating}
          className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-base font-extrabold gap-2 rounded-2xl shadow-lg"
        >
          {generating ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Crafting your prayer…</>
          ) : (
            <><Sparkles className="w-5 h-5" /> {prayer ? 'Regenerate Prayer' : 'Generate My Morning Prayer'}</>
          )}
        </Button>

        {/* Prayer display */}
        {prayer && !generating && (
          <PrayerDisplay prayer={prayer} onSpeak={handleSpeak} speaking={speaking} onStop={handleStop} />
        )}

        {/* Schedule section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" /> Schedule Daily Prayer Reminder
          </h3>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Enable daily prayer notification</p>
              <p className="text-xs text-gray-500">Get reminded to pray at your chosen time</p>
            </div>
            <button onClick={() => setScheduleEnabled(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${scheduleEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${scheduleEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          {scheduleEnabled && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Prayer Time</label>
              <Select value={scheduleTime} onValueChange={setScheduleTime}>
                <SelectTrigger className="bg-gray-50">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={saveSchedule} className="w-full bg-indigo-700 hover:bg-indigo-800 gap-2">
            {scheduleSaved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : 'Save Schedule'}
          </Button>
        </div>

      </div>
    </div>
  );
}