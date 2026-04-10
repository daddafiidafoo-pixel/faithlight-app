import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';

export default function SermonAIAssistantPanel() {
  const [passage, setPassage] = useState('');
  const [theme, setTheme] = useState('');
  const [audienceLevel, setAudienceLevel] = useState('mixed');
  const [activeTab, setActiveTab] = useState('outline');
  const [copiedId, setCopiedId] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async (contentType) => {
      const response = await base44.functions.invoke('generateSermonContent', {
        contentType,
        passage: passage.trim(),
        theme: theme.trim(),
        audienceLevel,
        denominationContext: 'evangelical',
        language: 'en'
      });
      return response.data;
    }
  });

  const handleGenerate = (contentType) => {
    if (!passage.trim() && !theme.trim()) {
      alert('Please enter a Bible passage or sermon theme');
      return;
    }
    generateMutation.mutate(contentType);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const results = generateMutation.data?.results || {};

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Sermon Preparation Assistant
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Enter a Bible passage or theme to generate sermon content
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Bible Passage (e.g., John 3:16)
              </label>
              <Input
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
                placeholder="Enter passage or leave blank"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Or Sermon Theme
              </label>
              <Input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., God's Love, Forgiveness, Leadership"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Audience Level
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'new_believers', label: '🌱 New Believers' },
                { value: 'growing', label: '🌿 Growing in Faith' },
                { value: 'mature_leaders', label: '🔥 Leaders' },
                { value: 'mixed', label: '👥 Mixed Congregation' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setAudienceLevel(option.value)}
                  className={`px-3 py-2 rounded-lg font-sm transition-all ${
                    audienceLevel === option.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="cross_references">Cross-Refs</TabsTrigger>
          <TabsTrigger value="application_points">Application</TabsTrigger>
          <TabsTrigger value="intro_conclusion">Intro & Conclusion</TabsTrigger>
        </TabsList>

        {/* Outline Tab */}
        <TabsContent value="outline" className="space-y-4">
          <Button
            onClick={() => handleGenerate('outline')}
            disabled={generateMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            {generateMutation.isPending && generateMutation.variables?.contentType === 'outline' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Sermon Outline
              </>
            )}
          </Button>

          {results.outline && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">Your Sermon Outline</h3>
                  <button
                    onClick={() => copyToClipboard(results.outline, 'outline')}
                    className="p-2 hover:bg-white rounded transition-colors"
                  >
                    {copiedId === 'outline' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-white p-4 rounded border border-blue-200">
                  {results.outline}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cross-References Tab */}
        <TabsContent value="cross_references" className="space-y-4">
          <Button
            onClick={() => handleGenerate('cross_references')}
            disabled={generateMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            {generateMutation.isPending && generateMutation.variables?.contentType === 'cross_references' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Suggesting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Suggest Cross-References
              </>
            )}
          </Button>

          {results.crossReferences && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">Supporting Passages</h3>
                  <button
                    onClick={() => copyToClipboard(results.crossReferences, 'crossref')}
                    className="p-2 hover:bg-white rounded transition-colors"
                  >
                    {copiedId === 'crossref' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-white p-4 rounded border border-green-200">
                  {results.crossReferences}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Application Tab */}
        <TabsContent value="application_points" className="space-y-4">
          <Button
            onClick={() => handleGenerate('application_points')}
            disabled={generateMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            {generateMutation.isPending && generateMutation.variables?.contentType === 'application_points' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Application Points
              </>
            )}
          </Button>

          {results.applicationPoints && (
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">Application for {audienceLevel}</h3>
                  <button
                    onClick={() => copyToClipboard(results.applicationPoints, 'app')}
                    className="p-2 hover:bg-white rounded transition-colors"
                  >
                    {copiedId === 'app' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-white p-4 rounded border border-purple-200">
                  {results.applicationPoints}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Intro & Conclusion Tab */}
        <TabsContent value="intro_conclusion" className="space-y-4">
          <Button
            onClick={() => handleGenerate('intro_conclusion')}
            disabled={generateMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            {generateMutation.isPending && generateMutation.variables?.contentType === 'intro_conclusion' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Drafting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Draft Intro & Conclusion
              </>
            )}
          </Button>

          {results.introConclusion && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">Opening & Closing</h3>
                  <button
                    onClick={() => copyToClipboard(results.introConclusion, 'intro')}
                    className="p-2 hover:bg-white rounded transition-colors"
                  >
                    {copiedId === 'intro' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-white p-4 rounded border border-amber-200">
                  {results.introConclusion}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Full Sermon Prep Option */}
      <Card className="border-2 border-dashed border-indigo-300">
        <CardContent className="pt-6">
          <Button
            onClick={() => handleGenerate('full_sermon_prep')}
            disabled={generateMutation.isPending}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2 text-lg py-6"
          >
            {generateMutation.isPending && generateMutation.variables?.contentType === 'full_sermon_prep' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Preparing Full Sermon...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                📋 Generate Full Sermon Prep (All Above)
              </>
            )}
          </Button>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Creates outline + cross-references + applications + intro/conclusion in one go
          </p>
        </CardContent>
      </Card>

      {/* Error Display */}
      {generateMutation.isError && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700">
              ❌ Error: {generateMutation.error?.message || 'Generation failed'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}