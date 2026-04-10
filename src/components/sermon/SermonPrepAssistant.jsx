import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Download, Copy, Lightbulb, BookOpen } from 'lucide-react';

export default function SermonPrepAssistant() {
  const [topic, setTopic] = useState('');
  const [scripture, setScripture] = useState('');
  const [teachingType, setTeachingType] = useState('sermon');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [materials, setMaterials] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleGenerate = async () => {
    if (!topic && !scripture) {
      setError('Please enter a topic or scripture passage');
      return;
    }

    setIsLoading(true);
    setError('');
    setMaterials(null);

    try {
      const response = await base44.functions.invoke('generateSermonPrepMaterials', {
        topic,
        scripturePassage: scripture,
        teachingType,
        difficulty
      });

      if (response.data) {
        setMaterials(response.data);
      } else {
        setError('Failed to generate materials');
      }
    } catch (err) {
      setError(err?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadAsText = () => {
    if (!materials) return;

    const content = generateTextFile();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${materials.title || 'Teaching Materials'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateTextFile = () => {
    if (!materials) return '';

    const lines = [
      materials.title,
      '=' .repeat(50),
      '',
      'OPENING HOOK',
      materials.openingHook,
      '',
      'MAIN OUTLINE',
      materials.outline.map((item, i) => `${i + 1}. ${item.point}\n   ${item.subPoints.map(sp => `- ${sp}`).join('\n   ')}\n   Verse: ${item.supportingVerse}`).join('\n'),
      '',
      'KEY POINTS',
      materials.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n'),
      '',
      'APPLICATIONS',
      materials.applicationIdeas.map(app => `${app.area}:\n${app.suggestions.map(s => `  • ${s}`).join('\n')}`).join('\n'),
      '',
      'ILLUSTRATIONS',
      materials.illustrations.map((ill, i) => `${i + 1}. ${ill.title}\n   ${ill.description}\n   Use: ${ill.whenToUse}`).join('\n'),
      '',
      'DISCUSSION QUESTIONS',
      materials.discussionQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n'),
      '',
      'CLOSING CHALLENGE',
      materials.closingChallenge,
      '',
      `Estimated Time: ${materials.estimatedTime}`
    ];
    return lines.join('\n');
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            AI Sermon & Lesson Preparation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Topic (or leave blank if using Scripture)</label>
            <Input
              placeholder="e.g., 'The Gospel of Grace', 'Overcoming Fear'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Scripture Passage (optional)</label>
            <Input
              placeholder="e.g., 'John 3:16', 'Romans 8:28-39'"
              value={scripture}
              onChange={(e) => setScripture(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Teaching Type</label>
              <Select value={teachingType} onValueChange={setTeachingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sermon">Sermon</SelectItem>
                  <SelectItem value="lesson">Bible Lesson</SelectItem>
                  <SelectItem value="study">Study Guide</SelectItem>
                  <SelectItem value="devotional">Devotional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Difficulty Level</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Materials...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Generate Teaching Materials
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {materials && (
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{materials.title}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadAsText}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="outline" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="outline">Outline</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="illustrations">Illustrations</TabsTrigger>
                <TabsTrigger value="more">More</TabsTrigger>
              </TabsList>

              {/* Outline Tab */}
              <TabsContent value="outline" className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold text-lg mb-3 text-indigo-600">Opening Hook</p>
                  <p className="text-gray-700 italic">{materials.openingHook}</p>
                </div>

                <div className="space-y-3">
                  <p className="font-semibold text-lg">Main Points</p>
                  {materials.outline.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-indigo-600 mb-2">{item.point}</h4>
                      <ul className="space-y-1 mb-3 ml-4">
                        {item.subPoints.map((sp, spIdx) => (
                          <li key={spIdx} className="text-sm text-gray-700">• {sp}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 italic">
                        Scripture: {item.supportingVerse}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold text-lg mb-3 text-indigo-600">Closing Challenge</p>
                  <p className="text-gray-700">{materials.closingChallenge}</p>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  ⏱ {materials.estimatedTime}
                </p>
              </TabsContent>

              {/* Applications Tab */}
              <TabsContent value="applications" className="space-y-4">
                <div className="space-y-3">
                  <p className="font-semibold text-lg">Key Points to Emphasize</p>
                  {materials.keyPoints.map((point, idx) => (
                    <div key={idx} className="p-3 bg-white rounded border border-gray-200 flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">{idx + 1}.</span>
                      <p className="text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mt-4">
                  <p className="font-semibold text-lg">Application Ideas</p>
                  {materials.applicationIdeas.map((app, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-amber-600 mb-2">{app.area}</h4>
                      <ul className="space-y-2">
                        {app.suggestions.map((sug, sugIdx) => (
                          <li key={sugIdx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-amber-500 mt-1">→</span>
                            {sug}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Illustrations Tab */}
              <TabsContent value="illustrations" className="space-y-4">
                {materials.illustrations.map((ill, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-green-600 mb-2">{ill.title}</h4>
                    <p className="text-gray-700 text-sm mb-3">{ill.description}</p>
                    <div className="p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-xs font-semibold text-green-700 mb-1">How to use:</p>
                      <p className="text-xs text-gray-600">{ill.whenToUse}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* More Tab */}
              <TabsContent value="more" className="space-y-4">
                <div className="space-y-3">
                  <p className="font-semibold text-lg">Discussion Questions</p>
                  {materials.discussionQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-white rounded border border-gray-200 flex items-start gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(q, idx)}
                        className="flex-shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <span className="text-gray-700">{q}</span>
                      {copiedIndex === idx && (
                        <span className="text-xs text-green-600 ml-auto">Copied!</span>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}