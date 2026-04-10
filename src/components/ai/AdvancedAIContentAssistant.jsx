import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader, Copy, Check, Download } from 'lucide-react';
import { useI18n } from '../I18nProvider';

export default function AdvancedAIContentAssistant() {
  const { lang } = useI18n();
  const [activeTab, setActiveTab] = useState('brainstorm');
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('general');
  const [readingLevel, setReadingLevel] = useState('intermediate');
  const [existingContent, setExistingContent] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const AUDIENCES = [
    { value: 'general', label: lang === 'om' ? 'Waliigala' : 'General Audience' },
    { value: 'youth', label: lang === 'om' ? 'Yeroo Xiqqaa' : 'Youth' },
    { value: 'leaders', label: lang === 'om' ? 'Hoggantootaa' : 'Church Leaders' },
    { value: 'beginners', label: lang === 'om' ? 'Jalqabaa' : 'Bible Beginners' },
  ];

  const READING_LEVELS = [
    { value: 'simple', label: lang === 'om' ? 'Salphaa' : 'Simple' },
    { value: 'intermediate', label: lang === 'om' ? 'Giddugale' : 'Intermediate' },
    { value: 'advanced', label: lang === 'om' ? 'Ol\'aarsa' : 'Advanced' },
  ];

  const generateBrainstorm = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate creative brainstorming ideas for Bible study content on the topic: "${topic}". For audience: ${audience}. 
        Include:
        1. 5 creative content ideas
        2. Different formats (video, discussion, hands-on activity, etc.)
        3. Engagement hooks
        4. Related scripture passages
        5. Discussion questions
        Format as structured JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            topic: { type: 'string' },
            ideas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  format: { type: 'string' },
                  engagementHook: { type: 'string' },
                  relatedScriptures: { type: 'array', items: { type: 'string' } },
                  discussionQuestions: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            disclaimer: { type: 'string' },
          },
        },
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error generating brainstorm:', error);
      alert(lang === 'om' ? 'Dogoggora uumuu' : 'Error generating ideas');
    } finally {
      setLoading(false);
    }
  };

  const generateOutline = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive study plan outline for: "${topic}". For reading level: ${readingLevel}.
        Include:
        1. Main learning objectives
        2. Detailed outline with sections (intro, 3-5 main points, conclusion)
        3. Scripture references for each section
        4. Time allocation (in minutes)
        5. Interactive activities
        6. Assessment questions
        7. Deeper study resources`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            objectives: { type: 'array', items: { type: 'string' } },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  duration: { type: 'number' },
                  content: { type: 'string' },
                  scriptures: { type: 'array', items: { type: 'string' } },
                  activity: { type: 'string' },
                },
              },
            },
            assessment: { type: 'array', items: { type: 'string' } },
            resources: { type: 'array', items: { type: 'string' } },
            disclaimer: { type: 'string' },
          },
        },
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error generating outline:', error);
      alert(lang === 'om' ? 'Dogoggora uumuu' : 'Error generating outline');
    } finally {
      setLoading(false);
    }
  };

  const adaptContent = async () => {
    if (!existingContent.trim() || !readingLevel) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Adapt the following Bible study content for a ${readingLevel} reading level and ${audience} audience:
        
        Original Content:
        "${existingContent}"
        
        Provide:
        1. Adapted version of the content
        2. Simplified/expanded explanations as needed
        3. Age-appropriate examples
        4. Modified discussion questions
        5. Adjusted scripture references`,
        response_json_schema: {
          type: 'object',
          properties: {
            adaptedContent: { type: 'string' },
            explanations: { type: 'array', items: { type: 'string' } },
            examples: { type: 'array', items: { type: 'string' } },
            discussionQuestions: { type: 'array', items: { type: 'string' } },
            scriptures: { type: 'array', items: { type: 'string' } },
            disclaimer: { type: 'string' },
          },
        },
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error adapting content:', error);
      alert(lang === 'om' ? 'Dogoggora firii godhuu' : 'Error adapting content');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--faith-light-primary-dark)] mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[var(--faith-light-accent)]" />
          {lang === 'om' ? 'Gargaarsa AI Miidiyaa' : 'AI Content Assistant'}
        </h1>
        <p className="text-gray-600">
          {lang === 'om'
            ? 'Miidiyaa waaqeffannaa uumuu fi firii godhuu'
            : 'Create and adapt Bible study content with AI'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="brainstorm">
            {lang === 'om' ? 'Jidhaadhu' : 'Brainstorm'}
          </TabsTrigger>
          <TabsTrigger value="outline">
            {lang === 'om' ? 'Filannoo' : 'Outline'}
          </TabsTrigger>
          <TabsTrigger value="adapt">
            {lang === 'om' ? 'Firii Godhu' : 'Adapt'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brainstorm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'om' ? 'Jidhaadhu Miidiyaa' : 'Brainstorm Content Ideas'}</CardTitle>
              <CardDescription>
                {lang === 'om' ? 'Mata gaaffii fi audience filadhu' : 'Generate creative ideas for your audience'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'om' ? 'Mata Gaaffii' : 'Topic'}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={lang === 'om' ? 'Ee.g., Amantaa, Ilaalcha, ...' : 'E.g., Faith, Grace, ...'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'om' ? 'Audience' : 'Audience'}
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
                >
                  {AUDIENCES.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={generateBrainstorm}
                disabled={loading || !topic.trim()}
                className="w-full bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {lang === 'om' ? 'Uumaa...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {lang === 'om' ? 'Jidhaadhu' : 'Brainstorm'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="border-2 border-[var(--faith-light-primary)]">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle>{result.topic}</CardTitle>
                    <CardDescription>
                      {lang === 'om' ? 'Miidiyaa jidhaadhu' : 'Content Ideas'}
                    </CardDescription>
                  </div>
                  <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        {lang === 'om' ? 'Haftee' : 'Copied'}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {lang === 'om' ? 'Gadi Qabuu' : 'Copy'}
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
                {result.ideas && result.ideas.map((idea, idx) => (
                  <div key={idx} className="border-l-4 border-[var(--faith-light-primary)] pl-4 pb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{idea.title}</h3>
                    <p className="text-gray-700 text-sm mb-2">{idea.description}</p>
                    <div className="bg-gray-50 p-2 rounded text-xs mb-2">
                      <span className="font-medium">{lang === 'om' ? 'Dhangii' : 'Format'}:</span> {idea.format}
                    </div>
                    {idea.engagementHook && (
                      <div className="text-sm text-gray-700 italic mb-2">
                        💡 {idea.engagementHook}
                      </div>
                    )}
                    {idea.relatedScriptures && idea.relatedScriptures.length > 0 && (
                      <div className="text-xs text-gray-600 mb-2">
                        <span className="font-medium">{lang === 'om' ? 'Kitaaba' : 'Scriptures'}:</span> {idea.relatedScriptures.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="outline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'om' ? 'Filannoo Uumuu' : 'Generate Outline'}</CardTitle>
              <CardDescription>
                {lang === 'om' ? 'Filannoo qophaa' : 'Create a structured study outline'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'om' ? 'Mata Gaaffii' : 'Topic'}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={lang === 'om' ? 'Mata gaaffii barreessi' : 'Enter a topic'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'om' ? 'Sadarkaa Dubbisuu' : 'Reading Level'}
                </label>
                <select
                  value={readingLevel}
                  onChange={(e) => setReadingLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
                >
                  {READING_LEVELS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={generateOutline}
                disabled={loading || !topic.trim()}
                className="w-full bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {lang === 'om' ? 'Uumaa...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {lang === 'om' ? 'Filannoo Uumuu' : 'Generate'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {result && result.sections && (
            <Card className="border-2 border-[var(--faith-light-primary)]">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle>{result.title}</CardTitle>
                  </div>
                  <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {result.objectives && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{lang === 'om' ? 'Gallaa Barumsa' : 'Learning Objectives'}</h3>
                    <ul className="space-y-1">
                      {result.objectives.map((obj, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.sections.map((section, idx) => (
                  <div key={idx} className="border-t pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{section.title}</h4>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{section.duration}min</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{section.content}</p>
                    {section.activity && (
                      <div className="bg-blue-50 p-2 rounded text-xs mb-2">
                        <span className="font-medium">📌 Activity:</span> {section.activity}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="adapt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'om' ? 'Miidiyaa Firii Godhu' : 'Adapt Content'}</CardTitle>
              <CardDescription>
                {lang === 'om' ? 'Miidiyaa kamitti firii godhu' : 'Adapt content for different audiences'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'om' ? 'Miidiyaa Jiruu' : 'Existing Content'}
                </label>
                <textarea
                  value={existingContent}
                  onChange={(e) => setExistingContent(e.target.value)}
                  placeholder={lang === 'om' ? 'Miidiyaa barreessi' : 'Paste your content here'}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'om' ? 'Sadarkaa Dubbisuu' : 'Reading Level'}
                  </label>
                  <select
                    value={readingLevel}
                    onChange={(e) => setReadingLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
                  >
                    {READING_LEVELS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'om' ? 'Audience' : 'Audience'}
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
                  >
                    {AUDIENCES.map(a => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={adaptContent}
                disabled={loading || !existingContent.trim()}
                className="w-full bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {lang === 'om' ? 'Firii Godhaa...' : 'Adapting...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {lang === 'om' ? 'Firii Godhu' : 'Adapt'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {result && result.adaptedContent && (
            <Card className="border-2 border-[var(--faith-light-primary)]">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle>{lang === 'om' ? 'Miidiyaa Firii Godhame' : 'Adapted Content'}</CardTitle>
                  <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{result.adaptedContent}</p>
                </div>

                {result.discussionQuestions && result.discussionQuestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {lang === 'om' ? 'Gaaffii Jidhaadhu' : 'Discussion Questions'}
                    </h4>
                    <ul className="space-y-1">
                      {result.discussionQuestions.map((q, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {result && result.disclaimer && (
        <div className="bg-yellow-50 border-l-4 border-[var(--faith-light-accent)] p-4 rounded">
          <p className="text-xs text-gray-700">
            <span className="font-semibold">⚠️ {lang === 'om' ? 'Qaroorsaa AI' : 'AI Disclaimer'}:</span> {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}