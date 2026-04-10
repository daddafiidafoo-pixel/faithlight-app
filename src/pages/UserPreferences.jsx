import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Globe, BookOpen, Sparkles, Bell, Lock, Palette } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UserPreferences() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Language & Content Preferences
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [interfaceLanguage, setInterfaceLanguage] = useState('en');

  // Sermon Preferences
  const [preferredSermonStyle, setPreferredSermonStyle] = useState('expository');
  const [targetAudience, setTargetAudience] = useState('adults');
  const [readingLevel, setReadingLevel] = useState('medium');
  const [theologicalFocus, setTheologicalFocus] = useState('general');
  const [preferredLength, setPreferredLength] = useState(30);

  // AI Generation Preferences
  const [useAIGeneration, setUseAIGeneration] = useState(true);
  const [aiDetailLevel, setAiDetailLevel] = useState('standard');
  const [includeOriginalLanguage, setIncludeOriginalLanguage] = useState(true);

  // Notification Preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState('weekly');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Load saved preferences
        if (currentUser.preferred_language_code) {
          setPreferredLanguage(currentUser.preferred_language_code);
        }
        if (currentUser.sermon_prep_style) {
          setPreferredSermonStyle(currentUser.sermon_prep_style);
        }
        if (currentUser.preferred_audience) {
          setTargetAudience(currentUser.preferred_audience);
        }
        if (currentUser.preferred_reading_level) {
          setReadingLevel(currentUser.preferred_reading_level);
        }
        if (currentUser.theological_focus) {
          setTheologicalFocus(currentUser.theological_focus);
        }
        if (currentUser.preferred_sermon_length) {
          setPreferredLength(currentUser.preferred_sermon_length);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load preferences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        preferred_language_code: preferredLanguage,
        sermon_prep_style: preferredSermonStyle,
        preferred_audience: targetAudience,
        preferred_reading_level: readingLevel,
        theological_focus: theologicalFocus,
        preferred_sermon_length: preferredLength,
        ai_generation_enabled: useAIGeneration,
        ai_detail_level: aiDetailLevel,
        include_original_language: includeOriginalLanguage,
        notifications_enabled: notificationsEnabled,
        email_digest_frequency: emailDigest,
      });

      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Loading preferences...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Please log in to manage preferences</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Settings className="w-10 h-10 text-indigo-600" />
            Preferences & Settings
          </h1>
          <p className="text-gray-600">Customize your FaithLight experience and improve AI generation accuracy</p>
        </div>

        <Tabs defaultValue="sermon" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sermon" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Sermon</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Language</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notify</span>
            </TabsTrigger>
          </TabsList>

          {/* Sermon Preferences */}
          <TabsContent value="sermon" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Sermon & Teaching Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Preferred Sermon Style</label>
                    <Select value={preferredSermonStyle} onValueChange={setPreferredSermonStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expository">Expository (verse-by-verse)</SelectItem>
                        <SelectItem value="topical">Topical (theme-focused)</SelectItem>
                        <SelectItem value="teaching">Teaching (educational)</SelectItem>
                        <SelectItem value="evangelistic">Evangelistic</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">Used for AI sermon generation</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Audience</label>
                    <Select value={targetAudience} onValueChange={setTargetAudience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youth">Youth (13-18)</SelectItem>
                        <SelectItem value="young-adults">Young Adults (18-35)</SelectItem>
                        <SelectItem value="adults">Adults (35+)</SelectItem>
                        <SelectItem value="mixed">Mixed Audience</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">Affects language and examples</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Reading Level</label>
                    <Select value={readingLevel} onValueChange={setReadingLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple (Children/New Believers)</SelectItem>
                        <SelectItem value="medium">Medium (General Audience)</SelectItem>
                        <SelectItem value="advanced">Advanced (Theological)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">Vocabulary and complexity level</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Theological Focus</label>
                    <Select value={theologicalFocus} onValueChange={setTheologicalFocus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Christian</SelectItem>
                        <SelectItem value="reformed">Reformed/Calvinist</SelectItem>
                        <SelectItem value="arminian">Arminian/Wesleyan</SelectItem>
                        <SelectItem value="pentecostal">Pentecostal/Charismatic</SelectItem>
                        <SelectItem value="baptist">Baptist</SelectItem>
                        <SelectItem value="evangelical">Evangelical</SelectItem>
                        <SelectItem value="catholic">Catholic</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">Theological perspective for AI content</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Preferred Sermon Length</label>
                    <Select value={preferredLength.toString()} onValueChange={(v) => setPreferredLength(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">Default for AI generation</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    💡 These preferences are used to personalize sermon recommendations and improve AI-generated content to match your style.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Preferences */}
          <TabsContent value="language" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  Language & Content Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Preferred Content Language</label>
                    <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                        <SelectItem value="fr">🇫🇷 French</SelectItem>
                        <SelectItem value="de">🇩🇪 German</SelectItem>
                        <SelectItem value="pt">🇵🇹 Portuguese</SelectItem>
                        <SelectItem value="zh">🇨🇳 Chinese</SelectItem>
                        <SelectItem value="ar">🇸🇦 Arabic</SelectItem>
                        <SelectItem value="ru">🇷🇺 Russian</SelectItem>
                        <SelectItem value="hi">🇮🇳 Hindi</SelectItem>
                        <SelectItem value="sw">🇰🇪 Swahili</SelectItem>
                        <SelectItem value="om">🇪🇹 Oromo</SelectItem>
                        <SelectItem value="am">🇪🇹 Amharic</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">Affects AI-generated sermons and content</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Interface Language</label>
                    <Select value={interfaceLanguage} onValueChange={setInterfaceLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                        <SelectItem value="fr">🇫🇷 French</SelectItem>
                        <SelectItem value="om">🇪🇹 Oromo</SelectItem>
                        <SelectItem value="am">🇪🇹 Amharic</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">Language for the app interface</p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900">
                    🌍 Your preferred languages determine which sermons appear first in searches and what language AI generates content in.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Generation Preferences */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div>
                      <p className="font-medium text-gray-900">Enable AI Generation</p>
                      <p className="text-sm text-gray-600">Allow AI to generate sermons and content</p>
                    </div>
                    <Button
                      variant={useAIGeneration ? 'default' : 'outline'}
                      onClick={() => setUseAIGeneration(!useAIGeneration)}
                    >
                      {useAIGeneration ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">AI Detail Level</label>
                    <Select value={aiDetailLevel} onValueChange={setAiDetailLevel} disabled={!useAIGeneration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brief">Brief (Quick outlines)</SelectItem>
                        <SelectItem value="standard">Standard (Balanced)</SelectItem>
                        <SelectItem value="detailed">Detailed (In-depth analysis)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">How much detail AI includes in generated content</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-gray-900">Include Original Language References</p>
                      <p className="text-sm text-gray-600">Show Greek/Hebrew words in AI sermons</p>
                    </div>
                    <Button
                      variant={includeOriginalLanguage ? 'default' : 'outline'}
                      onClick={() => setIncludeOriginalLanguage(!includeOriginalLanguage)}
                      disabled={!useAIGeneration}
                    >
                      {includeOriginalLanguage ? 'Included' : 'Excluded'}
                    </Button>
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-indigo-900">
                    🤖 These settings customize how AI generates sermons, outlines, and suggestions. Your preferences from the Sermon & Teaching tab also affect AI output.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Preferences */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Notification & Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <p className="font-medium text-gray-900">Enable Notifications</p>
                      <p className="text-sm text-gray-600">Receive in-app notifications</p>
                    </div>
                    <Button
                      variant={notificationsEnabled ? 'default' : 'outline'}
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    >
                      {notificationsEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Digest Frequency</label>
                    <Select value={emailDigest} onValueChange={setEmailDigest} disabled={!notificationsEnabled}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Never</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">How often to receive email summaries</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">
                    📧 We'll send you updates about new sermons, community highlights, and personalized recommendations based on your interests.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button 
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>

        {/* Info Box */}
        <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900 mb-2">How Your Preferences Help</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ AI generates sermons tailored to your style and audience</li>
                  <li>✓ Personalized sermon recommendations in the library</li>
                  <li>✓ Better content suggestions based on your interests</li>
                  <li>✓ Faster generation with pre-configured settings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}