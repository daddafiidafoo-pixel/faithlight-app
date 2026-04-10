import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

export default function SermonStructureAnalyzer({ sermonContent, sermonTitle }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyzeStructure = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Analyze the structure and flow of this sermon. Evaluate clarity, engagement, and logical progression:

SERMON TITLE: ${sermonTitle}

SERMON CONTENT:
${sermonContent}

Provide a detailed structural analysis with:

**1. STRUCTURAL ASSESSMENT**
- Overall organization (is it clear and logical?)
- Flow between sections (smooth transitions? abrupt jumps?)
- Balance (does it spend appropriate time on each point?)
- Length proportions (intro/main points/conclusion ratio)

**2. STRENGTH IDENTIFICATION**
- 3-4 structural elements that work well
- Why these elements are effective
- How they engage listeners

**3. IMPROVEMENT SUGGESTIONS**
For each improvement, explain:
- Current issue
- Specific suggestion
- How it will improve clarity/engagement
- Example of better phrasing if applicable

**4. ENGAGEMENT ANALYSIS**
- Does it have a clear hook at the beginning?
- Are illustrations/examples well-placed?
- Is there variety in pace and tone?
- Does the conclusion motivate action?

**5. FLOW RECOMMENDATIONS**
- Any sections that feel disconnected?
- Points that could be better integrated?
- Transitions that need strengthening?
- Logical order suggestions if needed

**6. CLARITY CHECKLIST**
- Are key points clearly stated?
- Is the "Big Idea" apparent throughout?
- Would a listener understand the main takeaway?
- Any confusing or unclear sections?

Format with clear headers and actionable recommendations.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setAnalysis(response);
      toast.success('Structure analysis generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze structure');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-emerald-600" />
          Sermon Structure Analyzer
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">AI analyzes flow, clarity, and engagement to suggest structural improvements</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <Button
            onClick={handleAnalyzeStructure}
            disabled={isAnalyzing}
            className="w-full gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4" />
                Analyze Structure & Flow
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none bg-white p-4 rounded-lg border border-emerald-100 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: analysis }} />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(analysis);
                  toast.success('Analysis copied!');
                }}
                variant="outline"
                className="flex-1"
              >
                Copy Analysis
              </Button>
              <Button
                onClick={() => setAnalysis(null)}
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