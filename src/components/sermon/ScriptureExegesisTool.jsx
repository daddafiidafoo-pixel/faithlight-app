import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { Loader2, Book, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ScriptureExegesisTool() {
  const [passage, setPassage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [exegesis, setExegesis] = useState(null);

  const analyzePassage = async () => {
    if (!passage.trim()) {
      toast.error('Please enter a scripture passage');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Provide a comprehensive biblical exegesis and commentary on the following scripture passage:

Passage: ${passage}

Please include:

1. HISTORICAL CONTEXT
   - When and where was this written?
   - Who was the original audience?
   - What was happening in the time period?

2. LITERARY CONTEXT
   - What comes before and after this passage?
   - How does it fit in the broader narrative/letter?
   - What is the genre and structure?

3. WORD STUDY & GRAMMAR
   - Key words in original language (Hebrew/Greek)
   - Important grammatical constructions
   - Nuances lost in translation

4. THEOLOGICAL MEANING
   - What does this passage teach about God?
   - Key theological themes
   - How does it relate to the gospel?

5. CROSS-REFERENCES
   - Related passages in Scripture
   - Old Testament background (if NT)
   - Parallel accounts or themes

6. PRACTICAL INSIGHTS
   - What did this mean for the original audience?
   - What does this mean for us today?
   - Common misinterpretations to avoid

Provide scholarly yet accessible analysis that would help a pastor prepare a sermon.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true // Use internet for biblical scholarship
      });

      setExegesis({
        full: result,
        passage: passage
      });

      toast.success('Exegesis complete!');
    } catch (error) {
      console.error('Failed to analyze passage:', error);
      toast.error('Failed to analyze passage');
    } finally {
      setIsLoading(false);
    }
  };

  const getQuickInsight = async (type) => {
    if (!passage.trim()) {
      toast.error('Please enter a scripture passage');
      return;
    }

    setIsLoading(true);
    try {
      let prompt = '';
      
      if (type === 'cultural') {
        prompt = `Explain the cultural and historical background of ${passage}. What cultural practices, customs, or historical events should readers understand to properly interpret this passage?`;
      } else if (type === 'original') {
        prompt = `Provide a word-by-word analysis of key terms in ${passage}, including the original Hebrew/Greek words, their meanings, and any important nuances that might be lost in English translation.`;
      } else if (type === 'application') {
        prompt = `How can ${passage} be applied to modern Christian life? Provide practical, relevant applications for today's believers while staying true to the original intent.`;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setExegesis({
        full: result,
        passage: passage,
        type: type
      });

      toast.success('Insight generated!');
    } catch (error) {
      console.error('Failed to get insight:', error);
      toast.error('Failed to get insight');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (exegesis?.full) {
      navigator.clipboard.writeText(exegesis.full);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="w-5 h-5" />
          Scripture Exegesis & Commentary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Scripture Passage</Label>
          <Input
            placeholder="e.g., Romans 8:28-39"
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
          />
        </div>

        <Tabs defaultValue="full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="full">Full Analysis</TabsTrigger>
            <TabsTrigger value="cultural">Cultural</TabsTrigger>
            <TabsTrigger value="original">Word Study</TabsTrigger>
            <TabsTrigger value="application">Application</TabsTrigger>
          </TabsList>

          <TabsContent value="full" className="space-y-2">
            <Button 
              onClick={analyzePassage}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Generate Complete Exegesis'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="cultural" className="space-y-2">
            <Button 
              onClick={() => getQuickInsight('cultural')}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Get Cultural & Historical Context'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="original" className="space-y-2">
            <Button 
              onClick={() => getQuickInsight('original')}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Analyze Original Language'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="application" className="space-y-2">
            <Button 
              onClick={() => getQuickInsight('application')}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Get Application Insights'
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {exegesis && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label>
                {exegesis.type === 'cultural' ? 'Cultural Context' : 
                 exegesis.type === 'original' ? 'Word Study' :
                 exegesis.type === 'application' ? 'Application' : 'Exegesis'}
              </Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
            <Textarea
              value={exegesis.full}
              onChange={(e) => setExegesis({ ...exegesis, full: e.target.value })}
              rows={20}
              className="font-mono text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}