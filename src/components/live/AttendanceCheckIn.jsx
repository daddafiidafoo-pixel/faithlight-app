import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check } from 'lucide-react';

export default function AttendanceCheckIn({ eventId, attendeeRecord, onCheckedIn }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(!!attendeeRecord?.checked_in_at);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setError('');

      await base44.entities.LiveEventAttendee.update(attendeeRecord.id, {
        checked_in_at: new Date().toISOString(),
        attended: true
      });

      setIsCheckedIn(true);
      onCheckedIn?.();
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckedIn) {
    return (
      <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
        <Check className="w-5 h-5 text-green-600" />
        <span className="text-green-800 font-semibold">✓ You've checked in</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      <Button
        onClick={handleCheckIn}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? 'Checking in...' : '📍 Check In'}
      </Button>
    </div>
  );
}