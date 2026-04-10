import React, { useState } from 'react';
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

export default function ScheduleLiveEventModal({ open, onOpenChange, onEventScheduled }) {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [eventCategory, setEventCategory] = useState('bible_study');
  const [startTime, setStartTime] = useState(null);
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [duration, setDuration] = useState('60');
  const [videoUrl, setVideoUrl] = useState('');
  const [allowQuestions, setAllowQuestions] = useState(true);
  const [ticketPrice, setTicketPrice] = useState('0');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    if (open) getUser();
  }, [open]);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Event title is required');
      return;
    }

    if (!startTime) {
      toast.error('Start date and time are required');
      return;
    }

    setIsLoading(true);
    try {
      const dateTime = new Date(startTime);
      dateTime.setHours(parseInt(startHour), parseInt(startMinute), 0);

      // Create main event
      const parsedPrice = parseFloat(ticketPrice) || 0;
      const event = await base44.entities.LiveRoom.create({
        type: 'audio_stage',
        title: title.trim(),
        description: description.trim(),
        event_type: eventCategory,
        room_type: eventCategory,
        host_id: user.id,
        host_name: user.full_name,
        status: 'scheduled',
        scheduled_start: dateTime.toISOString(),
        start_time: dateTime.toISOString(),
        duration_minutes: parseInt(duration),
        allow_chat: true,
        allow_reactions: allowQuestions,
        ticket_price: parsedPrice,
        is_paid: parsedPrice > 0,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : null,
        recurrence_end_date: isRecurring && recurrenceEndDate ? recurrenceEndDate.toISOString() : null,
      });

      // Create recurring instances if needed
      if (isRecurring && recurrenceEndDate) {
        const instances = [];
        const maxInstances = 20; // Limit to prevent abuse
        let currentDate = new Date(dateTime);
        
        const addInterval = {
          daily: 1,
          weekly: 7,
          biweekly: 14,
          monthly: 30
        }[recurrencePattern];

        while (instances.length < maxInstances && currentDate < recurrenceEndDate) {
          currentDate = new Date(currentDate.getTime() + addInterval * 24 * 60 * 60 * 1000);
          if (currentDate <= recurrenceEndDate) {
            instances.push({
              type: 'audio_stage',
              title: title.trim(),
              description: description.trim(),
              event_type: eventCategory,
              room_type: eventCategory,
              host_id: user.id,
              host_name: user.full_name,
              status: 'scheduled',
              scheduled_start: currentDate.toISOString(),
              start_time: currentDate.toISOString(),
              duration_minutes: parseInt(duration),
              allow_chat: true,
              allow_reactions: true,
              is_recurring: true,
              parent_event_id: event.id,
            });
          }
        }

        if (instances.length > 0) {
          await base44.entities.LiveRoom.bulkCreate(instances);
        }
      }

      toast.success('Event scheduled successfully!');
      onEventScheduled?.();
      onOpenChange(false);

      // Reset form
      setTitle('');
      setDescription('');
      setPrivacy('public');
      setEventCategory('bible_study');
      setStartTime(null);
      setStartHour('09');
      setStartMinute('00');
      setDuration('60');
      setVideoUrl('');
      setAllowQuestions(true);
      setIsRecurring(false);
      setRecurrencePattern('weekly');
      setRecurrenceEndDate(null);
      setTicketPrice('0');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to schedule event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Live Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sunday Morning Sermon"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you be discussing?"
              className="h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Category
            </label>
            <Select value={eventCategory} onValueChange={setEventCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bible_study">📖 Bible Study Group</SelectItem>
                <SelectItem value="qa_session">❓ Q&A with Teacher/Pastor</SelectItem>
                <SelectItem value="prayer_meeting">🙏 Prayer Meeting</SelectItem>
                <SelectItem value="sermon">⛪ Sermon/Teaching</SelectItem>
                <SelectItem value="workshop">🎓 Workshop</SelectItem>
                <SelectItem value="webinar">💻 Webinar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Conference Link (optional)
            </label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Zoom, Google Meet, or other meeting URL"
            />
            <p className="text-xs text-gray-500 mt-1">
              Participants will be able to join via this link
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy
            </label>
            <Select value={privacy} onValueChange={setPrivacy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">🌐 Public</SelectItem>
                <SelectItem value="group_only">👥 Group Only</SelectItem>
                <SelectItem value="invite_only">🔒 Invite Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowQuestions}
                  onChange={(e) => setAllowQuestions(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Allow Q&A</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startTime ? format(startTime, 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startTime}
                    onSelect={setStartTime}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <div className="flex gap-2">
                <Select value={startHour} onValueChange={setStartHour}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) =>
                      <SelectItem key={i} value={String(i).padStart(2, '0')}>
                        {String(i).padStart(2, '0')}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <span className="text-2xl text-gray-400">:</span>
                <Select value={startMinute} onValueChange={setStartMinute}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 15, 30, 45].map((min) =>
                      <SelectItem key={min} value={String(min).padStart(2, '0')}>
                        {String(min).padStart(2, '0')}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket Price (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Set to $0.00 for a free event. Attendees will be charged this amount to join.
            </p>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                Make this a recurring event
              </label>
            </div>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat
                  </label>
                  <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Until
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {recurrenceEndDate ? format(recurrenceEndDate, 'MMM d, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={recurrenceEndDate}
                        onSelect={setRecurrenceEndDate}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isLoading || !title.trim() || !startTime}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Schedule Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}