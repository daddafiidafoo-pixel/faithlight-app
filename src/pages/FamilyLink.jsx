import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, BookOpen, Heart, Crown, Plus, Copy, Check, Star, Shield, Target, Trash2, X, Send, MessageCircle, Bell } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { AccessibleSelect } from '@/components/ui/accessible-select';

// Minimal inline translations for FamilyLink labels
const FL_UI = {
  en: {
    title: 'Family Link',
    subtitle: 'Grow in faith together — shared goals, prayers, and achievements as one family.',
    createGroup: 'Create a Family Group',
    joinCode: 'Join with Invite Code',
    nameGroup: 'Name your family group',
    namePlaceholder: 'e.g. The Johnson Family',
    enterCode: 'Enter invite code',
    create: 'Create', cancel: 'Cancel', join: 'Join',
    inviteCode: 'Invite code',
    members: 'Members', totalXP: 'Total XP', avgStreak: 'Avg Streak',
    tabDashboard: '📊 Dashboard', tabPrayers: '🙏 Prayers', tabPremium: '⭐ Premium',
    familyMembers: 'Family Members',
    collectiveGoals: 'Collective Reading Goals',
    addGoal: 'New Reading Goal', goalTitle: 'e.g. Proverbs in 2 Weeks',
    targetDays: 'Target days', addGoalBtn: 'Add Goal',
    goalCompleted: '🎉 Goal completed!',
    noGoals: 'No goals yet — add your first reading goal!',
    addPrayer: 'Add a Family Prayer',
    yourName: 'Your name',
    prayerPlaceholder: 'Share a prayer request with your family…',
    postPrayer: '🙏 Post Prayer',
    markAnswered: 'Mark Answered',
    answered: '✅ Answered',
    prayForThis: 'Pray for this',
    prayed: 'Prayed',
    praying: '🙏',
    noPrayers: 'No prayers yet — be the first to share one!',
    premiumTitle: 'Family Premium Plan',
    premiumDesc: 'One subscription, shared across your whole family.',
    memberStatus: 'Member Subscription Status',
    free: 'Free',
    upgradeBtn: 'Upgrade to Family Premium — $9.99/mo',
    upgradeNote: 'Up to 6 family members included',
    xpFamilyPrayer: '+5 XP — Family intercession! 🙏',
    xpPrayerAnswered: '+10 XP — Prayer answered! 🎉',
    tabMessages: '💬 Messages',
    sendMessage: 'Send Encouraging Message',
    messageOrVerse: 'Message or Bible verse',
    messagePlaceholder: 'Type an encouraging message or Bible verse...',
    sendTo: 'Send to',
    sendBtn: 'Send Message',
    assignPlan: 'Assign Reading Plan',
    planName: 'Plan name',
    planPlaceholder: 'e.g. Genesis in 30 Days',
    assignTo: 'Assign to',
    daysLabel: 'Days',
    assignBtn: 'Assign Plan',
    assignedPlans: 'Assigned Reading Plans',
    noMessages: 'No messages yet — send an encouraging word!',
    noPlans: 'No plans assigned yet.',
  },
  om: {
    title: 'Hidhaa Maatii',
    subtitle: 'Amantii keessatti waliin guddadhaa — kaayyoolee, kadhannaa, fi milkaa\'ina tokko ta\'uudhaan.',
    createGroup: 'Garee Maatii Uumi',
    joinCode: 'Koodii Afeeriitiin Seeni',
    nameGroup: 'Garee maatii kee moggaasi',
    namePlaceholder: 'fkn: Maatii Johnsoon',
    enterCode: 'Koodii afeerii galchi',
    create: 'Uumi', cancel: 'Dhiisi', join: 'Seeni',
    inviteCode: 'Koodii Afeerii',
    members: 'Miseensota', totalXP: 'XP Waliigalaa', avgStreak: 'Itti Fufinsa Jiddugaleessaa',
    tabDashboard: '📊 Gabaasa', tabPrayers: '🙏 Kadhannaa', tabPremium: '⭐ Premium',
    familyMembers: 'Miseensota Maatii',
    collectiveGoals: 'Kaayyoolee Dubbisaa Waloolee',
    addGoal: 'Kaayyoo Dubbisaa Haaraa', goalTitle: 'fkn: Faaruu keessatti torbee 2',
    targetDays: 'Guyyaa kaayyoo', addGoalBtn: 'Kaayyoo Dabaluu',
    goalCompleted: '🎉 Kaayyoon xumurameera!',
    noGoals: 'Kaayyoon hin jiru — kaayyoo jalqabaa dabaluu!',
    addPrayer: 'Kadhannaa Maatii Dabaluu',
    yourName: 'Maqaa kee',
    prayerPlaceholder: 'Gaaffii kadhannaa maatii kee wajjin qoodi…',
    postPrayer: '🙏 Kadhannaa Maxxansi',
    markAnswered: 'Akka deebii argateetti mallatteessi',
    answered: '✅ Deebi\'ame',
    prayForThis: 'Kanaaf Kadhadhu',
    prayed: 'Kadhadhe',
    praying: '🙏',
    noPrayers: 'Kadhannaan hin jiru — dursa qoodi!',
    premiumTitle: 'Karoora Premium Maatii',
    premiumDesc: 'Galmee tokko, maatii guutuu keetiif qoodame.',
    memberStatus: 'Haala Galmee Miseensota',
    free: 'Kaffaltii Malee',
    upgradeBtn: 'Premium Maatii Fili — $9.99/ji\'a',
    upgradeNote: 'Hamma miseensota maatii 6',
    xpFamilyPrayer: '+5 XP — Kadhannaa Maatii! 🙏',
    xpPrayerAnswered: '+10 XP — Kadhannaan deebi\'ame! 🎉',
    tabMessages: '💬 Ergaa',
    sendMessage: 'Ergaa Jajjabeessaa Ergii',
    messageOrVerse: 'Ergaa ykn Aayata',
    messagePlaceholder: 'Ergaa jajjabeessaa ykn aayata galchi...',
    sendTo: 'Ergaa erguu',
    sendBtn: 'Ergaa Ergii',
    assignPlan: 'Karoora Dubbisaa Ramaduu',
    planName: 'Maqaa karoora',
    planPlaceholder: 'fkn: Uumamaa guyyaa 30',
    assignTo: 'Eenyuuf',
    daysLabel: 'Guyyaa',
    assignBtn: 'Karoora Ramaduu',
    assignedPlans: 'Karoora Dubbisaa Rammadame',
    noMessages: 'Ergaan hin jiru — jajjabessuu jalqabi!',
    noPlans: 'Karoora rammadame hin jiru.',
  },
  am: {
    title: 'የቤተሰብ ትስስር',
    subtitle: 'በእምነት አንድ ላይ ያድጉ — ጋራ ግቦች፣ ጸሎቶች እና ስኬቶች.',
    createGroup: 'የቤተሰብ ቡድን ፍጠር',
    joinCode: 'በጥሪ ኮድ ይቀላቀሉ',
    nameGroup: 'የቤተሰብ ቡድንዎን ይሰይሙ',
    namePlaceholder: 'ለምሳ: የጆንሰን ቤተሰብ',
    enterCode: 'የጥሪ ኮድ ያስገቡ',
    create: 'ፍጠር', cancel: 'ሰርዝ', join: 'ተቀላቀሉ',
    inviteCode: 'የጥሪ ኮድ',
    members: 'አባላት', totalXP: 'ጠቅላላ XP', avgStreak: 'ሰ/ነ ተከታ',
    tabDashboard: '📊 ዳሽቦርድ', tabPrayers: '🙏 ጸሎቶች', tabPremium: '⭐ ፕሪሚየም',
    familyMembers: 'የቤተሰብ አባላት',
    collectiveGoals: 'የጋራ የንባብ ግቦች',
    addGoal: 'አዲስ የንባብ ግብ', goalTitle: 'ለምሳ: ምሳሌ በ2 ሳምንት',
    targetDays: 'ዒላማ ቀናት', addGoalBtn: 'ግብ ጨምር',
    goalCompleted: '🎉 ግቡ ተጠናቋል!',
    noGoals: 'ምንም ግብ የለም — የመጀመሪያ ግብ ያክሉ!',
    addPrayer: 'የቤተሰብ ጸሎት ጨምር',
    yourName: 'ስምዎ',
    prayerPlaceholder: 'ለቤተሰብዎ የጸሎት ጥያቄ ያጋሩ…',
    postPrayer: '🙏 ጸሎት ለጥፍ',
    markAnswered: 'እንደተሰማ አምልክት',
    answered: '✅ ተሰምቷል',
    prayForThis: 'ለዚህ ጸልይ',
    prayed: 'ጸለይሁ',
    praying: '🙏',
    noPrayers: 'ጸሎቶች ምን የሉም — የመጀመሪያ ይሁኑ!',
    premiumTitle: 'የቤተሰብ ፕሪሚየም ዕቅድ',
    premiumDesc: 'አንድ ምዝገባ ለሁሉም ቤተሰብ ይጋራሉ.',
    memberStatus: 'የአባልነት ሁኔታ',
    free: 'ነጻ',
    upgradeBtn: 'ወደ ቤ/ፕሪሚየም ያሻሽሉ — $9.99/ወር',
    upgradeNote: 'እስከ 6 የቤተሰብ አባላት',
    xpFamilyPrayer: '+5 XP — የቤተሰብ ጸሎት! 🙏',
    xpPrayerAnswered: '+10 XP — ጸሎት ተሰምቷል! 🎉',
    tabMessages: '💬 መልዕክቶች',
    sendMessage: 'አበረታች መልዕክት ላክ',
    messageOrVerse: 'መልዕክት ወይም ጥቅስ',
    messagePlaceholder: 'አበረታች መልዕክት ወይም የመጽሐፍ ቅዱስ ጥቅስ ይፃፉ...',
    sendTo: 'ለ',
    sendBtn: 'መልዕክት ላክ',
    assignPlan: 'የንባብ እቅድ ተቀጣጠሩ',
    planName: 'የእቅድ ስም',
    planPlaceholder: 'ለምሳ: ዘፍ ​ 30 ቀን',
    assignTo: 'ለ',
    daysLabel: 'ቀናት',
    assignBtn: 'እቅድ ተቀጣጠሩ',
    assignedPlans: 'የተተቀጠሩ የንባብ እቅዶች',
    noMessages: 'ምንም መልዕክቶች የሉም — አበረታቹ!',
    noPlans: 'ምንም ተተቀጠሩ እቅዶች የሉም።',
  },
};

const FAMILY_KEY = 'fl_family_group';
const XP_KEY = 'fl_xp_data';
const GOALS_KEY = 'fl_reading_goals';
const PRAYERS_KEY = 'fl_family_prayers';
const MESSAGES_KEY = 'fl_family_messages';
const PLANS_KEY = 'fl_assigned_plans';

function getMessages() {
  try {
    const stored = JSON.parse(localStorage.getItem(MESSAGES_KEY) || 'null');
    if (stored) return stored;
  } catch {}
  return [
    { id: 1, from: 'James (Dad)', to: 'Emma (Sister)', text: '"For I know the plans I have for you..." — Jeremiah 29:11 💛', sentAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, from: 'Sarah (Mom)', to: 'Everyone', text: 'Keep going with your reading plans — so proud of this family! 🙏', sentAt: new Date(Date.now() - 7200000).toISOString() },
  ];
}
function saveMessages(m) { localStorage.setItem(MESSAGES_KEY, JSON.stringify(m)); }

function getPlans() {
  try {
    const stored = JSON.parse(localStorage.getItem(PLANS_KEY) || 'null');
    if (stored) return stored;
  } catch {}
  return [
    { id: 1, planName: 'Psalms in 30 Days', assignedTo: 'Emma (Sister)', days: 30, progress: 8, assignedBy: 'James (Dad)' },
    { id: 2, planName: 'New Testament in 90 Days', assignedTo: 'Everyone', days: 90, progress: 12, assignedBy: 'Sarah (Mom)' },
  ];
}
function savePlans(p) { localStorage.setItem(PLANS_KEY, JSON.stringify(p)); }

function getFamilyData() {
  try { return JSON.parse(localStorage.getItem(FAMILY_KEY) || 'null'); } catch { return null; }
}
function saveFamilyData(d) { localStorage.setItem(FAMILY_KEY, JSON.stringify(d)); }

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getXP() {
  try { return JSON.parse(localStorage.getItem(XP_KEY) || '{}'); } catch { return {}; }
}

function getGoals() {
  try {
    const stored = JSON.parse(localStorage.getItem(GOALS_KEY) || 'null');
    if (stored) return stored;
  } catch {}
  return [
    { id: 'genesis', title: 'Genesis in 30 Days', target: 30, progress: 14, emoji: '📖' },
    { id: 'psalms', title: 'Psalms of Praise', target: 20, progress: 8, emoji: '🎵' },
    { id: 'nt', title: 'New Testament Journey', target: 90, progress: 22, emoji: '✝️' },
  ];
}
function saveGoals(goals) { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)); }

function getPrayers() {
  try {
    const stored = JSON.parse(localStorage.getItem(PRAYERS_KEY) || 'null');
    if (stored) return stored;
  } catch {}
  return [
    { id: 1, author: 'Sarah (Mom)', text: "Pray for James's health and recovery.", prayedCount: 3, isAnswered: false },
    { id: 2, author: 'Emma (Sister)', text: 'Guidance for my university exams.', prayedCount: 2, isAnswered: false },
    { id: 3, author: 'Dad', text: 'Thanksgiving — Emma got into college!', prayedCount: 4, isAnswered: true },
  ];
}
function savePrayers(prayers) { localStorage.setItem(PRAYERS_KEY, JSON.stringify(prayers)); }

const MOCK_MEMBERS = [
  { name: 'You', role: 'admin', xp: 0, streak: 0, readingDays: 0, isYou: true },
  { name: 'Sarah (Mom)', role: 'member', xp: 420, streak: 5, readingDays: 12 },
  { name: 'James (Dad)', role: 'member', xp: 780, streak: 8, readingDays: 20 },
  { name: 'Emma (Sister)', role: 'member', xp: 210, streak: 3, readingDays: 7 },
];

const EMOJI_OPTIONS = ['📖', '🎵', '✝️', '🌟', '🙏', '🕊️', '💡', '🌿', '🔥', '🌅'];

function AvatarCircle({ name, size = 'md', role }) {
  const initials = name?.split(' ')[0]?.slice(0, 2).toUpperCase() || '?';
  const colors = ['bg-indigo-400', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-purple-400'];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  const sz = size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
  return (
    <div className="relative inline-block">
      <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold`}>{initials}</div>
      {role === 'admin' && <span className="absolute -top-1 -right-1 text-xs">👑</span>}
    </div>
  );
}

function ProgressBar({ value, max, color = 'bg-indigo-500' }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function FamilyLink() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const ui = FL_UI[uiLanguage] || FL_UI.en;
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(getFamilyData());
  const [tab, setTab] = useState('dashboard');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [xpToast, setXpToast] = useState(null);

  // Reading goals state
  const [goals, setGoals] = useState(getGoals);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('30');
  const [newGoalEmoji, setNewGoalEmoji] = useState('📖');
  const [editingProgressId, setEditingProgressId] = useState(null);
  const [progressInputVal, setProgressInputVal] = useState('');

  // Prayer state
  const [prayers, setPrayers] = useState(getPrayers);
  const [newPrayerText, setNewPrayerText] = useState('');
  const [newPrayerAuthor, setNewPrayerAuthor] = useState('');
  const [prayedFor, setPrayedFor] = useState([]);

  // Messages + plans state
  const [messages, setMessages] = useState(getMessages);
  const [newMessageText, setNewMessageText] = useState('');
  const [messageTo, setMessageTo] = useState('Everyone');
  const [assignedPlans, setAssignedPlans] = useState(getPlans);
  const [newPlanName, setNewPlanName] = useState('');
  const [planAssignTo, setPlanAssignTo] = useState('Everyone');
  const [planDays, setPlanDays] = useState('30');
  const [showAssignPlan, setShowAssignPlan] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setNewPrayerAuthor(u?.full_name || '');
    }).catch(() => {});
  }, []);

  const showXP = (msg) => {
    setXpToast(msg);
    setTimeout(() => setXpToast(null), 2500);
  };

  const addXP = (amount, action) => {
    const xp = getXP();
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(XP_KEY, JSON.stringify({
      ...xp,
      totalXP: (xp.totalXP || 0) + amount,
      log: [{ action, xp: amount, at: today }, ...(xp.log || [])].slice(0, 30),
    }));
  };

  const myXP = getXP();
  const members = family ? MOCK_MEMBERS.map(m => m.isYou ? { ...m, name: user?.full_name || 'You', xp: myXP.totalXP || 0, streak: myXP.streak || 0 } : m) : [];
  const totalFamilyXP = members.reduce((a, m) => a + m.xp, 0);
  const avgStreak = members.length ? Math.round(members.reduce((a, m) => a + m.streak, 0) / members.length) : 0;

  // Family actions
  const createFamily = () => {
    if (!familyName.trim()) return;
    const data = { name: familyName.trim(), inviteCode: generateInviteCode(), createdAt: new Date().toISOString(), adminName: user?.full_name || 'You' };
    saveFamilyData(data);
    setFamily(data);
    setShowCreate(false);
  };

  const joinFamily = () => {
    if (!joinCode.trim()) return;
    const data = { name: 'The Johnson Family', inviteCode: joinCode.toUpperCase(), createdAt: new Date().toISOString(), adminName: 'Family Admin' };
    saveFamilyData(data);
    setFamily(data);
    setShowJoin(false);
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(family?.inviteCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Goals actions
  const addGoal = () => {
    if (!newGoalTitle.trim() || !newGoalTarget) return;
    const updated = [...goals, { id: Date.now().toString(), title: newGoalTitle.trim(), target: parseInt(newGoalTarget), progress: 0, emoji: newGoalEmoji }];
    setGoals(updated);
    saveGoals(updated);
    setNewGoalTitle('');
    setNewGoalTarget('30');
    setNewGoalEmoji('📖');
    setShowAddGoal(false);
  };

  const deleteGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    saveGoals(updated);
  };

  const startEditProgress = (goal) => {
    setEditingProgressId(goal.id);
    setProgressInputVal(String(goal.progress));
  };

  const saveProgress = (id) => {
    const val = Math.max(0, parseInt(progressInputVal) || 0);
    const updated = goals.map(g => g.id === id ? { ...g, progress: Math.min(val, g.target) } : g);
    setGoals(updated);
    saveGoals(updated);
    setEditingProgressId(null);
  };

  // Prayer actions
  const addPrayer = () => {
    if (!newPrayerText.trim()) return;
    const updated = [{ id: Date.now(), author: newPrayerAuthor.trim() || user?.full_name || 'You', text: newPrayerText.trim(), prayedCount: 0, isAnswered: false }, ...prayers];
    setPrayers(updated);
    savePrayers(updated);
    setNewPrayerText('');
  };

  const prayFor = (id) => {
    if (prayedFor.includes(id)) return;
    setPrayedFor(prev => [...prev, id]);
    const updated = prayers.map(p => p.id === id ? { ...p, prayedCount: p.prayedCount + 1 } : p);
    setPrayers(updated);
    savePrayers(updated);
    addXP(5, 'family_prayer');
    showXP(ui.xpFamilyPrayer);
  };

  const markAnswered = (id) => {
    const updated = prayers.map(p => p.id === id ? { ...p, isAnswered: !p.isAnswered } : p);
    setPrayers(updated);
    savePrayers(updated);
    const prayer = prayers.find(p => p.id === id);
    if (!prayer?.isAnswered) {
      addXP(10, 'prayer_answered');
      showXP(ui.xpPrayerAnswered);
    }
  };

  const deletePrayer = (id) => {
    const updated = prayers.filter(p => p.id !== id);
    setPrayers(updated);
    savePrayers(updated);
  };

  // Message actions
  const sendMessage = () => {
    if (!newMessageText.trim()) return;
    const updated = [{ id: Date.now(), from: user?.full_name || 'You', to: messageTo, text: newMessageText.trim(), sentAt: new Date().toISOString() }, ...messages];
    setMessages(updated);
    saveMessages(updated);
    setNewMessageText('');
  };

  const deleteMessage = (id) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    saveMessages(updated);
  };

  // Plan actions
  const assignPlan = () => {
    if (!newPlanName.trim()) return;
    const updated = [{ id: Date.now(), planName: newPlanName.trim(), assignedTo: planAssignTo, days: parseInt(planDays) || 30, progress: 0, assignedBy: user?.full_name || 'You' }, ...assignedPlans];
    setAssignedPlans(updated);
    savePlans(updated);
    setNewPlanName('');
    setPlanDays('30');
    setShowAssignPlan(false);
  };

  const deletePlan = (id) => {
    const updated = assignedPlans.filter(p => p.id !== id);
    setAssignedPlans(updated);
    savePlans(updated);
  };

  if (!family) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pb-20">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Users size={36} className="text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{ui.title}</h1>
            <p className="text-gray-500 text-sm">{ui.subtitle}</p>
          </div>
          {!showCreate && !showJoin && (
            <div className="space-y-3">
              <button onClick={() => setShowCreate(true)} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
                <Plus size={18} /> {ui.createGroup}
              </button>
              <button onClick={() => setShowJoin(true)} className="w-full py-4 rounded-2xl border-2 border-indigo-200 text-indigo-700 font-semibold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
                {ui.joinCode}
              </button>
            </div>
          )}
          {showCreate && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-gray-900">{ui.nameGroup}</h3>
              <input value={familyName} onChange={e => setFamilyName(e.target.value)} placeholder={ui.namePlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <div className="flex gap-2">
                <button onClick={createFamily} className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm">{ui.create}</button>
                <button onClick={() => setShowCreate(false)} className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">{ui.cancel}</button>
              </div>
            </div>
          )}
          {showJoin && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-gray-900">{ui.enterCode}</h3>
              <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="ABC123"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <div className="flex gap-2">
                <button onClick={joinFamily} className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm">{ui.join}</button>
                <button onClick={() => setShowJoin(false)} className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">{ui.cancel}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {xpToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm">
          {xpToast}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-6 text-white">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide">Family Link</p>
              <h1 className="text-2xl font-bold">{family.name}</h1>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-indigo-200 text-xs mb-1"><Shield size={11} /> {ui.inviteCode}</div>
              <button onClick={copyCode} aria-label="Copy invite code" className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl font-mono font-bold text-sm hover:bg-white/30 min-h-[44px] min-w-[44px]">
                  {family.inviteCode} {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{members.length}</p>
              <p className="text-xs text-indigo-200">{ui.members}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{totalFamilyXP.toLocaleString()}</p>
              <p className="text-xs text-indigo-200">{ui.totalXP}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{avgStreak}d</p>
              <p className="text-xs text-indigo-200">{ui.avgStreak}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-4">
        {/* Tabs */}
        <div className="grid grid-cols-4 bg-white border border-gray-200 rounded-2xl p-1 mb-5 gap-1">
          {[['dashboard', ui.tabDashboard], ['prayers', ui.tabPrayers], ['messages', ui.tabMessages || '💬'], ['premium', ui.tabPremium]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`min-h-[44px] py-2 rounded-xl text-xs font-semibold transition-all ${tab === id ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && (
          <div className="space-y-4">
            {/* Members */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2"><Users size={15} className="text-indigo-500" /> {ui.familyMembers}</h3>
              <div className="space-y-3">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <AvatarCircle name={m.name} role={m.role} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{m.name} {m.isYou && <span className="text-xs text-indigo-500">(you)</span>}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">🔥 {m.streak}d</span>
                        <span className="text-xs text-gray-400">📖 {m.readingDays} days</span>
                      </div>
                    </div>
                    <span className="font-bold text-indigo-600 text-sm">{m.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collective Reading Goals */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><Target size={15} className="text-green-500" /> {ui.collectiveGoals}</h3>
                <button onClick={() => setShowAddGoal(v => !v)}
                      aria-label="Add reading goal"
                      className="min-h-[44px] min-w-[44px] rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors p-2">
                      <Plus size={14} aria-hidden="true" />
                    </button>
              </div>

              {/* Add goal form */}
              {showAddGoal && (
                <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-100 space-y-2">
                  <p className="text-xs font-semibold text-green-700">{ui.addGoal}</p>
                  <input value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} placeholder={ui.goalTitle}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                  <div className="flex gap-2">
                    <input type="number" min="1" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} placeholder={ui.targetDays}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                    <AccessibleSelect
                      value={newGoalEmoji}
                      onValueChange={setNewGoalEmoji}
                      label="Emoji"
                      compact
                      className="w-20"
                      options={EMOJI_OPTIONS.map(e => ({ value: e, label: e }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addGoal} disabled={!newGoalTitle.trim()}
                      className="flex-1 min-h-[44px] py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50">
                      {ui.addGoalBtn}
                    </button>
                    <button onClick={() => setShowAddGoal(false)} className="flex-1 min-h-[44px] py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold">
                      {ui.cancel}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {goals.map(goal => (
                  <div key={goal.id} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{goal.emoji} {goal.title}</span>
                      <div className="flex items-center gap-2">
                        {editingProgressId === goal.id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" min="0" max={goal.target} value={progressInputVal}
                              onChange={e => setProgressInputVal(e.target.value)}
                              className="w-16 px-2 py-0.5 rounded-lg border border-gray-300 text-xs text-center focus:outline-none focus:ring-1 focus:ring-green-400"
                              onKeyDown={e => { if (e.key === 'Enter') saveProgress(goal.id); if (e.key === 'Escape') setEditingProgressId(null); }}
                              autoFocus
                            />
                            <span className="text-xs text-gray-400">/{goal.target}</span>
                            <button onClick={() => saveProgress(goal.id)} aria-label="Save progress" className="min-h-[44px] min-w-[44px] text-green-600 hover:text-green-700 flex items-center justify-center"><Check size={13} aria-hidden="true" /></button>
                            <button onClick={() => setEditingProgressId(null)} aria-label="Cancel editing" className="min-h-[44px] min-w-[44px] text-gray-400 hover:text-gray-600 flex items-center justify-center"><X size={13} aria-hidden="true" /></button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => startEditProgress(goal)} aria-label={`Edit progress for ${goal.title}`}
                              className="min-h-[44px] min-w-[44px] text-xs text-gray-500 hover:text-green-600 font-medium transition-colors flex items-center justify-center">
                              {goal.progress}/{goal.target} days
                            </button>
                            <button onClick={() => deleteGoal(goal.id)} aria-label="Delete goal" className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center">
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <ProgressBar value={goal.progress} max={goal.target} color="bg-green-500" />
                    {goal.progress >= goal.target && (
                      <p className="text-xs text-green-600 font-semibold mt-1">{ui.goalCompleted}</p>
                    )}
                  </div>
                ))}
                {goals.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-3">{ui.noGoals}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PRAYERS TAB ── */}
        {tab === 'prayers' && (
          <div className="space-y-4">
            {/* Add prayer */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">{ui.addPrayer}</h3>
              <input value={newPrayerAuthor} onChange={e => setNewPrayerAuthor(e.target.value)} placeholder={ui.yourName}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-rose-200" />
              <textarea value={newPrayerText} onChange={e => setNewPrayerText(e.target.value)}
                placeholder={ui.prayerPlaceholder}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-rose-200" />
              <button onClick={addPrayer} disabled={!newPrayerText.trim()}
                className="mt-2 w-full py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 disabled:opacity-50 transition-colors">
                {ui.postPrayer}
              </button>
            </div>

            {/* Prayer list */}
            <div className="space-y-3">
              {prayers.map(prayer => (
                <div key={prayer.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${prayer.isAnswered ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      {prayer.isAnswered && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full mb-1.5 inline-block">{ui.answered}</span>}
                      <p className="text-sm text-gray-800 font-medium">{prayer.author}</p>
                    </div>
                    <button onClick={() => deletePrayer(prayer.id)} aria-label="Delete prayer" className="min-h-[44px] min-w-[44px] text-gray-300 hover:text-red-400 ml-2 transition-colors flex items-center justify-center">
                       <X size={14} aria-hidden="true" />
                     </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{prayer.text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-rose-500">🙏 {prayer.prayedCount} praying</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => markAnswered(prayer.id)} aria-label={prayer.isAnswered ? 'Mark prayer as unanswered' : 'Mark prayer as answered'}
                        className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center ${prayer.isAnswered ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600'}`}>
                        {prayer.isAnswered ? ui.answered : ui.markAnswered}
                      </button>
                      <button onClick={() => prayFor(prayer.id)} disabled={prayedFor.includes(prayer.id)} aria-label={prayedFor.includes(prayer.id) ? 'Already prayed for this' : 'Pray for this request'}
                        className={`min-h-[44px] min-w-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all justify-center ${prayedFor.includes(prayer.id) ? 'bg-rose-50 text-rose-400' : 'bg-rose-600 text-white hover:bg-rose-700'}`}>
                        <Heart size={14} fill={prayedFor.includes(prayer.id) ? 'currentColor' : 'none'} aria-hidden="true" />
                        {prayedFor.includes(prayer.id) ? ui.prayed : ui.prayForThis}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {prayers.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">{ui.noPrayers}</p>
              )}
            </div>
          </div>
        )}

        {/* ── MESSAGES TAB ── */}
        {tab === 'messages' && (
          <div className="space-y-4">
            {/* Send message */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <MessageCircle size={15} className="text-indigo-500" /> {ui.sendMessage || 'Send Encouraging Message'}
              </h3>
              <div className="flex gap-2 mb-2">
                <select value={messageTo} onChange={e => setMessageTo(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
                  <option value="Everyone">Everyone</option>
                  {members.filter(m => !m.isYou).map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
              </div>
              <textarea value={newMessageText} onChange={e => setNewMessageText(e.target.value)}
                placeholder={ui.messagePlaceholder || 'Type an encouraging message or Bible verse...'}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-indigo-200 mb-2" />
              <button onClick={sendMessage} disabled={!newMessageText.trim()}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]">
                <Send size={14} /> {ui.sendBtn || 'Send Message'}
              </button>
            </div>

            {/* Assigned Reading Plans */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <BookOpen size={15} className="text-green-500" /> {ui.assignedPlans || 'Assigned Reading Plans'}
                </h3>
                <button onClick={() => setShowAssignPlan(v => !v)}
                  className="min-h-[44px] min-w-[44px] rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors p-2">
                  <Plus size={14} />
                </button>
              </div>
              {showAssignPlan && (
                <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-100 space-y-2">
                  <input value={newPlanName} onChange={e => setNewPlanName(e.target.value)}
                    placeholder={ui.planPlaceholder || 'e.g. Genesis in 30 Days'}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                  <div className="flex gap-2">
                    <select value={planAssignTo} onChange={e => setPlanAssignTo(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white">
                      <option value="Everyone">Everyone</option>
                      {members.filter(m => !m.isYou).map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                    </select>
                    <input type="number" min="1" value={planDays} onChange={e => setPlanDays(e.target.value)}
                      placeholder="Days"
                      className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-300" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={assignPlan} disabled={!newPlanName.trim()}
                      className="flex-1 min-h-[44px] py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50">
                      {ui.assignBtn || 'Assign Plan'}
                    </button>
                    <button onClick={() => setShowAssignPlan(false)} className="flex-1 min-h-[44px] py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold">
                      {ui.cancel}
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {assignedPlans.map(plan => (
                  <div key={plan.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{plan.planName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">→ {plan.assignedTo} · {plan.days} days · by {plan.assignedBy}</p>
                      <div className="mt-1.5 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (plan.progress / plan.days) * 100)}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{plan.progress}/{plan.days} days</p>
                    </div>
                    <button onClick={() => deletePlan(plan.id)} className="text-gray-300 hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {assignedPlans.length === 0 && <p className="text-xs text-gray-400 text-center py-3">{ui.noPlans || 'No plans assigned yet.'}</p>}
              </div>
            </div>

            {/* Message feed */}
            <div className="space-y-3">
              {messages.length === 0 && <p className="text-sm text-gray-400 text-center py-8">{ui.noMessages}</p>}
              {messages.map(msg => (
                <div key={msg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-xs font-semibold text-indigo-600">{msg.from} → {msg.to}</p>
                      <p className="text-sm text-gray-700 mt-1">{msg.text}</p>
                      <p className="text-xs text-gray-400 mt-1.5">{new Date(msg.sentAt).toLocaleString()}</p>
                    </div>
                    <button onClick={() => deleteMessage(msg.id)} className="text-gray-300 hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ml-2">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PREMIUM TAB ── */}
        {tab === 'premium' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Star size={18} className="text-amber-500" />
                <h3 className="font-bold text-gray-900">{ui.premiumTitle}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{ui.premiumDesc}</p>
              <div className="space-y-2 mb-4">
                {['Unlimited Bible translations for all members', 'Shared study plans & collective goals', 'Family prayer board with notifications', 'Ad-free experience for everyone', 'Priority AI features for the family'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={14} className="text-green-500 flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <button aria-label="Upgrade to Family Premium" className="w-full min-h-[44px] py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                {ui.upgradeBtn}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">{ui.upgradeNote}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">{ui.memberStatus}</h3>
              <div className="space-y-2">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <AvatarCircle name={m.name} size="sm" role={m.role} />
                      <span className="text-sm font-medium text-gray-800">{m.name}</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">{ui.free}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}