import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Trash2, MessageSquare, Loader2 } from 'lucide-react';

/**
 * Moderation queue for flagged content
 */
export default function ModerationPanel({ isAdmin = false }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: flaggedContent = [], isLoading } = useQuery({
    queryKey: ['flagged-content'],
    queryFn: async () => {
      return await base44.entities.FlaggedContent.filter(
        { status: 'pending_review' },
        '-created_at',
        20
      );
    },
    refetchInterval: 10000,
    enabled: isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: async (contentId) => {
      await base44.entities.FlaggedContent.update(contentId, {
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-content'] });
      setSelectedItem(null);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (contentId) => {
      await base44.entities.FlaggedContent.update(contentId, {
        status: 'removed',
        reviewed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-content'] });
      setSelectedItem(null);
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (contentId) => {
      await base44.entities.FlaggedContent.update(contentId, {
        status: 'dismissed',
        reviewed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-content'] });
      setSelectedItem(null);
    },
  });

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-600">
          <p>Admin access required</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Flagged Content Queue */}
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Pending Review ({flaggedContent.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
              </div>
            ) : flaggedContent.length === 0 ? (
              <p className="text-sm text-gray-600">No items to review</p>
            ) : (
              flaggedContent.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedItem?.id === item.id
                      ? 'bg-blue-50 border-blue-400'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.author_name}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {item.content_preview}
                      </p>
                    </div>
                    <Badge
                      className={
                        item.priority === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : item.priority === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.content_type}</span>
                    <span>•</span>
                    <span>
                      {item.ai_flagged && '🤖'}
                      {item.user_report_id && '👤'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail View */}
      {selectedItem && (
        <Card className="col-span-1 h-fit sticky top-4">
          <CardHeader>
            <CardTitle className="text-base">Review Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Content</p>
              <p className="text-sm bg-gray-50 p-2 rounded line-clamp-4">
                {selectedItem.content_preview}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">
                Flagged Categories
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedItem.ai_categories?.map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {selectedItem.ai_confidence && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  AI Confidence
                </p>
                <div className="w-full bg-gray-200 rounded h-2">
                  <div
                    className="bg-red-500 h-2 rounded"
                    style={{
                      width: `${selectedItem.ai_confidence * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round(selectedItem.ai_confidence * 100)}% confidence
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => dismissMutation.mutate(selectedItem.id)}
                disabled={dismissMutation.isPending}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Dismiss
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeMutation.mutate(selectedItem.id)}
                disabled={removeMutation.isPending}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}