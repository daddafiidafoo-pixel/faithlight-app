import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RotateCcw, Eye, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

export default function SermonVersionHistory({ sermonId, currentVersion, onRestore, onViewVersion }) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isRestoring, setIsRestoring] = useState(null);

  const { data: versions = [], isLoading, refetch } = useQuery({
    queryKey: ['sermonVersions', sermonId],
    queryFn: () => base44.entities.SermonVersion.filter(
      { sermon_id: sermonId },
      '-version_number',
      50
    ),
    enabled: !!sermonId
  });

  const handleRestoreVersion = async (version) => {
    if (!window.confirm(`Restore to version ${version.version_number}? Current content will be saved as a new version.`)) {
      return;
    }

    setIsRestoring(version.version_number);
    try {
      // Update sermon with restored content
      await base44.entities.SermonNote.update(sermonId, {
        full_content: version.content,
        content_plain: version.content_plain,
        title: version.title,
        last_edited_at: new Date().toISOString(),
        current_version: currentVersion + 1
      });

      // Create new version entry for the restoration
      await base44.entities.SermonVersion.create({
        sermon_id: sermonId,
        user_id: version.user_id,
        version_number: currentVersion + 1,
        title: version.title,
        content: version.content,
        content_plain: version.content_plain,
        change_summary: `Restored from version ${version.version_number}`,
        change_type: 'edit',
        media_urls: version.media_urls || []
      });

      toast.success(`Restored to version ${version.version_number}`);
      refetch();
      onRestore?.();
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('Failed to restore version');
    } finally {
      setIsRestoring(null);
    }
  };

  const handleDownloadVersion = (version) => {
    const element = document.createElement('a');
    const file = new Blob([version.content_plain], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${version.title}_v${version.version_number}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Version downloaded');
  };

  const handleDeleteVersion = async (version) => {
    if (!window.confirm('Delete this version? This cannot be undone.')) return;

    try {
      await base44.entities.SermonVersion.delete(version.id);
      toast.success('Version deleted');
      refetch();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete version');
    }
  };

  const changeTypeIcons = {
    creation: '📝',
    edit: '✏️',
    auto_save: '💾',
    media_added: '🖼️'
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🕐 Version History
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">Every edit is automatically saved as a version. Restore previous versions anytime.</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          </div>
        ) : versions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p>No version history yet. Start editing to create versions.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {versions.map((version) => (
              <div
                key={version.id}
                onClick={() => setSelectedVersion(selectedVersion?.id === version.id ? null : version)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedVersion?.id === version.id
                    ? 'border-purple-600 bg-white shadow-md'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {/* Version Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{changeTypeIcons[version.change_type] || '📄'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-lg">v{version.version_number}</span>
                        {version.version_number === currentVersion && (
                          <Badge className="bg-green-100 text-green-800">Current</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {version.change_type === 'creation' ? 'Created' :
                           version.change_type === 'auto_save' ? 'Auto-saved' :
                           version.change_type === 'media_added' ? 'Media added' :
                           'Edited'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {format(new Date(version.created_date), 'MMM d, yyyy h:mm a')}
                      </p>
                      {version.change_summary && (
                        <p className="text-sm text-gray-700 mt-1 italic">{version.change_summary}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content Preview */}
                {selectedVersion?.id === version.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">Preview:</p>
                      <p className="text-sm text-gray-700 line-clamp-6">{version.content_plain}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewVersion?.(version);
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Full
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadVersion(version);
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      {version.version_number !== currentVersion && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreVersion(version);
                          }}
                          disabled={isRestoring === version.version_number}
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-amber-50 border-amber-200 hover:bg-amber-100"
                        >
                          {isRestoring === version.version_number ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Restoring...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4" />
                              Restore
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVersion(version);
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}