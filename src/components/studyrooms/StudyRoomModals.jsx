import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Copy, Share2, AlertCircle } from 'lucide-react';
import { useI18n } from '../I18nProvider';

export function InviteRoomModal({ room, open, onClose }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareRoom = async () => {
    if (navigator.share) {
      await navigator.share({
        title: room.name,
        text: `Join my FaithLight study room: ${room.name}`,
        url: `https://faithlight.app/study-rooms/${room.id}`
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('room.invite.om', 'Invite Members')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <p className="text-sm font-medium text-gray-700">{room.name}</p>
            <p className="text-xs text-gray-600 capitalize">{room.visibility}</p>
          </div>

          {room.visibility === 'private' && (
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">
                {t('room.privateJoinCode.om', 'Invite Code')}
              </label>
              <div className="flex gap-2">
                <Input value={room.invite_code} readOnly className="flex-1 font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(room.invite_code, 'code')}
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {copied === 'code' && <p className="text-xs text-green-600 mt-1">Copied!</p>}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-2">
              {t('room.roomLink.om', 'Room Link')}
            </label>
            <div className="flex gap-2">
              <Input
                value={`https://faithlight.app/study-rooms/${room.id}`}
                readOnly
                className="flex-1 text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(`https://faithlight.app/study-rooms/${room.id}`, 'link')}
                className="flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied === 'link' && <p className="text-xs text-green-600 mt-1">Copied!</p>}
          </div>

          <div className="pt-2">
            <Button
              onClick={shareRoom}
              className="w-full gap-2"
              variant="default"
            >
              <Share2 className="w-4 h-4" />
              {t('room.share.om', 'Share')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EditRoomModal({ room, open, onClose, onSave }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: room?.name || '',
    description: room?.description || '',
    language_code: room?.language_code || 'en',
    category: room?.category || 'bible-study',
    visibility: room?.visibility || 'public',
    invite_code: room?.invite_code || '',
    max_members: room?.max_members || 50,
    allow_prayer_requests: room?.allow_prayer_requests !== false,
    allow_verse_sharing: room?.allow_verse_sharing !== false,
    allow_ai_summaries: room?.allow_ai_summaries !== false,
    room_rules: room?.room_rules || ''
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('room.editRoom.om', 'Edit Room')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              {t('createRoom.name.om', 'Room Name')}
            </label>
            <Input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Room name"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              {t('createRoom.description.om', 'Description')}
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Room description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                {t('createRoom.language.om', 'Language')}
              </label>
              <Select value={form.language_code} onValueChange={(v) => handleChange('language_code', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="om">Afaan Oromoo</SelectItem>
                  <SelectItem value="am">Amharic</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                {t('createRoom.category.om', 'Category')}
              </label>
              <Select value={form.category} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bible-study">Bible Study</SelectItem>
                  <SelectItem value="prayer">Prayer</SelectItem>
                  <SelectItem value="youth">Youth</SelectItem>
                  <SelectItem value="sermon-discussion">Sermon Discussion</SelectItem>
                  <SelectItem value="theology">Theology</SelectItem>
                  <SelectItem value="church-group">Church Group</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              {t('createRoom.privacy.om', 'Privacy')}
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={form.visibility === 'public'}
                  onChange={(e) => handleChange('visibility', e.target.value)}
                />
                <span className="text-sm">{t('createRoom.public.om', 'Public')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={form.visibility === 'private'}
                  onChange={(e) => handleChange('visibility', e.target.value)}
                />
                <span className="text-sm">{t('createRoom.private.om', 'Private')}</span>
              </label>
            </div>
          </div>

          {form.visibility === 'private' && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                {t('createRoom.inviteCode.om', 'Invite Code')}
              </label>
              <Input
                value={form.invite_code}
                onChange={(e) => handleChange('invite_code', e.target.value)}
                placeholder="Auto-generated code"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              {t('createRoom.maxMembers.om', 'Maximum Members')}
            </label>
            <Input
              type="number"
              value={form.max_members}
              onChange={(e) => handleChange('max_members', parseInt(e.target.value))}
              min="1"
            />
          </div>

          <div className="space-y-3 pt-2 border-t">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-semibold text-gray-700">
                {t('createRoom.allowPrayerRequests.om', 'Allow Prayer Requests')}
              </span>
              <Switch
                checked={form.allow_prayer_requests}
                onCheckedChange={(v) => handleChange('allow_prayer_requests', v)}
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-semibold text-gray-700">
                {t('createRoom.allowVerseSharing.om', 'Allow Verse Sharing')}
              </span>
              <Switch
                checked={form.allow_verse_sharing}
                onCheckedChange={(v) => handleChange('allow_verse_sharing', v)}
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-semibold text-gray-700">
                {t('createRoom.allowAISummaries.om', 'Allow AI Summaries')}
              </span>
              <Switch
                checked={form.allow_ai_summaries}
                onCheckedChange={(v) => handleChange('allow_ai_summaries', v)}
              />
            </label>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              {t('room.rulesLabel.om', 'Room Rules')}
            </label>
            <Textarea
              value={form.room_rules}
              onChange={(e) => handleChange('room_rules', e.target.value)}
              placeholder="Community guidelines and rules"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {t('createRoom.cancel.om', 'Cancel')}
            </Button>
            <Button onClick={handleSubmit}>
              {t('room.saveChanges.om', 'Save Changes')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}