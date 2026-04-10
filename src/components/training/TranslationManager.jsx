import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader, Plus, Edit2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'de', name: 'German' },
  { code: 'sw', name: 'Swahili' },
  { code: 'ha', name: 'Hausa' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'am', name: 'Amharic' },
  { code: 'zh', name: 'Chinese' },
];

export default function TranslationManager() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [contentType, setContentType] = useState('lesson');
  const [contentId, setContentId] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translationData, setTranslationData] = useState({
    title: '',
    description: '',
    content: '',
  });
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: translations = [] } = useQuery({
    queryKey: ['training-translations', contentType, contentId],
    queryFn: async () => {
      if (!contentId) return [];
      const query = { content_type: contentType };
      if (contentId) query.content_id = contentId;
      return await base44.entities.TrainingContentTranslation.filter(query, '-created_date');
    },
    enabled: !!contentId,
  });

  const createTranslation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.TrainingContentTranslation.create({
        content_type: contentType,
        content_id: contentId,
        language_code: targetLanguage,
        language_name: LANGUAGES.find(l => l.code === targetLanguage)?.name,
        title: data.title,
        description: data.description,
        content: data.content,
        translated_by_user_id: user.id,
        translated_by_name: user.full_name,
        status: 'draft',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-translations'] });
      toast.success('Translation created');
      setShowDialog(false);
      setTranslationData({ title: '', description: '', content: '' });
    },
  });

  const updateTranslation = useMutation({
    mutationFn: (data) =>
      base44.entities.TrainingContentTranslation.update(editingTranslation.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-translations'] });
      toast.success('Translation updated');
      setEditingTranslation(null);
      setShowDialog(false);
      setTranslationData({ title: '', description: '', content: '' });
    },
  });

  const publishTranslation = useMutation({
    mutationFn: (id) =>
      base44.entities.TrainingContentTranslation.update(id, { status: 'published' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-translations'] });
      toast.success('Translation published');
    },
  });

  const handleSubmit = () => {
    if (!translationData.title || !translationData.content) {
      toast.error('Fill in required fields');
      return;
    }
    if (editingTranslation) {
      updateTranslation.mutate(translationData);
    } else {
      createTranslation.mutate(translationData);
    }
  };

  const openNewTranslation = () => {
    setEditingTranslation(null);
    setTranslationData({ title: '', description: '', content: '' });
    setShowDialog(true);
  };

  const openEditTranslation = (translation) => {
    setEditingTranslation(translation);
    setTranslationData({
      title: translation.title,
      description: translation.description,
      content: translation.content,
    });
    setShowDialog(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      review: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
    };
    return colors[status] || colors.draft;
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Translation Manager</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold mb-1 block">Content Type</label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="module">Module</SelectItem>
                <SelectItem value="lesson">Lesson</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block">Content ID</label>
            <Input
              placeholder="Paste content ID"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block">Target Language</label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {contentId && (
          <Button onClick={openNewTranslation} className="mt-4 gap-2">
            <Plus className="w-4 h-4" />
            Add Translation
          </Button>
        )}
      </div>

      {/* Translations List */}
      {contentId && (
        <div className="space-y-3">
          {translations.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center text-gray-600">
                No translations yet. Create one to get started.
              </CardContent>
            </Card>
          ) : (
            translations.map(translation => (
              <Card key={translation.id} className="hover:shadow-md transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{translation.language_name}</h3>
                        <Badge className={getStatusColor(translation.status)}>
                          {translation.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{translation.title}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        by {translation.translated_by_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditTranslation(translation)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {translation.status !== 'published' && (
                        <Button
                          size="sm"
                          onClick={() => publishTranslation.mutate(translation.id)}
                          disabled={publishTranslation.isPending}
                        >
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Translation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTranslation ? 'Edit' : 'Create'} Translation ({LANGUAGES.find(l => l.code === targetLanguage)?.name})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Title *</label>
              <Input
                value={translationData.title}
                onChange={(e) => setTranslationData({ ...translationData, title: e.target.value })}
                placeholder="Translated title"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <Input
                value={translationData.description}
                onChange={(e) => setTranslationData({ ...translationData, description: e.target.value })}
                placeholder="Translated description"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Content *</label>
              <Textarea
                value={translationData.content}
                onChange={(e) => setTranslationData({ ...translationData, content: e.target.value })}
                placeholder="Translated content (markdown supported)"
                rows={6}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createTranslation.isPending || updateTranslation.isPending}
                className="flex-1 gap-2"
              >
                {(createTranslation.isPending || updateTranslation.isPending) && (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                {editingTranslation ? 'Update' : 'Create'} Translation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}