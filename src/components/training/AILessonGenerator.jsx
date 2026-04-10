import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader, Sparkles } from 'lucide-react';
import { useTranslation } from '../useTranslation';

export default function AILessonGenerator({ onLessonGenerated, language = 'en' }) {
  const [topic, setTopic] = useState('');
  const [scriptureRef, setScriptureRef] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [audience, setAudience] = useState('general');
  const [lessonLength, setLessonLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation(language);

  const generateLesson = async () => {
    if (!topic && !scriptureRef && !learningObjective) {
      setError('Please provide at least one input: topic, scripture reference, or learning objective');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const prompt = buildPrompt(topic, scriptureRef, learningObjective, audience, lessonLength, language);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Lesson title' },
            content: { type: 'string', description: 'Main lesson content in markdown format' },
            scripture_references: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Key scripture references'
            },
            learning_points: { 
              type: 'array', 
              items: { type: 'string' },
              description: '3-5 key learning points'
            },
            reflection_questions: { 
              type: 'array', 
              items: { type: 'string' },
              description: '3-4 reflection questions for students'
            },
            estimated_minutes: { 
              type: 'number', 
              description: 'Estimated time to complete lesson'
            },
            quiz_questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  correct_answer_index: { type: 'number' }
                }
              },
              description: '3-5 quiz questions with options'
            }
          },
          required: ['title', 'content', 'learning_points', 'estimated_minutes']
        }
      });

      if (onLessonGenerated) {
        onLessonGenerated(result);
      }
    } catch (err) {
      setError(`Failed to generate lesson: ${err.message}`);
      console.error('Lesson generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildPrompt = (topic, scripture, objective, aud, length, lang) => {
    const lengthGuide = {
      short: '5-10 minutes',
      medium: '15-20 minutes',
      long: '30-40 minutes'
    };

    const languageNote = lang === 'om' 
      ? 'Generate the content in clear, natural Afaan Oromo suitable for believers and church leaders. Use church-appropriate terminology and ensure cultural relevance.'
      : 'Generate content in clear, accessible English suitable for diverse Christian audiences.';

    return `You are an expert Bible teacher creating structured educational content for FaithLight, a biblical learning platform.

${languageNote}

Create a comprehensive lesson with the following specifications:
- Topic: ${topic || 'Not specified'}
- Scripture Reference: ${scripture || 'Not specified'}
- Learning Objective: ${objective || 'Not specified'}
- Target Audience: ${aud === 'youth' ? 'Young people (13-18)' : aud === 'pastor' ? 'Pastors and church leaders' : aud === 'teacher' ? 'Bible teachers and instructors' : 'General believers'}
- Duration: ${lengthGuide[length]}

Requirements:
1. Create a biblically sound, well-structured lesson
2. Include clear explanations and practical application
3. Provide reflection questions that encourage deeper thinking
4. Generate quiz questions to test understanding
5. All content must be grounded in Scripture
6. Use accessible language while maintaining theological accuracy
7. Include real-life examples when relevant
8. Structure content with clear sections and bullet points

Return a JSON object with title, content (markdown), scripture_references, learning_points, reflection_questions, estimated_minutes, and quiz_questions.`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Lesson Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Topic</label>
            <Input
              placeholder="e.g., The Beatitudes, Faith in Crisis"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Scripture Reference</label>
            <Input
              placeholder="e.g., Matthew 5:1-12"
              value={scriptureRef}
              onChange={(e) => setScriptureRef(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Learning Objective</label>
          <Textarea
            placeholder="What should students understand or be able to do after this lesson?"
            value={learningObjective}
            onChange={(e) => setLearningObjective(e.target.value)}
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Target Audience</label>
            <Select value={audience} onValueChange={setAudience} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Believers</SelectItem>
                <SelectItem value="youth">Youth (13-18)</SelectItem>
                <SelectItem value="teacher">Bible Teachers</SelectItem>
                <SelectItem value="pastor">Pastors & Leaders</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Lesson Length</label>
            <Select value={lessonLength} onValueChange={setLessonLength} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (5-10 min)</SelectItem>
                <SelectItem value="medium">Medium (15-20 min)</SelectItem>
                <SelectItem value="long">Long (30-40 min)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button 
          onClick={generateLesson} 
          disabled={loading}
          className="w-full gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Lesson
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}