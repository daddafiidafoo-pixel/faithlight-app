import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, Lightbulb, BookOpen, Target, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';

export default function AIInsights({ lesson, quizQuestions, quizAttempts, userProgress }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');

  const analyzeWithAI = async () => {
    setAnalyzing(true);
    setError('');

    try {
      // Calculate struggle areas
      const questionStats = quizQuestions.map(question => {
        const answersForQuestion = quizAttempts.flatMap(attempt =>
          attempt.answers.filter(a => a.question_id === question.id)
        );
        const correctCount = answersForQuestion.filter(a => a.correct).length;
        const totalAnswers = answersForQuestion.length;
        const correctRate = totalAnswers > 0 ? (correctCount / totalAnswers) * 100 : 0;

        return {
          question: question.question,
          correctRate,
          totalAnswers
        };
      });

      const difficultQuestions = questionStats
        .filter(q => q.correctRate < 60 && q.totalAnswers >= 3)
        .sort((a, b) => a.correctRate - b.correctRate);

      const completionRate = userProgress.filter(p => p.lesson_id === lesson.id && p.completed).length /
        Math.max(userProgress.filter(p => p.lesson_id === lesson.id).length, 1) * 100;

      const avgQuizScore = quizAttempts.length > 0
        ? quizAttempts.reduce((acc, a) => acc + a.score, 0) / quizAttempts.length
        : 0;

      // Generate AI insights
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Christian education expert analyzing student performance data for a Bible lesson.

Lesson: "${lesson.title}"
Lesson Content Summary: ${lesson.content.substring(0, 500)}...

Performance Data:
- Completion Rate: ${completionRate.toFixed(0)}%
- Average Quiz Score: ${avgQuizScore.toFixed(0)}%
- Total Students: ${userProgress.filter(p => p.lesson_id === lesson.id).length}
- Quiz Attempts: ${quizAttempts.length}

Challenging Questions (where students struggled):
${difficultQuestions.map(q => `- "${q.question}" (${q.correctRate.toFixed(0)}% correct rate)`).join('\n')}

Based on this data, provide:

## Key Insights
Brief analysis of overall student engagement and understanding (2-3 sentences)

## Struggle Areas Identified
List specific concepts or topics where students are struggling based on quiz performance

## Recommended Actions
### 1. Review Materials
Suggest specific Scripture passages or supplementary materials to reinforce weak areas

### 2. Teaching Approach Adjustments  
Recommend alternative teaching methods or explanations for difficult concepts

### 3. Follow-up Activities
Suggest practical exercises, discussion questions, or review sessions

Keep recommendations practical, biblically grounded, and actionable for teachers.
Format in clean markdown.`,
      });

      setInsights(result);
    } catch (err) {
      console.error('Error analyzing:', err);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI-Powered Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!insights && !analyzing && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Lightbulb className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Get AI Analysis
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Let AI analyze student performance, identify struggle areas, and suggest targeted review materials and teaching improvements.
            </p>
            <Button onClick={analyzeWithAI} className="gap-2" size="lg">
              <Sparkles className="w-4 h-4" />
              Analyze Student Performance
            </Button>
            <p className="text-xs text-gray-500 mt-3">
              Uses AI to provide personalized teaching recommendations
            </p>
          </div>
        )}

        {analyzing && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Analyzing student performance data...</p>
          </div>
        )}

        {error && (
          <Alert className="bg-red-50 border-red-200 mb-4">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {insights && (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none bg-white rounded-lg p-6">
              <ReactMarkdown>{insights}</ReactMarkdown>
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={analyzeWithAI} variant="outline" size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Re-analyze
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(insights);
                  alert('Insights copied to clipboard');
                }}
              >
                Copy Insights
              </Button>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                <strong>Remember:</strong> AI insights are suggestions to support your teaching. 
                Always review recommendations prayerfully and adapt them to your students' specific needs.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}