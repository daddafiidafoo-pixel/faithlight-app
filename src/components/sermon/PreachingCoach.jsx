import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function PreachingCoach({ sermonContent, sermonTitle }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackType, setFeedbackType] = useState('comprehensive');

  const handleGetCoachFeedback = async (type) => {
    setIsAnalyzing(true);
    setFeedbackType(type);
    try {
      let prompt;

      if (type === 'clarity') {
        prompt = `As an experienced preaching coach, analyze this sermon for clarity and comprehension:

SERMON TITLE: ${sermonTitle}

SERMON CONTENT:
${sermonContent}

Evaluate and provide feedback on:

**CLARITY ASSESSMENT**
1. Is the main message/big idea clear and stated explicitly?
2. Are key theological terms defined?
3. Would a first-time listener understand the core message?
4. Are there confusing or jargon-heavy sections?

**SPECIFIC RECOMMENDATIONS**
For each area needing improvement:
- Problem statement
- Specific rewording suggestion
- Why the suggestion improves clarity
- Example of clearer language

**CLARITY SCORE** (1-10)
- Current score and why
- Key factors limiting clarity
- Top 3 changes to improve clarity

**SUMMARY**
Quick actionable takeaways for maximum clarity.`;
      } else if (type === 'engagement') {
        prompt = `As an experienced preaching coach, analyze this sermon for listener engagement:

SERMON TITLE: ${sermonTitle}

SERMON CONTENT:
${sermonContent}

Evaluate engagement across these dimensions:

**OPENING HOOK**
- Does it grab attention immediately?
- Is it relevant to the message?
- How can it be strengthened?

**PACING & VARIETY**
- Does the sermon maintain listener interest?
- Is there rhythm variation (stories, questions, declarations)?
- Are there points that might lose people's attention?
- Suggestions for better pacing

**ILLUSTRATIONS & STORIES**
- Are they relevant and relatable?
- Do they illuminate the main point?
- Suggestions for stronger examples

**AUDIENCE CONNECTION**
- Does it speak to real life situations?
- Are practical applications clear?
- Does it invite personal reflection?

**CLOSING IMPACT**
- Is there a memorable takeaway?
- Does it motivate action?
- Is there a strong call-to-action?

**ENGAGEMENT SCORE** (1-10)
- Current score with explanation
- Key strengths in engagement
- Top 3 improvements for maximum engagement

**SPECIFIC RECOMMENDATIONS**
Detailed, actionable suggestions with examples.`;
      } else {
        prompt = `As an experienced preaching coach with theological expertise, provide comprehensive coaching feedback on this sermon:

SERMON TITLE: ${sermonTitle}

SERMON CONTENT:
${sermonContent}

Provide detailed feedback across all dimensions:

**1. THEOLOGICAL SOUNDNESS**
- Is the theology biblically accurate?
- Are doctrines properly explained?
- Are any theological problems present?
- How is the passage interpreted? Is it sound?
- Suggestions for theological strengthening

**2. CLARITY & COMPREHENSION**
- Is the main message clear?
- Are key concepts defined?
- Would diverse listeners understand it?
- Clarity improvements needed

**3. ENGAGEMENT & DELIVERY**
- Opening hook effectiveness
- Pacing and rhythm
- Use of illustrations and stories
- Variety in presentation
- Closing impact
- Suggested improvements

**4. STRUCTURAL FLOW**
- Logical progression of ideas
- Smooth transitions
- Time allocation across sections
- Structural suggestions

**5. AUDIENCE RELEVANCE**
- Does it connect to real-life situations?
- Are practical applications clear?
- Is it appropriate for the stated audience?
- Suggestions for better application

**6. PERSUASIVENESS & POWER**
- Does it inspire action or change?
- Is there a clear call-to-action?
- Is it emotionally resonant?
- Does it motivate listeners?

**OVERALL COACHING ASSESSMENT**
- Sermon strengths (3-4 key strengths)
- Primary improvement areas (2-3 key gaps)
- Top 5 actionable recommendations
- Overall readiness to preach (1-10 score with notes)

**SPECIFIC REVISION SUGGESTIONS**
For each major recommendation, provide:
- Current issue
- Specific suggestion with example
- Expected impact
- Difficulty level (easy/moderate/challenging)

Format professionally with clear sections.`;
      }

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setFeedback(response);
      toast.success(`${type === 'comprehensive' ? 'Comprehensive' : type === 'clarity' ? 'Clarity' : 'Engagement'} feedback generated!`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate coaching feedback');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadFeedback = () => {
    const element = document.createElement('a');
    const file = new Blob([feedback], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `preaching-coach-feedback-${feedbackType}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Feedback downloaded!');
  };

  return (
    <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-rose-600" />
          Preaching Coach
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">AI coaching feedback on clarity, engagement, theological soundness, and delivery</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!feedback ? (
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => handleGetCoachFeedback('comprehensive')}
              disabled={isAnalyzing}
              className="w-full gap-2 bg-rose-600 hover:bg-rose-700"
            >
              {isAnalyzing && feedbackType === 'comprehensive' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  🎯 Comprehensive Feedback
                </>
              )}
            </Button>
            <Button
              onClick={() => handleGetCoachFeedback('clarity')}
              disabled={isAnalyzing}
              variant="outline"
              className="w-full gap-2"
            >
              {isAnalyzing && feedbackType === 'clarity' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  📢 Clarity Focus
                </>
              )}
            </Button>
            <Button
              onClick={() => handleGetCoachFeedback('engagement')}
              disabled={isAnalyzing}
              variant="outline"
              className="w-full gap-2"
            >
              {isAnalyzing && feedbackType === 'engagement' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  🎭 Engagement Focus
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none bg-white p-4 rounded-lg border border-rose-100 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: feedback }} />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(feedback);
                  toast.success('Feedback copied!');
                }}
                variant="outline"
                className="flex-1"
              >
                Copy Feedback
              </Button>
              <Button
                onClick={downloadFeedback}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                onClick={() => setFeedback(null)}
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}