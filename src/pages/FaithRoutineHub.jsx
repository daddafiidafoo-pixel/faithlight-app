import React, { useState, useEffect, useRef } from 'react';
import { Bell, Sparkles, Bookmark, BookOpen, Check, ChevronRight, Trash2, Play, Pause, Calendar, Target } from 'lucide-react';
import DailyScheduler from '@/components/notifications/DailyScheduler';
import AIStudyPlannerModal from '@/components/study/AIStudyPlannerModal';
import AudioTimestampBookmarks, { useAudioResumePosition } from '@/components/audio/AudioTimestampBookmarks';
import { toast } from 'sonner';

const TABS = [
  { id: 'schedule', label: 'Schedule', icon: Bell },
  { id: 'plans', label: 'Study Plans', icon: Sparkles },
  { id: 'audio', label: 'Audio Demo', icon: Bookmark },
];

function StudyPlanCard({ plan, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const toggleDay = (dayNum) => {
    const completed = plan.completedDays || [];
    const isCompleted = completed.includes(dayNum);
    const updated = {
      ...plan,
      completedDays: isCompleted
        ? completed.filter(d => d !== dayNum)
        : [...completed, dayNum],
      currentDay: isCompleted ? dayNum : Math.max(...completed, dayNum) + 1,
    };
    onUpdate(updated);
  };

  const progress = Math.round(((plan.completedDays?.length || 0) / plan.totalDays) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{plan.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
          </div>
          <button onClick={onDelete} className="p-1 text-red-300 hover:text-red-500 flex-shrink-0">
            <Trash2 size={14} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Day {plan.completedDays?.length || 0} of {plan.totalDays}</span>
            <span className="font-semibold text-indigo-600">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-xs text-indigo-600 font-semibold"
        >
          <Calendar size={12} />
          {expanded ? 'Hide days' : 'View & track days'}
          <ChevronRight size={12} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 max-h-80 overflow-y-auto">
          {plan.days?.map(d => {
            const done = plan.completedDays?.includes(d.day);
            return (
              <div
                key={d.day}
                className={`flex items-start gap-3 p-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${done ? 'opacity-60' : ''}`}
                onClick={() => toggleDay(d.day)}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                  {done && <Check size={11} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-500">Day {d.day}</span>
                    <span className="text-xs font-semibold text-gray-800 truncate">{d.title}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-0.5">
                    {d.readings?.map((r, i) => (
                      <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <BookOpen size={9} />{r}
                      </span>
                    ))}
                  </div>
                  {d.focus && <p className="text-xs text-gray-400 italic truncate">{d.focus}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudyPlansTab() {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setPlans(JSON.parse(localStorage.getItem('fl_study_plans') || '[]'));
  }, []);

  const persist = (updated) => {
    setPlans(updated);
    localStorage.setItem('fl_study_plans', JSON.stringify(updated));
  };

  const updatePlan = (updated) => {
    persist(plans.map(p => p.id === updated.id ? updated : p));
  };

  const deletePlan = (id) => {
    persist(plans.filter(p => p.id !== id));
    toast.success('Plan removed');
  };

  const onPlanCreated = (plan) => {
    const updated = [plan, ...plans];
    persist(updated);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
      >
        <Sparkles size={16} /> Generate AI Reading Plan
      </button>

      {plans.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
          <Target className="w-10 h-10 text-indigo-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">No study plans yet</p>
          <p className="text-gray-400 text-xs mt-1">Generate a personalized plan with AI above</p>
        </div>
      ) : (
        plans.map(plan => (
          <StudyPlanCard
            key={plan.id}
            plan={plan}
            onUpdate={updatePlan}
            onDelete={() => deletePlan(plan.id)}
          />
        ))
      )}

      {showModal && (
        <AIStudyPlannerModal
          onClose={() => setShowModal(false)}
          onPlanCreated={onPlanCreated}
        />
      )}
    </div>
  );
}

function AudioDemoTab() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const chapterKey = 'demo_JHN_3';
  useAudioResumePosition(audioRef, chapterKey);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setPlaying(true); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p className="text-sm font-semibold text-gray-800 mb-1">Audio Bookmark Demo</p>
        <p className="text-xs text-gray-500 mb-4">In the real audio player this connects to Bible chapter audio. Bookmarks are saved locally and resume position is auto-restored on next open.</p>

        {/* Demo audio using a public domain sample */}
        <audio
          ref={audioRef}
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />

        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl mb-4">
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div>
            <p className="text-sm font-semibold text-gray-900">John 3 (Demo)</p>
            <p className="text-xs text-gray-500">Play audio then tap + Add to bookmark your position</p>
          </div>
        </div>

        <AudioTimestampBookmarks
          audioRef={audioRef}
          chapterKey={chapterKey}
          bookName="John 3"
        />
      </div>

      <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
        <p className="text-xs text-indigo-800 font-semibold mb-1">How it works in the real Bible reader</p>
        <ul className="text-xs text-indigo-700 space-y-1 list-disc list-inside">
          <li>Position is auto-saved every 5 seconds</li>
          <li>Reopening the chapter resumes exactly where you left off</li>
          <li>Named bookmarks let you save and jump to any point</li>
          <li>All data stored locally — works offline</li>
        </ul>
      </div>
    </div>
  );
}

export default function FaithRoutineHub() {
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Faith Routine</h1>
          <p className="text-gray-500 text-sm mt-1">Schedules, study plans & audio bookmarks</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-5">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'schedule' && <DailyScheduler />}
        {activeTab === 'plans' && <StudyPlansTab />}
        {activeTab === 'audio' && <AudioDemoTab />}
      </div>
    </div>
  );
}