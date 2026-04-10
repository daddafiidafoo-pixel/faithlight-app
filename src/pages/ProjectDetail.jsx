import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, LayoutGrid, BarChart2, Flag, Users, FileText, Edit2, Check, X, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import TaskBoard from '../components/projects/TaskBoard';
import TaskDetailModal from '../components/projects/TaskDetailModal';
import MilestoneTracker from '../components/projects/MilestoneTracker';
import CollaboratorsPanel from '../components/projects/CollaboratorsPanel';
import ProjectProgressDashboard from '../components/projects/ProjectProgressDashboard';
import ProgressReportPanel from '../components/projects/ProgressReportPanel';
import AddTaskModal from '../components/projects/AddTaskModal';

export default function ProjectDetail() {
  const [user, setUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [addTaskStatus, setAddTaskStatus] = useState('todo');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: project, refetch: refetchProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }, '-created_date', 1).then(r => r[0] || null),
    enabled: !!projectId && !!user,
  });

  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['projectTasks', projectId],
    queryFn: () => base44.entities.ProjectTask.filter({ project_id: projectId }, 'order', 200),
    enabled: !!projectId && !!user,
  });

  const { data: collaborators = [], refetch: refetchCollabs } = useQuery({
    queryKey: ['collaborators', projectId],
    queryFn: () => base44.entities.ProjectCollaborator.filter({ project_id: projectId }, '-created_date', 50),
    enabled: !!projectId && !!user,
  });

  const { data: commentCounts = {} } = useQuery({
    queryKey: ['taskCommentCounts', projectId],
    queryFn: async () => {
      const comments = await base44.entities.TaskComment.filter({ project_id: projectId }, '-created_date', 500).catch(() => []);
      const counts = {};
      comments.filter(c => !c.is_deleted).forEach(c => { counts[c.task_id] = (counts[c.task_id] || 0) + 1; });
      return counts;
    },
    enabled: !!projectId && !!user,
  });

  // Subscribe to real-time task updates
  useEffect(() => {
    if (!projectId) return;
    const unsub = base44.entities.ProjectTask.subscribe(ev => {
      if (ev.data?.project_id === projectId) refetchTasks();
    });
    return unsub;
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const unsub = base44.entities.TaskComment.subscribe(ev => {
      if (ev.data?.project_id === projectId) queryClient.invalidateQueries({ queryKey: ['taskCommentCounts', projectId] });
    });
    return unsub;
  }, [projectId]);

  // Determine user permissions
  const isOwner = project?.owner_id === user?.id;
  const myCollab = collaborators.find(c => c.user_id === user?.id);
  const myRole = isOwner ? 'admin' : (myCollab?.role || null);
  const canEdit = myRole === 'admin' || myRole === 'editor';
  const canComment = canEdit || myRole === 'commenter';
  const hasAccess = isOwner || !!myCollab || project?.is_public;

  // Sync progress to project
  useEffect(() => {
    if (!project || !tasks.length) return;
    const progress = Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100);
    if (Math.abs(progress - (project.progress_percentage || 0)) > 1) {
      base44.entities.Project.update(project.id, { progress_percentage: progress }).catch(() => {});
    }
  }, [tasks, project]);

  const handleSaveTitle = async () => {
    if (!titleDraft.trim() || titleDraft === project.title) { setEditingTitle(false); return; }
    await base44.entities.Project.update(project.id, { title: titleDraft.trim() });
    setEditingTitle(false);
    refetchProject();
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    await base44.entities.ProjectTask.filter({ project_id: project.id }).then(ts => Promise.all(ts.map(t => base44.entities.ProjectTask.delete(t.id)))).catch(() => {});
    await base44.entities.Project.delete(project.id);
    navigate(createPageUrl('Projects'));
  };

  const handleStatusChange = async (status) => {
    await base44.entities.Project.update(project.id, { status });
    refetchProject();
  };

  const openAddTask = (status = 'todo') => {
    setAddTaskStatus(status);
    setShowAddTask(true);
  };

  if (!project && user) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-400 text-lg">Project not found or you don't have access.</p>
      <Link to={createPageUrl('Projects')}><Button className="mt-4">← Back to Projects</Button></Link>
    </div>
  );

  if (!project) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;

  const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : project.progress_percentage || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back */}
      <Link to={createPageUrl('Projects')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> All Projects
      </Link>

      {/* Project Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5" style={{ borderLeft: `6px solid ${project.color || '#6366F1'}` }}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {editingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input value={titleDraft} onChange={e => setTitleDraft(e.target.value)} className="text-xl font-bold" autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveTitle()} />
                  <Button size="icon" variant="ghost" onClick={handleSaveTitle}><Check className="w-4 h-4 text-green-600" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingTitle(false)}><X className="w-4 h-4" /></Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                  {isOwner && (
                    <button onClick={() => { setTitleDraft(project.title); setEditingTitle(true); }} className="text-gray-300 hover:text-gray-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            {project.description && <p className="text-gray-500 text-sm">{project.description}</p>}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge variant="outline" className="capitalize">{project.category?.replace('_', ' ')}</Badge>
              {project.due_date && (
                <span className="text-xs text-gray-500">📅 Due {new Date(project.due_date).toLocaleDateString()}</span>
              )}
              <span className="text-xs text-gray-400">{collaborators.length + 1} members</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Overall progress */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 text-lg font-bold"
                style={{ borderColor: project.color || '#6366F1', color: project.color || '#6366F1' }}>
                {progress}%
              </div>
              <p className="text-xs text-gray-400 mt-1">Progress</p>
            </div>

            <div className="flex flex-col gap-2">
              {isOwner && (
                <Select value={project.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {canEdit && (
                <Button size="sm" onClick={() => openAddTask()} className="gap-1 bg-indigo-600 hover:bg-indigo-700 h-8 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </Button>
              )}
              {isOwner && (
                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 h-8 text-xs" onClick={handleDeleteProject}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="board">
        <TabsList className="mb-5 flex flex-wrap gap-1">
          <TabsTrigger value="board" className="gap-1.5"><LayoutGrid className="w-3.5 h-3.5" /> Board</TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> Dashboard</TabsTrigger>
          <TabsTrigger value="milestones" className="gap-1.5"><Flag className="w-3.5 h-3.5" /> Milestones</TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5"><Users className="w-3.5 h-3.5" /> Team</TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5"><FileText className="w-3.5 h-3.5" /> Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <TaskBoard
            tasks={tasks}
            projectId={projectId}
            user={user}
            canEdit={canEdit}
            onTaskUpdated={refetchTasks}
            onTaskDeleted={refetchTasks}
            onAddTask={openAddTask}
            onSelectTask={setSelectedTask}
            commentCounts={commentCounts}
          />
        </TabsContent>

        <TabsContent value="dashboard">
          <ProjectProgressDashboard project={project} tasks={tasks} collaborators={collaborators} />
        </TabsContent>

        <TabsContent value="milestones">
          <MilestoneTracker project={project} canEdit={canEdit} onUpdated={refetchProject} />
        </TabsContent>

        <TabsContent value="team">
          <CollaboratorsPanel
            project={project}
            collaborators={collaborators}
            user={user}
            isOwner={isOwner}
            onUpdated={() => { refetchCollabs(); refetchProject(); }}
          />
        </TabsContent>

        <TabsContent value="reports">
          <ProgressReportPanel project={project} tasks={tasks} />
        </TabsContent>
      </Tabs>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          user={user}
          collaborators={collaborators}
          canEdit={canEdit || canComment}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => { refetchTasks(); setSelectedTask(null); }}
          onDeleted={async (id) => { await base44.entities.ProjectTask.delete(id); refetchTasks(); }}
        />
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          projectId={projectId}
          user={user}
          collaborators={collaborators}
          milestones={project.milestones || []}
          defaultStatus={addTaskStatus}
          onCreated={() => { setShowAddTask(false); refetchTasks(); }}
          onClose={() => setShowAddTask(false)}
        />
      )}
    </div>
  );
}