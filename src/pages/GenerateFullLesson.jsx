import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, CheckCircle2, BookOpen, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { checkFeatureAccess } from '../components/PlanLimitChecker';

export default function GenerateFullLesson() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1); // 1: Input, 2: Generating, 3: Review & Save
  
  // Form inputs
  const [topic, setTopic] = useState('');
  const [scriptureRef, setScriptureRef] = useState('');
  const [language, setLanguage] = useState('en');
  const [numQuestions, setNumQuestions] = useState(5);
  
  // Generated content
  const [lessonContent, setLessonContent] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [extractedObjectives, setExtractedObjectives] = useState('');
  const [extractedScriptures, setExtractedScriptures] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.user_role !== 'teacher' && currentUser.user_role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, [navigate]);

  const generateLesson = async () => {
    if (!topic.trim()) {
      setError('Please enter a lesson topic');
      return;
    }

    // Check AI usage limits
    const access = checkFeatureAccess(user, 'teaching_builder');
    if (!access.allowed) {
      setError(access.message);
      return;
    }

    setLoading(true);
    setError('');
    setStep(2);

    try {
      // Generate lesson content
      const contentResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Christian education expert. Create a comprehensive, ready-to-use Bible lesson.

Topic: ${topic}
${scriptureRef ? `Primary Scripture Reference: ${scriptureRef}` : ''}
Language: ${language}

Please provide complete lesson content with:

1. **Introduction** (2-3 paragraphs)
   - Hook to engage readers
   - Context for the topic
   - Why this matters today

2. **Main Teaching Content** (4-6 sections)
   - Clear explanations of biblical concepts
   - Scripture references and quotations
   - Historical and cultural context
   - Real-life examples and applications
   - Cross-references to related scriptures

3. **Practical Application** (2-3 paragraphs)
   - How to apply this in daily life
   - Specific action steps
   - Common challenges and how to overcome them

4. **Key Takeaways** (3-5 bullet points)
   - Main concepts to remember

5. **Reflection Questions** (3-5 questions)
   - For personal study or group discussion

Format in clean markdown with proper headers (## for sections).
Make it 1000-1500 words, engaging, theologically sound, and spiritually enriching.
Write in a warm, pastoral tone suitable for believers at various levels.`,
      });

      setLessonContent(contentResult);

      // Extract objectives and scripture references
      const extractionResult = await base44.integrations.Core.InvokeLLM({
        prompt: `From the following lesson content, extract:
1. Learning objectives (3-5 clear, concise objectives)
2. All scripture references mentioned

Lesson Content:
${contentResult}

Return as JSON with "objectives" (string) and "scripture_references" (string).`,
        response_json_schema: {
          type: "object",
          properties: {
            objectives: { type: "string" },
            scripture_references: { type: "string" }
          }
        }
      });

      setExtractedObjectives(extractionResult.objectives || '');
      setExtractedScriptures(extractionResult.scripture_references || scriptureRef || '');

      // Generate quiz questions
      const quizResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Create ${numQuestions} multiple-choice quiz questions based on this Bible lesson.

Lesson Content:
${contentResult}

Create questions that:
1. Test understanding of key biblical concepts
2. Include scriptural knowledge
3. Have 4 answer options each
4. Include explanations for correct answers

Return as JSON array with structure:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Why this is correct"
    }
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setQuizQuestions(quizResult.questions || []);

      // Increment AI usage
      await base44.auth.updateMe({
        ai_generations_used: (user.ai_generations_used || 0) + 1
      });

      setStep(3);
    } catch (error) {
      console.error('Error generating lesson:', error);
      setError('Failed to generate lesson. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const saveLesson = async () => {
    setSaving(true);
    setError('');

    try {
      // Create lesson
      const lesson = await base44.entities.Lesson.create({
        title: topic,
        content: lessonContent,
        objectives: extractedObjectives,
        scripture_references: extractedScriptures,
        language_code: language,
        status: 'draft',
        teacher_id: user.id,
      });

      // Create quiz
      const quiz = await base44.entities.Quiz.create({
        lesson_id: lesson.id,
        title: `${topic} - Quiz`,
        passing_score: 70,
      });

      // Create quiz questions
      const questionPromises = quizQuestions.map((q, index) =>
        base44.entities.QuizQuestion.create({
          quiz_id: quiz.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          order_index: index,
        })
      );

      await Promise.all(questionPromises);

      // Navigate to edit the lesson
      navigate(createPageUrl(`CreateLesson?id=${lesson.id}`));
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError('Failed to save lesson. Please try again.');
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-600" />
            AI Lesson Generator
          </h1>
          <p className="text-gray-600 mt-2">Generate complete Bible lessons with quizzes in seconds</p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Input Form */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Lesson Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="topic">Lesson Topic *</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., The Parable of the Good Samaritan, Faith and Works"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="scripture">Primary Scripture Reference (Optional)</Label>
                <Input
                  id="scripture"
                  value={scriptureRef}
                  onChange={(e) => setScriptureRef(e.target.value)}
                  placeholder="e.g., Luke 10:25-37, James 2:14-26"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="questions">Quiz Questions</Label>
                  <Select value={numQuestions.toString()} onValueChange={(v) => setNumQuestions(Number(v))}>
                    <SelectTrigger id="questions" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 questions</SelectItem>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="8">8 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generateLesson}
                disabled={loading || !topic.trim()}
                className="w-full gap-2"
                size="lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate Complete Lesson
              </Button>

              <p className="text-xs text-gray-500 text-center">
                This will generate a full lesson with content, objectives, and quiz questions
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Generating */}
        {step === 2 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Lesson</h3>
              <p className="text-gray-600">Creating lesson content and quiz questions...</p>
              <p className="text-sm text-gray-500 mt-2">This may take 15-30 seconds</p>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Save */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    Lesson Generated Successfully
                  </CardTitle>
                  <Button onClick={() => setStep(1)} variant="outline" size="sm">
                    Start Over
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Lesson Title</Label>
                    <p className="text-gray-700 mt-1">{topic}</p>
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Scripture References</Label>
                    <p className="text-gray-700 mt-1">{extractedScriptures || 'Various passages'}</p>
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Learning Objectives</Label>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">{extractedObjectives}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Lesson Content Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{lessonContent}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Quiz Questions ({quizQuestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <p className="font-semibold mb-2">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="space-y-1 ml-4">
                        {q.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={`text-sm ${optIdx === q.correct_answer ? 'text-green-700 font-medium' : 'text-gray-700'}`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {option}
                            {optIdx === q.correct_answer && ' ✓'}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2 italic">
                        Explanation: {q.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={saveLesson}
                  disabled={saving}
                  className="w-full gap-2"
                  size="lg"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  {saving ? 'Saving...' : 'Save Lesson & Quiz'}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  This will save the lesson as a draft. You can edit it before submitting for approval.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}