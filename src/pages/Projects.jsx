import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Folder, Users, BookOpen, Filter, LayoutGrid, List } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectModal from '../components/projects/CreateProjectModal';

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'bible_study', label: '📖 Bible Study' },
  { value: 'reading_plan', label: '📚 Reading Plans' },
  { value: 'ministry', label: '⛪ Ministry' },
  { value: 'group', label: '👥 Group' },
  { value: 'general', label: '📋 General' },
];

export default function Projects() {
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tab, setTab] = useState('my');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: myProjects = [], refetch: refetchMy } = useQuery({
    queryKey: ['myProjects', user?.id],
    queryFn: () => base44.entities.Project.filter({ owner_id: user.id }, '-updated_date', 50),
    enabled: !!user,
  });

  const { data: collabProjects = [] } = useQuery({
    queryKey: ['collabProjects', user?.id],
    queryFn: async () => {
      const memberships = await base44.entities.ProjectCollaborator.filter({ user_id: user.id }, '-created_date', 50).catch(() => []);
      if (!memberships.length) return [];
      const ids = [...new Set(memberships.map(m => m.project_id))];
      const all = await base44.entities.Project.list('-updated_date', 100).catch(() => []);
      return all.filter(p => ids.includes(p.id) && p.owner_id !== user.id);
    },
    enabled: !!user,
  });

  const { data: publicProjects = [] } = useQuery({
    queryKey: ['publicProjects'],
    queryFn: () => base44.entities.Project.filter({ is_public: true }, '-updated_date', 30),
    enabled: !!user && tab === 'discover',
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['allProjectTasks', user?.id],
    queryFn: () => base44.entities.ProjectTask.list('-created_date', 500),
    enabled: !!user,
  });

  const getTaskStats = (projectId) => {
    const projectTasks = allTasks.filter(t => t.project_id === projectId);
    return {
      taskCount: projectTasks.length,
      completedCount: projectTasks.filter(t => t.status === 'completed').length,
    };
  };

  const filterProjects = (list) => list.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleCreated = (project) => {
    setShowCreate(false);
    queryClient.invalidateQueries({ queryKey: ['myProjects'] });
    navigate(createPageUrl(`ProjectDetail?id=${project.id}`));
  };

  const renderProjectGrid = (list) => (
    filterProjects(list).length === 0
      ? <div className="text-center py-16 text-gray-400">
          <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm mt-1">Try a different filter or create a new project</p>
        </div>
      : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filterProjects(list).map(p => {
            const { taskCount, completedCount } = getTaskStats(p.id);
            return (
              <ProjectCard
                key={p.id}
                project={p}
                taskCount={taskCount}
                completedCount={completedCount}
                onClick={() => navigate(createPageUrl(`ProjectDetail?id=${p.id}`))}
              />
            );
          })}
        </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-3xl">📋</span> Projects & Tasks
          </h1>
          <p className="text-gray-500 mt-1">Track progress, collaborate, and stay organized in your faith journey</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'My Projects', value: myProjects.length, icon: '📋' },
          { label: 'Collaborating', value: collabProjects.length, icon: '🤝' },
          { label: 'Active', value: [...myProjects, ...collabProjects].filter(p => p.status === 'active').length, icon: '🔥' },
          { label: 'Completed', value: [...myProjects, ...collabProjects].filter(p => p.status === 'completed').length, icon: '✅' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm">
            <p className="text-2xl">{s.icon}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_FILTERS.map(f => (
            <button key={f.value} onClick={() => setCategoryFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${categoryFilter === f.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-5">
          <TabsTrigger value="my" className="gap-2">
            <Folder className="w-4 h-4" /> My Projects ({myProjects.length})
          </TabsTrigger>
          <TabsTrigger value="collab" className="gap-2">
            <Users className="w-4 h-4" /> Collaborating ({collabProjects.length})
          </TabsTrigger>
          <TabsTrigger value="discover" className="gap-2">
            <BookOpen className="w-4 h-4" /> Discover
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my">{renderProjectGrid(myProjects)}</TabsContent>
        <TabsContent value="collab">{renderProjectGrid(collabProjects)}</TabsContent>
        <TabsContent value="discover">{renderProjectGrid(publicProjects.filter(p => p.owner_id !== user?.id))}</TabsContent>
      </Tabs>

      {showCreate && user && (
        <CreateProjectModal user={user} onCreated={handleCreated} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}