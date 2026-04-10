import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import AIContentHelper from '../components/course/AIContentHelper';

export default function AILessonAssistant() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!['teacher', 'admin', 'pastor'].includes(currentUser.user_role)) {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl('MyCourses'))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              AI Lesson Assistant
            </h1>
            <p className="text-gray-600">Get AI-powered help creating and refining your lessons</p>
          </div>
        </div>

        <Tabs defaultValue="outline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="outline">Generate Outline</TabsTrigger>
            <TabsTrigger value="questions">Discussion Questions</TabsTrigger>
            <TabsTrigger value="refine">Refine Content</TabsTrigger>
          </TabsList>

          <TabsContent value="outline" className="m-0">
            <AIContentHelper
              type="outline"
              onContentGenerated={(content) => {
                console.log('Generated outline:', content);
              }}
            />
          </TabsContent>

          <TabsContent value="questions" className="m-0">
            <AIContentHelper
              type="questions"
              onContentGenerated={(content) => {
                console.log('Generated questions:', content);
              }}
            />
          </TabsContent>

          <TabsContent value="refine" className="m-0">
            <AIContentHelper
              type="refine"
              onContentGenerated={(content) => {
                console.log('Refined content:', content);
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">💡 Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>For Outlines:</strong> Be specific with scripture references (e.g., "John 3:16-18") or topics (e.g., "Jesus' Sermon on the Mount"). The AI will create structured lesson outlines with learning objectives.
            </p>
            <p>
              <strong>For Questions:</strong> Provide the lesson topic or scripture passage. The AI generates discussion questions at different levels - from basic comprehension to deep reflection and personal application.
            </p>
            <p>
              <strong>For Refinement:</strong> Paste your current lesson title or description. The AI will improve clarity, engagement, and appeal while preserving your core message.
            </p>
            <p className="pt-2 text-blue-700">
              📌 <strong>Note:</strong> Always review and customize AI-generated content to match your teaching style and goals.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}