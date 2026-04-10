import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, BarChart2, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = { completed: '#22C55E', in_progress: '#6366F1', review: '#F59E0B', todo: '#D1D5DB', blocked: '#EF4444' };

export default function ProjectProgressDashboard({ project, tasks, collaborators }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const review = tasks.filter(t => t.status === 'review').length;
  const blocked = tasks.filter(t => t.status === 'blocked').length;
  const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const pieData = [
    { name: 'Completed', value: completed, color: COLORS.completed },
    { name: 'In Progress', value: inProgress, color: COLORS.in_progress },
    { name: 'Review', value: review, color: COLORS.review },
    { name: 'To Do', value: todo, color: COLORS.todo },
    { name: 'Blocked', value: blocked, color: COLORS.blocked },
  ].filter(d => d.value > 0);

  // Per-assignee stats
  const assigneeStats = {};
  tasks.forEach(t => {
    if (t.assignee_name) {
      if (!assigneeStats[t.assignee_name]) assigneeStats[t.assignee_name] = { total: 0, done: 0 };
      assigneeStats[t.assignee_name].total++;
      if (t.status === 'completed') assigneeStats[t.assignee_name].done++;
    }
  });
  const barData = Object.entries(assigneeStats).map(([name, s]) => ({
    name: name.split(' ')[0],
    Completed: s.done,
    Remaining: s.total - s.done,
  }));

  // Milestone progress
  const milestones = project.milestones || [];
  const doneMs = milestones.filter(m => m.completed).length;

  return (
    <div className="space-y-4">
      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Tasks', value: total, icon: BarChart2, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Overdue', value: overdue, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-3`}>
            <s.icon className={`w-6 h-6 ${s.color}`} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-gray-800">Overall Progress</span>
          </div>
          <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3 mb-2" />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{completed} of {total} tasks done</span>
          {milestones.length > 0 && <span>🏁 {doneMs}/{milestones.length} milestones</span>}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pie Chart */}
        {total > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Task Distribution</h4>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-gray-600">{d.name}</span>
                    <span className="font-semibold text-gray-800 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bar chart by assignee */}
        {barData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> By Assignee</h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={barData} barSize={14}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Completed" fill="#22C55E" radius={[4,4,0,0]} />
                <Bar dataKey="Remaining" fill="#E5E7EB" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}