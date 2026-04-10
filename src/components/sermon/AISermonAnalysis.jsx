import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, MessageCircle, Lightbulb, BookOpen, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AISermonAnalysis({ sermon, user }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState(null);
  const [theologicalConcepts, setTheologicalConcepts] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [termExplanation, setTermExplanation] = useState('');
  const [loading, setLoading] = useState({
    question: false,
    takeaways: false,
    concepts: false,
    term: false
  });

  const askQuestion = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(prev => ({ ...prev, question: true }));
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a theological expert analyzing a sermon. Answer the following question based on the sermon content below.

SERMON TITLE: ${sermon.title}
SERMON CONTENT:
${sermon.content}

USER QUESTION: ${question}

Provide a clear, concise answer that references specific parts of the sermon. If the question cannot be answered from the sermon content, say so politely and offer related insights from the sermon.`,
        add_context_from_internet: false
      });

      setAnswer(response);
    } catch (error) {
      toast.error('Failed to get answer');
    } finally {
      setLoading(prev => ({ ...prev, question: false }));
    }
  };

  const generateTakeaways = async () => {
    setLoading(prev => ({ ...prev, takeaways: true }));
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this sermon and extract the key takeaways in a structured format.

SERMON TITLE: ${sermon.title}
SERMON TOPIC: ${sermon.topic}
SERMON CONTENT:
${sermon.content}

Provide:
1. Main Message (one sentence summary)
2. 3-5 Key Takeaways (bullet points)
3. Practical Applications (2-3 actionable points)
4. Scripture References (main verses discussed)

Format with clear headings and make it easy to scan.`,
        add_context_from_internet: false
      });

      setKeyTakeaways(response);
    } catch (error) {
      toast.error('Failed to generate takeaways');
    } finally {
      setLoading(prev => ({ ...prev, takeaways: false }));
    }
  };

  const identifyConcepts = async () => {
    setLoading(prev => ({ ...prev, concepts: true }));
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this sermon and identify the main theological concepts, doctrines, and themes discussed.

SERMON TITLE: ${sermon.title}
SERMON CONTENT:
${sermon.content}

Identify:
1. Primary Theological Concepts (e.g., Grace, Redemption, Faith)
2. Doctrinal Themes (e.g., Soteriology, Ecclesiology)
3. Biblical Themes (e.g., Covenant, Kingdom of God)
4. Practical Themes (e.g., Prayer, Service, Community)

For each concept, provide:
- The concept name
- A brief explanation of how it's presented in the sermon
- Related scripture references if mentioned

Format clearly with headings.`,
        add_context_from_internet: false
      });

      setTheologicalConcepts(response);
    } catch (error) {
      toast.error('Failed to identify concepts');
    } finally {
      setLoading(prev => ({ ...prev, concepts: false }));
    }
  };

  const explainTerm = async () => {
    if (!selectedTerm.trim()) {
      toast.error('Please enter a term to explain');
      return;
    }

    setLoading(prev => ({ ...prev, term: true }));
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Explain the theological term or concept: "${selectedTerm}"

Context: This term appears in a sermon about "${sermon.topic}".

Provide:
1. Definition (clear, simple explanation)
2. Biblical Background (where it comes from)
3. Theological Significance (why it matters)
4. Practical Meaning (how it applies to daily faith)
5. Related Terms (similar concepts)

Keep the explanation accessible for general audiences while being theologically accurate.`,
        add_context_from_internet: true
      });

      setTermExplanation(response);
    } catch (error) {
      toast.error('Failed to explain term');
    } finally {
      setLoading(prev => ({ ...prev, term: false }));
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Please log in to use AI analysis tools</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">AI Sermon Analysis</h3>
        <Badge variant="secondary" className="ml-auto">Powered by AI</Badge>
      </div>

      <Tabs defaultValue="question" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="question" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Q&A
          </TabsTrigger>
          <TabsTrigger value="takeaways" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Takeaways
          </TabsTrigger>
          <TabsTrigger value="concepts" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Concepts
          </TabsTrigger>
          <TabsTrigger value="terms" className="gap-2">
            <Info className="w-4 h-4" />
            Terms
          </TabsTrigger>
        </TabsList>

        {/* Q&A Tab */}
        <TabsContent value="question" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ask About This Sermon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., What does the pastor say about prayer?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                />
                <Button onClick={askQuestion} disabled={loading.question}>
                  {loading.question ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask'}
                </Button>
              </div>

              {answer && (
                <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <ReactMarkdown className="prose prose-sm max-w-none">
                    {answer}
                  </ReactMarkdown>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <p className="text-xs text-gray-600 w-full mb-1">Suggested questions:</p>
                {[
                  "What is the main message?",
                  "What scripture passages are discussed?",
                  "How can I apply this?",
                  "What are the key points?"
                ].map(q => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    onClick={() => { setQuestion(q); }}
                    className="text-xs"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Takeaways Tab */}
        <TabsContent value="takeaways" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key Takeaways</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!keyTakeaways ? (
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Generate a summary of the main points and applications</p>
                  <Button onClick={generateTakeaways} disabled={loading.takeaways}>
                    {loading.takeaways ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Takeaways
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{keyTakeaways}</ReactMarkdown>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setKeyTakeaways(null)}
                    className="mt-4"
                  >
                    Regenerate
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theological Concepts Tab */}
        <TabsContent value="concepts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Theological Concepts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!theologicalConcepts ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Identify key theological themes and doctrines</p>
                  <Button onClick={identifyConcepts} disabled={loading.concepts}>
                    {loading.concepts ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Identify Concepts
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{theologicalConcepts}</ReactMarkdown>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTheologicalConcepts(null)}
                    className="mt-4"
                  >
                    Regenerate
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Term Explanation Tab */}
        <TabsContent value="terms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Explain Theological Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a term (e.g., sanctification, atonement)"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && explainTerm()}
                />
                <Button onClick={explainTerm} disabled={loading.term}>
                  {loading.term ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Explain'}
                </Button>
              </div>

              {termExplanation && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <ReactMarkdown className="prose prose-sm max-w-none">
                    {termExplanation}
                  </ReactMarkdown>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <p className="text-xs text-gray-600 w-full mb-1">Common terms:</p>
                {[
                  "Grace",
                  "Justification",
                  "Sanctification",
                  "Redemption",
                  "Atonement",
                  "Covenant"
                ].map(term => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedTerm(term); }}
                    className="text-xs"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}