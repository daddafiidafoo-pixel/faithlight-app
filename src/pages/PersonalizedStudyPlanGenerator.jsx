import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Calendar, Bell, Loader2, Check } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const STUDY_GOALS = [
  { value: 'nt_90', label: 'New Testament in 90 Days' },
  { value: 'ot_180', label: 'Old Testament in 180 Days' },
  { value: 'psalms_30', label: 'Psalms in 30 Days' },
  { value: 'gospels_40', label: 'Four Gospels in 40 Days' },
  { value: 'custom', label: 'Custom Reading Plan' },
];

export default function PersonalizedStudyPlanGenerator() {
  const [user, setUser] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [customDetails, setCustomDetails] = useState({ title: '', days: '', passages: '' });
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }
    };
    checkAuth();
  }, []);

  const { data: activeePlans = [] } = useQuery({
    queryKey: ['userPlans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const progress = await base44.entities.UserReadingProgress.filter({
        user_id: user.id,
        status: 'active',
      });
      return progress;
    },
    enabled: !!user,
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planDetails) => {
      const plan = await base44.entities.ReadingPlan.create(planDetails);
      
      const userProgress = await base44.entities.UserReadingProgress.create({
        user_id: user.id,
        plan_id: plan.id,
        current_day: 1,
        completed_days: [],
        started_at: new Date().toISOString(),
        status: 'active',
      });

      return { plan, userProgress };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
      setSelectedGoal('');
      setCustomDetails({ title: '', days: '', passages: '' });
    },
  });

  const generatePlanFromGoal = async (goalType) => {
    setGeneratingPlan(true);
    
    const goalConfigs = {
      nt_90: {
        title: 'New Testament in 90 Days',
        total_days: 90,
        passages: generateNewTestamentPassages(90),
        category: 'gospels',
      },
      ot_180: {
        title: 'Old Testament in 180 Days',
        total_days: 180,
        passages: generateOldTestamentPassages(180),
        category: 'prophets',
      },
      psalms_30: {
        title: 'Psalms in 30 Days',
        total_days: 30,
        passages: generatePsalmsPassages(30),
        category: 'wisdom',
      },
      gospels_40: {
        title: 'Four Gospels in 40 Days',
        total_days: 40,
        passages: generateGospelsPassages(40),
        category: 'gospels',
      },
    };

    const planConfig = goalConfigs[goalType];
    if (planConfig) {
      createPlanMutation.mutate(planConfig);
    }
    setGeneratingPlan(false);
  };

  const generateNewTestamentPassages = (days) => {
    const books = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', 'Thessalonians', 'Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', 'Peter', 'John', 'Jude', 'Revelation'];
    const passages = [];
    
    for (let i = 1; i <= days; i++) {
      const bookIndex = Math.floor((i - 1) / (days / books.length));
      const book = books[bookIndex] || 'Revelation';
      const chapter = (i % 10) + 1;
      passages.push({
        day: i,
        passages: [`${book} ${chapter}`],
        title: `Day ${i}: ${book} ${chapter}`,
      });
    }
    return passages;
  };

  const generateOldTestamentPassages = (days) => {
    const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', 'Samuel', 'Kings', 'Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'];
    const passages = [];
    
    for (let i = 1; i <= days; i++) {
      const bookIndex = Math.floor((i - 1) / (days / books.length));
      const book = books[bookIndex] || 'Malachi';
      const chapter = (i % 15) + 1;
      passages.push({
        day: i,
        passages: [`${book} ${chapter}`],
        title: `Day ${i}: ${book} ${chapter}`,
      });
    }
    return passages;
  };

  const generatePsalmsPassages = (days) => {
    const passages = [];
    for (let i = 1; i <= days; i++) {
      const psalmStart = Math.floor((i - 1) * 150 / days) + 1;
      const psalmEnd = Math.floor(i * 150 / days);
      passages.push({
        day: i,
        passages: [`Psalm ${psalmStart}${psalmEnd > psalmStart ? `-${psalmEnd}` : ''}`],
        title: `Day ${i}: Psalms`,
      });
    }
    return passages;
  };

  const generateGospelsPassages = (days) => {
    const gospels = ['Matthew', 'Mark', 'Luke', 'John'];
    const passages = [];
    
    for (let i = 1; i <= days; i++) {
      const gospelIndex = Math.floor((i - 1) / (days / gospels.length));
      const gospel = gospels[gospelIndex];
      const chapter = (i % 12) + 1;
      passages.push({
        day: i,
        passages: [`${gospel} ${chapter}`],
        title: `Day ${i}: ${gospel}`,
      });
    }
    return passages;
  };

  const handleCustomPlan = async (e) => {
    e.preventDefault();
    if (!customDetails.title || !customDetails.days) return;

    const passages = [];
    const numDays = parseInt(customDetails.days);
    for (let i = 1; i <= numDays; i++) {
      passages.push({
        day: i,
        passages: [customDetails.passages || 'Custom reading'],
        title: `Day ${i}`,
      });
    }

    createPlanMutation.mutate({
      title: customDetails.title,
      total_days: numDays,
      passages,
      category: 'devotional',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Card><CardContent className="py-12 text-center">Please log in to create a study plan.</CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Personalized Study Plan Generator
          </h1>
          <p className="text-gray-600">Create a custom Bible reading schedule tailored to your spiritual goals.</p>
        </div>

        {/* Active Plans */}
        {activeePlans.length > 0 && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Active Study Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeePlans.map(plan => (
                  <div key={plan.id} className="flex items-center gap-2 text-green-700">
                    <Check className="w-4 h-4" />
                    <span>Plan in progress ({plan.current_day} of {plan.plan_id} days)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preset Goals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Preset Reading Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {STUDY_GOALS.filter(g => g.value !== 'custom').map(goal => (
              <Button
                key={goal.value}
                onClick={() => generatePlanFromGoal(goal.value)}
                disabled={generatingPlan}
                className="w-full justify-start h-auto py-4 bg-indigo-50 hover:bg-indigo-100 text-left text-indigo-900"
              >
                <div className="flex-1">
                  <p className="font-semibold">{goal.label}</p>
                  <p className="text-sm text-indigo-700">Comprehensive Bible reading plan</p>
                </div>
                {generatingPlan && <Loader2 className="w-4 h-4 animate-spin" />}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Custom Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Create Custom Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCustomPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Title</label>
                <Input
                  placeholder="e.g., Proverbs Deep Dive"
                  value={customDetails.title}
                  onChange={(e) => setCustomDetails({ ...customDetails, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={customDetails.days}
                  onChange={(e) => setCustomDetails({ ...customDetails, days: e.target.value })}
                  min="1"
                  max="365"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reading Focus (optional)</label>
                <Input
                  placeholder="e.g., Proverbs, specific books, or themes"
                  value={customDetails.passages}
                  onChange={(e) => setCustomDetails({ ...customDetails, passages: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                disabled={createPlanMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {createPlanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Study Plan
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Daily Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">Get in-app notifications to stay on track with your reading plan.</p>
            <Button variant="outline" className="w-full">Enable Daily Reminders</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}