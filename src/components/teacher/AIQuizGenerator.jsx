import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIQuizGenerator({ lessonContent, onQuestionsGenerated }) {
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [ageGroup, setAgeGroup] = useState('adults');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuestions = async () => {
    if (!lessonContent) {
      toast.error('Please add lesson content first');
      return;
    }

    setIsGenerating(true);
    try {
      const difficultyGuides = {
        easy: 'Simple recall and basic understanding questions',
        medium: 'Mix of recall, comprehension, and basic application',
        hard: 'Deep analysis, critical thinking, and complex application'
      };

      const ageGuides = {
        children: 'Simple language, concrete concepts, yes/no or simple choice questions',
        preteens: 'Clear language with some abstract thinking',
        teens: 'Challenging questions that make them think critically',
        adults: 'Sophisticated questions requiring deep understanding',
        seniors: 'Clear questions drawing on life experience'
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this lesson content, generate ${questionCount} quiz questions:

LESSON CONTENT:
${lessonContent.substring(0, 2000)}

QUIZ PARAMETERS:
- Difficulty: ${difficulty} (${difficultyGuides[difficulty]})
- Age Group: ${ageGroup} (${ageGuides[ageGroup]})
- Number of Questions: ${questionCount}

Generate questions that:
1. Test understanding of key concepts from the lesson
2. Include 4 answer options each (one correct, three plausible distractors)
3. Provide brief explanations for correct answers
4. Vary in question type (recall, comprehension, application)
5. Use age-appropriate language for ${ageGroup}

Return JSON array:`,
        response_json_schema: {
          type: 'object',
          properties: {
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  options: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  correct_answer: { type: 'number' },
                  explanation: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (response.questions && onQuestionsGenerated) {
        onQuestionsGenerated(response.questions);
        toast.success(`Generated ${response.questions.length} questions!`);
      }
    } catch (error) {
      toast.error('Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          AI Quiz Generator
        </CardTitle>
        <p className="text-sm text-gray-600">
          Auto-generate quiz questions from your lesson
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Questions</label>
            <Input
              type="number"
              min="3"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Difficulty</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Age Group</label>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="children">Children</SelectItem>
                <SelectItem value="preteens">Preteens</SelectItem>
                <SelectItem value="teens">Teens</SelectItem>
                <SelectItem value="adults">Adults</SelectItem>
                <SelectItem value="seniors">Seniors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={generateQuestions}
          disabled={isGenerating || !lessonContent}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Quiz Questions
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}