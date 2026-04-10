import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import RichTextSermonEditor from '../components/sermon/RichTextSermonEditor';
import SermonVersionHistory from '../components/sermon/SermonVersionHistory';
import AIBlogTools from '../components/blog/AIBlogTools';

export default function SermonEditor() {
  const [user, setUser] = useState(null);
  const [sermonId, setSermonId] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'version-preview'
  const [draftContent, setDraftContent] = useState('');
  const [insertedContent, setInsertedContent] = useState(null); // signal to editor
  const [autoTags, setAutoTags] = useState([]);

  // Get sermon ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setSermonId(id);

    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Not authenticated');
      }
    };
    getUser();
  }, []);

  const { data: sermon, isLoading: loadingSermon, refetch: refetchSermon } = useQuery({
    queryKey: ['sermon', sermonId],
    queryFn: () => base44.entities.SermonNote.filter(
      { id: sermonId },
      '',
      1
    ).then(results => results[0]),
    enabled: !!sermonId
  });

  const handleSave = async (data) => {
    await refetchSermon();
    toast.success('Sermon saved with new version!');
  };

  const handleViewVersion = (version) => {
    setSelectedVersion(version);
    setViewMode('version-preview');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!sermonId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">No sermon selected. Please select a sermon to edit.</p>
              <Button onClick={() => window.history.back()} className="mt-4 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loadingSermon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button onClick={() => window.history.back()} variant="outline" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Sermons
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {viewMode === 'edit' ? 'Edit Sermon' : 'Version Preview'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            {viewMode === 'edit' ? (
              <RichTextSermonEditor
                sermon={sermon}
                onSave={handleSave}
                onPreview={() => setViewMode('preview')}
              />
            ) : (
              <Card className="border-blue-200">
                <CardContent className="py-8">
                  <div className="prose max-w-none">
                    <h2>{selectedVersion?.title}</h2>
                    <div dangerouslySetInnerHTML={{ __html: selectedVersion?.content }} />
                  </div>
                  <Button
                    onClick={() => setViewMode('edit')}
                    className="mt-6 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Editor
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* AI Blog Tools */}
            <AIBlogTools
              currentContent={draftContent || sermon?.content || ''}
              currentTitle={sermon?.title || ''}
              onInsertContent={(text) => setInsertedContent(text)}
              onInsertTags={(tags) => setAutoTags(tags)}
            />
            {/* Version History */}
            {sermon && (
              <SermonVersionHistory
                sermonId={sermonId}
                currentVersion={sermon.current_version || 1}
                onRestore={() => {
                  refetchSermon();
                  setViewMode('edit');
                }}
                onViewVersion={handleViewVersion}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}