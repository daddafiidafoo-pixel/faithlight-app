import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, Sparkles, Calendar, CheckCircle2, ChevronDown, ChevronUp, Loader2, Plus, Target, Share2, Check, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AdaptiveStudyAssistant from '@/components/study/AdaptiveStudyAssistant';
import PlanFlashcardQuiz from '@/components/study/PlanFlashcardQuiz';

// ── Curated Plans ─────────────────────────────────────────────────────────────
const CURATED_PLANS = [
  {
    id: 'discipleship-30',
    title: '30-Day Discipleship Journey',
    description: 'A month-long walk through the core teachings of Jesus and what it means to follow Him.',
    duration_days: 30,
    tags: ['Jesus', 'Discipleship', 'NT'],
    color: 'from-blue-500 to-indigo-600',
    days: [
      { day: 1, label: 'Who is Jesus?', readings: ['John 1:1-18'] },
      { day: 2, label: 'The Call to Follow', readings: ['Matthew 4:18-22', 'Luke 9:23-26'] },
      { day: 3, label: 'The Sermon on the Mount I', readings: ['Matthew 5:1-26'] },
      { day: 4, label: 'The Sermon on the Mount II', readings: ['Matthew 5:27-48'] },
      { day: 5, label: 'Prayer & Fasting', readings: ['Matthew 6:1-18'] },
      { day: 6, label: 'Trusting God', readings: ['Matthew 6:19-34'] },
      { day: 7, label: 'Rest & Reflection', readings: ['Psalm 23', 'Psalm 46'] },
      { day: 8, label: 'The Kingdom Parables', readings: ['Matthew 13:1-43'] },
      { day: 9, label: 'Miraculous Faith', readings: ['Mark 4:35-41', 'Mark 5:21-43'] },
      { day: 10, label: 'Serving Others', readings: ['Mark 10:35-45', 'Luke 10:25-37'] },
      { day: 11, label: 'The Lord\'s Supper', readings: ['Luke 22:1-23'] },
      { day: 12, label: 'Gethsemane & Arrest', readings: ['Luke 22:39-71'] },
      { day: 13, label: 'The Cross', readings: ['John 19:1-42'] },
      { day: 14, label: 'The Resurrection', readings: ['John 20:1-31'] },
      { day: 15, label: 'The Great Commission', readings: ['Matthew 28:16-20', 'Acts 1:1-11'] },
      { day: 16, label: 'Pentecost', readings: ['Acts 2:1-47'] },
      { day: 17, label: 'Born Again', readings: ['John 3:1-21', 'Romans 6:1-14'] },
      { day: 18, label: 'Grace & Faith', readings: ['Ephesians 2:1-22'] },
      { day: 19, label: 'Identity in Christ', readings: ['Galatians 2:20', 'Colossians 3:1-17'] },
      { day: 20, label: 'The Holy Spirit', readings: ['Romans 8:1-27'] },
      { day: 21, label: 'Love One Another', readings: ['John 13:34-35', '1 Corinthians 13'] },
      { day: 22, label: 'Spiritual Armor', readings: ['Ephesians 6:10-20'] },
      { day: 23, label: 'Suffering & Hope', readings: ['Romans 5:1-11', '1 Peter 1:3-12'] },
      { day: 24, label: 'Forgiveness', readings: ['Matthew 18:21-35', 'Colossians 3:12-14'] },
      { day: 25, label: 'Generosity', readings: ['Luke 21:1-4', '2 Corinthians 9:6-15'] },
      { day: 26, label: 'Community', readings: ['Acts 2:42-47', 'Hebrews 10:24-25'] },
      { day: 27, label: 'Witnessing', readings: ['Acts 4:1-31', '1 Peter 3:15-16'] },
      { day: 28, label: 'The Vine & Branches', readings: ['John 15:1-17'] },
      { day: 29, label: 'Peace in Christ', readings: ['John 14:1-27', 'Philippians 4:4-9'] },
      { day: 30, label: 'Eternal Hope', readings: ['Revelation 21:1-8', 'John 17:1-26'] },
    ]
  },
  {
    id: 'prophets-overview',
    title: 'Overview of the Prophets',
    description: 'A survey of the Major and Minor Prophets — their context, message, and how they point to Jesus.',
    duration_days: 21,
    tags: ['OT', 'Prophecy', 'Isaiah', 'Jeremiah'],
    color: 'from-amber-500 to-orange-600',
    days: [
      { day: 1, label: 'What is a Prophet?', readings: ['Deuteronomy 18:14-22', 'Hebrews 1:1-3'] },
      { day: 2, label: 'Isaiah I — Holy, Holy, Holy', readings: ['Isaiah 6:1-13'] },
      { day: 3, label: 'Isaiah II — The Suffering Servant', readings: ['Isaiah 52:13-53:12'] },
      { day: 4, label: 'Isaiah III — A New Creation', readings: ['Isaiah 65:17-25'] },
      { day: 5, label: 'Jeremiah — Weeping Prophet', readings: ['Jeremiah 1:1-19', 'Jeremiah 31:31-34'] },
      { day: 6, label: 'Lamentations — Grief & Hope', readings: ['Lamentations 3:19-33'] },
      { day: 7, label: 'Ezekiel — The Valley of Dry Bones', readings: ['Ezekiel 37:1-28'] },
      { day: 8, label: 'Daniel — Faithfulness Under Fire', readings: ['Daniel 1', 'Daniel 6'] },
      { day: 9, label: 'Daniel — Visions of the Future', readings: ['Daniel 7:1-28'] },
      { day: 10, label: 'Hosea — God\'s Unfailing Love', readings: ['Hosea 1', 'Hosea 11:1-11'] },
      { day: 11, label: 'Joel — The Day of the Lord', readings: ['Joel 2:1-32'] },
      { day: 12, label: 'Amos — Justice & Righteousness', readings: ['Amos 5:1-27'] },
      { day: 13, label: 'Jonah — Running from God', readings: ['Jonah 1-4'] },
      { day: 14, label: 'Micah — What Does God Require?', readings: ['Micah 6:1-16'] },
      { day: 15, label: 'Habakkuk — Questions & Faith', readings: ['Habakkuk 1-3'] },
      { day: 16, label: 'Zechariah — Messianic Visions', readings: ['Zechariah 9:9-10', 'Zechariah 12-13'] },
      { day: 17, label: 'Malachi — Preparing the Way', readings: ['Malachi 3:1-18', 'Malachi 4:1-6'] },
      { day: 18, label: 'Prophecy Fulfilled — Jesus\' Birth', readings: ['Isaiah 7:14', 'Matthew 1:18-25'] },
      { day: 19, label: 'Prophecy Fulfilled — His Ministry', readings: ['Isaiah 61:1-3', 'Luke 4:14-21'] },
      { day: 20, label: 'Prophecy Fulfilled — The Cross', readings: ['Psalm 22', 'John 19:23-24'] },
      { day: 21, label: 'Prophetic Hope — New Heaven & Earth', readings: ['Isaiah 65:17', 'Revelation 21:1-5'] },
    ]
  },
  {
    id: 'psalms-devotional',
    title: 'Psalms Devotional — 14 Days',
    description: 'Two weeks in the Psalms, covering worship, lament, trust, and praise.',
    duration_days: 14,
    tags: ['Psalms', 'Prayer', 'Worship', 'Poetry'],
    color: 'from-purple-500 to-pink-600',
    days: [
      { day: 1, label: 'The Blessed Man', readings: ['Psalm 1'] },
      { day: 2, label: 'My Shepherd', readings: ['Psalm 23'] },
      { day: 3, label: 'The Earth is the Lord\'s', readings: ['Psalm 24', 'Psalm 25'] },
      { day: 4, label: 'The Lord is My Light', readings: ['Psalm 27'] },
      { day: 5, label: 'A New Song', readings: ['Psalm 33', 'Psalm 34'] },
      { day: 6, label: 'From the Depths', readings: ['Psalm 40', 'Psalm 42'] },
      { day: 7, label: 'Have Mercy on Me', readings: ['Psalm 51'] },
      { day: 8, label: 'God is Our Refuge', readings: ['Psalm 46', 'Psalm 91'] },
      { day: 9, label: 'Praise God in All Things', readings: ['Psalm 103'] },
      { day: 10, label: 'Your Word is a Lamp', readings: ['Psalm 119:1-64'] },
      { day: 11, label: 'Your Word is a Lamp II', readings: ['Psalm 119:105-176'] },
      { day: 12, label: 'Pilgrimage Songs', readings: ['Psalm 120', 'Psalm 121', 'Psalm 130'] },
      { day: 13, label: 'God Knows Me', readings: ['Psalm 139'] },
      { day: 14, label: 'Let Everything Praise', readings: ['Psalm 145', 'Psalm 150'] },
    ]
  },
  {
    id: 'genesis-to-revelation',
    title: 'Bible Story Overview — 7 Days',
    description: 'The whole story of the Bible in one week — from creation to new creation.',
    duration_days: 7,
    tags: ['Overview', 'Gospel', 'Story'],
    color: 'from-green-500 to-teal-600',
    days: [
      { day: 1, label: 'Creation & Fall', readings: ['Genesis 1-3'] },
      { day: 2, label: 'Covenant & Rescue', readings: ['Genesis 12:1-9', 'Exodus 12:1-42'] },
      { day: 3, label: 'Kingdom & Exile', readings: ['2 Samuel 7:1-17', 'Psalm 137'] },
      { day: 4, label: 'The Promise Fulfilled', readings: ['Luke 1:26-56', 'Luke 2:1-20'] },
      { day: 5, label: 'The Cross & Resurrection', readings: ['Luke 23:26-56', 'Luke 24:1-49'] },
      { day: 6, label: 'The Spirit & the Church', readings: ['Acts 2:1-47', 'Romans 8:1-30'] },
      { day: 7, label: 'New Heaven & Earth', readings: ['Revelation 21-22'] },
    ]
  }
];

// ── Share helper ─────────────────────────────────────────────────────────────
function ShareButton({ plan, type }) {
  const [copied, setCopied] = useState(false);
  const share = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#shared?type=${type}&id=${plan.curated_plan_id || plan.id}&title=${encodeURIComponent(plan.title)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={share} title="Copy shareable link"
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all ${copied ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'}`}>
      {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Share2 className="w-3 h-3" /> Share</>}
    </button>
  );
}

// ── Curated Plan Card ─────────────────────────────────────────────────────────
function CuratedPlanCard({ plan, onStart }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`bg-gradient-to-r ${plan.color} p-5`}>
        <h3 className="text-white font-bold text-lg">{plan.title}</h3>
        <p className="text-white/80 text-sm mt-1">{plan.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <Badge className="bg-white/20 text-white border-0 text-xs">
            <Calendar className="w-3 h-3 mr-1" />{plan.duration_days} days
          </Badge>
          {plan.tags.map(t => <Badge key={t} className="bg-white/20 text-white border-0 text-xs">{t}</Badge>)}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex gap-2 mb-3">
          <Button className="flex-1" size="sm" onClick={() => onStart(plan)}>
            <Plus className="w-4 h-4 mr-1" /> Start Plan
          </Button>
          <ShareButton plan={{ ...plan, curated_plan_id: plan.id }} type="curated" />
          <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        {expanded && (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {plan.days.map(d => (
              <div key={d.day} className="flex items-start gap-2 text-sm py-1 border-b border-gray-100">
                <span className="font-bold text-gray-500 w-8 flex-shrink-0">D{d.day}</span>
                <div>
                  <span className="font-medium text-gray-800">{d.label}</span>
                  <span className="text-gray-500 ml-2 text-xs">{d.readings.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── My Plan Day Tracker ───────────────────────────────────────────────────────
function MyPlanProgress({ plan }) {
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`plan_progress_${plan.id}`) || '{}'); }
    catch { return {}; }
  });

  const toggle = (dayKey) => {
    setChecked(prev => {
      const next = { ...prev, [dayKey]: !prev[dayKey] };
      localStorage.setItem(`plan_progress_${plan.id}`, JSON.stringify(next));
      return next;
    });
  };

  const planData = CURATED_PLANS.find(p => p.id === plan.curated_plan_id) || { days: plan.days || [] };
  const totalReadings = planData.days.reduce((acc, d) => acc + d.readings.length, 0);
  const doneReadings = Object.values(checked).filter(Boolean).length;
  const pct = totalReadings > 0 ? Math.round((doneReadings / totalReadings) * 100) : 0;

  return (
    <Card className="border-indigo-100">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{plan.title}</h3>
            <p className="text-sm text-gray-500">{pct}% complete — {doneReadings}/{totalReadings} readings done</p>
            <div className="mt-2 h-2 bg-gray-100 rounded-full">
              <div className="h-2 bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ShareButton plan={plan} type="user" />
            <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <PlanFlashcardQuiz plan={{ ...plan, days: planData.days }} />
        {expanded && (
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {planData.days.map(d => (
              <div key={d.day} className="bg-gray-50 rounded-lg p-3">
                <p className="font-semibold text-sm text-gray-700 mb-2">Day {d.day}: {d.label}</p>
                <div className="space-y-1">
                  {d.readings.map(r => {
                    const key = `d${d.day}_${r}`;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <Checkbox checked={!!checked[key]} onCheckedChange={() => toggle(key)} id={key} />
                        <label htmlFor={key} className={`text-sm cursor-pointer ${checked[key] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {r}
                        </label>
                        {checked[key] && <CheckCircle2 className="w-3 h-3 text-green-500 ml-auto" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── AI Plan Generator ─────────────────────────────────────────────────────────
function AIPlanGenerator({ user, onCreated }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a structured Bible reading plan in JSON for a user with this goal: "${prompt}".

Return ONLY valid JSON with this exact shape:
{
  "title": "Plan title",
  "description": "1-2 sentence description",
  "duration_days": number (7-30),
  "tags": ["tag1","tag2"],
  "days": [
    { "day": 1, "label": "Day topic", "readings": ["Book Chapter:Verses"] }
  ]
}

Rules:
- Use real Bible references (e.g. "John 3:16", "Psalm 23", "Romans 8:1-30")
- Cover diverse books matching the goal
- Keep each day to 1-3 readings
- Make it spiritually rich and practical`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            duration_days: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
            days: { type: 'array', items: {
              type: 'object',
              properties: {
                day: { type: 'number' },
                label: { type: 'string' },
                readings: { type: 'array', items: { type: 'string' } }
              }
            }}
          }
        }
      });

      await base44.entities.StudyPlan.create({
        user_id: user.id,
        title: result.title,
        description: result.description,
        duration_days: result.duration_days,
        topics: result.tags,
        days: result.days,
        status: 'active',
        curated_plan_id: null,
        progress_percentage: 0
      });
      setPrompt('');
      onCreated();
    } catch (error) {
      console.error('Failed to generate plan:', error.message);
      alert('Could not generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe your spiritual goal or study interest... e.g. 'Help me understand forgiveness' or 'I want to study the life of Paul'"
        rows={3}
      />
      <Button onClick={generate} disabled={loading || !prompt.trim()} className="w-full gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating your plan...</> : <><Sparkles className="w-4 h-4" /> Generate My Plan</>}
      </Button>
    </div>
  );
}

// ── Shared Plan Banner (when visiting via a shared link) ──────────────────────
function SharedPlanBanner({ user, onAdded }) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(window.location.hash.replace('#shared?', ''));
  const type = params.get('type');
  const id = params.get('id');
  const title = params.get('title');

  if (!id || !title) return null;

  const addToMyPlans = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    setLoading(true);
    try {
      // Find the curated plan data or fetch shared user plan
      let planData = CURATED_PLANS.find(p => p.id === id);
      if (!planData && type === 'user') {
        const results = await base44.entities.StudyPlan.filter({ id });
        planData = results[0];
      }
      await base44.entities.StudyPlan.create({
        user_id: user.id,
        title: planData?.title || decodeURIComponent(title),
        description: planData?.description || 'Shared plan',
        duration_days: planData?.duration_days || 30,
        topics: planData?.topics || planData?.tags || [],
        days: planData?.days || [],
        curated_plan_id: type === 'curated' ? id : null,
        status: 'active',
        progress_percentage: 0
      });
      setAdded(true);
      onAdded();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-indigo-900 text-sm">📤 Someone shared a plan with you!</p>
        <p className="text-indigo-700 text-sm mt-0.5">"{decodeURIComponent(title)}"</p>
      </div>
      {added ? (
        <span className="flex items-center gap-1 text-green-700 text-sm font-semibold"><Check className="w-4 h-4" /> Added!</span>
      ) : (
        <Button size="sm" onClick={addToMyPlans} disabled={loading} className="flex-shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Add to My Plans</>}
        </Button>
      )}
    </div>
  );
}

// ── Community Shared Plans Tab ────────────────────────────────────────────────
function CommunityPlans({ user, onAdd }) {
  const { data: sharedPlans = [] } = useQuery({
    queryKey: ['shared-study-plans'],
    queryFn: () => base44.entities.StudyPlan.list('-created_date', 30)
  });

  // Only show plans from other users that have days data
  const community = sharedPlans.filter(p => p.days?.length > 0 && p.user_id !== user?.id);

  return (
    <div className="space-y-4">
      {community.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-gray-400 text-sm">No shared plans yet — be the first to share yours!</CardContent></Card>
      ) : (
        community.map(plan => (
          <Card key={plan.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{plan.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{plan.duration_days} days</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />Shared by community</span>
                </div>
              </div>
              <Button size="sm" onClick={() => onAdd(plan)}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BibleReadingPlans() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [showAIDialog, setShowAIDialog] = useState(false);
  const queryClient = useQueryClient();

  // Detect shared link on mount
  useEffect(() => {
    if (window.location.hash.includes('#shared?')) setActiveTab('my-plans');
  }, []);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: myPlans = [] } = useQuery({
    queryKey: ['reading-plans', user?.id],
    queryFn: () => base44.entities.StudyPlan.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user
  });

  const addPlan = async (plan) => {
    if (!user) return;
    const already = myPlans.find(p => p.curated_plan_id === (plan.curated_plan_id || plan.id) || p.id === plan.id);
    if (already) { setActiveTab('my-plans'); return; }
    await base44.entities.StudyPlan.create({
      user_id: user.id,
      title: plan.title,
      description: plan.description,
      duration_days: plan.duration_days,
      topics: plan.topics || plan.tags || [],
      days: plan.days || [],
      curated_plan_id: plan.id,
      status: 'active',
      progress_percentage: 0
    });
    queryClient.invalidateQueries(['reading-plans']);
    setActiveTab('my-plans');
  };

  const TABS = [
    { id: 'browse', label: 'Curated Plans' },
    { id: 'community', label: 'Community' },
    { id: 'my-plans', label: `My Plans (${myPlans.length})` }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Shared plan banner */}
        <SharedPlanBanner user={user} onAdded={() => {
          queryClient.invalidateQueries(['reading-plans']);
          setActiveTab('my-plans');
        }} />

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-indigo-600" /> Bible Reading Plans
            </h1>
            <p className="text-gray-500 mt-1">Curated plans and AI-personalized reading journeys</p>
          </div>
          <Button onClick={() => setShowAIDialog(true)} className="gap-2 flex-shrink-0">
            <Sparkles className="w-4 h-4" /> AI Plan
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border w-fit flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CURATED_PLANS.map(plan => (
              <CuratedPlanCard key={plan.id} plan={plan} onStart={addPlan} />
            ))}
          </div>
        )}

        {activeTab === 'community' && <CommunityPlans user={user} onAdd={addPlan} />}

        {activeTab === 'my-plans' && myPlans.length > 0 && (
          <AdaptiveStudyAssistant user={user} plans={myPlans} />
        )}

        {activeTab === 'my-plans' && (
          <div className="space-y-4 mt-4">
            {myPlans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No reading plans started yet.</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => setActiveTab('browse')}>Browse Plans</Button>
                    <Button onClick={() => setShowAIDialog(true)} className="gap-2"><Sparkles className="w-4 h-4" /> AI Plan</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              myPlans.map(plan => <MyPlanProgress key={plan.id} plan={plan} />)
            )}
          </div>
        )}
      </div>

      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> AI-Personalized Reading Plan
            </DialogTitle>
          </DialogHeader>
          {user && (
            <AIPlanGenerator user={user} onCreated={() => {
              queryClient.invalidateQueries(['reading-plans']);
              setShowAIDialog(false);
              setActiveTab('my-plans');
            }} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}