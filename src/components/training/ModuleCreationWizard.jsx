import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Lightbulb, Plus, X, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function ModuleCreationWizard({ open, onOpenChange, onModuleCreated }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [moduleData, setModuleData] = useState({
    title: '',
    description: '',
    objectives: [],
    instructor_ids: [],
    prerequisite_module_ids: [],
    difficulty_level: 'intermediate',
    estimated_hours: 10,
  });
  const [currentObjective, setCurrentObjective] = useState('');
  const [aiOutline, setAiOutline] = useState(null);

  const { data: users = [] } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
  });

  const { data: existingModules = [] } = useQuery({
    queryKey: ['modules-for-prerequisites'],
    queryFn: () => base44.entities.TrainingModule.filter({ status: 'published' }),
  });

  const generateOutlineMutation = useMutation({
    mutationFn: async () => {
      const outline = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a detailed training module content outline for the following:

MODULE TITLE: ${moduleData.title}
DESCRIPTION: ${moduleData.description}
LEARNING OBJECTIVES:
${moduleData.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

DIFFICULTY LEVEL: ${moduleData.difficulty_level}
ESTIMATED HOURS: ${moduleData.estimated_hours}

Please provide:
1. A detailed outline of lesson topics (5-8 topics recommended)
2. Number of lessons recommended
3. Number of quizzes/assessments recommended
4. Key takeaways

Format your response as JSON with this structure:
{
  "outline": ["Topic 1", "Topic 2", ...],
  "suggested_lessons": number,
  "suggested_quizzes": number,
  "key_takeaways": ["takeaway 1", "takeaway 2", ...]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            outline: { type: 'array', items: { type: 'string' } },
            suggested_lessons: { type: 'number' },
            suggested_quizzes: { type: 'number' },
            key_takeaways: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      return outline;
    },
    onSuccess: (data) => {
      setAiOutline(data);
      toast.success('Content outline generated!');
    },
    onError: () => {
      toast.error('Failed to generate outline');
    },
  });

  const createModuleMutation = useMutation({
    mutationFn: async () => {
      const newModule = await base44.entities.TrainingModule.create({
        title: moduleData.title,
        description: moduleData.description,
        objectives: moduleData.objectives,
        instructor_ids: moduleData.instructor_ids,
        prerequisite_module_ids: moduleData.prerequisite_module_ids,
        difficulty_level: moduleData.difficulty_level,
        estimated_hours: moduleData.estimated_hours,
        ai_suggested_outline: aiOutline,
        status: 'draft',
        created_by_user_id: (await base44.auth.me()).id,
      });
      return newModule;
    },
    onSuccess: (newModule) => {
      queryClient.invalidateQueries({ queryKey: ['training-modules'] });
      toast.success('Module created successfully!');
      onModuleCreated(newModule);
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create module');
    },
  });

  const resetForm = () => {
    setStep(1);
    setModuleData({
      title: '',
      description: '',
      objectives: [],
      instructor_ids: [],
      prerequisite_module_ids: [],
      difficulty_level: 'intermediate',
      estimated_hours: 10,
    });
    setCurrentObjective('');
    setAiOutline(null);
  };

  const addObjective = () => {
    if (currentObjective.trim()) {
      setModuleData({
        ...moduleData,
        objectives: [...moduleData.objectives, currentObjective],
      });
      setCurrentObjective('');
    }
  };

  const removeObjective = (index) => {
    setModuleData({
      ...moduleData,
      objectives: moduleData.objectives.filter((_, i) => i !== index),
    });
  };

  const toggleInstructor = (userId) => {
    setModuleData({
      ...moduleData,
      instructor_ids: moduleData.instructor_ids.includes(userId)
        ? moduleData.instructor_ids.filter(id => id !== userId)
        : [...moduleData.instructor_ids, userId],
    });
  };

  const togglePrerequisite = (moduleId) => {
    setModuleData({
      ...moduleData,
      prerequisite_module_ids: moduleData.prerequisite_module_ids.includes(moduleId)
        ? moduleData.prerequisite_module_ids.filter(id => id !== moduleId)
        : [...moduleData.prerequisite_module_ids, moduleId],
    });
  };

  const canProceed = () => {
    if (step === 1) return moduleData.title && moduleData.description && moduleData.objectives.length > 0;
    if (step === 2) return moduleData.estimated_hours && moduleData.difficulty_level;
    if (step === 3) return true;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Training Module</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Module Title</label>
              <Input
                placeholder="e.g., Biblical Leadership Foundations"
                value={moduleData.title}
                onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Description</label>
              <Textarea
                placeholder="Describe what this module covers"
                value={moduleData.description}
                onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Learning Objectives</label>
              <div className="space-y-2">
                {moduleData.objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm">{obj}</span>
                    <button onClick={() => removeObjective(idx)}>
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an objective (e.g., Understand biblical leadership principles)"
                    value={currentObjective}
                    onChange={(e) => setCurrentObjective(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                  />
                  <Button onClick={addObjective} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Difficulty Level</label>
              <Select value={moduleData.difficulty_level} onValueChange={(val) => setModuleData({ ...moduleData, difficulty_level: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Estimated Hours</label>
              <Input
                type="number"
                min="1"
                value={moduleData.estimated_hours}
                onChange={(e) => setModuleData({ ...moduleData, estimated_hours: parseInt(e.target.value) })}
              />
            </div>
          </div>
        )}

        {/* Step 3: Instructors & Prerequisites */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Assign Instructors</label>
              <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-2">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moduleData.instructor_ids.includes(user.id)}
                      onChange={() => toggleInstructor(user.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{user.full_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Prerequisites</label>
              <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-2">
                {existingModules.map((mod) => (
                  <label key={mod.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moduleData.prerequisite_module_ids.includes(mod.id)}
                      onChange={() => togglePrerequisite(mod.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{mod.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: AI Content Outline */}
        {step === 4 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  AI-Suggested Content Outline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!aiOutline ? (
                  <Button
                    onClick={() => generateOutlineMutation.mutate()}
                    disabled={generateOutlineMutation.isPending}
                    className="w-full"
                  >
                    {generateOutlineMutation.isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    Generate Content Outline with AI
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-2">Suggested Topics:</p>
                      <ul className="space-y-1">
                        {aiOutline.outline.map((topic, idx) => (
                          <li key={idx} className="text-sm text-gray-700">• {topic}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600">Suggested Lessons</p>
                        <p className="text-lg font-bold text-blue-600">{aiOutline.suggested_lessons}</p>
                      </div>
                      <div className="p-2 bg-purple-50 rounded">
                        <p className="text-xs text-gray-600">Suggested Quizzes</p>
                        <p className="text-lg font-bold text-purple-600">{aiOutline.suggested_quizzes}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Key Takeaways:</p>
                      <ul className="space-y-1">
                        {aiOutline.key_takeaways?.map((takeaway, idx) => (
                          <li key={idx} className="text-sm text-gray-700">✓ {takeaway}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Back
          </Button>

          <div className="flex gap-2">
            {step === 4 && (
              <Button
                onClick={() => createModuleMutation.mutate()}
                disabled={createModuleMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createModuleMutation.isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                Create Module
              </Button>
            )}
            {step < 4 && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}