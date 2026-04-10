import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Video, Mic, Globe, Twitter, Instagram, Youtube, Facebook, Linkedin, Edit2, Check, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const SOCIAL_ICONS = {
  twitter: { Icon: Twitter, label: 'Twitter', color: 'text-sky-500' },
  instagram: { Icon: Instagram, label: 'Instagram', color: 'text-pink-500' },
  youtube: { Icon: Youtube, label: 'YouTube', color: 'text-red-500' },
  facebook: { Icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
  linkedin: { Icon: Linkedin, label: 'LinkedIn', color: 'text-blue-700' },
};

function SessionHistoryCard({ room }) {
  const isHost = true; // assumed from context
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
      <div className={`mt-0.5 p-1.5 rounded-lg ${room.type === 'video' ? 'bg-purple-100' : 'bg-blue-100'}`}>
        {room.type === 'video' ? <Video className="w-3.5 h-3.5 text-purple-600" /> : <Mic className="w-3.5 h-3.5 text-blue-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{room.title}</p>
        <p className="text-xs text-gray-500">
          {room.actual_start ? format(new Date(room.actual_start), 'MMM d, yyyy · h:mm a') : format(new Date(room.scheduled_start), 'MMM d, yyyy')}
        </p>
      </div>
      <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
        {room.room_type?.replace('_', ' ')}
      </Badge>
    </div>
  );
}

export default function LiveProfileSection({ user, isEditable = false }) {
  const [hostedRooms, setHostedRooms] = useState([]);
  const [speakerRooms, setSpeakerRooms] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    live_bio: user?.live_bio || '',
    website_url: user?.website_url || '',
    social_links: user?.social_links || {},
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    // Hosted sessions
    base44.entities.LiveRoom.filter({ host_id: user.id, status: 'ended' }, '-actual_start', 10)
      .then(setHostedRooms).catch(() => {});
    // Sessions spoken in (via ParticipantLog)
    base44.entities.ParticipantLog.filter({ user_id: user.id, role: 'speaker' }, '-joined_at', 10)
      .then(async (logs) => {
        if (!logs.length) return;
        const roomIds = [...new Set(logs.map(l => l.event_id))].slice(0, 5);
        const rooms = await Promise.all(
          roomIds.map(id => base44.entities.LiveRoom.filter({ id }, '', 1).then(r => r[0]).catch(() => null))
        );
        setSpeakerRooms(rooms.filter(Boolean));
      }).catch(() => {});
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(editData);
    setSaving(false);
    setIsEditing(false);
  };

  const socialEntries = Object.entries(SOCIAL_ICONS);
  const filledSocials = socialEntries.filter(([key]) => user?.social_links?.[key]);

  return (
    <div className="space-y-6">
      {/* Live Presence Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Video className="w-4 h-4 text-indigo-600" />
              Live Presence
            </CardTitle>
            {isEditable && !isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="gap-1 h-7 text-xs">
                <Edit2 className="w-3 h-3" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Live Bio (shown to participants)</label>
                <Textarea
                  value={editData.live_bio}
                  onChange={e => setEditData(p => ({ ...p, live_bio: e.target.value }))}
                  placeholder="A short intro shown when you're hosting or speaking..."
                  rows={2}
                  maxLength={160}
                  className="mt-1 text-sm"
                />
                <p className="text-xs text-gray-400 text-right">{editData.live_bio.length}/160</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Website</label>
                <Input
                  value={editData.website_url}
                  onChange={e => setEditData(p => ({ ...p, website_url: e.target.value }))}
                  placeholder="https://yoursite.com"
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">Social Links</label>
                <div className="space-y-2">
                  {socialEntries.map(([key, { label, Icon }]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <Input
                        value={editData.social_links?.[key] || ''}
                        onChange={e => setEditData(p => ({
                          ...p,
                          social_links: { ...p.social_links, [key]: e.target.value }
                        }))}
                        placeholder={`${label} username or URL`}
                        className="text-sm h-7"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1 h-7 text-xs flex-1">
                  <Check className="w-3 h-3" /> {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="h-7 text-xs">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {user?.live_bio ? (
                <p className="text-sm text-gray-700 italic">"{user.live_bio}"</p>
              ) : isEditable ? (
                <p className="text-xs text-gray-400">No live bio yet — click Edit to add one.</p>
              ) : null}

              {/* Website */}
              {user?.website_url && (
                <a href={user.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline">
                  <Globe className="w-3.5 h-3.5" />
                  {user.website_url.replace(/^https?:\/\//, '')}
                </a>
              )}

              {/* Social links */}
              {filledSocials.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filledSocials.map(([key, { Icon, label, color }]) => (
                    <a
                      key={key}
                      href={user.social_links[key].startsWith('http') ? user.social_links[key] : `https://${key}.com/${user.social_links[key]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1 text-xs ${color} hover:opacity-75 transition`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session History */}
      {(hostedRooms.length > 0 || speakerRooms.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Session History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hostedRooms.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hosted ({hostedRooms.length})</p>
                <div className="space-y-2">
                  {hostedRooms.map(r => <SessionHistoryCard key={r.id} room={r} />)}
                </div>
              </div>
            )}
            {speakerRooms.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Spoke In ({speakerRooms.length})</p>
                <div className="space-y-2">
                  {speakerRooms.map(r => <SessionHistoryCard key={r.id} room={r} />)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}