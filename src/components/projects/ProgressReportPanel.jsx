import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, TrendingUp, Calendar, CheckCircle, Star } from 'lucide-react';
import { format, subDays, subMonths, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';

export default function ProgressReportPanel({ project, tasks }) {
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, [project.id]);

  const loadReports = async () => {
    const data = await base44.entities.ProjectReport.filter({ project_id: project.id }, '-created_date', 10).catch(() => []);
    setReports(data);
  };

  const generateReport = async (type) => {
    setGenerating(true);
    const now = new Date();
    const periodStart = type === 'weekly' ? startOfWeek(now) : startOfMonth(now);
    const periodEnd = type === 'weekly' ? endOfWeek(now) : endOfMonth(now);

    const recentTasks = tasks.filter(t => t.updated_date && new Date(t.updated_date) >= periodStart);
    const completedInPeriod = recentTasks.filter(t => t.status === 'completed').length;
    const createdInPeriod = tasks.filter(t => t.created_date && new Date(t.created_date) >= periodStart).length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const milestonesHit = (project.milestones || []).filter(m => m.completed && m.completed_at && new Date(m.completed_at) >= periodStart).length;

    // Contributor stats
    const contrib = {};
    recentTasks.filter(t => t.status === 'completed' && t.assignee_name).forEach(t => {
      contrib[t.assignee_id] = contrib[t.assignee_id] || { user_name: t.assignee_name, tasks_done: 0 };
      contrib[t.assignee_id].tasks_done++;
    });
    const topContributors = Object.entries(contrib)
      .map(([uid, d]) => ({ user_id: uid, user_name: d.user_name, tasks_done: d.tasks_done }))
      .sort((a, b) => b.tasks_done - a.tasks_done)
      .slice(0, 5);

    const summaryText = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a concise ${type} progress report for a project called "${project.title}" (${project.category}).
Stats: ${completedInPeriod} tasks completed, ${createdInPeriod} new tasks added, ${inProgress} tasks in progress, ${milestonesHit} milestones hit.
Top contributors: ${topContributors.map(c => `${c.user_name} (${c.tasks_done} tasks)`).join(', ') || 'None'}.
Project overall progress: ${project.progress_percentage || 0}%.
Write 2-3 sentences in an encouraging, professional tone. Mention specific achievements.`,
    }).catch(() => `${type.charAt(0).toUpperCase() + type.slice(1)} report generated. ${completedInPeriod} tasks completed this period.`);

    const report = await base44.entities.ProjectReport.create({
      project_id: project.id,
      report_type: type,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tasks_completed: completedInPeriod,
      tasks_created: createdInPeriod,
      tasks_in_progress: inProgress,
      milestones_hit: milestonesHit,
      progress_delta: project.progress_percentage || 0,
      summary_text: summaryText,
      top_contributors: topContributors,
      generated_at: now.toISOString(),
    });

    await loadReports();
    setActiveReport(report);
    setGenerating(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">Progress Reports</h3>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => generateReport('weekly')} disabled={generating} className="gap-1 text-xs">
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />} Weekly
          </Button>
          <Button size="sm" variant="outline" onClick={() => generateReport('monthly')} disabled={generating} className="gap-1 text-xs">
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />} Monthly
          </Button>
        </div>
      </div>

      {activeReport && (
        <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-indigo-800 capitalize">{activeReport.report_type} Report</h4>
            <span className="text-xs text-indigo-500">{format(new Date(activeReport.generated_at || new Date()), 'MMM d, yyyy')}</span>
          </div>
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">{activeReport.summary_text}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {[
              { label: 'Completed', val: activeReport.tasks_completed, color: 'text-green-600' },
              { label: 'Created', val: activeReport.tasks_created, color: 'text-blue-600' },
              { label: 'In Progress', val: activeReport.tasks_in_progress, color: 'text-indigo-600' },
              { label: 'Milestones', val: activeReport.milestones_hit, color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg p-2">
                <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
          {activeReport.top_contributors?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" /> Top Contributors</p>
              <div className="flex flex-wrap gap-2">
                {activeReport.top_contributors.map((c, i) => (
                  <span key={i} className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">
                    {c.user_name} · {c.tasks_done} tasks
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {reports.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-3">No reports yet. Generate your first report above.</p>
      ) : (
        <div className="space-y-2">
          {reports.map(r => (
            <button
              key={r.id}
              onClick={() => setActiveReport(r)}
              className={`w-full text-left p-3 rounded-lg border transition-all hover:border-indigo-200 ${activeReport?.id === r.id ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100 hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium capitalize">{r.report_type} Report</span>
                </div>
                <span className="text-xs text-gray-400">{format(new Date(r.generated_at || r.created_date), 'MMM d')}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.summary_text}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}