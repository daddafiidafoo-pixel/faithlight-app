import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, BookOpen, Loader2, CheckCircle, AlertCircle, Wand2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AICourseGenerator() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    track: 'leadership',
    level: 1,
    title: '',
    audience: '',
    goal: '',
    scripture_focus: '',
    lesson_count: 10,
    lesson_length: 'medium',
    assessment_style: '8 questions (6 MC + 2 T/F)',
  });

  const [generationStatus, setGenerationStatus] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Lesson expansion state
  const [lessonExpansion, setLessonExpansion] = useState({
    topic: '',
    draft: '',
    isExpanding: false,
    result: null,
  });
  
  // Summarization state
  const [summarization, setSummarization] = useState({
    content: '',
    type: 'lesson', // 'lesson' or 'course'
    isSummarizing: false,
    result: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.user_role !== 'admin') {
          toast.error('Access denied. Admin only.');
          window.location.href = '/Home';
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = '/Home';
      }
    };
    fetchUser();
  }, []);

  const { data: tracks = [] } = useQuery({
    queryKey: ['training-tracks'],
    queryFn: () => base44.entities.TrainingTrack.list('order'),
  });

  const generateCourseMutation = useMutation({
    mutationFn: async (data) => {
      const systemPrompt = `You are FaithLight Training Builder. Create biblical, Christ-centered training content that is clear, practical, and respectful across cultures.

Use Scripture as the primary authority. Do not invent Bible verses. If you quote, keep it short; otherwise paraphrase and reference (Book Chapter:Verse).

Avoid divisive denominational debates. If a topic has multiple views, present it neutrally and focus on shared essentials.

Keep language simple (global English). No slang. No complex theology words without short explanations.

Output must follow the exact format requested.

No political content. No graphic violence. No romantic/sexual content.

Always include: key points, Scripture references, reflection, and assessment items.`;

      const userPrompt = `Create a training course for FaithLight.

Inputs:
- Track: ${data.track}
- Level: ${data.level}
- Course Title: ${data.title}
- Audience: ${data.audience}
- Goal: ${data.goal}
- Scripture Focus: ${data.scripture_focus || 'None specified'}
- Lesson Count: ${data.lesson_count}
- Lesson Length: ${data.lesson_length} (short 3-5 min / medium 6-10 min)
- Assessment Style: ${data.assessment_style}

Output Format (JSON):
{
  "course": {
    "title": "...",
    "description": "...",
    "estimated_hours": number
  },
  "lessons": [
    {
      "title": "...",
      "content": "markdown content with ## headers, key points, application, reflection",
      "scripture_references": ["Book 1:1", "Book 2:2"],
      "estimated_minutes": number,
      "quiz_questions": [
        {
          "question": "...",
          "options": ["A", "B", "C", "D"],
          "correct_answer_index": 0,
          "explanation": "..."
        }
      ]
    }
  ]
}

Keep it concise and practical. Each lesson should have:
- Lesson Summary (2-3 sentences)
- Key Teaching Points (3-5 bullets)
- Practical Application (3 bullets)
- Reflection Question
- Short Prayer (2-4 lines)
- ${data.assessment_style}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        response_json_schema: {
          type: 'object',
          properties: {
            course: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                estimated_hours: { type: 'number' }
              }
            },
            lessons: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  scripture_references: { type: 'array', items: { type: 'string' } },
                  estimated_minutes: { type: 'number' },
                  quiz_questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        question: { type: 'string' },
                        options: { type: 'array', items: { type: 'string' } },
                        correct_answer_index: { type: 'number' },
                        explanation: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      return result;
    },
    onSuccess: async (aiResponse, variables) => {
      try {
        setGenerationStatus('Saving course...');
        
        const trackId = tracks.find(t => 
          t.track_type === variables.track && t.level === variables.level
        )?.id;

        if (!trackId) {
          throw new Error('Track not found');
        }

        const course = await base44.entities.TrainingCourse.create({
          track_id: trackId,
          title: aiResponse.course.title,
          description: aiResponse.course.description,
          estimated_hours: aiResponse.course.estimated_hours,
          pass_score: 80,
          status: 'draft',
          order: 99,
        });

        setGenerationStatus('Saving lessons and quizzes...');

        for (let i = 0; i < aiResponse.lessons.length; i++) {
          const lessonData = aiResponse.lessons[i];
          
          const lesson = await base44.entities.TrainingLesson.create({
            course_id: course.id,
            title: lessonData.title,
            content: lessonData.content,
            scripture_references: lessonData.scripture_references || [],
            estimated_minutes: lessonData.estimated_minutes || 15,
            status: 'draft',
            order: i + 1,
          });

          if (lessonData.quiz_questions && lessonData.quiz_questions.length > 0) {
            const quiz = await base44.entities.TrainingQuiz.create({
              course_id: course.id,
              title: `${lessonData.title} Quiz`,
              description: `Test your understanding of ${lessonData.title}`,
              pass_score: 80,
              allow_retake: true,
              status: 'draft',
            });

            for (let j = 0; j < lessonData.quiz_questions.length; j++) {
              const q = lessonData.quiz_questions[j];
              await base44.entities.TrainingQuizQuestion.create({
                quiz_id: quiz.id,
                question: q.question,
                options: q.options,
                correct_answer_index: q.correct_answer_index,
                explanation: q.explanation || '',
                order: j + 1,
              });
            }
          }
        }

        setGenerationStatus('complete');
        toast.success('Course generated successfully! Review it in Draft Courses.');
        queryClient.invalidateQueries({ queryKey: ['training-courses'] });
        
        setTimeout(() => {
          window.location.href = '/DraftCoursesReview';
        }, 2000);

      } catch (error) {
        console.error('Error saving course:', error);
        setGenerationStatus('error');
        toast.error('Failed to save generated course');
      }
    },
    onError: (error) => {
      console.error('Generation error:', error);
      setGenerationStatus('error');
      toast.error('Failed to generate course');
    },
  });

  const handleGenerate = async () => {
    if (!formData.title || !formData.audience || !formData.goal) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('Generating course with AI...');
    
    try {
      await generateCourseMutation.mutateAsync(formData);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExpandLesson = async () => {
    if (!lessonExpansion.topic.trim()) {
      toast.error('Please enter a lesson topic or draft');
      return;
    }

    setLessonExpansion({ ...lessonExpansion, isExpanding: true, result: null });

    try {
      const systemPrompt = `You are FaithLight Training Builder. Expand lesson content into complete, biblical, practical teaching material.

Use Scripture as authority. Quote briefly or paraphrase with references.
Keep language simple and clear for global audiences.
Structure content with headers, points, application, and reflection.
Maintain Christ-centered focus.`;

      const userPrompt = `Expand this lesson draft into a complete lesson:

Topic/Draft: ${lessonExpansion.topic}

${lessonExpansion.draft ? `\nInitial Draft:\n${lessonExpansion.draft}` : ''}

Create a full lesson with:
- Brief introduction (2-3 sentences)
- Key Teaching Points (3-5 bullet points with brief explanations)
- Practical Application (3 specific, actionable points)
- Reflection Questions (2-3 thoughtful questions)
- Closing Prayer (2-4 lines)
- Suggested Scripture References (3-5 references)

Use markdown formatting with ## headers. Keep content clear, practical, and engaging.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\n${userPrompt}`,
      });

      setLessonExpansion({ ...lessonExpansion, isExpanding: false, result });
      toast.success('Lesson expanded successfully!');
    } catch (error) {
      console.error('Expansion error:', error);
      setLessonExpansion({ ...lessonExpansion, isExpanding: false });
      toast.error('Failed to expand lesson');
    }
  };

  const handleSummarize = async () => {
    if (!summarization.content.trim()) {
      toast.error('Please enter content to summarize');
      return;
    }

    setSummarization({ ...summarization, isSummarizing: true, result: null });

    try {
      const systemPrompt = `You are a biblical education content summarizer. Create clear, concise summaries that capture key points.`;

      const userPrompt = `Summarize this ${summarization.type} content into a brief, clear summary (2-4 sentences):

Content:
${summarization.content}

Focus on the main teaching points and practical takeaways.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\n${userPrompt}`,
      });

      setSummarization({ ...summarization, isSummarizing: false, result });
      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Summarization error:', error);
      setSummarization({ ...summarization, isSummarizing: false });
      toast.error('Failed to generate summary');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-600" />
            AI Course Generator
          </h1>
          <p className="text-gray-600 mt-2">
            Generate biblical training courses powered by AI. Courses start in draft status for review.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Configuration</CardTitle>
            <CardDescription>
              Fill in the details below to generate a new training course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Track</Label>
                <Select value={formData.track} onValueChange={(val) => setFormData({...formData, track: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biblical">Biblical Training</SelectItem>
                    <SelectItem value="leadership">Leadership Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Level</Label>
                <Select value={String(formData.level)} onValueChange={(val) => setFormData({...formData, level: parseInt(val)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Course Title *</Label>
              <Input
                placeholder="e.g., Prayer & Spiritual Disciplines"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <Label>Target Audience *</Label>
              <Input
                placeholder="e.g., new believers, growing believers, ministry leaders"
                value={formData.audience}
                onChange={(e) => setFormData({...formData, audience: e.target.value})}
              />
            </div>

            <div>
              <Label>Course Goal *</Label>
              <Textarea
                placeholder="1-2 sentences describing what students will learn"
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label>Scripture Focus (optional)</Label>
              <Textarea
                placeholder="List key passages: Matthew 6:5-15, Ephesians 6:18, James 5:16"
                value={formData.scripture_focus}
                onChange={(e) => setFormData({...formData, scripture_focus: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Lesson Count</Label>
                <Select value={String(formData.lesson_count)} onValueChange={(val) => setFormData({...formData, lesson_count: parseInt(val)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 lessons</SelectItem>
                    <SelectItem value="8">8 lessons</SelectItem>
                    <SelectItem value="10">10 lessons</SelectItem>
                    <SelectItem value="12">12 lessons</SelectItem>
                    <SelectItem value="15">15 lessons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Lesson Length</Label>
                <Select value={formData.lesson_length} onValueChange={(val) => setFormData({...formData, lesson_length: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (3-5 min)</SelectItem>
                    <SelectItem value="medium">Medium (6-10 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isGenerating && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <div>
                    <p className="font-semibold text-purple-900">{generationStatus}</p>
                    <p className="text-sm text-purple-700">This may take 30-60 seconds...</p>
                  </div>
                </div>
              </div>
            )}

            {generationStatus === 'complete' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-semibold text-green-900">Course generated successfully!</p>
                </div>
              </div>
            )}

            {generationStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="font-semibold text-red-900">Generation failed. Please try again.</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Course with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Lesson Expansion Tool */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-600" />
              AI Lesson Expander
            </CardTitle>
            <CardDescription>
              Input a short topic or draft, and AI will expand it into a full lesson
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Lesson Topic *</Label>
              <Input
                placeholder="e.g., The Power of Prayer"
                value={lessonExpansion.topic}
                onChange={(e) => setLessonExpansion({...lessonExpansion, topic: e.target.value})}
              />
            </div>

            <div>
              <Label>Initial Draft (optional)</Label>
              <Textarea
                placeholder="Add any initial notes or outline you want to expand..."
                value={lessonExpansion.draft}
                onChange={(e) => setLessonExpansion({...lessonExpansion, draft: e.target.value})}
                rows={4}
              />
            </div>

            <Button
              onClick={handleExpandLesson}
              disabled={lessonExpansion.isExpanding}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {lessonExpansion.isExpanding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Expanding...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Expand Lesson
                </>
              )}
            </Button>

            {lessonExpansion.result && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Expanded Lesson</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(lessonExpansion.result);
                      toast.success('Copied to clipboard');
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none bg-white p-4 rounded border max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {lessonExpansion.result}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summarization Tool */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              AI Content Summarizer
            </CardTitle>
            <CardDescription>
              Generate concise summaries for lessons or entire courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Content Type</Label>
              <Select 
                value={summarization.type} 
                onValueChange={(val) => setSummarization({...summarization, type: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">Single Lesson</SelectItem>
                  <SelectItem value="course">Entire Course</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Content to Summarize *</Label>
              <Textarea
                placeholder="Paste lesson content or course outline here..."
                value={summarization.content}
                onChange={(e) => setSummarization({...summarization, content: e.target.value})}
                rows={8}
              />
            </div>

            <Button
              onClick={handleSummarize}
              disabled={summarization.isSummarizing}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {summarization.isSummarizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>

            {summarization.result && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Summary</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(summarization.result);
                      toast.success('Copied to clipboard');
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <div className="bg-white p-4 rounded border">
                  <p className="text-gray-700">{summarization.result}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Course Generator:</strong> AI generates complete courses with lessons and quizzes</li>
                  <li>• <strong>Lesson Expander:</strong> Turn brief topics into full lessons with teaching points and applications</li>
                  <li>• <strong>Summarizer:</strong> Create concise summaries for lessons or courses</li>
                  <li>• All generated content starts in <strong>Draft</strong> status for review</li>
                  <li>• Review and edit in Draft Courses Review page before publishing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}