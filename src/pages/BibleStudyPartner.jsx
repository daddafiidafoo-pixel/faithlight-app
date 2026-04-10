import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles, Loader2, BookMarked, FileText, Link2, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ReactMarkdown from 'react-markdown';

export default function BibleStudyPartner() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('explain');
  
  // Verse Explanation
  const [verseInput, setVerseInput] = useState('');
  const [verseExplanation, setVerseExplanation] = useState('');
  
  // Book Summary
  const [bookInput, setBookInput] = useState('');
  const [bookSummary, setBookSummary] = useState('');
  
  // Devotional Creator
  const [devotionalScripture, setDevotionalScripture] = useState('');
  const [devotionalType, setDevotionalType] = useState('personal');
  const [devotional, setDevotional] = useState('');
  
  // Related Verses
  const [topicInput, setTopicInput] = useState('');
  const [relatedVerses, setRelatedVerses] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const explainVerseMutation = useMutation({
    mutationFn: async (passage) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI Bible Study Partner helping believers understand Scripture deeply.

TASK: Provide a verse-by-verse explanation of the following passage.

PASSAGE: ${passage}

INSTRUCTIONS:
- Break down each verse individually
- Explain the historical and cultural context
- Clarify difficult words or concepts
- Show how verses connect to each other
- Provide practical application for modern life
- Be theologically sound and faithful to Scripture
- Use clear, accessible language

Format your response with verse numbers and clear sections.`,
        add_context_from_internet: true
      });
      return response;
    },
    onSuccess: (data) => setVerseExplanation(data)
  });

  const summarizeBookMutation = useMutation({
    mutationFn: async (bookOrTheme) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI Bible Study Partner helping believers understand Scripture.

TASK: Provide a comprehensive summary of: ${bookOrTheme}

INSTRUCTIONS:
- Give an overview of the main themes and structure
- Explain the historical context and authorship
- Highlight key passages and teachings
- Show how it fits into the broader biblical narrative
- Provide practical takeaways for modern readers
- Be concise but thorough (3-5 paragraphs)

If this is a theme (not a book), explain how it develops throughout Scripture.`,
        add_context_from_internet: true
      });
      return response;
    },
    onSuccess: (data) => setBookSummary(data)
  });

  const createDevotionalMutation = useMutation({
    mutationFn: async ({ scripture, type }) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI Bible Study Partner helping create meaningful devotional content.

SCRIPTURE: ${scripture}

TYPE: ${type === 'personal' ? 'Personal Devotional' : type === 'teaching' ? 'Teaching Outline' : 'Small Group Study Guide'}

INSTRUCTIONS:
${type === 'personal' ? `
Create a personal devotional with:
- Opening Prayer (2-3 sentences)
- Scripture Reading (the passage)
- Reflection (3-4 paragraphs exploring the text)
- Personal Application (3 specific action points)
- Closing Prayer (2-3 sentences)
` : type === 'teaching' ? `
Create a teaching outline with:
- Main Theme (one sentence)
- Key Points (3-4 main points with sub-points)
- Scripture References (related passages to reference)
- Illustrations (2-3 practical examples or stories)
- Application (how to apply this teaching)
- Conclusion (summary and call to action)
` : `
Create a small group study guide with:
- Opening Question (icebreaker related to the theme)
- Scripture Reading (the passage)
- Discussion Questions (5-7 thought-provoking questions)
- Group Activity (practical exercise to apply the text)
- Prayer Focus (what to pray about together)
- Week Challenge (practical action for the week)
`}

Be practical, encouraging, and biblically sound.`,
        add_context_from_internet: true
      });
      return response;
    },
    onSuccess: (data) => setDevotional(data)
  });

  const findRelatedVersesMutation = useMutation({
    mutationFn: async (topic) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI Bible Study Partner helping believers explore Scripture deeply.

TOPIC: ${topic}

TASK: Provide related verses and theological concepts for deeper study.

INSTRUCTIONS:
- List 8-10 key Bible verses related to this topic (include full reference and text)
- Explain how each verse contributes to understanding the topic
- Identify 3-4 major theological concepts or themes connected to this topic
- Suggest a logical study order (which verses/concepts to explore first)
- Recommend relevant books of the Bible for extended study
- Provide 2-3 practical questions for reflection

Format clearly with sections for: Key Verses, Theological Concepts, Study Path, Recommended Reading, Reflection Questions.`,
        add_context_from_internet: true
      });
      return response;
    },
    onSuccess: (data) => setRelatedVerses(data)
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Bible Study Partner</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your personal guide for deeper Scripture understanding, devotional preparation, and theological exploration
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link to={createPageUrl('BibleReader')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
              <CardContent className="flex items-center gap-4 p-6">
                <BookOpen className="w-10 h-10 text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Bible Reader</h3>
                  <p className="text-sm text-gray-600">Read Scripture with notes & highlights</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl('AudioBible')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="flex items-center gap-4 p-6">
                <Volume2 className="w-10 h-10 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Audio Bible</h3>
                  <p className="text-sm text-gray-600">Listen to Scripture on the go</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Study Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-6">
                <TabsTrigger value="explain" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Explain Verses</span>
                  <span className="sm:hidden">Explain</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="gap-2">
                  <BookMarked className="w-4 h-4" />
                  <span className="hidden sm:inline">Book Summary</span>
                  <span className="sm:hidden">Summary</span>
                </TabsTrigger>
                <TabsTrigger value="devotional" className="gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Devotional</span>
                  <span className="sm:hidden">Devotional</span>
                </TabsTrigger>
                <TabsTrigger value="related" className="gap-2">
                  <Link2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Related Verses</span>
                  <span className="sm:hidden">Related</span>
                </TabsTrigger>
              </TabsList>

              {/* Verse Explanation Tab */}
              <TabsContent value="explain" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Scripture Passage
                  </label>
                  <Input
                    placeholder="e.g., John 3:16-17 or Romans 8:28-39"
                    value={verseInput}
                    onChange={(e) => setVerseInput(e.target.value)}
                    className="mb-3"
                  />
                  <Button
                    onClick={() => verseInput.trim() && explainVerseMutation.mutate(verseInput)}
                    disabled={explainVerseMutation.isPending || !verseInput.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {explainVerseMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Explain This Passage
                      </>
                    )}
                  </Button>
                </div>

                {verseExplanation && (
                  <Card className="bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="pt-6">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{verseExplanation}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Book Summary Tab */}
              <TabsContent value="summary" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Book Name or Biblical Theme
                  </label>
                  <Input
                    placeholder="e.g., Ephesians or Grace or Covenant"
                    value={bookInput}
                    onChange={(e) => setBookInput(e.target.value)}
                    className="mb-3"
                  />
                  <Button
                    onClick={() => bookInput.trim() && summarizeBookMutation.mutate(bookInput)}
                    disabled={summarizeBookMutation.isPending || !bookInput.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {summarizeBookMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <BookMarked className="w-4 h-4 mr-2" />
                        Get Summary
                      </>
                    )}
                  </Button>
                </div>

                {bookSummary && (
                  <Card className="bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="pt-6">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{bookSummary}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Devotional Creator Tab */}
              <TabsContent value="devotional" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Scripture Passage
                  </label>
                  <Input
                    placeholder="e.g., Psalm 23 or Matthew 5:1-12"
                    value={devotionalScripture}
                    onChange={(e) => setDevotionalScripture(e.target.value)}
                    className="mb-3"
                  />
                  
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Type
                  </label>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <Badge
                      onClick={() => setDevotionalType('personal')}
                      className={`cursor-pointer ${
                        devotionalType === 'personal'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Personal Devotional
                    </Badge>
                    <Badge
                      onClick={() => setDevotionalType('teaching')}
                      className={`cursor-pointer ${
                        devotionalType === 'teaching'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Teaching Outline
                    </Badge>
                    <Badge
                      onClick={() => setDevotionalType('group')}
                      className={`cursor-pointer ${
                        devotionalType === 'group'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Small Group Guide
                    </Badge>
                  </div>

                  <Button
                    onClick={() =>
                      devotionalScripture.trim() &&
                      createDevotionalMutation.mutate({
                        scripture: devotionalScripture,
                        type: devotionalType
                      })
                    }
                    disabled={createDevotionalMutation.isPending || !devotionalScripture.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {createDevotionalMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Create {devotionalType === 'personal' ? 'Devotional' : devotionalType === 'teaching' ? 'Outline' : 'Study Guide'}
                      </>
                    )}
                  </Button>
                </div>

                {devotional && (
                  <Card className="bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="pt-6">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{devotional}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Related Verses Tab */}
              <TabsContent value="related" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Topic or Concept
                  </label>
                  <Input
                    placeholder="e.g., Faith, Forgiveness, Prayer, Salvation"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    className="mb-3"
                  />
                  <Button
                    onClick={() => topicInput.trim() && findRelatedVersesMutation.mutate(topicInput)}
                    disabled={findRelatedVersesMutation.isPending || !topicInput.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {findRelatedVersesMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 mr-2" />
                        Find Related Verses
                      </>
                    )}
                  </Button>
                </div>

                {relatedVerses && (
                  <Card className="bg-gradient-to-br from-amber-50 to-white">
                    <CardContent className="pt-6">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{relatedVerses}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="mt-8 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Study Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✨ <strong>Be specific:</strong> The more detailed your input, the better the AI can help</li>
              <li>📖 <strong>Cross-reference:</strong> Use the Bible Reader to explore passages mentioned in responses</li>
              <li>🎧 <strong>Listen along:</strong> Play Audio Bible while reviewing AI explanations</li>
              <li>📝 <strong>Take notes:</strong> Save important insights in the Bible Reader's note feature</li>
              <li>🔗 <strong>Follow links:</strong> Explore related verses to deepen your understanding</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}