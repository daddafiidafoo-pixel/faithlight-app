import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Loader2, Copy, Check, Image, Quote } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SocialMediaClipGenerator({ sermon }) {
  const [generating, setGenerating] = useState(false);
  const [clips, setClips] = useState([]);
  const [selectedTab, setSelectedTab] = useState('quotes');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateQuotes = async () => {
    if (!sermon?.content) {
      toast.error('No sermon content available');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract 5 powerful, shareable quotes from this sermon that would work well on social media. Each quote should be:
- 1-2 sentences max
- Inspiring and impactful
- Standalone (makes sense without context)
- Under 280 characters

Sermon Title: ${sermon.title}
Topic: ${sermon.topic || 'N/A'}

Content:
${sermon.content}

Return only the quotes, one per line, without numbering or quotation marks.`,
        add_context_from_internet: false
      });

      const quotesArray = response.split('\n').filter(q => q.trim().length > 0).slice(0, 5);
      setClips(quotesArray);
      toast.success('Quotes generated!');
    } catch (error) {
      console.error('Error generating quotes:', error);
      toast.error('Failed to generate quotes');
    } finally {
      setGenerating(false);
    }
  };

  const generateImagePrompts = async () => {
    if (!sermon?.content) {
      toast.error('No sermon content available');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create 3 visual image prompts for social media posts about this sermon. Each prompt should describe a compelling image that represents the sermon's message.

Sermon Title: ${sermon.title}
Topic: ${sermon.topic || 'N/A'}
Main Message: ${sermon.summary || sermon.content.substring(0, 500)}

Format each prompt as: "Image description that would work for an AI image generator"`,
        add_context_from_internet: false
      });

      const promptsArray = response.split('\n').filter(p => p.trim().length > 0).slice(0, 3);
      setClips(promptsArray);
      toast.success('Image prompts generated!');
    } catch (error) {
      console.error('Error generating image prompts:', error);
      toast.error('Failed to generate image prompts');
    } finally {
      setGenerating(false);
    }
  };

  const generateSocialPosts = async () => {
    if (!sermon?.content) {
      toast.error('No sermon content available');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create 3 engaging social media post captions for this sermon suitable for Facebook, Instagram, and Twitter. Each should:
- Include a hook to grab attention
- Reference the sermon topic
- Include a call-to-action
- Use relevant emojis
- Be platform-appropriate length

Sermon Title: ${sermon.title}
Topic: ${sermon.topic || 'N/A'}
Summary: ${sermon.summary || sermon.content.substring(0, 500)}

Format: Platform name followed by the post text.`,
        add_context_from_internet: false
      });

      const postsArray = response.split('\n\n').filter(p => p.trim().length > 0).slice(0, 3);
      setClips(postsArray);
      toast.success('Social posts generated!');
    } catch (error) {
      console.error('Error generating social posts:', error);
      toast.error('Failed to generate social posts');
    } finally {
      setGenerating(false);
    }
  };

  const copyClip = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-600" />
          Social Media Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quotes">
              <Quote className="w-4 h-4 mr-2" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="images">
              <Image className="w-4 h-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger value="posts">
              <Share2 className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quotes" className="space-y-4 mt-4">
            <p className="text-sm text-gray-600">
              Generate shareable quotes from your sermon perfect for social media
            </p>
            <Button onClick={generateQuotes} disabled={generating} className="w-full">
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Quote className="w-4 h-4 mr-2" />}
              Generate Quotes
            </Button>
            {clips.length > 0 && (
              <div className="space-y-3">
                {clips.map((clip, index) => (
                  <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200 relative group">
                    <p className="text-sm font-medium text-gray-800 italic">"{clip}"</p>
                    <Button
                      onClick={() => copyClip(clip, index)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="space-y-4 mt-4">
            <p className="text-sm text-gray-600">
              Get AI image prompts to create visual content for your sermon
            </p>
            <Button onClick={generateImagePrompts} disabled={generating} className="w-full">
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Image className="w-4 h-4 mr-2" />}
              Generate Image Prompts
            </Button>
            {clips.length > 0 && (
              <div className="space-y-3">
                {clips.map((clip, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                    <p className="text-sm text-gray-700">{clip}</p>
                    <Button
                      onClick={() => copyClip(clip, index)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-4 mt-4">
            <p className="text-sm text-gray-600">
              Create ready-to-post captions for Facebook, Instagram, and Twitter
            </p>
            <Button onClick={generateSocialPosts} disabled={generating} className="w-full">
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
              Generate Posts
            </Button>
            {clips.length > 0 && (
              <div className="space-y-3">
                {clips.map((clip, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative group">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{clip}</p>
                    <Button
                      onClick={() => copyClip(clip, index)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}