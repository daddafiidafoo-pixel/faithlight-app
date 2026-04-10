import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import TranslationManager from '@/components/training/TranslationManager';

export default function TrainingTranslations() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Only admins and translators can access
        const isAuthorized = ['admin', 'translator', 'reviewer'].includes(currentUser.user_role);
        if (!isAuthorized) {
          window.location.href = '/Home';
        }
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Globe className="w-10 h-10 text-indigo-600" />
            Training Content Translations
          </h1>
          <p className="text-gray-600 mt-2">Manage and publish translations for lessons, quizzes, modules, and certificates</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="manage" className="space-y-6">
          <TabsList className="grid w-full max-w-md gap-4">
            <TabsTrigger value="manage">Manage Translations</TabsTrigger>
            <TabsTrigger value="guide">Translation Guide</TabsTrigger>
          </TabsList>

          {/* Manage Tab */}
          <TabsContent value="manage">
            <TranslationManager />
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide">
            <Card>
              <CardHeader>
                <CardTitle>How to Translate Training Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Supported Languages</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['English', 'Spanish', 'French', 'Portuguese', 'German', 'Swahili', 'Hausa', 'Yoruba', 'Amharic', 'Chinese'].map(lang => (
                      <div key={lang} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                        {lang}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Steps to Translate</h3>
                  <ol className="space-y-3 text-gray-700">
                    <li>1. <strong>Select Content Type:</strong> Choose whether you're translating a Module, Lesson, Quiz, Question, or Certificate</li>
                    <li>2. <strong>Enter Content ID:</strong> Paste the ID of the specific content you want to translate</li>
                    <li>3. <strong>Choose Target Language:</strong> Select which language to translate into</li>
                    <li>4. <strong>Create Translation:</strong> Click "Add Translation" and fill in the translated fields</li>
                    <li>5. <strong>Submit for Review:</strong> Translations start in "Draft" status</li>
                    <li>6. <strong>Publish:</strong> Once reviewed, click "Publish" to make available to learners</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Best Practices</h3>
                  <ul className="space-y-2 text-gray-700 list-disc list-inside">
                    <li>Maintain cultural and contextual accuracy</li>
                    <li>Keep formatting and markdown structure intact</li>
                    <li>Test translations in the actual learning interface</li>
                    <li>For quizzes, ensure all answer options are clearly translated</li>
                    <li>Review Scripture references in different translations</li>
                    <li>Keep terminology consistent across lessons</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Translation Status</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Draft:</strong> Translation in progress, not visible to learners</p>
                    <p><strong>Review:</strong> Awaiting administrator approval</p>
                    <p><strong>Published:</strong> Active and visible to learners in that language</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}