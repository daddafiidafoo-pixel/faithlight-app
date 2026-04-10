import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, MoreVertical, Calendar, User, Trash2, Edit2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-100 border-gray-300', dot: 'bg-gray-400' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  { id: 'review', label: 'In Review', color: 'bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500' },
  { id: 'completed', label: 'Completed', color: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
];

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

function TaskCard({ task, onStatusChange, onDelete, onSelect, commentCount = 0, canEdit }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onSelect(task)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-800 flex-1">{task.title}</p>
        {canEdit && (
          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-100"
            >
              <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-5 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36 text-sm">
                {COLUMNS.map(col => col.id !== task.status && (
                  <button key={col.id} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                    onClick={e => { e.stopPropagation(); onStatusChange(task.id, col.id); setShowMenu(false); }}>
                    Move to {col.label}
                  </button>
                ))}
                <hr className="my-1" />
                <button className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  onClick={e => { e.stopPropagation(); onDelete(task.id); setShowMenu(false); }}>
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}

      {task.bible_reference && (
        <p className="text-xs text-indigo-600 mt-1">📖 {task.bible_reference}</p>
      )}

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        {task.assignee_name && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <User className="w-3 h-3" /> {task.assignee_name.split(' ')[0]}
          </span>
        )}
        {task.due_date && (
          <span className={`flex items-center gap-1 text-xs ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-500' : 'text-gray-400'}`}>
            <Calendar className="w-3 h-3" /> {format(new Date(task.due_date), 'MMM d')}
          </span>
        )}
        {commentCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <MessageCircle className="w-3 h-3" /> {commentCount}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TaskBoard({ tasks, projectId, user, canEdit, onTaskUpdated, onTaskDeleted, onAddTask, onSelectTask, commentCounts = {} }) {
  const handleStatusChange = async (taskId, newStatus) => {
    const update = { status: newStatus };
    if (newStatus === 'completed') update.completed_at = new Date().toISOString();
    await base44.entities.ProjectTask.update(taskId, update);
    onTaskUpdated();
  };

  const handleDelete = async (taskId) => {
    await base44.entities.ProjectTask.delete(taskId);
    onTaskDeleted();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className={`rounded-xl border-2 ${col.color} p-3`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                <span className="text-xs bg-white rounded-full px-1.5 py-0.5 text-gray-500 border">{colTasks.length}</span>
              </div>
              {canEdit && col.id === 'todo' && (
                <button onClick={() => onAddTask(col.id)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="space-y-2 min-h-[60px]">
              {colTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onSelect={onSelectTask}
                  commentCount={commentCounts[task.id] || 0}
                  canEdit={canEdit}
                />
              ))}
            </div>
            {canEdit && col.id !== 'todo' && (
              <button
                onClick={() => onAddTask(col.id)}
                className="w-full mt-2 py-1.5 text-xs text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all flex items-center justify-center gap-1 border border-dashed border-transparent hover:border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add task
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}