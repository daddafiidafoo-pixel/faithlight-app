import React, { useState, useEffect } from 'react';
import { Plus, X, CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles, BookOpen, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PLANS_KEY = 'fl_topic_reading_plans';

const TOPICS = [
  { label: 'Anxiety & Fear', verses: ['Philippians 4:6-7', 'Matthew 6:25-27', 'Isaiah 41:10', 'Psalm 23', 'John 14:27', '1 Peter 5:7', 'Psalm 46:1-3'] },
  { label: 'Joy & Gratitude', verses: ['Psalm 100', 'Philippians 4:4', 'James 1:2-4', 'Romans 15:13', '1 Thessalonians 5:16-18', 'Psalm 16:11', 'John 15:11'] },
  { label: 'Patience', verses: ['Romans 5:3-4', 'James 1:3-4', 'Psalm 27:14', 'Hebrews 10:36', 'Romans 8:25', 'Lamentations 3:25', 'Isaiah 40:31'] },
  { label: 'Faith & Trust', verses: ['Hebrews 11:1', 'Proverbs 3:5-6', 'Mark 11:22-24', 'Romans 10:17', '2 Corinthians 5:7', 'Matthew 17:20', 'Psalm 56:3-4'] },
  { label: 'Grief & Loss', verses: ['Psalm 34:18', 'Matthew 5:4', 'Revelation 21:4', '2 Corinthians 1:3-4', 'John 11:35', 'Psalm 147:3', 'Romans 8:28'] },
  { label: 'Forgiveness', verses: ['Colossians 3:13', 'Ephesians 4:32', 'Matthew 6:14-15', 'Luke 17:3-4', '1 John 1:9', 'Mark 11:25', 'Micah 7:18'] },
  { label: 'Strength & Courage', verses: ['Joshua 1:9', 'Isaiah 40:29-31', 'Philippians 4:13', 'Psalm 18:32', '2 Timothy 1:7', 'Deuteronomy 31:6', 'Psalm 28:7'] },
  { label: 'Love', verses: ['1 Corinthians 13:4-7', 'John 3:16', 'Romans 8:38-39', '1 John 4:8', 'John 13:34-35', 'Romans 5:8', 'Song of Solomon 8:7'] },
];

function getPlans() { return JSON.parse(localStorage.getItem(PLANS_KEY) || '[]'); }
function savePlans(plans) { localStorage.setItem(PLANS_KEY, JSON.stringify(plans)); }

function PlanCard({ plan, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const completed = plan.progress?.filter(Boolean).length || 0;
  const total = plan.verses.length;
  const pct = Math.round((completed / total) * 100);

  const toggleVerse = (i) => {
    const newProgress = [...(plan.progress || plan.verses.map(() => false))];
    newProgress[i] = !newProgress[i];
    const updated = { ...plan, progress: newProgress };
    onUpdate(updated);
    if (newProgress[i]) toast.success('Verse marked as read! 🙌');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">{plan.topic}</h3>
            {pct === 100 && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">Complete!</span>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{completed}/{total} verses · {pct}%</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(e => !e)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-indigo-600 rounded-lg">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => onDelete(plan.id)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="mt-3 bg-gray-100 rounded-full h-2">
        <div
          className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {expanded && (
        <div className="mt-3 border-t border-gray-50 pt-3 space-y-2">
          {plan.verses.map((verse, i) => {
            const done = plan.progress?.[i] || false;
            return (
              <button
                key={i}
                onClick={() => toggleVerse(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all min-h-[44px] ${done ? 'bg-green-50' : 'bg-gray-50 hover:bg-indigo-50'}`}
              >
                {done
                  ? <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                  : <Circle size={16} className="text-gray-300 flex-shrink-0" />}
                <span className={`text-sm font-medium ${done ? 'text-green-700 line-through' : 'text-gray-700'}`}>{verse}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewPlanModal({ onClose, onCreated }) {
  const [selected, setSelected] = useState(null);
  const [customTopic, setCustomTopic] = useState('');

  const create = () => {
    const topic = selected || customTopic.trim();
    if (!topic) { toast.error('Please select or enter a topic.'); return; }
    const topicData = TOPICS.find(t => t.label === topic);
    const verses = topicData ? topicData.verses : ['Genesis 1:1', 'John 3:16', 'Psalm 23', 'Romans 8:28', 'Philippians 4:13', 'Proverbs 3:5-6', 'Isaiah 40:31'];
    const plan = {
      id: Date.now().toString(),
      topic,
      verses,
      progress: verses.map(() => false),
      createdAt: new Date().toISOString(),
    };
    const all = getPlans();
    savePlans([plan, ...all]);
    onCreated(plan);
    onClose();
    toast.success('Reading plan created!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-gray-900">New Reading Plan</h2>
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          <p className="text-sm text-gray-500 mb-4">Choose a life topic to build a 7-verse reading plan:</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {TOPICS.map(t => (
              <button
                key={t.label}
                onClick={() => { setSelected(t.label); setCustomTopic(''); }}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium text-left transition-all ${selected === t.label ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 border border-gray-200'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative mb-4">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-200" />
            <span className="relative bg-white px-3 text-xs text-gray-400 mx-auto block w-fit">or enter your own</span>
          </div>
          <input
            value={customTopic}
            onChange={e => { setCustomTopic(e.target.value); setSelected(null); }}
            placeholder="e.g., Marriage, Purpose, Wisdom..."
            className="w-full min-h-[44px] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
          />
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <button onClick={onClose} className="flex-1 min-h-[44px] rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm">Cancel</button>
          <button onClick={create} className="flex-1 min-h-[44px] rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 flex items-center justify-center gap-2">
            <Sparkles size={14} /> Create Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TopicReadingPlans() {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { setPlans(getPlans()); }, []);

  const handleUpdate = (updated) => {
    const newPlans = plans.map(p => p.id === updated.id ? updated : p);
    setPlans(newPlans);
    savePlans(newPlans);
  };

  const handleDelete = (id) => {
    const updated = plans.filter(p => p.id !== id);
    setPlans(updated);
    savePlans(updated);
    toast.success('Plan removed.');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reading Plans</h1>
            <p className="text-sm text-gray-500">Scripture by life topic, daily</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] bg-indigo-600 text-white rounded-2xl font-semibold text-sm hover:bg-indigo-700"
          >
            <Plus size={15} /> New Plan
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No plans yet</p>
            <p className="text-gray-300 text-sm mt-1">Create a plan based on a topic you're walking through</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map(plan => (
              <PlanCard key={plan.id} plan={plan} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewPlanModal
          onClose={() => setShowModal(false)}
          onCreated={plan => setPlans(prev => [plan, ...prev])}
        />
      )}
    </div>
  );
}