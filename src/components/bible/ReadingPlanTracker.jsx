import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle2, Calendar, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PREDEFINED_PLANS = [
  {
    id: 'bible-in-year',
    title: 'Bible in a Year',
    description: 'Read through the entire Bible in 365 days',
    duration_days: 365,
    topics: ['Complete Bible', 'Systematic Reading']
  },
  {
    id: 'nt-90-days',
    title: 'New Testament in 90 Days',
    description: 'Complete the New Testament in 3 months',
    duration_days: 90,
    topics: ['New Testament', 'Intensive Reading']
  },
  {
    id: 'psalms-month',
    title: 'Psalms in a Month',
    description: 'Read all 150 Psalms in 30 days (5 per day)',
    duration_days: 30,
    topics: ['Psalms', 'Devotional', 'Worship']
  },
  {
    id: 'gospels-40-days',
    title: 'Four Gospels in 40 Days',
    description: 'Journey through the life of Jesus in the four Gospels',
    duration_days: 40,
    topics: ['Gospels', 'Jesus', 'Life of Christ']
  }
];

export default function ReadingPlanTracker({ user, currentBook, currentChapter }) {
  const [activePlan, setActivePlan] = useState(null);
  const [planProgress, setPlanProgress] = useState([]);
  const [showPlans, setShowPlans] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadActivePlan();
    }
  }, [user]);

  const loadActivePlan = async () => {
    try {
      const plans = await base44.entities.StudyPlan.filter({
        user_id: user.id,
        status: 'active'
      });

      const predefinedPlan = plans.find(p => 
        PREDEFINED_PLANS.some(pp => pp.id === p.title?.toLowerCase().replace(/\s+/g, '-'))
      );

      if (predefinedPlan) {
        setActivePlan(predefinedPlan);
        setPlanProgress(predefinedPlan.plan_items || []);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const startPlan = async (plan) => {
    if (!user) {
      toast.error('Please sign in to start a reading plan');
      return;
    }

    setLoading(true);
    try {
      // Generate reading plan items based on plan type
      const items = generatePlanItems(plan);
      
      const newPlan = await base44.entities.StudyPlan.create({
        user_id: user.id,
        title: plan.title,
        description: plan.description,
        duration_days: plan.duration_days,
        topics: plan.topics,
        plan_items: items,
        status: 'active',
        progress_percentage: 0
      });

      setActivePlan(newPlan);
      setPlanProgress(items);
      setShowPlans(false);
      toast.success(`Started: ${plan.title}`);
    } catch (error) {
      console.error('Error starting plan:', error);
      toast.error('Failed to start reading plan');
    } finally {
      setLoading(false);
    }
  };

  const generatePlanItems = (plan) => {
    // Simplified generation - in production, this would be more sophisticated
    const items = [];
    
    if (plan.id === 'nt-90-days') {
      const ntBooks = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', 
                       '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
                       '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
                       'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John',
                       '3 John', 'Jude', 'Revelation'];
      
      let day = 1;
      ntBooks.forEach(book => {
        for (let chapter = 1; chapter <= 5; chapter++) {
          items.push({
            day: day++,
            label: `${book} ${chapter}`,
            book,
            chapter,
            done: false
          });
        }
      });
    } else if (plan.id === 'psalms-month') {
      for (let day = 1; day <= 30; day++) {
        for (let i = 0; i < 5; i++) {
          const psalmNum = (day - 1) * 5 + i + 1;
          if (psalmNum <= 150) {
            items.push({
              day,
              label: `Psalm ${psalmNum}`,
              book: 'Psalms',
              chapter: psalmNum,
              done: false
            });
          }
        }
      }
    } else if (plan.id === 'gospels-40-days') {
      const gospels = [
        { book: 'Matthew', chapters: 28 },
        { book: 'Mark', chapters: 16 },
        { book: 'Luke', chapters: 24 },
        { book: 'John', chapters: 21 }
      ];
      
      let day = 1;
      gospels.forEach(({ book, chapters }) => {
        for (let chapter = 1; chapter <= chapters; chapter++) {
          items.push({
            day: day++,
            label: `${book} ${chapter}`,
            book,
            chapter,
            done: false
          });
        }
      });
    }
    
    return items.slice(0, plan.duration_days * 2); // Reasonable limit
  };

  const markAsComplete = async (itemIndex) => {
    if (!activePlan) return;

    const updatedItems = [...planProgress];
    updatedItems[itemIndex].done = true;

    const completedCount = updatedItems.filter(item => item.done).length;
    const progressPercentage = Math.round((completedCount / updatedItems.length) * 100);

    try {
      await base44.entities.StudyPlan.update(activePlan.id, {
        plan_items: updatedItems,
        progress_percentage: progressPercentage,
        status: progressPercentage === 100 ? 'completed' : 'active'
      });

      setPlanProgress(updatedItems);
      setActivePlan({ ...activePlan, progress_percentage: progressPercentage });
      toast.success('Reading marked complete');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const getTodaysReading = () => {
    if (!activePlan || planProgress.length === 0) return null;
    
    const nextIncomplete = planProgress.find(item => !item.done);
    return nextIncomplete;
  };

  const completedCount = planProgress.filter(item => item.done).length;
  const todaysReading = getTodaysReading();

  if (!user) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {!activePlan ? (
        <div className="text-center">
          <Calendar className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Start a Reading Plan</h3>
          <p className="text-sm text-gray-600 mb-3">
            Follow a structured plan to read through the Bible
          </p>
          <Button onClick={() => setShowPlans(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <BookOpen className="w-4 h-4 mr-2" />
            Choose a Plan
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900">{activePlan.title}</h3>
            <p className="text-xs text-gray-600">{activePlan.description}</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-indigo-600">
                {completedCount} / {planProgress.length} ({activePlan.progress_percentage}%)
              </span>
            </div>
            <Progress value={activePlan.progress_percentage} className="h-2" />
          </div>

          {todaysReading && (
            <div className="bg-indigo-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-900">Next Reading</span>
                <span className="text-xs text-indigo-600">Day {todaysReading.day}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-indigo-800">{todaysReading.label}</span>
                {currentBook === todaysReading.book && currentChapter === todaysReading.chapter && (
                  <Button
                    onClick={() => markAsComplete(planProgress.indexOf(todaysReading))}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={() => setShowPlans(true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            View All Plans
          </Button>
        </div>
      )}

      {showPlans && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Choose a Reading Plan</h2>
            </div>
            
            <div className="p-6 space-y-3">
              {PREDEFINED_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    <Button
                      onClick={() => startPlan(plan)}
                      disabled={loading}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Start
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {plan.duration_days} days
                    </span>
                    <span>{plan.topics.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t">
              <Button
                onClick={() => setShowPlans(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}