import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'bible_study', label: '📖 Bible Study' },
  { value: 'qa_session', label: '❓ Q&A Session' },
  { value: 'prayer_meeting', label: '🙏 Prayer Meeting' },
  { value: 'sermon', label: '⛪ Sermon/Teaching' },
  { value: 'workshop', label: '🎓 Workshop' },
  { value: 'webinar', label: '💻 Webinar' },
];

export default function EditLiveEventModal({ open, onOpenChange, event, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventCategory, setEventCategory] = useState('bible_study');
  const [startDate, setStartDate] = useState(null);
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [duration, setDuration] = useState('60');
  const [allowChat, setAllowChat] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (event && open) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setEventCategory(event.event_type || event.room_type || 'bible_study');
      setDuration(String(event.duration_minutes || 60));
      setAllowChat(event.allow_chat !== false);
      setAllowReactions(event.allow_reactions !== false);
      if (event.scheduled_start || event.start_time) {
        const d = new Date(event.scheduled_start || event.start_time);
        setStartDate(d);
        setStartHour(String(d.getHours()).padStart(2, '0'));
        setStartMinute(String(d.getMinutes()).padStart(2, '0'));
      }
    }
  }, [event, open]);

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!startDate) { toast.error('Start date is required'); return; }

    setIsLoading(true);
    const dateTime = new Date(startDate);
    dateTime.setHours(parseInt(startHour), parseInt(startMinute), 0);

    await base44.entities.LiveRoom.update(event.id, {
      title: title.trim(),
      description: description.trim(),
      event_type: eventCategory,
      room_type: eventCategory,
      scheduled_start: dateTime.toISOString(),
      start_time: dateTime.toISOString(),
      duration_minutes: parseInt(duration),
      allow_chat: allowChat,
      allow_reactions: allowReactions,
    });

    toast.success('Event updated!');
    onSaved?.();
    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What will you discuss?" className="h-20" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select value={eventCategory} onValueChange={setEventCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={d => d < new Date()} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <div className="flex gap-1 items-center">
                <Select value={startHour} onValueChange={setStartHour}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-gray-400">:</span>
                <Select value={startMinute} onValueChange={setStartMinute}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 15, 30, 45].map(m => (
                      <SelectItem key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={allowChat} onChange={e => setAllowChat(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm">Allow chat</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={allowReactions} onChange={e => setAllowReactions(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm">Allow reactions</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}