import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AITutoringAssistant({ lessonId, courseId, userId, userName }) {
  const [messages, setMessages] = useState([
    {
      id: 'initial',
      role: 'assistant',
      content: "Hi! I'm your AI tutor. I can help explain concepts, answer questions about this lesson, and suggest personalized study tips. What would you like to learn about?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Fetch lesson content for context
  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonId ? base44.entities.TrainingLesson.filter({ id: lessonId }, '-created_date', 1).then(r => r[0]) : null,
    enabled: !!lessonId,
  });

  // Fetch user engagement metrics
  const { data: engagementMetrics } = useQuery({
    queryKey: ['user-engagement', lessonId, userId],
    queryFn: async () => {
      if (!lessonId || !userId) return null;
      const metrics = await base44.entities.LessonEngagementMetric.filter({
        lesson_id: lessonId,
        user_id: userId,
      }, '-created_date', 1);
      return metrics.length > 0 ? metrics[0] : null;
    },
    enabled: !!lessonId && !!userId,
  });

  // Fetch quiz performance for context
  const { data: quizPerformance } = useQuery({
    queryKey: ['quiz-performance', courseId, userId],
    queryFn: async () => {
      if (!courseId || !userId) return [];
      const results = await base44.entities.UserQuizResult.filter({
        course_id: courseId,
        user_id: userId,
      }, '-created_date', 5);
      return results;
    },
    enabled: !!courseId && !!userId,
  });

  // Auto scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build context from lesson and performance data
      let context = '';
      if (lesson) {
        context += `Lesson: ${lesson.title}\nContent: ${lesson.content.substring(0, 500)}...\n\n`;
      }

      if (engagementMetrics) {
        context += `User has spent ${Math.round(engagementMetrics.time_spent_seconds / 60)} minutes on this lesson. `;
        if (engagementMetrics.completed) {
          context += 'They have completed the lesson. ';
        }
      }

      if (quizPerformance && quizPerformance.length > 0) {
        const avgScore = Math.round(quizPerformance.reduce((sum, q) => sum + q.score, 0) / quizPerformance.length);
        context += `Recent quiz average: ${avgScore}%. `;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert AI tutor helping a student named ${userName} understand training content. 
        
Context: ${context}

Student Question: "${inputValue}"

Guidelines:
1. Answer directly and clearly
2. Use examples when helpful
3. Break down complex concepts into simple parts
4. If the question is about the lesson, reference the lesson content
5. Be encouraging and supportive
6. If unsure about content, ask clarifying questions`,
        add_context_from_internet: false,
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || 'I apologize, but I was unable to generate a response. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: '❌ Error generating response. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Tutor error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="bg-white border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Tutor
          </CardTitle>
        </div>
        <p className="text-sm text-gray-600 mt-1">Ask questions, get explanations, and personalized study tips</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 border border-indigo-200 rounded-bl-none'
                  }`}
                >
                  <div className={msg.role === 'assistant' ? 'prose prose-sm max-w-none' : ''}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown className="text-sm leading-relaxed">
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-indigo-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex-shrink-0" />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-white text-gray-900 border border-indigo-200 rounded-lg rounded-bl-none px-4 py-2">
                  <p className="text-sm text-gray-500">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-indigo-100 p-4 bg-white">
          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask me anything about this lesson..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}