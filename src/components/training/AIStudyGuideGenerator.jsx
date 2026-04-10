import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader, Sparkles, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function AIStudyGuideGenerator({ courseTitle, courseLessons, language = 'en' }) {
  const [loading, setLoading] = useState(false);
  const [studyGuide, setStudyGuide] = useState(null);
  const [error, setError] = useState('');

  const generateStudyGuide = async () => {
    if (!courseLessons || courseLessons.length === 0) {
      setError('No lessons available to create study guide');
      return;
    }

    setLoading(true);
    setError('');
    setStudyGuide(null);

    try {
      const lessonTitles = courseLessons.map((l) => l.title).join('\n- ');

      const prompt = `You are an expert Bible teacher creating a comprehensive study guide for FaithLight, a biblical learning platform.

Create a detailed study guide for this course in ${language === 'om' ? 'Afaan Oromo' : 'English'}:

**Course Title:** ${courseTitle}

**Lessons:**
- ${lessonTitles}

Create a comprehensive study guide that includes:
1. Course Overview - What students will learn
2. Learning Objectives - Overall goals
3. Study Tips - How to get the most from the course
4. Chapter-by-Chapter Outline - Brief summary of each lesson
5. Key Concepts - Important ideas to remember
6. Study Schedule - Suggested timeline
7. Assessment Tips - How to prepare for quizzes/exams
8. Discussion Questions - For group study
9. Additional Resources - Where to go for deeper study
10. Summary Review - Checklist of what to know

Format with clear headings and bullet points. Make it practical and encouraging.

Return a JSON object with:
{
  "title": "Study Guide Title",
  "overview": "Course overview text",
  "learning_objectives": ["objective 1", "objective 2"],
  "study_tips": ["tip 1", "tip 2"],
  "chapter_outlines": [{"lesson": "Lesson Title", "summary": "Brief summary"}],
  "key_concepts": ["concept 1", "concept 2"],
  "study_schedule": "Suggested timeline",
  "assessment_tips": "How to prepare",
  "discussion_questions": ["question 1", "question 2"],
  "resources": ["resource 1", "resource 2"]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            overview: { type: 'string' },
            learning_objectives: { type: 'array', items: { type: 'string' } },
            study_tips: { type: 'array', items: { type: 'string' } },
            chapter_outlines: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  lesson: { type: 'string' },
                  summary: { type: 'string' },
                },
              },
            },
            key_concepts: { type: 'array', items: { type: 'string' } },
            study_schedule: { type: 'string' },
            assessment_tips: { type: 'string' },
            discussion_questions: { type: 'array', items: { type: 'string' } },
            resources: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      setStudyGuide(result);
      toast.success('Study guide generated successfully');
    } catch (err) {
      setError(`Failed to generate study guide: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadStudyGuide = () => {
    if (!studyGuide) return;

    const content = `
# ${studyGuide.title}

## Overview
${studyGuide.overview}

## Learning Objectives
${studyGuide.learning_objectives?.map((obj) => `- ${obj}`).join('\n')}

## Study Tips
${studyGuide.study_tips?.map((tip) => `- ${tip}`).join('\n')}

## Chapter Outlines
${studyGuide.chapter_outlines
  ?.map(
    (ch) => `
### ${ch.lesson}
${ch.summary}
`,
  )
  .join('\n')}

## Key Concepts
${studyGuide.key_concepts?.map((concept) => `- ${concept}`).join('\n')}

## Study Schedule
${studyGuide.study_schedule}

## Assessment Tips
${studyGuide.assessment_tips}

## Discussion Questions
${studyGuide.discussion_questions?.map((q) => `- ${q}`).join('\n')}

## Additional Resources
${studyGuide.resources?.map((r) => `- ${r}`).join('\n')}
`;

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', `${courseTitle}-study-guide.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success('Study guide downloaded');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5" />
          Study Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!studyGuide ? (
          <>
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <Button
              onClick={generateStudyGuide}
              disabled={loading}
              className="w-full gap-2"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Study Guide
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Overview</h4>
                <p className="text-gray-700">{studyGuide.overview}</p>
              </div>

              {studyGuide.learning_objectives?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Learning Objectives</h4>
                  <ul className="space-y-1">
                    {studyGuide.learning_objectives.map((obj, idx) => (
                      <li key={idx} className="text-gray-700">• {obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {studyGuide.key_concepts?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Concepts</h4>
                  <ul className="space-y-1">
                    {studyGuide.key_concepts.slice(0, 5).map((concept, idx) => (
                      <li key={idx} className="text-gray-700">• {concept}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={downloadStudyGuide}
                className="flex-1 gap-2"
              >
                <Download className="w-4 h-4" />
                Download Guide
              </Button>
              <Button
                onClick={() => setStudyGuide(null)}
                variant="outline"
                className="flex-1"
              >
                Generate New
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}