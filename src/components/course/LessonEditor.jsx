import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, X, Save, Loader2, Sparkles } from 'lucide-react';
import AIContentHelper from './AIContentHelper';

export default function LessonEditor({ courseId, onLessonCreated, onClose, existingLesson = null }) {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);

  const [title, setTitle] = useState(existingLesson?.title || '');
  const [description, setDescription] = useState(existingLesson?.description || '');
  const [content, setContent] = useState(existingLesson?.content || '');
  const [contentType, setContentType] = useState(existingLesson?.content_type || 'text');
  const [videoUrl, setVideoUrl] = useState(existingLesson?.video_url || '');
  const [duration, setDuration] = useState(existingLesson?.duration_minutes?.toString() || '');
  const [scriptureRefs, setScriptureRefs] = useState(existingLesson?.scripture_references || '');
  const [tags, setTags] = useState((existingLesson?.tags || []).join(', '));
  const [showAIHelper, setShowAIHelper] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const lessonData = {
        title,
        description,
        content,
        content_type: contentType,
        video_url: videoUrl || null,
        duration_minutes: duration ? Number(duration) : null,
        scripture_references: scriptureRefs,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        teacher_id: user.id,
        status: 'draft',
      };

      if (courseId) {
        lessonData.course_id = courseId;
      }

      if (existingLesson) {
        await base44.entities.Lesson.update(existingLesson.id, lessonData);
        return { id: existingLesson.id, ...lessonData };
      } else {
        return await base44.entities.Lesson.create(lessonData);
      }
    },
    onSuccess: (lesson) => {
      queryClient.invalidateQueries(['available-lessons']);
      queryClient.invalidateQueries(['course-lessons']);
      if (onLessonCreated) {
        onLessonCreated(lesson);
      }
      if (onClose) {
        onClose();
      }
    },
  });

  const isValid = title && content;

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{existingLesson ? 'Edit Lesson' : 'Create New Lesson'}</CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="ai" className="gap-1">
              <Sparkles className="w-4 h-4" />
              AI Help
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 mt-0">
            <div>
              <Label htmlFor="title">Lesson Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Jesus' First Miracle"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of the lesson"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger id="contentType" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text/Article</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                  <SelectItem value="mixed">Mixed (Text + Video)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(contentType === 'video' || contentType === 'mixed') && (
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="mt-2"
                />
              </div>
            )}

            <div>
              <Label htmlFor="content">Lesson Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your lesson content here. Use markdown for formatting."
                rows={6}
                className="mt-2 font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 15"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="scripture">Scripture References</Label>
                <Input
                  id="scripture"
                  value={scriptureRefs}
                  onChange={(e) => setScriptureRefs(e.target.value)}
                  placeholder="e.g., John 2:1-11"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="gospel, miracles, faith"
                className="mt-2"
              />
              {tags && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {tags.split(',').map((tag, idx) => (
                    tag.trim() && <Badge key={idx} variant="outline">{tag.trim()}</Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-0">
            <Alert>
              <AlertDescription>
                Use AI assistance to generate lesson outlines, refine titles/descriptions, and create discussion questions.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Generate from Scripture/Topic
                </h3>
                <AIContentHelper
                  type="outline"
                  initialPrompt={scriptureRefs || title}
                  onContentGenerated={(outline) => {
                    setContent(outline);
                  }}
                />
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Refine Title & Description
                </h3>
                <AIContentHelper
                  type="refine"
                  initialPrompt={title}
                  onContentGenerated={(refined) => {
                    setTitle(refined.split('\n')[0]);
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {!user && (
          <Alert>
            <AlertDescription>Loading user information...</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 justify-end pt-4">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!isValid || saveMutation.isLoading || !user}
            className="gap-2"
          >
            {saveMutation.isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Lesson
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}