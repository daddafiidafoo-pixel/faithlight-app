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

export default function CreateEventModal({ user, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'community_gathering',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    location: '',
    is_online: false,
    online_link: '',
    max_attendees: '',
    is_featured: false,
    tags: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = '';
      
      // Upload image if provided
      if (imageFile) {
        setUploading(true);
        try {
          const uploadResult = await base44.integrations.Core.UploadFile({ file: imageFile });
          imageUrl = uploadResult.file_url;
        } catch (error) {
          console.error('Image upload failed:', error);
        }
        setUploading(false);
      }

      // Create event
      const startDateTime = `${data.start_date}T${data.start_time}:00`;
      const endDateTime = data.end_date && data.end_time 
        ? `${data.end_date}T${data.end_time}:00`
        : null;

      return await base44.entities.ChurchEvent.create({
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        start_date: startDateTime,
        end_date: endDateTime,
        location: data.location,
        is_online: data.is_online,
        online_link: data.online_link,
        image_url: imageUrl,
        organizer_id: user.id,
        organizer_name: user.full_name || user.email,
        max_attendees: data.max_attendees ? parseInt(data.max_attendees) : null,
        is_featured: data.is_featured,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['church-events']);
      toast.success('Event created successfully!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create event');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.start_date || !formData.start_time) {
      toast.error('Please fill in all required fields');
      return;
    }
    createEventMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Sunday Worship Service"
              required
            />
          </div>

          <div>
            <Label htmlFor="event_type">Event Type *</Label>
            <Select value={formData.event_type} onValueChange={(value) => handleChange('event_type', value)}>
              <SelectTrigger id="event_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sermon">Sermon</SelectItem>
                <SelectItem value="community_gathering">Community Gathering</SelectItem>
                <SelectItem value="prayer_meeting">Prayer Meeting</SelectItem>
                <SelectItem value="bible_study">Bible Study</SelectItem>
                <SelectItem value="worship_service">Worship Service</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="social_event">Social Event</SelectItem>
                <SelectItem value="outreach">Outreach</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what attendees can expect..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time (Optional)</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="123 Church Street"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_online"
              checked={formData.is_online}
              onCheckedChange={(checked) => handleChange('is_online', checked)}
            />
            <Label htmlFor="is_online">This is an online event</Label>
          </div>

          {formData.is_online && (
            <div>
              <Label htmlFor="online_link">Online Meeting Link</Label>
              <Input
                id="online_link"
                value={formData.online_link}
                onChange={(e) => handleChange('online_link', e.target.value)}
                placeholder="https://zoom.us/..."
              />
            </div>
          )}

          <div>
            <Label htmlFor="max_attendees">Maximum Attendees (Optional)</Label>
            <Input
              id="max_attendees"
              type="number"
              value={formData.max_attendees}
              onChange={(e) => handleChange('max_attendees', e.target.value)}
              placeholder="Leave blank for unlimited"
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="youth, worship, fellowship"
            />
          </div>

          <div>
            <Label htmlFor="image">Event Image</Label>
            <div className="mt-2">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image').click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {imageFile ? imageFile.name : 'Upload Image'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => handleChange('is_featured', checked)}
            />
            <Label htmlFor="is_featured">Feature this event on the home page</Label>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending || uploading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {createEventMutation.isPending || uploading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}