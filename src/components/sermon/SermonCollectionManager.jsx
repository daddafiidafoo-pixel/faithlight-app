import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Trash2, FolderOpen, Lock, Globe, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SermonCollectionManager({ user, sermon = null, onClose }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const queryClient = useQueryClient();

  const { data: collections = [] } = useQuery({
    queryKey: ['sermon-collections', user?.id],
    queryFn: () => base44.entities.SermonCollection.filter({ user_id: user.id }, '-created_date', 100),
    enabled: !!user
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.SermonCollection.create({
        user_id: user.id,
        name: data.name,
        description: data.description,
        sermon_ids: sermon ? [sermon.id] : [],
        is_public: false,
        color: 'indigo',
        icon: 'BookOpen'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sermon-collections']);
      setShowCreateForm(false);
      setNewCollectionName('');
      setNewCollectionDesc('');
      toast.success('Collection created!');
    }
  });

  const addToCollectionMutation = useMutation({
    mutationFn: async (collection) => {
      const updatedSermonIds = [...(collection.sermon_ids || [])];
      if (!updatedSermonIds.includes(sermon.id)) {
        updatedSermonIds.push(sermon.id);
      }
      return await base44.entities.SermonCollection.update(collection.id, {
        sermon_ids: updatedSermonIds
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sermon-collections']);
      toast.success('Added to collection!');
      if (onClose) onClose();
    }
  });

  const removeFromCollectionMutation = useMutation({
    mutationFn: async ({ collectionId, sermonId }) => {
      const collection = collections.find(c => c.id === collectionId);
      const updatedSermonIds = (collection.sermon_ids || []).filter(id => id !== sermonId);
      return await base44.entities.SermonCollection.update(collectionId, {
        sermon_ids: updatedSermonIds
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sermon-collections']);
      toast.success('Removed from collection');
    }
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: (collectionId) => base44.entities.SermonCollection.delete(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['sermon-collections']);
      toast.success('Collection deleted');
    }
  });

  const togglePublicMutation = useMutation({
    mutationFn: async (collection) => {
      return await base44.entities.SermonCollection.update(collection.id, {
        is_public: !collection.is_public
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sermon-collections']);
      toast.success('Collection visibility updated');
    }
  });

  const isSermonInCollection = (collection) => {
    return sermon && collection.sermon_ids?.includes(sermon.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-indigo-600" />
          {sermon ? 'Add to Collection' : 'My Sermon Collections'}
        </h3>
        <Button onClick={() => setShowCreateForm(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          New Collection
        </Button>
      </div>

      {showCreateForm && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Collection name..."
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
            <Textarea
              placeholder="Description (optional)..."
              value={newCollectionDesc}
              onChange={(e) => setNewCollectionDesc(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => createCollectionMutation.mutate({
                  name: newCollectionName,
                  description: newCollectionDesc
                })}
                disabled={!newCollectionName || createCollectionMutation.isPending}
                size="sm"
              >
                Create
              </Button>
              <Button onClick={() => setShowCreateForm(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {collections.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No collections yet. Create one to organize your favorite sermons!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {collections.map(collection => (
            <Card key={collection.id} className="hover:shadow-md transition">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{collection.name}</h4>
                      <Badge variant="outline" className="gap-1">
                        {collection.sermon_ids?.length || 0} sermons
                      </Badge>
                      {collection.is_public ? (
                        <Globe className="w-4 h-4 text-green-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    {collection.description && (
                      <p className="text-sm text-gray-600">{collection.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {sermon && (
                      <Button
                        onClick={() => {
                          if (isSermonInCollection(collection)) {
                            removeFromCollectionMutation.mutate({
                              collectionId: collection.id,
                              sermonId: sermon.id
                            });
                          } else {
                            addToCollectionMutation.mutate(collection);
                          }
                        }}
                        variant={isSermonInCollection(collection) ? 'default' : 'outline'}
                        size="sm"
                        className="gap-1"
                      >
                        {isSermonInCollection(collection) ? (
                          <>
                            <Check className="w-4 h-4" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      onClick={() => togglePublicMutation.mutate(collection)}
                      variant="ghost"
                      size="sm"
                      title={collection.is_public ? 'Make private' : 'Make public'}
                    >
                      {collection.is_public ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm('Delete this collection?')) {
                          deleteCollectionMutation.mutate(collection.id);
                        }
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}