import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function AIPathGenerator({ user, userProgress, quizAttempts, allLessons, allCourses }) {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const createPathMutation = useMutation({
    mutationFn: (pathData) => base44.entities.LearningPath.create(pathData),
    onSuccess: () => {
      queryClient.invalidateQueries(['learningPaths']);
      toast.success('Learning path created!');
    }
  });

  const handleGeneratePath = async () => {
    setGenerating(true);

    try {
      const completedLessonIds = userProgress.filter(p => p.completed).map(p => p.lesson_id);
      const avgScore = quizAttempts.length > 0
        ? quizAttempts.reduce((sum, q) => sum + q.score, 0) / quizAttempts.length
        : 0;

      const completedLessons = allLessons.filter(l => completedLessonIds.includes(l.id));
      const availableLessons = allLessons.filter(l => 
        !completedLessonIds.includes(l.id) && l.status === 'approved'
      );

      const userInterests = user.interests || [];
      const userGoals = user.learning_goals || '';

      const prompt = `Analyze this user's learning profile and create a personalized learning path.

USER PROFILE:
- Interests: ${userInterests.join(', ') || 'General biblical study'}
- Learning Goals: ${userGoals || 'Not specified'}
- Completed Lessons: ${completedLessons.length}
- Average Quiz Score: ${Math.round(avgScore)}%
- Learning Level: ${avgScore >= 80 ? 'Advanced' : avgScore >= 60 ? 'Intermediate' : 'Beginner'}

COMPLETED TOPICS:
${completedLessons.slice(0, 10).map(l => `- ${l.title}`).join('\n') || 'None yet'}

AVAILABLE LESSONS:
${availableLessons.slice(0, 50).map((l, i) => `${i + 1}. ${l.title} (${l.language_code})`).join('\n')}

Create a learning path with:
1. A compelling title that reflects the user's interests
2. A brief description explaining why this path is recommended
3. Select 5-8 lessons from the available list (use lesson numbers)
4. Order them from foundational to advanced
5. Estimate duration in days
6. Explain your reasoning

Return JSON:
{
  "title": "Learning path title",
  "description": "Why this path is recommended",
  "difficulty_level": "beginner|intermediate|advanced",
  "estimated_duration_days": 30,
  "lesson_numbers": [1, 3, 5, 7, 10],
  "ai_reasoning": "Explanation of why these lessons in this order",
  "interests_matched": ["interest1", "interest2"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            difficulty_level: { type: "string" },
            estimated_duration_days: { type: "number" },
            lesson_numbers: { type: "array", items: { type: "number" } },
            ai_reasoning: { type: "string" },
            interests_matched: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Map lesson numbers to actual lesson IDs
      const selectedLessons = response.lesson_numbers
        .map((num, idx) => {
          const lesson = availableLessons[num - 1];
          return lesson ? {
            lesson_id: lesson.id,
            order: idx,
            is_completed: false
          } : null;
        })
        .filter(Boolean);

      if (selectedLessons.length === 0) {
        toast.error('No suitable lessons found');
        setGenerating(false);
        return;
      }

      await createPathMutation.mutateAsync({
        user_id: user.id,
        title: response.title,
        description: response.description,
        path_type: 'ai_generated',
        difficulty_level: response.difficulty_level,
        estimated_duration_days: response.estimated_duration_days,
        lessons: selectedLessons,
        interests_matched: response.interests_matched,
        ai_reasoning: response.ai_reasoning,
        started_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to generate path:', error);
      toast.error('Failed to generate learning path');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Learning Path Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">
          Let AI analyze your progress, interests, and quiz performance to create a personalized learning sequence just for you.
        </p>
        <Button
          onClick={handleGeneratePath}
          disabled={generating}
          className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing your progress...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate My Learning Path
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}