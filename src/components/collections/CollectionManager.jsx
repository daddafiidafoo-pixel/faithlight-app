import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useI18n } from '@/components/I18nProvider';

const EMOJI_ICONS = ['📚', '💬', '✝️', '🙏', '💡', '🔥', '🌟', '📖'];

export default function CollectionManager({ userId, onCollectionCreated }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '📚', color: '#6366F1' });

  const { data: collections = [] } = useQuery({
    queryKey: ['collections', userId],
    queryFn: () => base44.entities.HighlightCollection.filter({ user_id: userId }),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HighlightCollection.create({ user_id: userId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', userId] });
      setFormData({ name: '', icon: '📚', color: '#6366F1' });
      setIsOpen(false);
      onCollectionCreated?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.HighlightCollection.update(editingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', userId] });
      setEditingId(null);
      setFormData({ name: '', icon: '📚', color: '#6366F1' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HighlightCollection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', userId] });
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (collection) => {
    setEditingId(collection.id);
    setFormData({ name: collection.name, icon: collection.icon, color: collection.color });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{t('collections.title', 'Collections')}</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              {t('collections.new', 'New Collection')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? t('collections.edit', 'Edit Collection') : t('collections.create', 'Create Collection')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder={t('collections.namePlaceholder', 'Collection name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('collections.icon', 'Icon')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {EMOJI_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.icon === emoji
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('collections.color', 'Color')}
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingId ? t('common.save', 'Save') : t('common.create', 'Create')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setEditingId(null);
                  }}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
            style={{ borderLeftColor: collection.color, borderLeftWidth: '4px' }}
          >
            <span className="text-lg">{collection.icon}</span>
            <div className="flex-1 mx-3">
              <p className="font-medium text-gray-900">{collection.name}</p>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleEdit(collection)}
                className="h-8 w-8"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteMutation.mutate(collection.id)}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}