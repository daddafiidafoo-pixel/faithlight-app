import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, Lightbulb, FileText, Copy, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function AISermonAssistant({ user }) {
  const [passage, setPassage] = useState('');
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState([]);
  const [results, setResults] = useState({
    outline: null,
    insights: null,
    illustrations: null,
    fullSermon: null
  });

  const loadPersonalizedSuggestions = async () => {
    if (!user?.comprehensive_profile) return;
    
    const profile = user.comprehensive_profile;
    const interests = profile.theological_interests?.slice(0, 3).join(', ') || '';
    const growth = profile.areas_of_growth?.slice(0, 2).join(', ') || '';
    
    setPersonalizedSuggestions([
      `${interests ? 'Explore ' + interests : 'Bible study'}`,
      `Overcoming ${growth || 'spiritual challenges'}`,
      `${profile.sermon_prep_focus?.[0] || 'Practical teaching'}`
    ]);
  };

  React.useEffect(() => {
    loadPersonalizedSuggestions();
  }, [user]);

  const generateOutline = async () => {
    if (!passage && !theme) {
      toast.error('Please enter a passage or theme');
      return;
    }

    setLoading(true);
    try {
      const profileContext = user?.comprehensive_profile ? `

PERSONALIZE FOR THIS USER'S PROFILE:
- Ministry Goals: ${user.comprehensive_profile.ministry_goals?.join(', ') || 'General ministry'}
- Sermon Focus: ${user.comprehensive_profile.sermon_prep_focus?.join(', ') || 'General preaching'}
- Content Depth: ${user.comprehensive_profile.preferred_content_depth || 'medium'}

Tailor the outline to address their ministry focus and content depth preference.` : '';

      const prompt = `Generate a structured sermon outline for: "${passage || theme}"${profileContext}

Create a clear, actionable outline with:

**SERMON OUTLINE**

**Title:** [Compelling sermon title]

**Main Scripture:** [Primary passage]

**Big Idea (One Sentence):**
[Central message]

**INTRODUCTION**
- Hook: [Attention-grabbing opening]
- Context: [Background]
- Thesis: [Main point]

**MAIN POINTS** (3-4 points)

**Point 1: [Title]**
- Main Idea: [Explanation]
- Scripture: [Verse references]
- Application: [How to apply]

**Point 2: [Title]**
- Main Idea: [Explanation]
- Scripture: [Verse references]
- Application: [How to apply]

**Point 3: [Title]**
- Main Idea: [Explanation]
- Scripture: [Verse references]
- Application: [How to apply]

**CONCLUSION**
- Summary: [Recap]
- Call to Action: [Specific response]
- Closing: [Final thought]

**DISCUSSION QUESTIONS**
1. [Reflection question]
2. [Application question]
3. [Group discussion question]`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setResults(prev => ({ ...prev, outline: response }));
      toast.success('Outline generated!');
    } catch (error) {
      toast.error('Failed to generate outline');
    } finally {
      setLoading(false);
    }
  };

  const generateTheologicalInsights = async () => {
    if (!passage && !theme) {
      toast.error('Please enter a passage or theme');
      return;
    }

    setLoading(true);
    try {
      const prompt = `Provide deep theological insights for preaching on: "${passage || theme}"

Include:

**THEOLOGICAL INSIGHTS**

**1. BIBLICAL CONTEXT**
- Historical background
- Cultural setting
- Author's original intent
- Place in redemptive history

**2. KEY THEOLOGICAL THEMES**
- Central doctrines addressed
- How this connects to the gospel
- Related theological concepts
- Connections to the broader biblical narrative

**3. WORD STUDIES** (if applicable)
- Important Greek/Hebrew words
- Nuances in translation
- Theological significance

**4. CROSS-REFERENCES**
- Related passages that shed light
- Old Testament/New Testament connections
- Parallel teachings in Scripture

**5. DENOMINATIONAL PERSPECTIVES**
- How different traditions interpret this
- Areas of consensus
- Points of theological emphasis

**6. CONTEMPORARY RELEVANCE**
- Why this matters today
- Modern applications of ancient truth
- Addressing current questions

**7. SCHOLARLY INSIGHTS**
- What biblical scholars highlight
- Historical interpretations
- Contemporary commentary

Format with clear sections and citations where relevant.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setResults(prev => ({ ...prev, insights: response }));
      toast.success('Theological insights generated!');
    } catch (error) {
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const generateIllustrations = async () => {
    if (!passage && !theme) {
      toast.error('Please enter a passage or theme');
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate powerful sermon illustrations for: "${passage || theme}"

Provide 6-8 diverse illustrations:

**SERMON ILLUSTRATIONS**

**1. PERSONAL STORY**
[Relatable personal experience that illustrates the point]

**2. HISTORICAL EXAMPLE**
[Story from church history or world history]

**3. CONTEMPORARY EXAMPLE**
[Recent news or cultural reference]

**4. ANALOGY/METAPHOR**
[Clear comparison that explains the concept]

**5. SCIENTIFIC/NATURE ILLUSTRATION**
[Example from creation that illuminates truth]

**6. LITERATURE/FILM REFERENCE**
[Story or scene that connects]

**7. EVERYDAY LIFE SCENARIO**
[Common experience people can relate to]

**8. BIBLICAL STORY**
[Different Bible passage that illustrates the same principle]

For each illustration:
- Make it vivid and memorable
- Keep it concise (2-3 paragraphs max)
- Show clear connection to the sermon point
- Make it appropriate for church settings
- Ensure cultural sensitivity

Format with clear headings and engaging narrative style.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setResults(prev => ({ ...prev, illustrations: response }));
      toast.success('Illustrations generated!');
    } catch (error) {
      toast.error('Failed to generate illustrations');
    } finally {
      setLoading(false);
    }
  };

  const generateFullSermon = async () => {
    if (!passage && !theme) {
      toast.error('Please enter a passage or theme');
      return;
    }

    setLoading(true);
    try {
      const prompt = `Write a complete, ready-to-preach sermon on: "${passage || theme}"

Create a comprehensive sermon with:

**COMPLETE SERMON MANUSCRIPT**

**Title:** [Compelling, memorable title]

**Main Scripture:** [Primary passage with reference]

**Opening Prayer Suggestion:**
[Brief prayer to open the message]

---

**INTRODUCTION** (2-3 minutes)

[Engaging opening that captures attention - could be a story, question, or observation]

[Transition that introduces the topic and why it matters]

[State the big idea clearly]

---

**BODY** (Main teaching - 3-4 points)

**I. [FIRST MAIN POINT - Clear, memorable heading]**

[Explanation of this point - what does Scripture say?]

[Supporting verses and evidence]

[Illustration that makes it concrete]

[Application - so what? how does this change how we live?]

**II. [SECOND MAIN POINT]**

[Explanation]

[Biblical support]

[Illustration]

[Application]

**III. [THIRD MAIN POINT]**

[Explanation]

[Biblical support]
 
[Illustration]

[Application]

[Optional Fourth Point if needed]

---

**CONCLUSION** (2-3 minutes)

[Brief recap of main points]

[Return to opening illustration/question with resolution]

[Clear, specific call to action - what should listeners do this week?]

[Final inspiring thought]

**Closing Prayer:**
[Suggested prayer to conclude]

---

**ADDITIONAL RESOURCES**

**For Further Study:**
- [Related passages]
- [Recommended resources]

**Small Group Discussion Questions:**
1. [Personal reflection]
2. [Group discussion]
3. [Application challenge]

**This Week's Challenge:**
[Specific, measurable action step]

---

STYLE NOTES:
- Use conversational, pastoral tone
- Include brief transitions between points
- Balance exposition with application
- Make it preachable (not just readable)
- Include brief parenthetical delivery notes where helpful
- Aim for 25-30 minute delivery time
- Keep sentences varied in length
- Use inclusive language
- Ground everything in Scripture`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setResults(prev => ({ ...prev, fullSermon: response }));
      toast.success('Full sermon generated!');
    } catch (error) {
      toast.error('Failed to generate sermon');
    } finally {
      setLoading(false);
    }
  };

  const generateAll = async () => {
    if (!passage && !theme) {
      toast.error('Please enter a passage or theme');
      return;
    }

    setLoading(true);
    try {
      await Promise.all([
        generateOutline(),
        generateTheologicalInsights(),
        generateIllustrations(),
        generateFullSermon()
      ]);
    } catch (error) {
      toast.error('Some components failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI Sermon Preparation Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {personalizedSuggestions.length > 0 && (
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
              <p className="text-xs font-medium text-indigo-900 mb-2">✨ Suggested for you:</p>
              <div className="flex gap-2 flex-wrap">
                {personalizedSuggestions.map((suggestion, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="cursor-pointer hover:bg-indigo-100"
                    onClick={() => setTheme(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium block mb-2">Bible Passage (optional)</label>
            <Input
              placeholder="e.g., John 3:16-21, Psalm 23, Romans 8"
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Sermon Theme (optional)</label>
            <Input
              placeholder="e.g., Grace, Faith, Prayer, God's Love"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button
              onClick={generateOutline}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Outline
            </Button>
            <Button
              onClick={generateTheologicalInsights}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Insights
            </Button>
            <Button
              onClick={generateIllustrations}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Illustrations
            </Button>
            <Button
              onClick={generateFullSermon}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Full Sermon
            </Button>
            <Button
              onClick={generateAll}
              disabled={loading}
              className="gap-2 col-span-2 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate All
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(results.outline || results.insights || results.illustrations || results.fullSermon) && (
        <Tabs defaultValue="outline" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="outline">Outline</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="illustrations">Illustrations</TabsTrigger>
            <TabsTrigger value="sermon">Full Sermon</TabsTrigger>
          </TabsList>

          <TabsContent value="outline">
            {results.outline ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Sermon Outline</CardTitle>
                    <Button
                      onClick={() => copyToClipboard(results.outline)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown>{results.outline}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Click "Outline" to generate a sermon outline
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights">
            {results.insights ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Theological Insights</CardTitle>
                    <Button
                      onClick={() => copyToClipboard(results.insights)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown>{results.insights}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Click "Insights" to generate theological insights
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="illustrations">
            {results.illustrations ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Sermon Illustrations</CardTitle>
                    <Button
                      onClick={() => copyToClipboard(results.illustrations)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown>{results.illustrations}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Click "Illustrations" to generate sermon illustrations
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sermon">
            {results.fullSermon ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Complete Sermon</CardTitle>
                    <Button
                      onClick={() => copyToClipboard(results.fullSermon)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown>{results.fullSermon}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Click "Full Sermon" to generate a complete sermon manuscript
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}