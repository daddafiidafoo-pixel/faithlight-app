import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Upload, FileText, Loader2, BookOpen, MessageCircle,
  Lightbulb, Heart, TrendingUp, Tag, BarChart3, AlertCircle, CheckCircle2, Zap
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const SENTIMENT_CONFIG = {
  hopeful:      { color: 'bg-green-100 text-green-800',  label: 'Hopeful' },
  encouraging:  { color: 'bg-blue-100 text-blue-800',    label: 'Encouraging' },
  convicting:   { color: 'bg-orange-100 text-orange-800',label: 'Convicting' },
  celebratory:  { color: 'bg-purple-100 text-purple-800',label: 'Celebratory' },
  somber:       { color: 'bg-gray-100 text-gray-800',    label: 'Somber' },
  challenging:  { color: 'bg-red-100 text-red-800',      label: 'Challenging' },
  instructional:{ color: 'bg-yellow-100 text-yellow-800',label: 'Instructional' },
};

function ReadabilityMeter({ score }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
  const label = pct >= 70 ? 'Clear & Accessible' : pct >= 40 ? 'Moderate Complexity' : 'Complex / Dense';
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-gray-700">Readability Score</span>
        <span className="font-bold text-gray-900">{pct}/100</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default function SermonAIAnalyzer() {
  const [transcriptText, setTranscriptText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('input');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: { type: 'object', properties: { text: { type: 'string' } } },
      });
      if (result.status === 'success' && result.output?.text) {
        setTranscriptText(result.output.text);
        toast.success('Transcript extracted!');
      } else {
        toast.info('Could not auto-extract. Please paste manually.');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeSermon = async () => {
    const content = transcriptText.trim();
    if (content.length < 100) {
      toast.error('Please provide at least 100 characters');
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a biblical theologian, sermon coach, and language analyst. Perform a comprehensive deep analysis of the following sermon transcript. Be specific and actionable.

SERMON TRANSCRIPT:
${content.slice(0, 8000)}

Provide a JSON analysis including ALL of the following fields:

1. summary: 3-5 sentence overview
2. key_takeaways: 5-7 practical takeaways (strings)
3. theological_points: 4-6 objects with { point, scripture_references[] }
4. reflection_questions: 5 personal reflection questions
5. discussion_prompts: 4 group discussion prompts
6. main_scripture: primary scripture referenced
7. themes: 3-5 main themes
8. sermon_title_suggestion: suggested title

9. sentiment: overall emotional tone (one of: hopeful, encouraging, convicting, celebratory, somber, challenging, instructional)
10. sentiment_breakdown: object with keys matching sections of the sermon (intro/body/conclusion) each as a string description of tone
11. keywords: array of 8-12 most significant theological/topical keywords (strings)
12. readability_score: integer 0-100 (100 = very easy to understand, 0 = very complex)
13. word_count_estimate: estimated word count as integer
14. engagement_score: integer 0-100 rating how engaging and dynamic the delivery feels from the text
15. clarity_suggestions: array of 3-5 specific, actionable suggestions to improve clarity and engagement (strings)
16. strengths: array of 3-4 things the sermon does well (strings)
17. scripture_density: "low" | "moderate" | "high" — how much scripture is used relative to commentary
18. audience_accessibility: integer 0-100 (how accessible to a general audience)`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            key_takeaways: { type: 'array', items: { type: 'string' } },
            theological_points: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  point: { type: 'string' },
                  scripture_references: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            reflection_questions: { type: 'array', items: { type: 'string' } },
            discussion_prompts: { type: 'array', items: { type: 'string' } },
            main_scripture: { type: 'string' },
            themes: { type: 'array', items: { type: 'string' } },
            sermon_title_suggestion: { type: 'string' },
            sentiment: { type: 'string' },
            sentiment_breakdown: { type: 'object' },
            keywords: { type: 'array', items: { type: 'string' } },
            readability_score: { type: 'number' },
            word_count_estimate: { type: 'number' },
            engagement_score: { type: 'number' },
            clarity_suggestions: { type: 'array', items: { type: 'string' } },
            strengths: { type: 'array', items: { type: 'string' } },
            scripture_density: { type: 'string' },
            audience_accessibility: { type: 'number' },
          },
        },
      });
      setAnalysis(result);
      setActiveTab('summary');
      toast.success('Analysis complete!');
    } catch (e) {
      toast.error('Analysis failed. Please try again.');
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sentimentCfg = analysis?.sentiment ? (SENTIMENT_CONFIG[analysis.sentiment] || SENTIMENT_CONFIG.instructional) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sermon AI Analyzer</h2>
          <p className="text-sm text-gray-500">Deep insights: sentiment, themes, readability & improvement suggestions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="input">Input</TabsTrigger>
          <TabsTrigger value="summary" disabled={!analysis}>Summary</TabsTrigger>
          <TabsTrigger value="insights" disabled={!analysis}>Insights</TabsTrigger>
          <TabsTrigger value="theology" disabled={!analysis}>Theology</TabsTrigger>
          <TabsTrigger value="reflection" disabled={!analysis}>Reflect</TabsTrigger>
          <TabsTrigger value="discussion" disabled={!analysis}>Discuss</TabsTrigger>
        </TabsList>

        {/* Input Tab */}
        <TabsContent value="input" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-5">
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                <input type="file" className="hidden" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} disabled={isUploading} />
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                    <span className="text-sm text-indigo-600 font-medium">Upload sermon transcript</span>
                    <span className="text-xs text-gray-400 mt-1">.txt, .pdf, .docx supported</span>
                  </>
                )}
              </label>
              {uploadedFile && (
                <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-green-50 rounded-lg">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">{uploadedFile.name}</span>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="text-center text-sm text-gray-400">— or paste transcript below —</div>
          <Textarea
            value={transcriptText}
            onChange={e => setTranscriptText(e.target.value)}
            placeholder="Paste your sermon transcript here..."
            className="min-h-64 text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{transcriptText.length} characters</span>
            <Button
              onClick={analyzeSermon}
              disabled={isAnalyzing || transcriptText.trim().length < 100}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Analyze Sermon</>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-4 space-y-4">
          {analysis && (
            <>
              {analysis.sermon_title_suggestion && (
                <div className="bg-indigo-600 text-white rounded-xl p-4">
                  <p className="text-xs opacity-75 mb-1">Suggested Title</p>
                  <p className="text-lg font-bold">{analysis.sermon_title_suggestion}</p>
                  {analysis.main_scripture && (
                    <p className="text-sm opacity-80 mt-1">📖 {analysis.main_scripture}</p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {sentimentCfg && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sentimentCfg.color}`}>
                    ✦ Tone: {sentimentCfg.label}
                  </span>
                )}
                {analysis.scripture_density && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                    📖 Scripture: {analysis.scripture_density}
                  </span>
                )}
                {analysis.word_count_estimate && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    ~{analysis.word_count_estimate.toLocaleString()} words
                  </span>
                )}
              </div>

              {analysis.themes?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {analysis.themes.map((t, i) => <Badge key={i} variant="secondary">{t}</Badge>)}
                </div>
              )}

              <Card>
                <CardHeader><CardTitle className="text-base">Sermon Summary</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
                </CardContent>
              </Card>

              {analysis.key_takeaways?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" /> Key Takeaways</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.key_takeaways.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Insights Tab (NEW) */}
        <TabsContent value="insights" className="mt-4 space-y-4">
          {analysis && (
            <>
              {/* Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-5 space-y-3">
                    <ReadabilityMeter score={analysis.readability_score ?? 50} />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">Engagement</span>
                      <span className="font-bold text-gray-900">{analysis.engagement_score ?? 0}/100</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${analysis.engagement_score ?? 0}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">How dynamic & engaging the message feels</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">Accessibility</span>
                      <span className="font-bold text-gray-900">{analysis.audience_accessibility ?? 0}/100</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${analysis.audience_accessibility ?? 0}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">Suitable for a general audience</p>
                  </CardContent>
                </Card>
              </div>

              {/* Sentiment Breakdown */}
              {analysis.sentiment_breakdown && (
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500" /> Sentiment Breakdown</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(analysis.sentiment_breakdown).map(([section, desc]) => (
                      <div key={section} className="flex items-start gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 w-20 flex-shrink-0 mt-0.5 capitalize">{section}</span>
                        <p className="text-sm text-gray-700">{desc}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Keywords */}
              {analysis.keywords?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Tag className="w-4 h-4 text-blue-500" /> Key Terms & Themes</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">{kw}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Strengths */}
              {analysis.strengths?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Sermon Strengths</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {s}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Clarity Suggestions */}
              {analysis.clarity_suggestions?.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Suggestions for Improvement</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.clarity_suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-800">{s}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Theological Points Tab */}
        <TabsContent value="theology" className="mt-4 space-y-3">
          {analysis?.theological_points?.map((tp, i) => (
            <Card key={i} className="border-l-4 border-l-indigo-500">
              <CardContent className="pt-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">{tp.point}</p>
                {tp.scripture_references?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tp.scripture_references.map((ref, j) => (
                      <Badge key={j} variant="outline" className="text-xs gap-1">
                        <BookOpen className="w-3 h-3" /> {ref}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Reflection Tab */}
        <TabsContent value="reflection" className="mt-4 space-y-3">
          <p className="text-sm text-gray-500 mb-2">Personal reflection questions to deepen your application</p>
          {analysis?.reflection_questions?.map((q, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
              <p className="text-sm text-gray-800">{q}</p>
            </div>
          ))}
        </TabsContent>

        {/* Discussion Tab */}
        <TabsContent value="discussion" className="mt-4 space-y-3">
          <p className="text-sm text-gray-500 mb-2">Group discussion prompts for study groups or small groups</p>
          {analysis?.discussion_prompts?.map((p, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
              <MessageCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-800">{p}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}