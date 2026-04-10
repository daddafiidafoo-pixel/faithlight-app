import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AILessonContentGenerator({ onContentGenerated }) {
  const [passage, setPassage] = useState('');
  const [topic, setTopic] = useState('');
  const [ageGroup, setAgeGroup] = useState('adults');
  const [learningStyle, setLearningStyle] = useState('mixed');
  const [contentType, setContentType] = useState('full');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const generateContent = async () => {
    if (!passage && !topic) {
      toast.error('Please enter a Bible passage or topic');
      return;
    }

    setIsGenerating(true);
    try {
      const ageGroupDescriptions = {
        children: 'Children (ages 6-10): Use simple language, concrete examples, interactive activities, stories, and visual elements',
        preteens: 'Preteens (ages 11-13): Balance simplicity with deeper concepts, encourage questions, use relatable scenarios',
        teens: 'Teenagers (ages 14-18): Address real-world issues, encourage critical thinking, make it relevant to their lives',
        adults: 'Adults: Provide theological depth, historical context, and practical application for daily life',
        seniors: 'Seniors: Draw on life experience, provide reflection time, connect to familiar contexts'
      };

      const learningStyleDescriptions = {
        visual: 'Visual Learners: Include diagrams, charts, timelines, videos, images, and written materials',
        auditory: 'Auditory Learners: Include discussions, lectures, audio resources, storytelling, and verbal explanations',
        kinesthetic: 'Kinesthetic/Hands-on Learners: Include activities, role-plays, crafts, movement, and experiential learning',
        reading: 'Reading/Writing Learners: Include written exercises, journaling prompts, note-taking, and text-based study',
        mixed: 'Mixed Learning Styles: Combine visual, auditory, kinesthetic, and reading/writing approaches'
      };

      const contentTypes = {
        full: 'Complete lesson with all sections',
        explanation: 'Biblical explanation and context only',
        activities: 'Learning activities and exercises only',
        questions: 'Discussion and reflection questions only'
      };

      const prompt = `Generate a Bible lesson for: ${passage || topic}

TARGET AUDIENCE:
${ageGroupDescriptions[ageGroup]}

LEARNING STYLE FOCUS:
${learningStyleDescriptions[learningStyle]}

CONTENT TYPE: ${contentTypes[contentType]}

Generate a complete, engaging lesson with the following structure:

${contentType === 'full' || contentType === 'explanation' ? `
**1. BIBLICAL CONTEXT & EXPLANATION**
- Historical and cultural background
- Key themes and theological insights
- Verse-by-verse or topic breakdown
- Cross-references to related passages
` : ''}

${contentType === 'full' || contentType === 'activities' ? `
**2. LEARNING ACTIVITIES** (Tailored to ${learningStyle} learning style)
- Opening activity/icebreaker
- Main teaching activity
- Application activity
- Age-appropriate hands-on elements
` : ''}

${contentType === 'full' || contentType === 'questions' ? `
**3. DISCUSSION QUESTIONS**
- Reflection questions (varying depth for ${ageGroup})
- Application questions
- Critical thinking prompts
- Small group discussion starters
` : ''}

${contentType === 'full' ? `
**4. PRACTICAL APPLICATION**
- Real-life scenarios
- Weekly challenge
- Prayer points
- Takeaway message

**5. ADDITIONAL RESOURCES**
- Suggested songs/worship
- Recommended reading
- Visual aids suggestions
- Extension activities
` : ''}

IMPORTANT:
- Keep language appropriate for ${ageGroup}
- Emphasize ${learningStyle} learning approaches
- Make it engaging and interactive
- Include specific examples and illustrations
- Provide clear, actionable steps

Format with clear markdown headings and bullet points.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setGeneratedContent(response);
      toast.success('Lesson content generated!');
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard!');
  };

  const insertIntoLesson = () => {
    if (onContentGenerated) {
      onContentGenerated(generatedContent);
    }
    toast.success('Content added to lesson!');
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Lesson Content Generator
        </CardTitle>
        <p className="text-sm text-gray-600">
          Generate tailored lesson content for any passage or topic
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Bible Passage</label>
            <Input
              placeholder="e.g., John 3:16, Genesis 1, Psalm 23"
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Or Topic</label>
            <Input
              placeholder="e.g., Faith, Prayer, God's Love"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Age Group</label>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="children">👶 Children (6-10)</SelectItem>
                <SelectItem value="preteens">🧒 Preteens (11-13)</SelectItem>
                <SelectItem value="teens">👦 Teens (14-18)</SelectItem>
                <SelectItem value="adults">👨 Adults</SelectItem>
                <SelectItem value="seniors">👴 Seniors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Learning Style</label>
            <Select value={learningStyle} onValueChange={setLearningStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">👁️ Visual</SelectItem>
                <SelectItem value="auditory">👂 Auditory</SelectItem>
                <SelectItem value="kinesthetic">✋ Kinesthetic</SelectItem>
                <SelectItem value="reading">📖 Reading/Writing</SelectItem>
                <SelectItem value="mixed">🔄 Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Content Type</label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">📝 Full Lesson</SelectItem>
                <SelectItem value="explanation">📖 Explanation Only</SelectItem>
                <SelectItem value="activities">🎯 Activities Only</SelectItem>
                <SelectItem value="questions">❓ Questions Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={generateContent}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Lesson Content
            </>
          )}
        </Button>

        {generatedContent && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Generated Content</h3>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Button onClick={generateContent} variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
                {onContentGenerated && (
                  <Button onClick={insertIntoLesson} size="sm" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Use This Content
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{generatedContent}</ReactMarkdown>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-purple-100 text-purple-800">
                Age: {ageGroup}
              </Badge>
              <Badge className="bg-indigo-100 text-indigo-800">
                Style: {learningStyle}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                Type: {contentType}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}