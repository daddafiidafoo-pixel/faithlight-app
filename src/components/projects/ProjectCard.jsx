import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar, CheckSquare, ArrowRight, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_ICONS = {
  bible_study: '📖',
  reading_plan: '📚',
  ministry: '⛪',
  personal: '👤',
  group: '👥',
  general: '📋',
};

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-500',
};

export default function ProjectCard({ project, taskCount = 0, completedCount = 0, onClick }) {
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : project.progress_percentage || 0;
  const overdue = project.due_date && new Date(project.due_date) < new Date() && project.status !== 'completed';

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all border hover:border-indigo-300 group"
      onClick={onClick}
      style={{ borderLeft: `4px solid ${project.color || '#6366F1'}` }}
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl">{CATEGORY_ICONS[project.category] || '📋'}</span>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-700 transition-colors">
                {project.title}
              </h3>
              {project.description && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[project.status] || STATUS_COLORS.active}`}>
              {project.status}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span className="font-semibold text-gray-700">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5" />
            {completedCount}/{taskCount} tasks
          </span>
          {project.collaborator_ids?.length > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {project.collaborator_ids.length + 1} members
            </span>
          )}
          {project.due_date && (
            <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : ''}`}>
              <Calendar className="w-3.5 h-3.5" />
              {overdue ? 'Overdue · ' : ''}{format(new Date(project.due_date), 'MMM d')}
            </span>
          )}
          {project.milestones?.length > 0 && (
            <span className="flex items-center gap-1">
              🏁 {project.milestones.filter(m => m.completed).length}/{project.milestones.length} milestones
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}