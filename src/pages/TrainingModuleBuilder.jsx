import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ModuleCreationWizard from '@/components/training/ModuleCreationWizard';

export default function TrainingModuleBuilder() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const { data: modules = [] } = useQuery({
    queryKey: ['training-modules'],
    queryFn: async () => {
      const allModules = await base44.entities.TrainingModule.list('-created_date');
      return allModules;
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId) => base44.entities.TrainingModule.delete(moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-modules'] });
      toast.success('Module deleted');
    },
  });

  const publishModuleMutation = useMutation({
    mutationFn: (moduleId) =>
      base44.entities.TrainingModule.update(moduleId, { status: 'published' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-modules'] });
      toast.success('Module published');
    },
  });

  const draftModules = modules.filter(m => m.status === 'draft');
  const publishedModules = modules.filter(m => m.status === 'published');

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'bg-yellow-100 text-yellow-800',
      review: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            Training Module Builder
          </h1>
          <p className="text-gray-600 mt-2">Create structured training modules with AI-assisted content planning</p>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <Button
            onClick={() => setWizardOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Module
          </Button>
        </div>

        {/* Modules Tabs */}
        <Tabs defaultValue="draft" className="space-y-6">
          <TabsList>
            <TabsTrigger value="draft">
              Draft ({draftModules.length})
            </TabsTrigger>
            <TabsTrigger value="published">
              Published ({publishedModules.length})
            </TabsTrigger>
          </TabsList>

          {/* Draft Modules */}
          <TabsContent value="draft" className="space-y-4">
            {draftModules.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No draft modules yet</p>
                  <Button
                    onClick={() => setWizardOpen(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    Create your first module
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {draftModules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onPublish={() => publishModuleMutation.mutate(module.id)}
                    onDelete={() => deleteModuleMutation.mutate(module.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Published Modules */}
          <TabsContent value="published" className="space-y-4">
            {publishedModules.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No published modules yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {publishedModules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onDelete={() => deleteModuleMutation.mutate(module.id)}
                    published
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Module Creation Wizard */}
      <ModuleCreationWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onModuleCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['training-modules'] });
        }}
      />
    </div>
  );
}

function ModuleCard({ module, onPublish, onDelete, published }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
            <p className="text-gray-600 mt-1">{module.description}</p>
          </div>
          {module.status && getStatusBadge(module.status)}
        </div>

        {/* Module Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 py-4 border-y">
          <div>
            <p className="text-xs text-gray-600">Difficulty</p>
            <p className="font-semibold text-gray-900 capitalize">{module.difficulty_level}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Hours</p>
            <p className="font-semibold text-gray-900">{module.estimated_hours}h</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Objectives</p>
            <p className="font-semibold text-gray-900">{module.objectives?.length || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Instructors</p>
            <p className="font-semibold text-gray-900">{module.instructor_ids?.length || 0}</p>
          </div>
        </div>

        {/* Objectives */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Learning Objectives:</p>
          <ul className="space-y-1">
            {module.objectives?.slice(0, 2).map((obj, idx) => (
              <li key={idx} className="text-sm text-gray-600">• {obj}</li>
            ))}
            {module.objectives?.length > 2 && (
              <li className="text-sm text-gray-500 italic">+{module.objectives.length - 2} more</li>
            )}
          </ul>
        </div>

        {/* AI Outline Preview */}
        {module.ai_suggested_outline && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="text-xs font-semibold text-blue-900 mb-2">AI-Generated Outline:</p>
            <ul className="space-y-1">
              {module.ai_suggested_outline.outline?.slice(0, 3).map((topic, idx) => (
                <li key={idx} className="text-xs text-blue-800">• {topic}</li>
              ))}
              {module.ai_suggested_outline.outline?.length > 3 && (
                <li className="text-xs text-blue-700 italic">
                  +{module.ai_suggested_outline.outline.length - 3} more topics
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Edit
          </Button>
          {!published && (
            <Button
              onClick={onPublish}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Publish
            </Button>
          )}
          <Button
            onClick={onDelete}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusBadge(status) {
  const variants = {
    draft: 'bg-yellow-100 text-yellow-800',
    review: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800',
  };
  return <Badge className={variants[status]}>{status}</Badge>;
}