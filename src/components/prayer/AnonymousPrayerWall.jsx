import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Send, Lock, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = ['Healing', 'Family', 'Work', 'Faith', 'Grief', 'Provision', 'Relationships', 'Other'];

export default function AnonymousPrayerWall({ user }) {
  const queryClient = useQueryClient();
  const [newRequest, setNewRequest] = useState('');
  const [category, setCategory] = useState('Other');
  const [submitting, setSubmitting] = useState(false);
  const [prayedIds, setPrayedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('prayed_for_ids') || '[]'); } catch { return []; }
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['anonymous_prayers'],
    queryFn: () => base44.entities.PrayerRequest.filter(
      { is_anonymous: true, is_public: true },
      '-created_date', 30
    ).catch(() => []),
    refetchInterval: 30000,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.PrayerRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anonymous_prayers'] });
      setNewRequest('');
      setCategory('Other');
    },
  });

  const prayMutation = useMutation({
    mutationFn: async ({ id, currentCount }) => {
      return base44.entities.PrayerRequest.update(id, { prayer_count: (currentCount || 0) + 1 });
    },
    onSuccess: (_, { id }) => {
      const updated = [...prayedIds, id];
      setPrayedIds(updated);
      localStorage.setItem('prayed_for_ids', JSON.stringify(updated));
      queryClient.invalidateQueries({ queryKey: ['anonymous_prayers'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newRequest.trim()) return;
    setSubmitting(true);
    submitMutation.mutate({
      content: newRequest.trim(),
      category,
      is_anonymous: true,
      is_public: true,
      prayer_count: 0,
      user_id: user?.id || 'anonymous',
      display_name: 'Anonymous',
    }, { onSettled: () => setSubmitting(false) });
  };

  return (
    <div className="space-y-6">
      {/* Submit Form */}
      <Card className="border-purple-100 bg-purple-50/40">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">Post Anonymously</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={newRequest}
              onChange={e => setNewRequest(e.target.value)}
              placeholder="Share your prayer request… your name will not be shown."
              className="min-h-24 resize-none border-purple-200 focus:border-purple-400"
              maxLength={500}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1.5 flex-wrap flex-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="text-xs px-2.5 py-1 rounded-full border transition-all"
                    style={{
                      background: category === cat ? '#6C5CE7' : 'white',
                      color: category === cat ? 'white' : '#6B7280',
                      borderColor: category === cat ? '#6C5CE7' : '#E5E7EB',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <Button
                type="submit"
                disabled={submitting || !newRequest.trim()}
                size="sm"
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Posting…' : 'Post'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Prayer Requests List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500 text-sm">Loading prayer requests…</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Heart className="w-10 h-10 mx-auto mb-3 text-purple-300" />
          <p className="font-medium">No prayer requests yet.</p>
          <p className="text-sm mt-1">Be the first to share one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const hasPrayed = prayedIds.includes(req.id);
            return (
              <Card key={req.id} className="border-gray-100 hover:shadow-sm transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar placeholder */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                      style={{ background: 'linear-gradient(135deg, #6C5CE7, #a78bfa)' }}>
                      🙏
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">Anonymous</span>
                        {req.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                            {req.category}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          {req.created_date ? formatDistanceToNow(new Date(req.created_date), { addSuffix: true }) : 'recently'}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{req.content}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (!hasPrayed) prayMutation.mutate({ id: req.id, currentCount: req.prayer_count });
                          }}
                          disabled={hasPrayed || prayMutation.isPending}
                          className="flex items-center gap-1.5 text-sm font-medium transition-all px-3 py-1.5 rounded-full"
                          style={{
                            background: hasPrayed ? '#FDF2F8' : '#F9FAFB',
                            color: hasPrayed ? '#DB2777' : '#6B7280',
                            border: `1px solid ${hasPrayed ? '#F9A8D4' : '#E5E7EB'}`,
                          }}
                        >
                          <Heart className={`w-3.5 h-3.5 ${hasPrayed ? 'fill-pink-500 text-pink-500' : ''}`} />
                          {hasPrayed ? 'Praying' : 'I\'ll Pray'}
                          {(req.prayer_count || 0) > 0 && (
                            <span className="ml-1 font-bold">{req.prayer_count}</span>
                          )}
                        </button>
                        {(req.prayer_count || 0) > 0 && (
                          <span className="text-xs text-gray-400">
                            {req.prayer_count} {req.prayer_count === 1 ? 'person is' : 'people are'} praying
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}