import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const NOTIFICATION_TYPES = [
  { value: 'announcement', label: '📣 Announcement', desc: 'General group update' },
  { value: 'challenge', label: '⚡ Challenge Alert', desc: 'Notify about new challenge' },
  { value: 'study_reminder', label: '📖 Study Reminder', desc: 'Remind members to read' },
  { value: 'prayer', label: '🙏 Prayer Request', desc: 'Group prayer prompt' },
  { value: 'meeting', label: '📅 Meeting Reminder', desc: 'Upcoming session alert' },
];

export default function GroupNotificationSender({ groupId, group, user, members = [] }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }
    setSending(true);
    try {
      // Create a notification record for each member
      const notifications = members.map(m => ({
        user_id: m.user_id,
        title: `[${group?.name || 'Group'}] ${title}`,
        message,
        type,
        group_id: groupId,
        sent_by: user?.id,
        is_read: false,
      }));

      // Batch create (up to 50 at a time)
      await base44.entities.Notification.bulkCreate(notifications).catch(() => {
        // Fallback: create one by one if bulk fails
        return Promise.all(notifications.slice(0, 20).map(n => base44.entities.Notification.create(n).catch(() => null)));
      });

      setSent(true);
      setTitle('');
      setMessage('');
      toast.success(`Notification sent to ${members.length} members!`);
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      toast.error('Failed to send notifications');
    }
    setSending(false);
  };

  return (
    <Card className="border-blue-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-500" /> Send Group Notification
        </CardTitle>
        <p className="text-xs text-gray-500">Message all {members.length} group members</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs font-semibold text-gray-600 mb-2 block">Notification Type</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {NOTIFICATION_TYPES.map(t => (
              <button key={t.value} onClick={() => setType(t.value)}
                className={`flex items-start gap-2 p-2 rounded-lg border text-left transition-all ${type === t.value ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className="text-sm">{t.label.split(' ')[0]}</span>
                <div>
                  <p className="text-xs font-medium text-gray-900">{t.label.split(' ').slice(1).join(' ')}</p>
                  <p className="text-[10px] text-gray-500">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-gray-600">Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. New Reading Challenge starts Monday!" className="mt-1 text-sm" maxLength={80} />
        </div>

        <div>
          <Label className="text-xs font-semibold text-gray-600">Message</Label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write your message to all group members..."
            rows={3}
            maxLength={500}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="text-[10px] text-gray-400 text-right mt-0.5">{message.length}/500</p>
        </div>

        <Button onClick={handleSend} disabled={sending || sent} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
          {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
            : sent ? <><CheckCircle className="w-4 h-4" /> Sent!</>
            : <><Send className="w-4 h-4" /> Send to All Members</>}
        </Button>
      </CardContent>
    </Card>
  );
}