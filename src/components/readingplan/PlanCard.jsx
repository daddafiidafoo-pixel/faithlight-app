import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTodaysAssignment, getNextAssignment } from './planGenerator';
import { CheckCircle2, ChevronDown, ChevronUp, Play, BookOpen, Calendar, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

function progressColor(pct) {
  if (pct >= 100) return 'bg-green-500';
  if (pct >= 60) return 'bg-indigo-500';
  if (pct >= 30) return 'bg-amber-500';
  return 'bg-gray-300';
}

export default function PlanCard({ plan, onPlay, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [marking, setMarking] = useState(null);

  const todayAssignment = getTodaysAssignment(plan.assignments || []);
  const nextAssignment = getNextAssignment(plan.assignments || []);
  const pct = plan.total_chapters > 0 ? Math.round((plan.completed_chapters / plan.total_chapters) * 100) : 0;

  const markComplete = async (session) => {
    setMarking(session);
    const assignments = (plan.assignments || []).map(a =>
      a.session === session ? { ...a, completed: true, completed_at: new Date().toISOString() } : a
    );
    const completed = assignments.filter(a => a.completed).reduce((sum, a) => sum + a.chapters.length, 0);
    const status = completed >= plan.total_chapters ? 'completed' : 'active';
    await base44.entities.ReadingPlan.update(plan.id, { assignments, completed_chapters: completed, status });
    toast.success('Session marked complete!');
    onUpdate?.();
    setMarking(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 truncate">{plan.title}</h3>
              <Badge variant={plan.status === 'completed' ? 'default' : 'secondary'} className="text-xs shrink-0">
                {plan.status}
              </Badge>
            </div>
            <p className="text-xs text-gray-400">
              {plan.frequency === 'daily' ? 'Daily' : 'Weekly'} · {plan.chapters_per_session} ch/session · {plan.total_chapters} total
            </p>
          </div>
          <button onClick={() => onDelete?.(plan.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{plan.completed_chapters} / {plan.total_chapters} chapters</span>
            <span className="text-xs font-bold text-indigo-600">{pct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${progressColor(pct)}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Today's assignment */}
        {todayAssignment && (
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 mb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-indigo-700 mb-1">📖 Today — Session {todayAssignment.session}</p>
                <p className="text-sm text-gray-700 truncate">
                  {todayAssignment.chapters.map(c => `${c.book} ${c.chapter}`).join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {onPlay && (
                  <Button size="sm" variant="outline" onClick={() => onPlay(todayAssignment)} className="gap-1 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-100">
                    <Play className="w-3 h-3" /> Audio
                  </Button>
                )}
                <Button size="sm" onClick={() => markComplete(todayAssignment.session)}
                  disabled={marking === todayAssignment.session}
                  className="gap-1 text-xs bg-indigo-600 hover:bg-indigo-700">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Next up */}
        {!todayAssignment && nextAssignment && (
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 mb-3">
            <p className="text-xs text-gray-500 mb-1">Next up · {nextAssignment.due_date}</p>
            <p className="text-sm text-gray-600 truncate">
              {nextAssignment.chapters.map(c => `${c.book} ${c.chapter}`).join(', ')}
            </p>
          </div>
        )}

        {plan.status === 'completed' && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Plan Completed!
          </div>
        )}

        {/* Toggle sessions list */}
        <button onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors mt-1">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide' : 'View all sessions'}
        </button>
      </div>

      {/* Sessions list */}
      {expanded && (
        <div className="border-t border-gray-100 max-h-64 overflow-y-auto">
          {(plan.assignments || []).map(a => (
            <div key={a.session} className={`flex items-center gap-3 px-5 py-2.5 border-b border-gray-50 last:border-0 ${a.completed ? 'opacity-50' : ''}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${a.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                {a.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <span className="text-xs text-gray-400">{a.session}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{a.due_date}</p>
                <p className="text-sm text-gray-700 truncate">{a.chapters.map(c => `${c.book} ${c.chapter}`).join(', ')}</p>
              </div>
              {!a.completed && (
                <div className="flex items-center gap-1 shrink-0">
                  {onPlay && <button onClick={() => onPlay(a)} className="p-1 rounded hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 transition-colors"><Play className="w-3.5 h-3.5" /></button>}
                  <button onClick={() => markComplete(a.session)} className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}