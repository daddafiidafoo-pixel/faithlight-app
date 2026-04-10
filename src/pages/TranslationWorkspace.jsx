import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, CheckCircle2, AlertCircle, Clock, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function TranslationWorkspace() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Check if user is a translator or reviewer
        if (!['translator', 'reviewer', 'admin'].includes(currentUser.user_role)) {
          alert('Access denied. Translator/Reviewer role required.');
          window.location.href = '/';
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: translations = [] } = useQuery({
    queryKey: ['translations', user?.id],
    queryFn: () => base44.entities.Translation.filter({}),
    enabled: !!user,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => base44.entities.Lesson.filter({ status: 'approved' }),
    enabled: !!user,
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: () => base44.entities.Language.filter({ is_active: true }),
    enabled: !!user,
  });

  const isTranslator = user?.user_role === 'translator';
  const isReviewer = ['reviewer', 'admin'].includes(user?.user_role);

  // Filter translations based on user role
  const userTranslations = isTranslator
    ? translations.filter(t => t.translator_id === user?.id)
    : isReviewer
    ? translations.filter(t => t.status === 'submitted')
    : [];

  const availableLessons = lessons.filter(l => 
    !translations.some(t => t.entity_id === l.id && t.status !== 'rejected')
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Translation Workspace</h1>
          <p className="text-gray-600">
            {isTranslator ? 'Translate lessons to expand global reach' : 'Review and validate translations'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {userTranslations.filter(t => t.status === 'draft' || t.status === 'submitted').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-3xl font-bold text-gray-900">
                  {userTranslations.filter(t => t.status === 'approved').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-gray-600 text-sm">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">
                  {translations.filter(t => t.status === 'submitted').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            {isTranslator && <TabsTrigger value="available">Available</TabsTrigger>}
            {isTranslator && <TabsTrigger value="my-translations">My Translations</TabsTrigger>}
            {isReviewer && <TabsTrigger value="review-queue">Review Queue</TabsTrigger>}
            {isReviewer && <TabsTrigger value="approved">Approved</TabsTrigger>}
          </TabsList>

          {/* Available Lessons (Translator) */}
          {isTranslator && (
            <TabsContent value="available">
              <div className="space-y-4">
                {availableLessons.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No lessons available for translation</p>
                    </CardContent>
                  </Card>
                ) : (
                  availableLessons.map(lesson => (
                    <TranslateLesson key={lesson.id} lesson={lesson} languages={languages} onTranslated={() => queryClient.invalidateQueries(['translations'])} />
                  ))
                )}
              </div>
            </TabsContent>
          )}

          {/* My Translations (Translator) */}
          {isTranslator && (
            <TabsContent value="my-translations">
              <div className="space-y-4">
                {userTranslations.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-600">No translations yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  userTranslations.map(translation => (
                    <TranslationCard key={translation.id} translation={translation} lessons={lessons} isReview={false} />
                  ))
                )}
              </div>
            </TabsContent>
          )}

          {/* Review Queue (Reviewer) */}
          {isReviewer && (
            <TabsContent value="review-queue">
              <div className="space-y-4">
                {translations.filter(t => t.status === 'submitted').length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <p className="text-gray-600">No translations to review</p>
                    </CardContent>
                  </Card>
                ) : (
                  translations.filter(t => t.status === 'submitted').map(translation => (
                    <ReviewTranslation key={translation.id} translation={translation} lessons={lessons} onReviewed={() => queryClient.invalidateQueries(['translations'])} />
                  ))
                )}
              </div>
            </TabsContent>
          )}

          {/* Approved (Reviewer) */}
          {isReviewer && (
            <TabsContent value="approved">
              <div className="space-y-4">
                {translations.filter(t => t.status === 'approved').length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-600">No approved translations yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  translations.filter(t => t.status === 'approved').map(translation => (
                    <TranslationCard key={translation.id} translation={translation} lessons={lessons} isReview={false} />
                  ))
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function TranslateLesson({ lesson, languages, onTranslated }) {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showTranslateDialog, setShowTranslateDialog] = useState(false);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.content}</p>
            <Badge variant="outline">{lesson.language_code}</Badge>
          </div>
          <TranslateDialog
            lesson={lesson}
            languages={languages}
            onTranslated={() => {
              setShowTranslateDialog(false);
              onTranslated();
            }}
            open={showTranslateDialog}
            onOpenChange={setShowTranslateDialog}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function TranslateDialog({ lesson, languages, onTranslated, open, onOpenChange }) {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    getUser();
  }, []);

  const createTranslationMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Translation.create(data),
    onSuccess: () => {
      setSelectedLanguage('');
      setTranslatedTitle('');
      setTranslatedContent('');
      queryClient.invalidateQueries(['translations']);
      onTranslated();
    }
  });

  const handleSubmit = () => {
    if (!selectedLanguage || !translatedTitle || !translatedContent) {
      alert('Please fill in all fields');
      return;
    }

    createTranslationMutation.mutate({
      entity_type: 'Lesson',
      entity_id: lesson.id,
      source_language: lesson.language_code,
      target_language: selectedLanguage,
      translator_id: user?.id,
      translator_name: user?.full_name,
      translated_content: {
        title: translatedTitle,
        content: translatedContent
      },
      status: 'draft'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <BookOpen className="w-4 h-4" />
          Translate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Translate: {lesson.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Target Language</Label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full mt-2 p-2 border rounded"
            >
              <option value="">Select language...</option>
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.native_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Translated Title</Label>
            <input
              type="text"
              value={translatedTitle}
              onChange={(e) => setTranslatedTitle(e.target.value)}
              placeholder="Enter translated title"
              className="w-full mt-2 p-2 border rounded"
            />
          </div>
          <div>
            <Label>Translated Content</Label>
            <Textarea
              value={translatedContent}
              onChange={(e) => setTranslatedContent(e.target.value)}
              placeholder="Enter translated content"
              rows={6}
              className="mt-2"
            />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Keep Scripture references intact. Use natural, church-familiar language.
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Save as Draft
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TranslationCard({ translation, lessons, isReview }) {
  const lesson = lessons.find(l => l.id === translation.entity_id);
  const sourceLanguage = lesson?.language_code || 'en';

  const statusIcon = {
    draft: <Clock className="w-4 h-4 text-gray-500" />,
    submitted: <Clock className="w-4 h-4 text-yellow-500" />,
    approved: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    rejected: <AlertCircle className="w-4 h-4 text-red-500" />
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {statusIcon[translation.status]}
              <h3 className="text-lg font-semibold text-gray-900">{translation.translated_content?.title || lesson?.title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {sourceLanguage} → {translation.target_language}
            </p>
            <Badge>{translation.status}</Badge>
            {translation.reviewer_feedback && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700"><strong>Feedback:</strong> {translation.reviewer_feedback}</p>
              </div>
            )}
          </div>
          {translation.status === 'draft' && (
            <Button variant="outline" size="sm">
              <Send className="w-4 h-4 mr-1" />
              Submit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewTranslation({ translation, lessons, onReviewed }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();
  const lesson = lessons.find(l => l.id === translation.entity_id);

  const approveMutation = useMutation({
    mutationFn: () =>
      base44.entities.Translation.update(translation.id, {
        status: 'approved',
        reviewer_id: '', // Would be set to current user
        reviewed_date: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['translations']);
      onReviewed();
    }
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      base44.entities.Translation.update(translation.id, {
        status: 'rejected',
        reviewer_feedback: feedback,
        reviewer_id: '', // Would be set to current user
        reviewed_date: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['translations']);
      onReviewed();
    }
  });

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{translation.translated_content?.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Translator: {translation.translator_name}
            </p>
            <p className="text-sm text-gray-600">
              Source: {translation.source_language} → Target: {translation.target_language}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-gray-200 mb-4">
          <p className="text-sm text-gray-700">{translation.translated_content?.content}</p>
        </div>

        {showFeedback ? (
          <div className="space-y-3 mb-4">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback for the translator..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFeedback(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => rejectMutation.mutate()}
              >
                Reject
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFeedback(true)}
            >
              Request Changes
            </Button>
            <Button
              onClick={() => approveMutation.mutate()}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}