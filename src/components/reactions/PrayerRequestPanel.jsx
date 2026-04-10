import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, Archive, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ReactionBar from './ReactionBar';
import { useReactions } from './useReactions';

// Mini hook — how many prayed (PRAYER reaction count) for a given request
function PrayerCount({ requestId }) {
  const { counts } = useReactions('prayer_request', requestId, null);
  const n = counts['PRAYER'] || 0;
  if (!n) return null;
  return <span className="text-xs text-indigo-500 font-medium">🙏 {n} praying</span>;
}

export default function PrayerRequestPanel({ groupId, user }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', details: '', visibility: 'group' });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['prayer-requests', groupId],
    queryFn: () => {
      const filter = groupId ? { group_id: groupId } : {};
      return base44.entities.PrayerRequest.filter(filter, '-created_date', 50);
    },
    enabled: true,
  });

  const createRequest = useMutation({
    mutationFn: () => base44.entities.PrayerRequest.create({
      user_id: user.id,
      user_name: user.full_name,
      group_id: groupId || null,
      title: form.title.trim(),
      details: form.details.trim(),
      visibility: form.visibility,
      status: 'active',
      prayer_count: 0,
    }),
    onSuccess: () => {
      toast.success('🙏 Prayer request shared');
      queryClient.invalidateQueries(['prayer-requests', groupId]);
      setForm({ title: '', details: '', visibility: 'group' });
      setShowForm(false);
    },
    onError: () => toast.error('Failed to share'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, answered_note }) =>
      base44.entities.PrayerRequest.update(id, { status, ...(answered_note ? { answered_note } : {}) }),
    onSuccess: () => queryClient.invalidateQueries(['prayer-requests', groupId]),
  });

  const active = requests.filter(r => r.status === 'active');
  const answered = requests.filter(r => r.status === 'answered');

  const StatusBadge = ({ status }) => {
    if (status === 'answered') return <Badge className="bg-green-100 text-green-700 text-xs">✅ Answered</Badge>;
    if (status === 'archived') return <Badge className="bg-gray-100 text-gray-500 text-xs">Archived</Badge>;
    return <Badge className="bg-blue-100 text-blue-700 text-xs">Active</Badge>;
  };

  const RequestCard = ({ req }) => (
    <Card className={`border ${req.status === 'answered' ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm">{req.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{req.user_name} · {format(new Date(req.created_date), 'MMM d, yyyy')}</p>
          </div>
          <StatusBadge status={req.status} />
        </div>
        {req.details && (
          <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{req.details}</p>
        )}
        {req.answered_note && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-green-700 mb-1">🎉 Testimony</p>
            <p className="text-sm text-green-800">{req.answered_note}</p>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <ReactionBar targetType="prayer_request" targetId={req.id} user={user} compact />
          {user?.id === req.user_id && req.status === 'active' && (
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50 text-xs h-7 px-2"
                onClick={() => {
                  const note = prompt('Share your testimony (optional):');
                  if (note !== null) updateStatus.mutate({ id: req.id, status: 'answered', answered_note: note });
                }}
              >
                <CheckCircle className="w-3 h-3 mr-1" /> Answered!
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 text-xs h-7 px-2"
                onClick={() => updateStatus.mutate({ id: req.id, status: 'archived' })}
              >
                <Archive className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            🙏 Prayer Requests
            {active.length > 0 && <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{active.length}</span>}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Share your prayer needs with the group</p>
        </div>
        {user && !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Share Request
          </Button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Prayer request title..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <Textarea
              placeholder="Share more details (optional)..."
              className="h-20 resize-none text-sm"
              value={form.details}
              onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
            />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Select value={form.visibility} onValueChange={v => setForm(f => ({ ...f, visibility: v }))}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">Group only</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs"
                  disabled={!form.title.trim() || createRequest.isPending}
                  onClick={() => createRequest.mutate()}
                >
                  {createRequest.isPending ? 'Sharing...' : '🙏 Share'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active requests */}
      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-4 animate-pulse">Loading prayer requests...</p>
      ) : active.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-3xl mb-2">🙏</p>
            <p className="text-gray-500 text-sm">No active prayer requests.</p>
            {user && <p className="text-gray-400 text-xs mt-1">Be the first to share one above.</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {active.map(req => <RequestCard key={req.id} req={req} />)}
        </div>
      )}

      {/* Answered requests */}
      {answered.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs font-semibold text-green-700 flex items-center gap-1.5 select-none py-1">
            <CheckCircle className="w-3.5 h-3.5" /> {answered.length} Answered Prayer{answered.length > 1 ? 's' : ''} — praise God!
          </summary>
          <div className="space-y-3 mt-3">
            {answered.map(req => <RequestCard key={req.id} req={req} />)}
          </div>
        </details>
      )}
    </div>
  );
}