import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, Loader2, BookOpen, Globe, History, Users, Bookmark } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function TheologicalDeepDive({ user }) {
  const [passage, setPassage] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deepDive, setDeepDive] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  const handleGenerate = async () => {
    if (!passage.trim() && !keywords.trim()) {
      alert('Please enter a Bible passage or keywords');
      return;
    }

    setIsLoading(true);
    try {
      const query = passage || keywords;

      // Generate comprehensive theological study
      const overview = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive theological overview for: "${query}"

Include:
1. **Introduction**: What this passage/topic is about and its significance
2. **Main Themes**: 3-5 key theological themes present
3. **Biblical Context**: Where this fits in the broader biblical narrative
4. **Core Message**: The central theological truth being communicated

Use clear markdown formatting with headers and bullet points.`,
        add_context_from_internet: true
      });

      const originalLanguages = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide original language analysis for: "${query}"

Include:
1. **Hebrew/Greek Words**: Key original words with transliteration and meaning
2. **Word Studies**: Deeper exploration of significant terms
3. **Translation Notes**: How different translations render key phrases
4. **Linguistic Insights**: What the original language reveals about meaning

Format with clear sections and examples.`,
        add_context_from_internet: true
      });

      const historical = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide historical and cultural context for: "${query}"

Include:
1. **Historical Setting**: When and where this was written
2. **Cultural Background**: Social customs, political situation, religious context
3. **Author & Audience**: Who wrote it and who it was for
4. **Archaeological Insights**: Relevant findings that illuminate the text
5. **Timeline**: Where this fits in biblical history

Use clear structure with headers.`,
        add_context_from_internet: true
      });

      const theological = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide diverse theological perspectives on: "${query}"

Compare interpretations from:
1. **Reformed/Calvinist**: Their interpretation and key proponents
2. **Arminian/Wesleyan**: Their perspective and reasoning
3. **Catholic**: Traditional Catholic understanding
4. **Orthodox**: Eastern Orthodox view
5. **Pentecostal/Charismatic**: Their emphasis and application
6. **Liberal/Progressive**: Modern critical perspective

For each, explain:
- Their interpretation
- Biblical justification
- Practical implications

Be balanced and scholarly.`,
        add_context_from_internet: true
      });

      const application = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide practical application and devotional insights for: "${query}"

Include:
1. **Personal Application**: How believers can apply this today
2. **Life Situations**: Specific scenarios where this applies
3. **Prayer Points**: How to pray through this passage
4. **Reflection Questions**: 5-7 questions for deeper meditation
5. **Action Steps**: Practical ways to live out this truth
6. **Devotional Thought**: A brief encouraging reflection

Make it pastoral and practical.`,
        add_context_from_internet: true
      });

      setDeepDive({
        query,
        overview,
        originalLanguages,
        historical,
        theological,
        application
      });

      // Save to user content analysis
      await base44.entities.UserContentAnalysis.create({
        user_id: user.id,
        content_type: 'theological_study',
        content_text: query,
        themes: keywords.split(',').map(k => k.trim()).filter(Boolean),
        difficulty_level: 'advanced',
        analysis_metadata: {
          study_type: 'deep_dive',
          generated_at: new Date().toISOString()
        }
      }).catch(() => {});

    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate deep-dive. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!deepDive) return;

    try {
      await base44.entities.SavedExplanation.create({
        user_id: user.id,
        question: `Theological Deep-Dive: ${deepDive.query}`,
        ai_response: JSON.stringify(deepDive),
        category: 'theological',
        tags: keywords.split(',').map(k => k.trim()).filter(Boolean),
        is_favorite: true
      });
      alert('✅ Deep-dive saved to your library!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save study');
    }
  };

  const quickTopics = [
    { passage: 'Romans 8:28-39', keywords: 'assurance, perseverance' },
    { passage: 'John 3:16-21', keywords: 'salvation, eternal life' },
    { passage: 'Ephesians 2:1-10', keywords: 'grace, works, salvation' },
    { passage: 'Matthew 5-7', keywords: 'sermon on the mount, kingdom ethics' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Generate Theological Deep-Dive
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Bible Passage or Topic
            </label>
            <Input
              placeholder="e.g., John 1:1-14, Romans 9, The Trinity, Justification by Faith"
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Keywords (comma-separated)
            </label>
            <Input
              placeholder="e.g., grace, faith, covenant, redemption"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={(!passage.trim() && !keywords.trim()) || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Deep-Dive...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Deep-Dive Study
              </>
            )}
          </Button>

          {/* Quick Topics */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Quick topics:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickTopics.map((topic, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPassage(topic.passage);
                    setKeywords(topic.keywords);
                  }}
                  className="justify-start text-left"
                >
                  <BookOpen className="w-3 h-3 mr-2 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-medium truncate">{topic.passage}</div>
                    <div className="text-xs text-gray-500 truncate">{topic.keywords}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {deepDive && (
        <div className="space-y-6">
          {/* Header with Save */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Study: {deepDive.query}
            </h2>
            <Button onClick={handleSave} variant="outline" className="gap-2">
              <Bookmark className="w-4 h-4" />
              Save Study
            </Button>
          </div>

          {/* Tabbed Content */}
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="languages">Languages</TabsTrigger>
              <TabsTrigger value="historical">Historical</TabsTrigger>
              <TabsTrigger value="theological">Theological</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Theological Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{deepDive.overview}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="languages">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Original Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{deepDive.originalLanguages}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historical">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-600" />
                    Historical & Cultural Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{deepDive.historical}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theological">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Theological Perspectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{deepDive.theological}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="application">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Practical Application
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{deepDive.application}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Initial State */}
      {!deepDive && !isLoading && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Comprehensive Theological Study
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Enter a passage or keywords to generate an in-depth study covering original languages, 
              historical context, diverse theological perspectives, and practical applications.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}