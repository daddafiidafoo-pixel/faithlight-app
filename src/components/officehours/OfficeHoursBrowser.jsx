import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader, Clock, Users, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function OfficeHoursBrowser({ user }) {
  const queryClient = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getNextDate('monday'));
  const [sessionType, setSessionType] = useState('all');

  const { data: officeHours = [] } = useQuery({
    queryKey: ['available-office-hours'],
    queryFn: () => base44.entities.OfficeHours.filter({ is_active: true }, '-created_date'),
  });

  const bookSession = useMutation({
    mutationFn: async (slot) => {
      const startTime = new Date(selectedDate);
      const [hours, mins] = slot.start_time.split(':');
      startTime.setHours(parseInt(hours), parseInt(mins), 0);

      const endTime = new Date(selectedDate);
      const [eHours, eMins] = slot.end_time.split(':');
      endTime.setHours(parseInt(eHours), parseInt(eMins), 0);

      return await base44.entities.OfficeHoursSession.create({
        office_hours_id: slot.id,
        instructor_user_id: slot.instructor_user_id,
        instructor_name: slot.instructor_name,
        scheduled_date: selectedDate,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        booked_by_user_id: user.id,
        booked_by_name: user.full_name,
        participants: [
          {
            user_id: user.id,
            name: user.full_name,
            email: user.email,
          }
        ],
        session_type: slot.session_type,
        status: 'scheduled',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-office-hours'] });
      toast.success('Session booked successfully!');
      setSelectedSlot(null);
    },
  });

  const filteredSlots = officeHours.filter(slot => {
    if (sessionType === 'all') return true;
    return slot.session_type === sessionType;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Find Office Hours</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold mb-1 block">Session Type</label>
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="one_on_one">1-on-1 Only</SelectItem>
                <SelectItem value="group">Group Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block">Preferred Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Office Hours Grid */}
      {filteredSlots.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center text-gray-600">
            No office hours available matching your filters
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredSlots.map(slot => (
            <Card key={slot.id} className="hover:shadow-md transition cursor-pointer" onClick={() => setSelectedSlot(slot)}>
              <CardHeader>
                <CardTitle className="text-lg flex items-start justify-between">
                  <span>{slot.instructor_name}</span>
                  <Badge variant="outline">{slot.session_type === 'one_on_one' ? '1-on-1' : 'Group'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">{slot.title}</p>
                  {slot.description && (
                    <p className="text-sm text-gray-600 mt-1">{slot.description}</p>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    {slot.day_of_week.charAt(0).toUpperCase() + slot.day_of_week.slice(1)} {slot.start_time}-{slot.end_time}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4" />
                    {slot.session_type === 'one_on_one' ? '1 participant' : `Max ${slot.max_participants} participants`}
                  </div>
                </div>

                {slot.topics?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {slot.topics.slice(0, 2).map(topic => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button className="w-full" onClick={() => setSelectedSlot(slot)}>
                  Book Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      {selectedSlot && (
        <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Booking</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <p className="font-semibold text-gray-900">{selectedSlot.title}</p>
                <p className="text-sm text-gray-600 mt-1">with {selectedSlot.instructor_name}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <div>
                  <span className="font-semibold">Date:</span> {new Date(selectedDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Time:</span> {selectedSlot.start_time} - {selectedSlot.end_time}
                </div>
                <div>
                  <span className="font-semibold">Type:</span> {selectedSlot.session_type === 'one_on_one' ? '1-on-1 Session' : 'Group Session'}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => bookSession.mutate(selectedSlot)}
                  disabled={bookSession.isPending}
                  className="flex-1 gap-2"
                >
                  {bookSession.isPending && <Loader className="w-4 h-4 animate-spin" />}
                  Book Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function getNextDate(dayOfWeek) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(dayOfWeek);
  const today = new Date();
  const currentDay = today.getDay();
  let daysAhead = targetDay - currentDay;

  if (daysAhead <= 0) {
    daysAhead += 7;
  }

  const date = new Date(today);
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}