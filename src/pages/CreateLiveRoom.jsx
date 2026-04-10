import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mic, Video, Clock, Zap, Lock, Crown, AlertCircle } from 'lucide-react';

const ROOM_TYPES = [
  {
    type: 'video',
    roomType: 'small_group',
    name: 'Small Group Video',
    description: 'Everyone can share audio & video. Perfect for friend calls and small study groups.',
    icon: Video,
    maxParticipants: 10,
    badge: 'Premium Only',
    badgeColor: 'bg-purple-100 text-purple-800',
    features: ['Up to 10 participants', 'Full audio + video', 'Host controls', 'Requires Premium'],
  },
  {
    type: 'audio_stage',
    roomType: 'bible_study',
    name: 'Audio Live Study',
    description: 'Stage mode: host + approved speakers broadcast to hundreds of listeners.',
    icon: Mic,
    maxAudience: 500,
    badge: 'Verified Leader',
    badgeColor: 'bg-amber-100 text-amber-800',
    features: ['500+ listeners (scalable)', 'Stage + audience mode', 'Raise-hand system', 'Requires Verified Leader'],
  },
  {
    type: 'audio_stage',
    roomType: 'broadcast_service',
    name: 'Broadcast Service',
    description: 'Church service broadcast. Host + worship team on stage, congregation listens.',
    icon: Users,
    maxAudience: 500,
    badge: 'Verified Leader',
    badgeColor: 'bg-amber-100 text-amber-800',
    features: ['500+ listeners (scalable)', 'Service-style layout', 'Prayer requests', 'Requires Verified Leader'],
  },
];

export default function CreateLiveRoom() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [entitlement, setEntitlement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduledStart, setScheduledStart] = useState('');
  const [allowChat, setAllowChat] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);
  const [maxAudience, setMaxAudience] = useState(500);
  const [permError, setPermError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const ents = await base44.entities.UserEntitlement.filter({ user_id: currentUser.id }, '', 1);
        setEntitlement(ents[0] || { plan: 'basic', status: 'active' });
      } catch {
        navigate(createPageUrl('Home'));
      }
    };
    init();
  }, []);

  const isPremium = entitlement?.plan === 'premium' && entitlement?.status !== 'expired';
  const isVerifiedLeader = user?.spiritual_level >= 4 && user?.is_verified_leader;
  const isAdmin = user?.role === 'admin';

  const canUseTemplate = (tmpl) => {
    if (isAdmin) return true;
    if (tmpl.type === 'video') return isPremium;
    if (tmpl.type === 'audio_stage') return isVerifiedLeader;
    return false;
  };

  const handleSelectTemplate = (tmpl) => {
    setPermError(null);
    if (!canUseTemplate(tmpl)) {
      if (tmpl.type === 'video') {
        setPermError('Video study is a Premium feature (up to 10 participants). Start your 30-day free trial.');
      } else {
        setPermError('Audio Live hosting requires Verified Leader status (Level 4+).');
      }
      return;
    }
    setSelectedTemplate(tmpl);
    setPermError(null);
    if (tmpl.type === 'audio_stage') setMaxAudience(500);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedTemplate) return;

    setLoading(true);
    const roomData = {
      type: selectedTemplate.type,
      room_type: selectedTemplate.roomType,
      title: title.trim(),
      description: description.trim(),
      host_id: user.id,
      host_name: user.full_name,
      status: scheduleType === 'now' ? 'live' : 'scheduled',
      scheduled_start: scheduleType === 'schedule' ? scheduledStart : null,
      actual_start: scheduleType === 'now' ? new Date().toISOString() : null,
      allow_chat: allowChat,
      allow_reactions: allowReactions,
      max_participants: selectedTemplate.type === 'video' ? 10 : null,
      max_audience: selectedTemplate.type === 'audio_stage' ? maxAudience : null,
      is_locked: false,
      is_muted_all: false,
    };

    const room = await base44.entities.LiveRoom.create(roomData);
    if (scheduleType === 'now') {
      navigate(createPageUrl(`LiveRoom?roomId=${room.id}`));
    } else {
      navigate(createPageUrl('LiveEvents'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Create Live Room</h1>
          <p className="text-gray-500">Choose a format and go live or schedule for later.</p>
        </div>

        {/* Step 1: Choose format */}
        {!selectedTemplate && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Choose a format</h2>
            {permError && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{permError}</p>
              </div>
            )}
            <div className="grid gap-4">
              {ROOM_TYPES.map((tmpl) => {
                const Icon = tmpl.icon;
                const allowed = canUseTemplate(tmpl);
                return (
                  <div
                    key={`${tmpl.type}-${tmpl.roomType}`}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      allowed
                        ? 'border-gray-200 bg-white hover:border-indigo-400 hover:shadow-md'
                        : 'border-gray-100 bg-gray-50 opacity-70 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${allowed ? 'bg-indigo-100' : 'bg-gray-200'}`}>
                        <Icon className={`w-6 h-6 ${allowed ? 'text-indigo-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{tmpl.name}</h3>
                          <Badge className={`text-xs ${tmpl.badgeColor}`}>
                            {allowed ? '✓ ' : <Lock className="w-3 h-3 inline mr-1" />}
                            {tmpl.badge}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{tmpl.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {tmpl.features.map((f) => (
                            <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Room Details */}
        {selectedTemplate && (
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <selectedTemplate.icon className="w-5 h-5 text-indigo-600" />
              <div className="flex-1">
                <p className="font-semibold text-indigo-900">{selectedTemplate.name}</p>
                <p className="text-xs text-indigo-600">{selectedTemplate.description}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)} className="text-indigo-600">
                Change
              </Button>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Room Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <Input placeholder="e.g. Sunday Bible Study on John 3" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea placeholder="What will you discuss?" value={description} onChange={e => setDescription(e.target.value)} className="h-20" />
                </div>

                {selectedTemplate.type === 'audio_stage' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Audience Capacity</label>
                    <select
                      value={maxAudience}
                      onChange={e => setMaxAudience(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value={500}>500 listeners</option>
                      <option value={2000}>2,000 listeners</option>
                      <option value={5000}>5,000 listeners</option>
                      <option value={10000}>10,000 listeners</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Architecture supports scaling — set the cap per session.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">When to go live?</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { value: 'now', icon: Zap, label: 'Go Live Now', desc: 'Start immediately' },
                  { value: 'schedule', icon: Clock, label: 'Schedule for Later', desc: 'Set a future start time' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="schedule" value={opt.value} checked={scheduleType === opt.value} onChange={() => setScheduleType(opt.value)} className="w-4 h-4" />
                    <opt.icon className={`w-4 h-4 ${opt.value === 'now' ? 'text-orange-500' : 'text-blue-500'}`} />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
                {scheduleType === 'schedule' && (
                  <input type="datetime-local" value={scheduledStart} onChange={e => setScheduledStart(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Settings</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 'chat', label: 'Allow Chat', desc: 'Participants can send messages', state: allowChat, setter: setAllowChat },
                  { id: 'react', label: 'Allow Reactions', desc: 'Emoji reactions from audience', state: allowReactions, setter: setAllowReactions },
                ].map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={opt.state} onChange={e => opt.setter(e.target.checked)} className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" disabled={loading || !title.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {loading ? 'Creating...' : scheduleType === 'now' ? '🔴 Go Live Now' : 'Schedule Room'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}