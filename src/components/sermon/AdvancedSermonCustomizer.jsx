import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AdvancedSermonCustomizer({ sermon, onCustomizationGenerated }) {
  const [activeTab, setActiveTab] = useState('theological');
  const [isGenerating, setIsGenerating] = useState(null);
  const [theologicalContext, setTheologicalContext] = useState(null);
  const [interpretiveAngles, setInterpretiveAngles] = useState(null);
  const [discussionQuestions, setDiscussionQuestions] = useState(null);

  const handleGenerateTheologicalContext = async () => {
    setIsGenerating('theological');
    try {
      const prompt = `Based on this sermon content, provide deep theological context:

SERMON:
${sermon.content}

Generate:
1. THEOLOGICAL THEMES - Main doctrinal truths in this sermon
2. BIBLICAL CONNECTIONS - How this connects to broader biblical theology
3. HISTORICAL PERSPECTIVE - How church history has understood these truths
4. CONTEMPORARY RELEVANCE - Why this theology matters today
5. DENOMINATIONAL VARIATIONS - Different evangelical perspectives on this passage

Format with clear markdown headings.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setTheologicalContext(response);
      onCustomizationGenerated?.('theological', response);
      toast.success('Theological context generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate theological context');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGenerateInterpretiveAngles = async () => {
    setIsGenerating('interpretive');
    try {
      const prompt = `Based on this sermon, provide multiple interpretive angles:

SERMON:
${sermon.content}

Generate FOUR different interpretive perspectives on this passage:

1. EXPOSITORY ANGLE
   - What does the text literally say?
   - Original meaning and historical context
   - Word-by-word analysis of key terms

2. TYPOLOGICAL ANGLE
   - How does this prefigure or connect to Christ?
   - Patterns, types, and shadows in the narrative
   - Christological fulfillment

3. PASTORAL/APPLICATIONAL ANGLE
   - How should modern believers respond practically?
   - Ethical and spiritual implications
   - Life transformation insights

4. REDEMPTIVE-HISTORICAL ANGLE
   - Where does this fit in God's redemptive story?
   - Connection to Old Testament preparation and New Testament fulfillment
   - Progress of revelation

For each angle, provide:
- Main insight (2-3 sentences)
- 2-3 supporting ideas
- 1-2 practical implications

Format with clear markdown.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setInterpretiveAngles(response);
      onCustomizationGenerated?.('interpretive', response);
      toast.success('Interpretive angles generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate interpretive angles');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGenerateDiscussionQuestions = async () => {
    setIsGenerating('discussion');
    try {
      const prompt = `Based on this sermon, create comprehensive discussion questions:

SERMON:
${sermon.content}

Generate discussion questions organized by depth and purpose:

**ICEBREAKER QUESTIONS** (Light, engaging, get people talking)
- 2-3 questions that relate to the topic but are easy to answer
- Get people comfortable sharing

**COMPREHENSION QUESTIONS** (Help people understand the passage)
- 3-4 questions about what the passage/sermon actually says
- Ensure everyone grasps the key points

**REFLECTION QUESTIONS** (Deeper personal connection)
- 3-4 questions that encourage personal thought
- "What does this passage mean to you?"
- "How does this challenge your thinking?"

**APPLICATION QUESTIONS** (Practical life change)
- 3-4 questions focused on real-world application
- "What will you do with this truth?"
- "How will this change your behavior?"

**CHALLENGING QUESTIONS** (For mature believers)
- 2-3 thought-provoking questions
- Address objections or difficult aspects
- Deep theological implications

For each question:
- Write the question clearly
- Suggest a follow-up if answers are shallow
- Indicate good discussion directions

Format with clear sections and markdown.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setDiscussionQuestions(response);
      onCustomizationGenerated?.('discussion', response);
      toast.success('Discussion questions generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate discussion questions');
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <Card className="mt-6 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Advanced Customization
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">Generate deeper theological context, alternative interpretations, and discussion resources</p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="theological">Theological Context</TabsTrigger>
            <TabsTrigger value="interpretive">Interpretive Angles</TabsTrigger>
            <TabsTrigger value="discussion">Discussion Questions</TabsTrigger>
          </TabsList>

          {/* Theological Context Tab */}
          <TabsContent value="theological" className="space-y-4">
            {!theologicalContext ? (
              <Button
                onClick={handleGenerateTheologicalContext}
                disabled={isGenerating === 'theological'}
                className="w-full gap-2"
              >
                {isGenerating === 'theological' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Theological Context
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none bg-white p-4 rounded-lg">
                  <ReactMarkdown>{theologicalContext}</ReactMarkdown>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(theologicalContext);
                    toast.success('Copied to clipboard!');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Copy Theological Context
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Interpretive Angles Tab */}
          <TabsContent value="interpretive" className="space-y-4">
            {!interpretiveAngles ? (
              <Button
                onClick={handleGenerateInterpretiveAngles}
                disabled={isGenerating === 'interpretive'}
                className="w-full gap-2"
              >
                {isGenerating === 'interpretive' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Interpretive Angles
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none bg-white p-4 rounded-lg">
                  <ReactMarkdown>{interpretiveAngles}</ReactMarkdown>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(interpretiveAngles);
                    toast.success('Copied to clipboard!');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Copy Interpretive Angles
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Discussion Questions Tab */}
          <TabsContent value="discussion" className="space-y-4">
            {!discussionQuestions ? (
              <Button
                onClick={handleGenerateDiscussionQuestions}
                disabled={isGenerating === 'discussion'}
                className="w-full gap-2"
              >
                {isGenerating === 'discussion' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Discussion Questions
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none bg-white p-4 rounded-lg">
                  <ReactMarkdown>{discussionQuestions}</ReactMarkdown>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(discussionQuestions);
                    toast.success('Copied to clipboard!');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Copy Discussion Questions
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}