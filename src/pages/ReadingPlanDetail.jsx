import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, CheckCircle2, Circle, ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getReadingProgress, markDayComplete as markDayCompleteLocal, syncProgressToBackend } from '@/lib/readingProgressService';

export default function ReadingPlanDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan_id');

  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reflectionNote, setReflectionNote] = useState('');
  const [showReflectionInput, setShowReflectionInput] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          navigate('/auth');
          return;
        }

        // Fetch plan
        const planData = await base44.entities.ReadingPlan.filter({ id: planId }, null, 1);
        if (planData?.[0]) setPlan(planData[0]);

        // Fetch progress from backend first
        let progressData = await base44.entities.ReadingPlanProgress.filter({
          user_email: user.email,
          plan_id: planId,
        });

        // If no backend progress, check localStorage
        if (!progressData?.[0]) {
          const localProgress = getReadingProgress(planId, user.email);
          // Create backend record from localStorage
          if (localProgress.completedDays.length > 0) {
            const created = await base44.entities.ReadingPlanProgress.create({
              user_email: user.email,
              plan_id: planId,
              started_date: localProgress.startedAt,
              completed_days: localProgress.completedDays,
              current_day: localProgress.currentDay,
              last_accessed: new Date().toISOString(),
            });
            progressData = [created];
          }
        }

        if (progressData?.[0]) setProgress(progressData[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [planId, navigate]);

  const handleMarkDayComplete = async () => {
    if (!progress || !plan) return;

    // Save to localStorage for offline support
    const localProgress = markDayCompleteLocal(planId, progress.current_day, progress.user_email);

    const updatedCompletedDays = [...(progress.completed_days || [])];
    if (!updatedCompletedDays.includes(progress.current_day)) {
      updatedCompletedDays.push(progress.current_day);
    }

    const nextDay = progress.current_day + 1;
    const isFullyCompleted = nextDay > plan.duration_days;

    try {
      // Sync to backend
      await base44.entities.ReadingPlanProgress.update(progress.id, {
        completed_days: updatedCompletedDays,
        current_day: isFullyCompleted ? plan.duration_days : nextDay,
        is_completed: isFullyCompleted,
        completed_date: isFullyCompleted ? new Date().toISOString() : undefined,
      });

      // Refresh progress
      const updated = await base44.entities.ReadingPlanProgress.filter(
        { id: progress.id },
        null,
        1
      );
      if (updated?.[0]) setProgress(updated[0]);
      setShowReflectionInput(false);
      setReflectionNote('');
    } catch (error) {
      console.error('Error updating progress:', error);
      // Progress is still saved in localStorage, so don't error out
    }
  };

  const handleAddNote = async () => {
    if (!progress || !reflectionNote.trim()) return;

    try {
      const updatedNotes = [...(progress.notes || [])];
      updatedNotes.push({
        day: progress.current_day,
        note_text: reflectionNote,
        created_at: new Date().toISOString(),
      });

      await base44.entities.ReadingPlanProgress.update(progress.id, {
        notes: updatedNotes,
      });

      // Refresh
      const updated = await base44.entities.ReadingPlanProgress.filter(
        { id: progress.id },
        null,
        1
      );
      if (updated?.[0]) setProgress(updated[0]);
      setReflectionNote('');
      setShowReflectionInput(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan || !progress) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
        <p className="text-slate-600">Plan not found</p>
      </div>
    );
  }

  const currentVerse = plan.verses?.find(v => v.day === progress.current_day);
  const isCompleted = progress.is_completed;
  const daysDone = progress.completed_days?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-20 border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/ReadingPlans')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-900" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{plan.title}</h1>
            <p className="text-sm text-slate-600">Day {progress.current_day} of {plan.duration_days}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-900">{daysDone} completed</span>
          <span className="text-sm font-semibold text-slate-600">{daysDone}/{plan.duration_days}</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
            style={{ width: `${(daysDone / plan.duration_days) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {isCompleted ? (
          // Completion View
          <div className="bg-white rounded-2xl p-8 text-center shadow-md">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Plan Completed!</h2>
            <p className="text-slate-600 mb-6">You've completed all {plan.duration_days} days of this reading plan.</p>
            <button
              onClick={() => navigate('/ReadingPlans')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
            >
              Browse More Plans
            </button>
          </div>
        ) : (
          <>
            {/* Verse Card */}
            {currentVerse && (
              <div
                className="rounded-2xl p-8 text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${plan.theme_color || '#8B5CF6'} 0%, ${plan.theme_color || '#8B5CF6'}dd 100%)`,
                }}
              >
                <p className="text-sm font-semibold opacity-90 mb-4 text-center">Today's Verse</p>
                <p className="text-2xl font-bold leading-relaxed text-center mb-6">
                  {currentVerse.verse_start}-{currentVerse.verse_end}
                </p>
                <p className="text-lg font-semibold text-center text-white/90">
                  {currentVerse.book_id} {currentVerse.chapter}:{currentVerse.verse_start}
                </p>
              </div>
            )}

            {/* Reflection Prompt */}
            {currentVerse?.reflection_prompt && (
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Reflection</h3>
                <p className="text-slate-600 mb-4">{currentVerse.reflection_prompt}</p>
                <button
                  onClick={() => setShowReflectionInput(!showReflectionInput)}
                  className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                >
                  {showReflectionInput ? 'Cancel' : 'Add Your Thoughts'}
                </button>

                {showReflectionInput && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={reflectionNote}
                      onChange={e => setReflectionNote(e.target.value)}
                      placeholder="Write your reflection..."
                      className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={4}
                    />
                    <button
                      onClick={handleAddNote}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
                    >
                      Save Reflection
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mark Complete Button */}
            <button
              onClick={handleMarkDayComplete}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl transition-all shadow-lg"
            >
              <CheckCircle2 className="w-6 h-6" />
              Mark Day {progress.current_day} Complete
            </button>
          </>
        )}

        {/* Previous Notes */}
        {progress.notes && progress.notes.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Your Reflections</h3>
            <div className="space-y-4">
              {progress.notes.map((note, idx) => (
                <div key={idx} className="pb-4 border-b last:border-b-0">
                  <p className="text-sm font-semibold text-slate-600 mb-1">Day {note.day}</p>
                  <p className="text-slate-700">{note.note_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}