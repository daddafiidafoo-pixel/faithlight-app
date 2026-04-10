import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function CrossReferenceSuggester({ sermonContent }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [crossReferences, setCrossReferences] = useState(null);

  const handleGenerateCrossReferences = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Based on this sermon content, identify and suggest relevant cross-references (other Bible passages that connect to the themes, doctrines, and messages in this sermon):

SERMON CONTENT:
${sermonContent}

Analyze the main theological themes and provide CROSS-REFERENCES organized by relationship:

**PRIMARY PARALLELS** (Same passage discussed in different gospels or books)
- Reference: Book Chapter:Verse
- Connection: How it parallels the main passage

**THEMATIC CONNECTIONS** (Passages exploring the same doctrine/theme)
- Reference: Book Chapter:Verse  
- Theme: [Specific theological connection]
- Reason: Why this strengthens the sermon's message

**CONTEXTUAL REFERENCES** (Passages that provide cultural/historical context)
- Reference: Book Chapter:Verse
- Context: What background it provides

**APPLICATION PARALLELS** (Examples showing practical application of the truth)
- Reference: Book Chapter:Verse
- Application: How someone lived out this truth

**PROPHETIC/TYPOLOGICAL CONNECTIONS** (How this points to Christ or future fulfillment)
- Reference: Book Chapter:Verse
- Connection: The prophetic or typological link

For each section, include 3-4 references with clear explanations.
Format with markdown for easy scanning.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setCrossReferences(response);
      toast.success('Cross-references generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate cross-references');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Cross-Reference Suggester
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">AI automatically identifies related Bible passages to strengthen your sermon</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!crossReferences ? (
          <Button
            onClick={handleGenerateCrossReferences}
            disabled={isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Suggest Cross-References
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none bg-white p-4 rounded-lg border border-blue-100 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: crossReferences }} />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(crossReferences);
                  toast.success('Cross-references copied!');
                }}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button
                onClick={() => setCrossReferences(null)}
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