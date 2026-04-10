import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, BookOpen, HelpCircle, RefreshCw, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ContextualAIHelper({ currentPage, studyPlanId, dayIndex, userId }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');

  // Get context-specific prompts
  const getContextualPrompts = () => {
    const prompts = {
      summary: 'Generate a concise summary of the key points from this material',
      quiz: 'Generate 5 practice quiz questions based on the study material',
      reflection: 'Generate 5 reflection questions for deeper understanding',
      takeaways: 'List the top 5 key takeaways from this study material',
    };
    return prompts;
  };

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('generateReflectionQuestions', {
        contentType: 'study',
        daysCompleted: dayIndex + 1,
      });
      setGeneratedContent({
        type: 'summary',
        content: response.data?.reflectionQuestions,
      });
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('generateStudyQuiz', {
        studyPlanId,
        dayIndex,
      });
      setGeneratedContent({
        type: 'quiz',
        content: response.data?.quiz,
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReflectionQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('generateReflectionQuestions', {
        contentType: 'study',
        daysCompleted: dayIndex + 1,
      });
      setGeneratedContent({
        type: 'reflection',
        content: response.data?.reflectionQuestions,
      });
    } catch (error) {
      console.error('Error generating reflection questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendCustomMessage = async () => {
    if (!userMessage.trim()) return;

    setIsLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${userMessage}\n\nContext: User is studying on page: ${currentPage}`,
      });
      setGeneratedContent({
        type: 'custom',
        content: response,
      });
      setUserMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-full"
          title="AI Study Assistant"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">AI Assistant</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Study Assistant
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary" className="text-xs">
              Summary
            </TabsTrigger>
            <TabsTrigger value="quiz" className="text-xs">
              Quiz
            </TabsTrigger>
            <TabsTrigger value="reflection" className="text-xs">
              Reflect
            </TabsTrigger>
            <TabsTrigger value="ask" className="text-xs">
              Ask AI
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Get key takeaways and summary of today's study material
              </p>
              <Button
                onClick={generateSummary}
                disabled={isLoading}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>

            {generatedContent?.type === 'summary' && (
              <Card className="bg-indigo-50 border-indigo-200">
                <CardContent className="pt-6 space-y-3">
                  {generatedContent.content?.questions?.map((q, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="font-semibold text-sm text-indigo-900">
                        {q.question}
                      </p>
                      {q.prompts && (
                        <ul className="text-xs text-indigo-700 ml-4 space-y-1">
                          {q.prompts.map((p, pIdx) => (
                            <li key={pIdx}>• {p}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Test your understanding with practice questions
              </p>
              <Button
                onClick={generateQuiz}
                disabled={isLoading}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </div>

            {generatedContent?.type === 'quiz' && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6 space-y-4">
                  {generatedContent.content?.questions?.map((q, idx) => (
                    <div key={idx} className="space-y-2">
                      <p className="font-semibold text-sm text-blue-900">
                        {idx + 1}. {q.question}
                      </p>
                      {q.options && (
                        <div className="space-y-1 ml-4">
                          {q.options.map((opt, oIdx) => (
                            <p key={oIdx} className="text-xs text-blue-800">
                              {String.fromCharCode(65 + oIdx)}) {opt}
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 capitalize">
                        Difficulty: {q.difficulty}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reflection Tab */}
          <TabsContent value="reflection" className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Deep reflection questions for personal growth
              </p>
              <Button
                onClick={generateReflectionQuestions}
                disabled={isLoading}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Generate Questions
                  </>
                )}
              </Button>
            </div>

            {generatedContent?.type === 'reflection' && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6 space-y-3">
                  {generatedContent.content?.questions?.map((q, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="font-semibold text-sm text-purple-900">
                        {idx + 1}. {q.question}
                      </p>
                      <p className="text-xs text-purple-600 capitalize">
                        {q.category?.replace('_', ' ')}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Ask AI Tab */}
          <TabsContent value="ask" className="space-y-4">
            <div className="space-y-3">
              <Textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Ask anything about your study material, Bible passages, theology, or application..."
                className="min-h-24"
              />
              <Button
                onClick={sendCustomMessage}
                disabled={isLoading || !userMessage.trim()}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get Answer
                  </>
                )}
              </Button>
            </div>

            {generatedContent?.type === 'custom' && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {generatedContent.content}
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