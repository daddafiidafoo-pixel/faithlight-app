import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SermonTitleGenerator({ sermonContent, currentTitle, onTitleSelect }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [titles, setTitles] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);

  const handleGenerateTitles = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Based on this sermon content, generate 8 compelling title options with different approaches and styles:

CURRENT TITLE: ${currentTitle}

SERMON CONTENT:
${sermonContent}

Generate 8 alternative sermon titles using these approaches:

1. **QUESTION-BASED TITLE** (Engages curiosity - starts with a question)
   - Make it thought-provoking but answerable in the sermon
   - Example: "What Does God's Love Really Mean?"

2. **DECLARATION TITLE** (Bold statement of the message)
   - Strong, confident assertion of the main truth
   - Example: "God's Love Never Fails"

3. **INTRIGUING TITLE** (Mysterious/compelling, draws people in)
   - Creates intrigue without being clickbait
   - Example: "The Hidden Power of Faith"

4. **PROMISE-BASED TITLE** (Offers hope or benefit)
   - Highlights what listeners will gain/learn
   - Example: "Finding Peace in Life's Storms"

5. **ALLITERATIVE TITLE** (Memorable, uses repeated sounds)
   - Catchy and easy to remember
   - Example: "Faithful, Fearless, Fruitful"

6. **CONTRAST TITLE** (Sets up opposing ideas)
   - Highlights the tension/resolution in the sermon
   - Example: "From Brokenness to Wholeness"

7. **BIBLICAL REFERENCE TITLE** (References specific verse/passage)
   - Uses or adapts a well-known Bible verse
   - Example: "More Than Conquerors" (from Romans)

8. **ACTION-ORIENTED TITLE** (Calls listeners to do something)
   - Motivates listeners toward change
   - Example: "Rise Up and Walk"

For each title:
- State the title
- Explain why it works for this sermon content
- Identify the target audience appeal
- Note what makes it memorable

Format with clear sections and markdown.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setTitles(response);
      toast.success('Title options generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate titles');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTitle = (title) => {
    setSelectedTitle(title);
    onTitleSelect?.(title);
    toast.success('Title selected!');
  };

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          Sermon Title Generator
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">AI generates compelling title options to capture your sermon's essence</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!titles ? (
          <Button
            onClick={handleGenerateTitles}
            disabled={isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                Generate Title Options
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none bg-white p-4 rounded-lg border border-amber-100 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: titles }} />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(titles);
                  toast.success('Titles copied!');
                }}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy All
              </Button>
              <Button
                onClick={() => setTitles(null)}
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