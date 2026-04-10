import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function StudentMessageModal({ student, courseId, onClose, onSuccess }) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [error, setError] = useState('');

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!message.trim()) {
        throw new Error('Message cannot be empty');
      }

      const user = await base44.auth.me();
      return await base44.entities.CourseMessage.create({
        course_id: courseId,
        sender_id: user.id,
        sender_type: 'teacher',
        recipient_ids: [student.user_id],
        subject: `${messageType.charAt(0).toUpperCase() + messageType.slice(1)} - ${new Date().toLocaleDateString()}`,
        content: message.trim(),
        is_group_message: false,
      });
    },
    onSuccess: () => {
      setMessage('');
      setMessageType('general');
      setError('');
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSend = () => {
    sendMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Send Message to {student.full_name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{student.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-2">
              Message Type
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              disabled={sendMutation.isPending}
            >
              <option value="general">General Message</option>
              <option value="feedback">Feedback</option>
              <option value="encouragement">Encouragement</option>
              <option value="support">Support Offer</option>
              <option value="assignment">Assignment Update</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-2">
              Message
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              rows={6}
              disabled={sendMutation.isPending}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={sendMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sendMutation.isPending || !message.trim()}
              className="gap-2"
            >
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}