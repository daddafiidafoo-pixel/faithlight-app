import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Shield, MessageCircle, Users, BookOpen, CheckCircle } from 'lucide-react';

export default function AICommunityOnboarding({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [aiTips, setAiTips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generatePersonalizedTips();
  }, []);

  const generatePersonalizedTips = async () => {
    setIsLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 personalized tips for a new user joining the FaithLight Christian community platform. 

User profile:
- Name: ${user.full_name || 'New User'}
- Role: ${user.user_role || 'user'}

Focus on:
1. How to engage respectfully in forums
2. Finding study groups and mentors
3. Asking good theological questions
4. Using AI tools responsibly
5. Building meaningful connections

Return JSON array of tip objects:`,
        response_json_schema: {
          type: 'object',
          properties: {
            tips: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  icon: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setAiTips(response.tips || []);
    } catch (error) {
      console.error('Failed to generate tips:', error);
      // Fallback tips
      setAiTips([
        { title: 'Be Respectful', description: 'Treat all members with kindness and respect', icon: '🤝' },
        { title: 'Ask Questions', description: 'No question is too simple - we\'re all learning', icon: '❓' },
        { title: 'Share Insights', description: 'Your perspective can help others grow', icon: '💡' },
        { title: 'Stay On Topic', description: 'Keep discussions focused on faith and learning', icon: '🎯' },
        { title: 'Report Issues', description: 'Help keep the community safe by flagging inappropriate content', icon: '🚩' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      title: 'Welcome to FaithLight Community! 🎉',
      description: 'Let\'s help you get started with our community features',
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            FaithLight is more than just a learning platform - it's a global community of believers 
            growing together in faith. Here's what you can do:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded">
              <MessageCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Forums & Discussions</p>
                <p className="text-xs text-gray-600">Ask questions and share insights</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded">
              <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Study Groups</p>
                <p className="text-xs text-gray-600">Learn together with others</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <BookOpen className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Mentorship</p>
                <p className="text-xs text-gray-600">Find or become a mentor</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">AI Tools</p>
                <p className="text-xs text-gray-600">Bible Tutor, study aids, and more</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Community Guidelines 📋',
      description: 'How to be a great community member',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Our Values</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Scripture-Centered:</strong> All discussions should honor God's Word</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Respectful Dialogue:</strong> Disagree graciously, never attack personally</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>No Spam:</strong> Avoid promotional content or repetitive posts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Truth in Love:</strong> Speak truth, but always with compassion</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-2">⚠️ What's Not Allowed</h4>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>• Hate speech, harassment, or discrimination</li>
              <li>• Spreading false teachings or heresy</li>
              <li>• Inappropriate or offensive language</li>
              <li>• Off-topic political debates</li>
              <li>• Spam or self-promotion</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            <strong>AI Moderation:</strong> Our AI tools help flag potentially inappropriate content, 
            but moderators make final decisions. If you see something concerning, please report it.
          </p>
        </div>
      )
    },
    {
      title: 'AI-Powered Tips for You ✨',
      description: 'Personalized suggestions based on your profile',
      icon: Sparkles,
      content: (
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-gray-600 text-center py-8">Generating personalized tips...</p>
          ) : (
            aiTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <div className="text-2xl">{tip.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )
    },
    {
      title: 'You\'re Ready! 🚀',
      description: 'Start exploring the community',
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">You're All Set!</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            You've completed the community onboarding. Remember to be respectful, ask questions, 
            and grow together with fellow believers.
          </p>
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 max-w-md mx-auto">
            <p className="text-sm text-indigo-900 font-semibold mb-2">Quick Tips:</p>
            <ul className="text-sm text-indigo-800 space-y-1 text-left">
              <li>✓ Start by introducing yourself in the Forum</li>
              <li>✓ Join a study group that matches your interests</li>
              <li>✓ Try the AI Bible Tutor if you have questions</li>
              <li>✓ Be patient and kind - we're all learning</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const handleComplete = async () => {
    try {
      await base44.auth.updateMe({
        community_onboarding_completed: true
      });
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">Step {step + 1} of {steps.length}</Badge>
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
          <p className="text-sm text-gray-600">{currentStep.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep.content}

          <div className="flex gap-3 pt-4 border-t">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="flex-1">
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete} className="flex-1 bg-green-600 hover:bg-green-700">
                Start Exploring!
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}