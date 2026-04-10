import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Heart, BookMarked, MessageCircle, Lock, Globe, Edit3, Save, X, Plus, Trash2, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

function PrivacyToggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(value === 'public' ? 'private' : 'public')}
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium transition-all ${
        value === 'public'
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-gray-100 text-gray-500 border-gray-200'
      }`}
    >
      {value === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
      {value === 'public' ? 'Public' : 'Private'}
    </button>
  );
}

/* ── My Testimony ── */
export function TestimonySection({ user }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(user?.testimony || '');
  const [privacy, setPrivacy] = useState(user?.testimony_privacy || 'public');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ testimony: text, testimony_privacy: privacy });
    setSaving(false);
    setEditing(false);
    toast.success('Testimony saved!');
  };

  const isPublic = privacy === 'public';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" /> My Testimony
          </CardTitle>
          <div className="flex items-center gap-2">
            <PrivacyToggle value={privacy} onChange={setPrivacy} />
            {!editing && (
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="h-7 px-2">
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-3">
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Share your faith journey, how you came to believe, or what God has done in your life..."
              rows={6}
              className="text-sm resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(false); setText(user?.testimony || ''); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ) : text ? (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="text-center py-6">
            <Heart className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Share your faith story with the community.</p>
            <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => setEditing(true)}>
              <Plus className="w-3.5 h-3.5" /> Add Testimony
            </Button>
          </div>
        )}
        {!isPublic && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Only visible to you
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ── My Prayer Requests ── */
export function MyPrayerRequestsSection({ user }) {
  const queryClient = useQueryClient();
  const [newPrayer, setNewPrayer] = useState('');
  const [newPrivacy, setNewPrivacy] = useState('public');
  const [adding, setAdding] = useState(false);

  const { data: prayers = [], isLoading } = useQuery({
    queryKey: ['my-prayer-requests', user?.id],
    queryFn: () => base44.entities.PrayerRequest.filter({ user_id: user.id }, '-created_date', 20).catch(() => []),
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.PrayerRequest.create({
      user_id: user.id,
      user_name: user.full_name,
      title: newPrayer.slice(0, 80),
      details: newPrayer,
      visibility: newPrivacy,
      status: 'active',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-prayer-requests', user?.id]);
      setNewPrayer('');
      setAdding(false);
      toast.success('Prayer request added!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PrayerRequest.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['my-prayer-requests', user?.id]),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.PrayerRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(['my-prayer-requests', user?.id]),
  });

  const statusColors = { active: 'bg-blue-100 text-blue-700', answered: 'bg-green-100 text-green-700', archived: 'bg-gray-100 text-gray-500' };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-500" /> My Prayer Requests
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setAdding(v => !v)} className="h-7 px-2 gap-1 text-xs">
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
            <Textarea
              value={newPrayer}
              onChange={e => setNewPrayer(e.target.value)}
              placeholder="Describe your prayer request..."
              rows={3}
              className="text-sm resize-none bg-white"
            />
            <div className="flex items-center justify-between">
              <PrivacyToggle value={newPrivacy} onChange={setNewPrivacy} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => createMutation.mutate()} disabled={!newPrayer.trim() || createMutation.isPending}
                  className="gap-1 bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs">
                  {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-7 text-xs">Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
        ) : prayers.length === 0 ? (
          <div className="text-center py-6">
            <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No prayer requests yet.</p>
          </div>
        ) : (
          prayers.map(p => (
            <div key={p.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-relaxed">{p.details || p.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || statusColors.active}`}>
                    {p.status}
                  </span>
                  {p.visibility === 'private' ? (
                    <span className="text-xs text-gray-400 flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> Private</span>
                  ) : (
                    <span className="text-xs text-gray-400 flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" /> Public</span>
                  )}
                  {p.prayer_count > 0 && (
                    <span className="text-xs text-blue-500">🙏 {p.prayer_count}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {p.status === 'active' && (
                  <button onClick={() => updateStatus.mutate({ id: p.id, status: 'answered' })}
                    className="text-xs text-green-600 hover:text-green-800 px-1.5 py-0.5 rounded border border-green-200 hover:bg-green-50">
                    ✓ Answered
                  </button>
                )}
                <button onClick={() => deleteMutation.mutate(p.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/* ── My Favorite Verses ── */
export function FavoriteVersesSection({ user }) {
  const queryClient = useQueryClient();
  const [privacy, setPrivacy] = useState(user?.favorite_verses_privacy || 'public');
  const [newVerse, setNewVerse] = useState('');
  const [newRef, setNewRef] = useState('');

  const { data: saved = [], isLoading } = useQuery({
    queryKey: ['saved-verses-profile', user?.id],
    queryFn: () => base44.entities.SavedVerse.filter({ user_id: user.id }, '-created_date', 30).catch(() => []),
    enabled: !!user?.id,
  });

  const addMutation = useMutation({
    mutationFn: () => base44.entities.SavedVerse.create({
      user_id: user.id,
      verse_reference: newRef,
      verse_text: newVerse,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-verses-profile', user?.id]);
      setNewVerse(''); setNewRef('');
      toast.success('Verse saved!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedVerse.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['saved-verses-profile', user?.id]),
  });

  const savePrivacy = async (val) => {
    setPrivacy(val);
    await base44.auth.updateMe({ favorite_verses_privacy: val });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-amber-500" /> My Favorite Verses
          </CardTitle>
          <PrivacyToggle value={privacy} onChange={savePrivacy} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add new */}
        <div className="flex gap-2">
          <input
            value={newRef}
            onChange={e => setNewRef(e.target.value)}
            placeholder="John 3:16"
            className="w-28 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <input
            value={newVerse}
            onChange={e => setNewVerse(e.target.value)}
            placeholder="Verse text..."
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-300"
            onKeyDown={e => e.key === 'Enter' && newRef && newVerse && addMutation.mutate()}
          />
          <Button size="sm" onClick={() => addMutation.mutate()} disabled={!newRef.trim() || !newVerse.trim() || addMutation.isPending}
            className="h-8 px-2 bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs">
            {addMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-amber-400" /></div>
        ) : saved.length === 0 ? (
          <div className="text-center py-6">
            <BookMarked className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No saved verses yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {saved.map(v => (
              <div key={v.id} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-700 mb-0.5">{v.verse_reference}</p>
                  <p className="text-sm text-gray-700 italic leading-relaxed">"{v.verse_text}"</p>
                </div>
                <button onClick={() => deleteMutation.mutate(v.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-0.5 mt-0.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}