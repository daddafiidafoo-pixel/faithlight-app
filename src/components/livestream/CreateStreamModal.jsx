import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateStreamModal({ user, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stream_type: 'service',
    scheduled_date: '',
    scheduled_time: '',
    stream_url: '',
    chat_enabled: true,
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const createStreamMutation = useMutation({
    mutationFn: async (data) => {
      let thumbnailUrl = '';
      if (thumbnailFile) {
        const upload = await base44.integrations.Core.UploadFile({ file: thumbnailFile });
        thumbnailUrl = upload.file_url;
      }

      const scheduledDateTime = `${data.scheduled_date}T${data.scheduled_time}:00`;

      return await base44.entities.LiveStream.create({
        title: data.title,
        description: data.description,
        stream_type: data.stream_type,
        scheduled_start: scheduledDateTime,
        stream_url: data.stream_url,
        chat_enabled: data.chat_enabled,
        thumbnail_url: thumbnailUrl,
        host_id: user.id,
        host_name: user.full_name || user.email,
        status: 'scheduled',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-streams-admin']);
      toast.success('Stream scheduled!');
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.scheduled_date || !formData.scheduled_time) {
      toast.error('Please fill in all required fields');
      return;
    }
    createStreamMutation.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Live Stream</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Stream Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Sunday Morning Service"
              required
            />
          </div>

          <div>
            <Label htmlFor="stream_type">Stream Type *</Label>
            <Select value={formData.stream_type} onValueChange={(value) => setFormData({ ...formData, stream_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="sermon">Sermon</SelectItem>
                <SelectItem value="worship">Worship</SelectItem>
                <SelectItem value="prayer">Prayer Meeting</SelectItem>
                <SelectItem value="bible_study">Bible Study</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What viewers can expect..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduled_date">Date *</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="scheduled_time">Time *</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="stream_url">Stream URL (YouTube/Vimeo embed URL)</Label>
            <Input
              id="stream_url"
              value={formData.stream_url}
              onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
              placeholder="https://www.youtube.com/embed/..."
            />
            <p className="text-xs text-gray-600 mt-1">Leave empty to add later when you start the stream</p>
          </div>

          <div>
            <Label>Thumbnail Image</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              className="hidden"
              id="thumbnail"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('thumbnail').click()}
              className="w-full mt-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              {thumbnailFile ? thumbnailFile.name : 'Upload Thumbnail'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="chat_enabled"
              checked={formData.chat_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, chat_enabled: checked })}
            />
            <Label htmlFor="chat_enabled">Enable live chat</Label>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={createStreamMutation.isPending} className="flex-1 bg-red-600 hover:bg-red-700">
              {createStreamMutation.isPending ? 'Scheduling...' : 'Schedule Stream'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}