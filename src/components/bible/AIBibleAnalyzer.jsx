import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BookOpen, Lightbulb, MapPin, BookMarked } from 'lucide-react';
import { toast } from 'sonner';

export default function AIBibleAnalyzer({ book, chapter, verses, currentUser, isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [results, setResults] = useState({
    summary: null,
    crossReferences: null,
    perspectives: null,
    studyPlan: null
  });

  const generateBookSummary = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a comprehensive summary of the biblical book of ${book}. Include:
- Main themes and messages
- Key figures and their roles
- Historical context
- Theological significance
- Major events in chronological order

Keep it concise but thorough (2-3 paragraphs).`,
        add_context_from_internet: false
      });
      setResults(prev => ({ ...prev, summary: response }));
      toast.success('Summary generated');
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const generateCrossReferences = async () => {
    setLoading(true);
    try {
      const verseText = verses.slice(0, 5).map(v => `${v.verse}: ${v.text}`).join('\n');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `For this passage from ${book} ${chapter}:

${verseText}

Provide relevant cross-references to other biblical passages that relate to the same themes, concepts, or teachings. Format as:
- Theme/Concept: [Book Chapter:Verse - brief explanation]

Include 5-8 cross-references.`,
        add_context_from_internet: false
      });
      setResults(prev => ({ ...prev, crossReferences: response }));
      toast.success('Cross-references found');
    } catch (error) {
      toast.error('Failed to generate cross-references');
    } finally {
      setLoading(false);
    }
  };

  const generateTheologicalPerspectives = async () => {
    setLoading(true);
    try {
      const verseText = verses.slice(0, 3).map(v => `${v.verse}: ${v.text}`).join('\n');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `For this passage from ${book} ${chapter}:

${verseText}

Provide 3 different theological perspectives on this passage:
1. Protestant perspective
2. Catholic perspective
3. Evangelical/Charismatic perspective

For each, briefly explain:
- Main interpretation
- Key theological insights
- Practical application

Keep each perspective concise.`,
        add_context_from_internet: false
      });
      setResults(prev => ({ ...prev, perspectives: response }));
      toast.success('Perspectives generated');
    } catch (error) {
      toast.error('Failed to generate perspectives');
    } finally {
      setLoading(false);
    }
  };

  const generateStudyPlan = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a personalized Bible study plan for someone interested in the book of ${book}. Include:
- 8-week study outline with weekly topics
- Daily readings (3-5 chapters per day)
- Weekly themes and focus areas
- Discussion questions for each week
- Reflection prompts
- Suggested cross-study books or themes

Format as a clear, actionable plan.`,
        add_context_from_internet: false
      });
      setResults(prev => ({ ...prev, studyPlan: response }));
      toast.success('Study plan created');
    } catch (error) {
      toast.error('Failed to generate study plan');
    } finally {
      setLoading(false);
    }
  };

  const cardBg = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" style={{ color: '#6B8E6E', borderColor }}>
          <Lightbulb className="w-4 h-4" />
          AI Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto" style={{ backgroundColor: cardBg, borderColor }}>
        <DialogHeader>
          <DialogTitle style={{ color: textColor }}>AI Bible Analysis</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="references">Cross-Ref</TabsTrigger>
            <TabsTrigger value="perspectives">Theology</TabsTrigger>
            <TabsTrigger value="study">Study Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Button 
              onClick={generateBookSummary} 
              disabled={loading}
              className="w-full gap-2"
              style={{ backgroundColor: '#6B8E6E', color: '#FFFFFF' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  Generate Book Summary
                </>
              )}
            </Button>
            {results.summary && (
              <Card style={{ backgroundColor: isDarkMode ? '#0F1411' : '#F9F5F0', borderColor }}>
                <CardContent className="pt-6">
                  <p style={{ color: textColor, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {results.summary}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="references" className="space-y-4">
            <Button 
              onClick={generateCrossReferences} 
              disabled={loading}
              className="w-full gap-2"
              style={{ backgroundColor: '#6B8E6E', color: '#FFFFFF' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Find Cross-References
                </>
              )}
            </Button>
            {results.crossReferences && (
              <Card style={{ backgroundColor: isDarkMode ? '#0F1411' : '#F9F5F0', borderColor }}>
                <CardContent className="pt-6">
                  <p style={{ color: textColor, lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                    {results.crossReferences}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="perspectives" className="space-y-4">
            <Button 
              onClick={generateTheologicalPerspectives} 
              disabled={loading}
              className="w-full gap-2"
              style={{ backgroundColor: '#6B8E6E', color: '#FFFFFF' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4" />
                  Theological Perspectives
                </>
              )}
            </Button>
            {results.perspectives && (
              <Card style={{ backgroundColor: isDarkMode ? '#0F1411' : '#F9F5F0', borderColor }}>
                <CardContent className="pt-6">
                  <p style={{ color: textColor, lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                    {results.perspectives}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="study" className="space-y-4">
            <Button 
              onClick={generateStudyPlan} 
              disabled={loading}
              className="w-full gap-2"
              style={{ backgroundColor: '#6B8E6E', color: '#FFFFFF' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <BookMarked className="w-4 h-4" />
                  Create Study Plan
                </>
              )}
            </Button>
            {results.studyPlan && (
              <Card style={{ backgroundColor: isDarkMode ? '#0F1411' : '#F9F5F0', borderColor }}>
                <CardContent className="pt-6">
                  <p style={{ color: textColor, lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                    {results.studyPlan}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}