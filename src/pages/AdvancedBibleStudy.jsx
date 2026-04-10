import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Sparkles, Layers, TrendingUp, Loader2, Bookmark } from 'lucide-react';
import ComparativeVerseExplorer from '../components/bible/ComparativeVerseExplorer';
import TheologicalDeepDive from '../components/bible/TheologicalDeepDive';

export default function AdvancedBibleStudy() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('comparative');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced Bible Study Tools</h1>
          <p className="text-gray-600">Deep theological exploration and comparative Scripture analysis</p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border-indigo-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('comparative')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <Layers className="w-5 h-5" />
                Comparative Verse Explorer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Discover how different Bible verses address similar themes, doctrines, or life situations. 
                Compare parallel passages and explore thematic connections.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('deepdive')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Sparkles className="w-5 h-5" />
                Theological Deep-Dive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Generate comprehensive theological studies on specific passages, keywords, or doctrines. 
                Explore historical context, original languages, and scholarly perspectives.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tools */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="comparative" className="gap-2">
              <Layers className="w-4 h-4" />
              Comparative Explorer
            </TabsTrigger>
            <TabsTrigger value="deepdive" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Theological Deep-Dive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparative">
            <ComparativeVerseExplorer user={user} />
          </TabsContent>

          <TabsContent value="deepdive">
            <TheologicalDeepDive user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}