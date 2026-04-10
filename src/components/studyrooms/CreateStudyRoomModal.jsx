import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';

const CATEGORIES = ['Bible Study', 'Prayer', 'Youth', 'Women', 'Men', 'Theology', 'Daily Devotion', 'Gospel Outreach', 'Testimony'];
const LANGUAGES = ['English', 'Afaan Oromoo', 'Amharic', 'Tigrinya', 'Arabic', 'French'];

export default function CreateStudyRoomModal({ user, onClose, onCreated }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    language: 'English',
    category: 'Bible Study',
    privacy: 'public',
    inviteCode: '',
    maxMembers: 100,
    allowPrayerRequests: true,
    allowVerseSharing: true,
    allowAISummaries: true,
    rules: ''
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const room = await base44.entities.StudyRoom.create({
        ...form,
        memberCount: 1,
        lastActivityAt: new Date().toISOString()
      });
      await base44.entities.StudyRoomMember.create({
        roomId: room.id,
        userId: user.id,
        userName: user.full_name || user.email,
        role: 'owner',
        status: 'active',
        joinedAt: new Date().toISOString()
      });
      onCreated();
    } catch (err) {
      console.error('Failed to create room:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">{t('createRoom.title', 'Create Study Room')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('createRoom.name', 'Room Name')} *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g., Romans Study Group"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">{t('createRoom.description', 'Description')}</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What will your group study?"
              rows={3}
            />
          </div>

          {/* Language + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('createRoom.language', 'Language')} *</Label>
              <Select value={form.language} onValueChange={(v) => set('language', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('createRoom.category', 'Category')} *</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            <Label>{t('createRoom.privacy', 'Privacy')} *</Label>
            <div className="flex gap-4">
              {['public', 'private'].map(p => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    value={p}
                    checked={form.privacy === p}
                    onChange={(e) => set('privacy', e.target.value)}
                  />
                  <span className="text-sm capitalize">{t(`createRoom.${p}`, p)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Invite code (private only) */}
          {form.privacy === 'private' && (
            <div className="space-y-1.5">
              <Label htmlFor="inviteCode">{t('createRoom.inviteCode', 'Invite Code')}</Label>
              <Input
                id="inviteCode"
                value={form.inviteCode}
                onChange={(e) => set('inviteCode', e.target.value)}
                placeholder="e.g., FAITH2026"
                className="font-mono uppercase"
              />
            </div>
          )}

          {/* Max members */}
          <div className="space-y-1.5">
            <Label htmlFor="maxMembers">{t('createRoom.maxMembers', 'Maximum Members')}</Label>
            <Input
              id="maxMembers"
              type="number"
              value={form.maxMembers}
              onChange={(e) => set('maxMembers', parseInt(e.target.value) || 100)}
              min={2}
              max={1000}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Room Features</p>
            {[
              { key: 'allowPrayerRequests', label: t('createRoom.allowPrayerRequests', 'Allow Prayer Requests') },
              { key: 'allowVerseSharing', label: t('createRoom.allowVerseSharing', 'Allow Verse Sharing') },
              { key: 'allowAISummaries', label: t('createRoom.allowAISummaries', 'Allow AI Summaries') },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <Switch
                  checked={form[key]}
                  onCheckedChange={(v) => set(key, v)}
                />
              </div>
            ))}
          </div>

          {/* Rules */}
          <div className="space-y-1.5">
            <Label htmlFor="rules">Community Rules <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Textarea
              id="rules"
              value={form.rules}
              onChange={(e) => set('rules', e.target.value)}
              placeholder="e.g., Be respectful, stay on topic"
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2 pb-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              {t('createRoom.cancel', 'Cancel')}
            </Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Creating…' : t('createRoom.submit', 'Create Room')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}