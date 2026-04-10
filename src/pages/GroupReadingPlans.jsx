import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, Plus, ChevronRight, CheckCircle2, Copy,
  ArrowLeft, Flame, Trophy, RefreshCw, Lock
} from 'lucide-react';

const PLANS = [
  { id: 'overcoming_anxiety', title: 'Overcoming Anxiety', emoji: '🕊️', color: 'from-sky-500 to-indigo-600',
    days: [
      { day: 1, reference: 'Philippians 4:6-7', text: 'Do not be anxious about anything, but in every situation, by prayer and petition, present your requests to God.' },
      { day: 2, reference: 'Matthew 6:25-27', text: 'Do not worry about your life, what you will eat or drink; or about your body, what you will wear.' },
      { day: 3, reference: 'Isaiah 41:10', text: 'So do not fear, for I am with you; do not be dismayed, for I am your God.' },
      { day: 4, reference: 'Psalm 23:1-4', text: 'The Lord is my shepherd, I lack nothing.' },
      { day: 5, reference: '1 Peter 5:7', text: 'Cast all your anxiety on him because he cares for you.' },
      { day: 6, reference: 'John 14:27', text: 'Peace I leave with you; my peace I give you.' },
      { day: 7, reference: 'Romans 8:28', text: 'In all things God works for the good of those who love him.' },
    ],
  },
  { id: 'growth', title: 'Spiritual Growth', emoji: '🌱', color: 'from-emerald-500 to-teal-600',
    days: [
      { day: 1, reference: 'James 1:2-4', text: 'Consider it pure joy whenever you face trials of many kinds.' },
      { day: 2, reference: '2 Peter 1:5-8', text: 'Make every effort to add to your faith goodness; and to goodness, knowledge.' },
      { day: 3, reference: 'Colossians 3:16', text: 'Let the message of Christ dwell among you richly.' },
      { day: 4, reference: 'Psalm 119:105', text: 'Your word is a lamp for my feet, a light on my path.' },
      { day: 5, reference: 'Hebrews 5:14', text: 'Solid food is for the mature, who have trained themselves to distinguish good from evil.' },
      { day: 6, reference: 'Romans 12:2', text: 'Be transformed by the renewing of your mind.' },
      { day: 7, reference: 'Galatians 5:22-23', text: 'The fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness.' },
    ],
  },
  { id: 'strength', title: 'Finding Strength', emoji: '⚡', color: 'from-amber-500 to-orange-600',
    days: [
      { day: 1, reference: 'Philippians 4:13', text: 'I can do all this through him who gives me strength.' },
      { day: 2, reference: 'Isaiah 40:31', text: 'Those who hope in the Lord will renew their strength.' },
      { day: 3, reference: 'Psalm 46:1', text: 'God is our refuge and strength, an ever-present help in trouble.' },
      { day: 4, reference: '2 Corinthians 12:9', text: 'My grace is sufficient for you, for my power is made perfect in weakness.' },
      { day: 5, reference: 'Joshua 1:9', text: 'Be strong and courageous. Do not be afraid; do not be discouraged.' },
      { day: 6, reference: 'Ephesians 6:10', text: 'Be strong in the Lord and in his mighty power.' },
      { day: 7, reference: 'Psalm 28:7', text: 'The Lord is my strength and my shield; my heart trusts in him.' },
    ],
  },
  { id: 'forgiveness', title: 'Grace & Forgiveness', emoji: '🤍', color: 'from-rose-400 to-pink-600',
    days: [
      { day: 1, reference: '1 John 1:9', text: 'If we confess our sins, he is faithful and just and will forgive us.' },
      { day: 2, reference: 'Psalm 103:12', text: 'As far as the east is from the west, so far has he removed our transgressions.' },
      { day: 3, reference: 'Ephesians 4:32', text: 'Be kind and compassionate, forgiving each other, just as in Christ God forgave you.' },
      { day: 4, reference: 'Matthew 18:21-22', text: 'Not seven times, but seventy-seven times.' },
      { day: 5, reference: 'Colossians 3:13', text: 'Forgive one another if any of you has a grievance against someone.' },
      { day: 6, reference: 'Romans 8:1', text: 'There is now no condemnation for those who are in Christ Jesus.' },
      { day: 7, reference: 'Luke 15:20', text: 'While he was still a long way off, his father saw him and was filled with compassion.' },
    ],
  },
];

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ── Create Group Plan Modal ──────────────────────────────────────────────────
function CreatePlanModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ groupName: '', leaderName: '', leaderEmail: '', planId: '', title: '' });
  const [saving, setSaving] = useState(false);

  const selectedPlan = PLANS.find(p => p.id === form.planId);

  const create = async () => {
    setSaving(true);
    const inviteCode = generateCode();
    const record = await base44.entities.GroupReadingPlanEntity.create({
      title: form.title || selectedPlan?.title,
      planId: form.planId,
      groupName: form.groupName,
      leaderName: form.leaderName,
      leaderEmail: form.leaderEmail,
      inviteCode,
      memberEmails: [form.leaderEmail],
      memberCount: 1,
      isActive: true,
    });
    setSaving(false);
    onCreated(record);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
          <h2 className="text-lg font-bold">Create Group Plan</h2>
          <p className="text-sm text-indigo-100 mt-1">Start a shared reading plan for your group</p>
        </div>

        <div className="p-5 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Church / Group Name</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="e.g. Grace Church Youth Group"
                  value={form.groupName} onChange={e => setForm(f => ({ ...f, groupName: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Your Name (Leader)</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="e.g. Pastor Daniel"
                  value={form.leaderName} onChange={e => setForm(f => ({ ...f, leaderName: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Your Email</label>
                <input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="leader@church.com"
                  value={form.leaderEmail} onChange={e => setForm(f => ({ ...f, leaderEmail: e.target.value }))} />
              </div>
              <button disabled={!form.groupName || !form.leaderName || !form.leaderEmail}
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-40">
                Next: Choose Plan →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm font-semibold text-gray-700 mb-2">Choose a reading plan:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {PLANS.map(plan => (
                  <button key={plan.id} onClick={() => setForm(f => ({ ...f, planId: plan.id, title: plan.title }))}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${form.planId === plan.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{plan.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{plan.title}</p>
                        <p className="text-xs text-gray-500">{plan.days.length} days</p>
                      </div>
                      {form.planId === plan.id && <CheckCircle2 size={16} className="text-indigo-600 ml-auto" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm">← Back</button>
                <button disabled={!form.planId || saving} onClick={create}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-40">
                  {saving ? 'Creating…' : 'Create Plan ✓'}
                </button>
              </div>
            </>
          )}
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-xl">✕</button>
      </motion.div>
    </div>
  );
}

// ── Join Plan Modal ──────────────────────────────────────────────────────────
function JoinPlanModal({ onClose, onJoined }) {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const join = async () => {
    setLoading(true);
    setError('');
    const results = await base44.entities.GroupReadingPlanEntity.filter({ inviteCode: code.toUpperCase() });
    if (!results?.length) { setError('Invalid code. Please try again.'); setLoading(false); return; }
    const plan = results[0];
    const already = (plan.memberEmails || []).includes(email);
    if (!already) {
      await base44.entities.GroupReadingPlanEntity.update(plan.id, {
        memberEmails: [...(plan.memberEmails || []), email],
        memberCount: (plan.memberCount || 1) + 1,
      });
    }
    setLoading(false);
    onJoined({ ...plan, myEmail: email, myName: name });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-xl p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Join a Group Plan</h2>
        <p className="text-sm text-gray-500 mb-4">Enter the invite code your leader shared</p>

        <div className="space-y-3">
          <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="INVITE CODE" maxLength={6}
            value={code} onChange={e => setCode(e.target.value)} />
          <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          <input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button disabled={!code || !email || !name || loading} onClick={join}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-40">
            {loading ? 'Joining…' : 'Join Plan'}
          </button>
          <button onClick={onClose} className="w-full text-gray-500 text-sm py-2">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Group Plan Detail View ───────────────────────────────────────────────────
function GroupPlanDetail({ groupPlan, myEmail, myName, onBack }) {
  const plan = PLANS.find(p => p.id === groupPlan.planId);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.entities.GroupPlanCompletion.filter({ groupPlanId: groupPlan.id }).then(data => {
      setCompletions(data || []);
      setLoading(false);
    });
  }, [groupPlan.id]);

  const myCompletedDays = completions.filter(c => c.userEmail === myEmail).map(c => c.dayNumber);

  const todayDay = (() => {
    for (let i = 1; i <= plan.days.length; i++) {
      if (!myCompletedDays.includes(i)) return i;
    }
    return null;
  })();

  const markComplete = async (dayNumber) => {
    const record = await base44.entities.GroupPlanCompletion.create({
      groupPlanId: groupPlan.id,
      userEmail: myEmail,
      userName: myName || myEmail.split('@')[0],
      dayNumber,
      completedAt: new Date().toISOString(),
    });
    setCompletions(prev => [...prev, record]);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(groupPlan.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pct = Math.round((myCompletedDays.length / plan.days.length) * 100);

  // Per-day completion count across all members
  const dayCompletionCount = (day) => completions.filter(c => c.dayNumber === day).length;
  const totalMembers = groupPlan.memberCount || 1;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-200">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{plan.emoji} {groupPlan.title}</h1>
            <p className="text-xs text-gray-500">{groupPlan.groupName} · Led by {groupPlan.leaderName}</p>
          </div>
        </div>

        {/* Invite code */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-700 mb-0.5">Invite Code</p>
            <p className="text-2xl font-bold tracking-widest text-indigo-900">{groupPlan.inviteCode}</p>
            <p className="text-xs text-indigo-600 mt-0.5">{totalMembers} member{totalMembers !== 1 ? 's' : ''} joined</p>
          </div>
          <button onClick={copyCode} className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl">
            <Copy size={14} /> {copied ? 'Copied!' : 'Share'}
          </button>
        </div>

        {/* My progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">My Progress</span>
            <span className="text-sm font-bold text-indigo-600">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
              className={`h-2 rounded-full bg-gradient-to-r ${plan.color}`} />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">{myCompletedDays.length} of {plan.days.length} days complete</p>
        </div>

        {/* Day list */}
        <div className="space-y-3">
          {plan.days.map((d) => {
            const done = myCompletedDays.includes(d.day);
            const isToday = todayDay === d.day;
            const locked = !done && !isToday;
            const groupCount = dayCompletionCount(d.day);

            return (
              <motion.div key={d.day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: d.day * 0.04 }}
                className={`bg-white rounded-2xl p-4 border shadow-sm ${
                  isToday ? 'border-indigo-300 ring-1 ring-indigo-200' :
                  done ? 'border-green-200 bg-green-50' : 'border-gray-100 opacity-60'
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : isToday ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                    {done ? <CheckCircle2 size={16} className="text-white" /> :
                     locked ? <Lock size={12} className="text-gray-400" /> :
                     <span className="text-white text-xs font-bold">{d.day}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-indigo-600 mb-0.5">{d.reference}</p>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">"{d.text}"</p>
                    {groupCount > 0 && (
                      <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                        <Users size={11} /> {groupCount} member{groupCount !== 1 ? 's' : ''} completed today
                      </p>
                    )}
                  </div>
                </div>
                {isToday && !done && (
                  <button onClick={() => markComplete(d.day)}
                    className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600">
                    ✓ Mark Complete
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {pct === 100 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-center text-white">
            <Trophy size={32} className="mx-auto mb-2" />
            <p className="text-lg font-bold">Plan Complete! 🎉</p>
            <p className="text-sm text-indigo-100 mt-1">Well done for completing "{groupPlan.title}"</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function GroupReadingPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [activeView, setActiveView] = useState(null); // { plan, myEmail, myName }

  useEffect(() => {
    base44.entities.GroupReadingPlanEntity.list('-created_date', 20).then(data => {
      setPlans(data || []);
      setLoading(false);
    });
  }, []);

  const handleCreated = (plan) => {
    setPlans(prev => [plan, ...prev]);
    setShowCreate(false);
    setActiveView({ plan, myEmail: plan.leaderEmail, myName: plan.leaderName });
  };

  const handleJoined = ({ myEmail, myName, ...plan }) => {
    setPlans(prev => prev.some(p => p.id === plan.id) ? prev.map(p => p.id === plan.id ? plan : p) : [plan, ...prev]);
    setShowJoin(false);
    setActiveView({ plan, myEmail, myName });
  };

  if (activeView) {
    return (
      <GroupPlanDetail
        groupPlan={activeView.plan}
        myEmail={activeView.myEmail}
        myName={activeView.myName}
        onBack={() => setActiveView(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">👥 Group Plans</h1>
          <p className="text-sm text-gray-500 mt-1">Read the Bible together with your church or group</p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-2xl font-semibold text-sm shadow-sm">
            <Plus size={16} /> Create Plan
          </button>
          <button onClick={() => setShowJoin(true)}
            className="flex items-center justify-center gap-2 bg-white border border-indigo-200 text-indigo-700 py-3 rounded-2xl font-semibold text-sm shadow-sm">
            <Users size={16} /> Join with Code
          </button>
        </div>

        {/* Plans list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />)}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-gray-700 font-semibold">No group plans yet</p>
            <p className="text-sm text-gray-500 mt-1">Create one for your church or join with an invite code</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map(plan => {
              const basePlan = PLANS.find(p => p.id === plan.planId);
              return (
                <motion.div key={plan.id} whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer"
                  onClick={() => {
                    const email = prompt('Enter your email to continue:');
                    if (email) setActiveView({ plan, myEmail: email, myName: '' });
                  }}>
                  <div className={`h-1.5 bg-gradient-to-r ${basePlan?.color || 'from-indigo-500 to-purple-600'}`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{basePlan?.emoji || '📖'}</span>
                          <p className="text-sm font-bold text-gray-900 truncate">{plan.title}</p>
                        </div>
                        <p className="text-xs text-gray-500">{plan.groupName} · Led by {plan.leaderName}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users size={12} /> {plan.memberCount || 1} member{plan.memberCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                        {basePlan?.days?.length || 7} days
                      </span>
                      <span className="text-xs font-mono text-gray-400">{plan.inviteCode}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreatePlanModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
        {showJoin && <JoinPlanModal onClose={() => setShowJoin(false)} onJoined={handleJoined} />}
      </AnimatePresence>
    </div>
  );
}