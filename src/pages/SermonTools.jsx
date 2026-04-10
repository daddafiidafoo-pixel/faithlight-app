import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, BookOpen, Loader2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SermonTools() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sermon Outline State
  const [sermonTopic, setSermonTopic] = useState('');
  const [sermonScripture, setSermonScripture] = useState('');
  const [sermonOutline, setSermonOutline] = useState('');

  // Sermon Summary State
  const [sermonContent, setSermonContent] = useState('');
  const [sermonSummary, setSermonSummary] = useState('');

  // Verse Explanation State
  const [selectedVerse, setSelectedVerse] = useState('');
  const [verseExplanation, setVerseExplanation] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!['teacher', 'pastor', 'admin'].includes(currentUser.user_role)) {
          base44.auth.redirectToLogin();
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const generateSermonOutline = async () => {
    if (!sermonTopic.trim()) return;

    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert preacher and theologian. Create a detailed sermon outline.

Sermon Topic: ${sermonTopic}
${sermonScripture ? `Primary Scripture: ${sermonScripture}` : ''}

Please provide a structured sermon outline with:
1. Sermon Title
2. Key Scripture passages (2-4 main verses)
3. Main Theme statement
4. Sermon Structure:
   - Opening/Hook (engaging way to start)
   - 3-4 Main Points with:
     * Point statement
     * Scripture support
     * Explanation
     * Real-world application
   - Conclusion/Call to Action
5. Reflection questions for listeners
6. Prayer points

Format in clear markdown. Make it practical and spiritually engaging for a congregation.`,
      });
      setSermonOutline(result);
    } catch (error) {
      console.error('Error generating sermon outline:', error);
      alert('Failed to generate sermon outline. Please try again.');
    }
    setLoading(false);
  };

  const generateSermonSummary = async () => {
    if (!sermonContent.trim()) return;

    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert preacher. Create a concise, powerful summary of the following sermon.

Sermon Content:
${sermonContent}

Please provide:
1. Sermon Title (if not already named)
2. Key Theme in one sentence
3. 3-4 Main Points (bullet points, concise)
4. Central Scripture Focus
5. Main Takeaway for Listeners
6. Call to Action

Format in clear markdown. Keep the summary brief (5-7 minutes reading time) but impactful.`,
      });
      setSermonSummary(result);
    } catch (error) {
      console.error('Error generating sermon summary:', error);
      alert('Failed to generate sermon summary. Please try again.');
    }
    setLoading(false);
  };

  const generateVerseExplanation = async () => {
    if (!selectedVerse.trim()) return;

    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a biblical scholar and teacher. Provide a detailed explanation of the following scripture verse for teaching purposes.

Scripture Verse: ${selectedVerse}

Please provide:
1. Verse Context:
   - Book, chapter, and context
   - Historical and cultural background
   - Who wrote it and why

2. Literal Meaning:
   - Word-for-word explanation
   - Key terms and their meanings
   - Original language insights (if relevant)

3. Theological Significance:
   - What this teaches about God
   - Connection to the Gospel
   - Related scriptures and themes

4. Practical Application:
   - How believers apply this today
   - Spiritual lessons
   - Common challenges in applying it

5. Teaching Tips:
   - How to explain this clearly to others
   - Questions to ask a congregation
   - Illustrations or modern examples

Format in clear markdown with sections. Make it useful for a pastor or teacher.`,
      });
      setVerseExplanation(result);
    } catch (error) {
      console.error('Error generating explanation:', error);
      alert('Failed to generate verse explanation. Please try again.');
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-600" />
            Sermon & Teaching Tools
          </h1>
          <p className="text-gray-600 mt-2">AI-powered tools for sermon prep, summaries, and verse explanations</p>
        </div>

        <Tabs defaultValue="outline" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="outline" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Sermon Outline</span>
              <span className="sm:hidden">Outline</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="verse" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Verse Explanation</span>
              <span className="sm:hidden">Verse</span>
            </TabsTrigger>
          </TabsList>

          {/* Sermon Outline Tab */}
          <TabsContent value="outline">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Sermon Outline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sermonTopic">Sermon Topic *</Label>
                    <Input
                      id="sermonTopic"
                      value={sermonTopic}
                      onChange={(e) => setSermonTopic(e.target.value)}
                      placeholder="e.g., Faith in the Storm, Love Your Enemies"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sermonScripture">Primary Scripture (Optional)</Label>
                    <Input
                      id="sermonScripture"
                      value={sermonScripture}
                      onChange={(e) => setSermonScripture(e.target.value)}
                      placeholder="e.g., Matthew 8:23-27"
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={generateSermonOutline}
                    disabled={loading || !sermonTopic}
                    className="w-full gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate Outline
                  </Button>
                  <p className="text-xs text-gray-500">
                    💡 Tip: Provides structure, scripture references, and application points
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Outline</CardTitle>
                    {sermonOutline && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(sermonOutline)}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  {sermonOutline ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{sermonOutline}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Your sermon outline will appear here</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sermon Summary Tab */}
          <TabsContent value="summary">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Sermon Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sermonContent">Full Sermon Content *</Label>
                    <Textarea
                      id="sermonContent"
                      value={sermonContent}
                      onChange={(e) => setSermonContent(e.target.value)}
                      placeholder="Paste your full sermon text here..."
                      rows={12}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={generateSermonSummary}
                    disabled={loading || !sermonContent}
                    className="w-full gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate Summary
                  </Button>
                  <p className="text-xs text-gray-500">
                    💡 Tip: Perfect for creating bulletin inserts or email summaries
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Summary</CardTitle>
                    {sermonSummary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(sermonSummary)}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  {sermonSummary ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{sermonSummary}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Your sermon summary will appear here</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Verse Explanation Tab */}
          <TabsContent value="verse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Verse Explanation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="selectedVerse">Bible Verse Reference *</Label>
                    <Input
                      id="selectedVerse"
                      value={selectedVerse}
                      onChange={(e) => setSelectedVerse(e.target.value)}
                      placeholder="e.g., John 3:16, 1 Corinthians 13:4-7"
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={generateVerseExplanation}
                    disabled={loading || !selectedVerse}
                    className="w-full gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Explain Verse
                  </Button>
                  <p className="text-xs text-gray-500">
                    💡 Tip: Includes context, meaning, theology, and teaching tips
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Verse Explanation</CardTitle>
                    {verseExplanation && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(verseExplanation)}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  {verseExplanation ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{verseExplanation}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Verse explanation will appear here</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}