import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Sparkles, Loader2, Play, Save, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PersonalizedStudyPlans() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    interest: '',
    readingLevel: 'intermediate',
    duration: 30,
    minutesPerDay: 30,
  });
  const [generating, setGenerating] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
  }, []);

  const { data: plans = [] } = useQuery({
    queryKey: ['study-plans', user?.id],
    queryFn: () => user?.id 
      ? base44.entities.StudyPlan.filter({ user_id: user.id }, '-created_date', 50)
      : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate a personalized Bible study plan with the following:
- Goal: ${formData.goal}
- Interest: ${formData.interest}
- Reading level: ${formData.readingLevel}
- Duration: ${formData.duration} days
- Time commitment: ${formData.minutesPerDay} minutes per day

Format as JSON with structure: { 
  title, 
  description, 
  passages: [{day, reference, devotional, reflection_question}],
  quizzes: [{day, topic}],
  keyThemes: [string]
}`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              passages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    day: { type: 'number' },
                    reference: { type: 'string' },
                    devotional: { type: 'string' },
                    reflection_question: { type: 'string' }
                  }
                }
              },
              quizzes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    day: { type: 'number' },
                    topic: { type: 'string' }
                  }
                }
              },
              keyThemes: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        });

        const plan = await base44.entities.StudyPlan.create({
          user_id: user.id,
          title: formData.title || response.title,
          goal: formData.goal,
          interest: formData.interest,
          reading_level: formData.readingLevel,
          duration_days: formData.duration,
          minutes_per_day: formData.minutesPerDay,
          description: response.description,
          passages: response.passages,
          quizzes: response.quizzes,
          key_themes: response.keyThemes,
          status: 'created',
        });

        queryClient.invalidateQueries({ queryKey: ['study-plans'] });
        toast.success('Study plan created!');
        setShowForm(false);
        setFormData({
          title: '',
          goal: '',
          interest: '',
          readingLevel: 'intermediate',
          duration: 30,
          minutesPerDay: 30,
        });
      } catch (err) {
        toast.error('Failed to generate plan: ' + err.message);
      } finally {
        setGenerating(false);
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (planId) => base44.entities.StudyPlan.delete(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      toast.success('Plan deleted');
    }
  });

  if (!user) {
    return <div className="p-6 text-center text-gray-600">Please log in to create study plans.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Personalized Study Plans</h1>
        </div>
        <p className="text-gray-600">Create AI-generated Bible study plans tailored to your goals and interests.</p>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="mb-8 border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Create New Study Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Plan Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Faith & Grace Journey"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Reading Level</Label>
                <Select value={formData.readingLevel} onValueChange={(v) => setFormData(p => ({ ...p, readingLevel: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Spiritual Goal</Label>
              <Textarea
                value={formData.goal}
                onChange={(e) => setFormData(p => ({ ...p, goal: e.target.value }))}
                placeholder="e.g., Deepen my understanding of God's grace, Build stronger prayer habits..."
                rows={3}
                className="mt-1 resize-none"
              />
            </div>

            <div>
              <Label>Area of Interest</Label>
              <Input
                value={formData.interest}
                onChange={(e) => setFormData(p => ({ ...p, interest: e.target.value }))}
                placeholder="e.g., Prayer, New Testament, Leadership, Parenting..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(p => ({ ...p, duration: parseInt(e.target.value) }))}
                  min="7"
                  max="365"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Minutes Per Day</Label>
                <Input
                  type="number"
                  value={formData.minutesPerDay}
                  onChange={(e) => setFormData(p => ({ ...p, minutesPerDay: parseInt(e.target.value) }))}
                  min="10"
                  max="120"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={!formData.goal || !formData.interest || generating}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 flex-1"
              >
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Plan</>}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="mb-6 gap-2 bg-indigo-600 hover:bg-indigo-700">
          <BookOpen className="w-4 h-4" />
          Create New Plan
        </Button>
      )}

      {plans.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">No study plans yet.</p>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                Create Your First Plan
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{plan.title || 'Untitled Plan'}</CardTitle>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{plan.duration_days || 0} days</Badge>
                      <Badge className="text-xs bg-blue-100 text-blue-800">{plan.reading_level}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(plan.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {plan.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{plan.description}</p>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Key Themes</p>
                  <div className="flex flex-wrap gap-1">
                    {(plan.key_themes || []).slice(0, 3).map((theme, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{theme}</Badge>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {plan.created_date && `Created ${format(new Date(plan.created_date), 'MMM d, yyyy')}`}
                </p>
              </CardContent>
              <div className="p-4 border-t">
                <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Play className="w-4 h-4" />
                  Start Plan
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}