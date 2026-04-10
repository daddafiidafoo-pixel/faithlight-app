import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, BookOpen, Download, Printer, Save, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import PlanLimitChecker, { checkFeatureAccess } from '../components/PlanLimitChecker';

export default function TeachingProgramGenerator() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [generating, setGenerating] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [scripture, setScripture] = useState('');
  const [audience, setAudience] = useState('adults');
  const [teachingType, setTeachingType] = useState('sermon');
  const [duration, setDuration] = useState(30);
  const [tone, setTone] = useState('preaching');
  const [languageCode, setLanguageCode] = useState('en');
  const [culturalContext, setCulturalContext] = useState('');
  const [keyEmphasis, setKeyEmphasis] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!['teacher', 'pastor', 'admin'].includes(currentUser.user_role)) {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
        setLanguageCode(currentUser.preferred_language_code || 'en');
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, [navigate]);

  const saveTeachingMutation = useMutation({
    mutationFn: (data) => base44.entities.TeachingProgram.create(data),
    onSuccess: (program) => {
      alert('Teaching program saved successfully!');
      navigate(createPageUrl(`MyTeachingPrograms`));
    },
  });

  const generateTeachingProgram = async () => {
    if (!title || !scripture) {
      alert('Please provide at least a title and scripture reference');
      return;
    }

    // Check AI usage limit
    const usageCheck = checkFeatureAccess(user, 'teaching_builder');
    if (!usageCheck.allowed) {
      alert(usageCheck.message);
      return;
    }

    // Increment AI usage
    try {
      await base44.auth.updateMe({ 
        ai_generations_used: (user.ai_generations_used || 0) + 1 
      });
      setUser({ ...user, ai_generations_used: (user.ai_generations_used || 0) + 1 });
    } catch (error) {
      console.error('Failed to update usage:', error);
    }

    setGenerating(true);
    try {
      const audienceMap = {
        youth: 'Youth and teenagers',
        adults: 'Adult congregation',
        new_believers: 'New believers and seekers',
        church_leaders: 'Church leaders and ministers'
      };

      const typeMap = {
        sermon: 'sermon',
        bible_study: 'Bible study session',
        lecture: 'theological lecture',
        devotional: 'devotional message'
      };

      const toneMap = {
        teaching: 'educational and teaching-focused',
        preaching: 'passionate and proclamation-oriented',
        academic: 'scholarly and theological',
        simple_practical: 'simple, practical, and easily applicable'
      };

      const prompt = `You are a Christian Bible teaching assistant and pastoral aid.
Create a ${typeMap[teachingType]} for the topic "${topic || title}" based on ${scripture}.

Requirements:
- Audience: ${audienceMap[audience]}
- Duration: ${duration} minutes
- Language: ${languageCode}
- Tone: ${toneMap[tone]}
${culturalContext ? `- Cultural context: ${culturalContext}` : ''}
${keyEmphasis ? `- Key emphasis: ${keyEmphasis}` : ''}

Structure your response with these sections:

# ${title}

## Scripture Foundation
${scripture}

## Introduction / Hook
(2-3 paragraphs that capture attention and introduce the theme)

## Main Teaching Points
(Create 3-5 well-developed points with):
### Point 1: [Title]
- Explanation
- Supporting verses
- Illustration or example
- Application

### Point 2: [Title]
- Explanation
- Supporting verses
- Illustration or example
- Application

(Continue for remaining points)

## Practical Applications
(How the audience can apply this teaching in their daily lives)

## Discussion Questions
(3-5 questions for reflection or group discussion)

## Conclusion
(Powerful closing that reinforces the main message)

## Closing Prayer / Reflection
(A prayer or reflective thought)

Use Scripture as the ultimate authority. Ensure all teaching is biblically grounded. Include cross-references where appropriate. Make it engaging, spiritually enriching, and appropriate for the specified duration and audience.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setGeneratedContent(result);
    } catch (error) {
      console.error('Error generating program:', error);
      alert('Failed to generate teaching program. Please try again.');
    }
    setGenerating(false);
  };

  const saveAsDraft = () => {
    if (!generatedContent) {
      alert('Please generate content first');
      return;
    }

    saveTeachingMutation.mutate({
      title,
      topic: topic || title,
      scripture,
      audience,
      teaching_type: teachingType,
      duration_minutes: duration,
      tone,
      language_code: languageCode,
      cultural_context: culturalContext || null,
      key_emphasis: keyEmphasis || null,
      content: generatedContent,
      status: 'draft',
      teacher_id: user.id
    });
  };

  const saveAsFinalized = () => {
    if (!generatedContent) {
      alert('Please generate content first');
      return;
    }

    saveTeachingMutation.mutate({
      title,
      topic: topic || title,
      scripture,
      audience,
      teaching_type: teachingType,
      duration_minutes: duration,
      tone,
      language_code: languageCode,
      cultural_context: culturalContext || null,
      key_emphasis: keyEmphasis || null,
      content: generatedContent,
      status: 'finalized',
      teacher_id: user.id
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Simple approach - trigger browser print to PDF
    alert('Use your browser\'s Print function and select "Save as PDF" as the printer.');
    window.print();
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="w-10 h-10 text-purple-600" />
                AI Teaching & Sermon Builder
              </h1>
              <p className="text-lg text-gray-700 mt-2">Prepare biblical sermons, lessons, and teaching programs in minutes — grounded in Scripture and ready to print.</p>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-gray-800 leading-relaxed">
              FaithLight's AI Teaching Builder helps pastors, Bible teachers, and lecturers prepare clear, Scripture-based teaching materials for Sunday services, Bible studies, seminars, and classes.
            </p>
            <p className="text-gray-800 leading-relaxed mt-3">
              Enter your topic or Bible passage, choose your audience and time, and FaithLight will generate a structured, editable teaching outline you can download or print.
            </p>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">What this tool helps you do</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span className="text-gray-700">Prepare sermons and Bible studies faster</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span className="text-gray-700">Stay grounded in Scripture with referenced passages</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span className="text-gray-700">Create structured outlines (introduction, main points, application)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span className="text-gray-700">Adapt teaching for different audiences (youth, adults, leaders)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span className="text-gray-700">Download or print materials for church or classroom use</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Limit Checker */}
          {user && <PlanLimitChecker user={user} feature="teaching_builder" />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Program Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title / Topic *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Faith in Difficult Times"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="scripture">Bible Passage(s) *</Label>
                  <Input
                    id="scripture"
                    value={scripture}
                    onChange={(e) => setScripture(e.target.value)}
                    placeholder="e.g., Romans 8:18-39"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="topic">Main Topic (Optional)</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="If different from title"
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="audience">Audience *</Label>
                    <Select value={audience} onValueChange={setAudience}>
                      <SelectTrigger id="audience" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youth">Youth</SelectItem>
                        <SelectItem value="adults">Adults</SelectItem>
                        <SelectItem value="new_believers">New Believers</SelectItem>
                        <SelectItem value="church_leaders">Church Leaders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="teachingType">Teaching Type *</Label>
                    <Select value={teachingType} onValueChange={setTeachingType}>
                      <SelectTrigger id="teachingType" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sermon">Sermon</SelectItem>
                        <SelectItem value="bible_study">Bible Study</SelectItem>
                        <SelectItem value="lecture">Lecture</SelectItem>
                        <SelectItem value="devotional">Devotional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration *</Label>
                    <Select value={duration.toString()} onValueChange={(val) => setDuration(parseInt(val))}>
                      <SelectTrigger id="duration" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tone">Tone *</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger id="tone" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teaching">Teaching</SelectItem>
                        <SelectItem value="preaching">Preaching</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="simple_practical">Simple & Practical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="culturalContext">Cultural Context (Optional)</Label>
                  <Input
                    id="culturalContext"
                    value={culturalContext}
                    onChange={(e) => setCulturalContext(e.target.value)}
                    placeholder="e.g., African, European, Global"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="keyEmphasis">Key Emphasis (Optional)</Label>
                  <Input
                    id="keyEmphasis"
                    value={keyEmphasis}
                    onChange={(e) => setKeyEmphasis(e.target.value)}
                    placeholder="e.g., faith, grace, repentance, hope"
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={generateTeachingProgram}
                  disabled={generating || !title || !scripture}
                  className="w-full gap-2"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Create New Teaching Program
                    </>
                  )}
                </Button>

                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-gray-700 italic">
                    This tool is designed to support pastors and teachers. Scripture remains the final authority, and all content should be prayerfully reviewed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Content */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Program</CardTitle>
                  {generatedContent && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Print Teaching</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-1">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download PDF</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="max-h-[800px] overflow-y-auto">
                {generatedContent ? (
                  <>
                    <div className="prose prose-sm max-w-none mb-6 print:prose-base" id="teaching-content">
                      <ReactMarkdown>{generatedContent}</ReactMarkdown>
                    </div>
                    <div className="flex gap-3 print:hidden">
                      <Button
                        onClick={saveAsDraft}
                        variant="outline"
                        disabled={saveTeachingMutation.isPending}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save as Draft
                      </Button>
                      <Button
                        onClick={saveAsFinalized}
                        disabled={saveTeachingMutation.isPending}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save & Finalize
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Your generated teaching program will appear here</p>
                    <p className="text-sm mt-2">Fill in the form and click Generate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #teaching-content, #teaching-content * {
            visibility: visible;
          }
          #teaching-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}