import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export default function PrayerRequestPanel({ roomId, user, isHost }) {
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const reqs = await base44.entities.ServicePrayerRequest.filter(
          { room_id: roomId },
          '-created_date',
          30
        );
        setRequests(reqs);
      } catch (e) {
        console.error('Failed to load requests:', e);
      }
    };
    loadRequests();
  }, [roomId]);

  useEffect(() => {
    const unsubscribe = base44.entities.ServicePrayerRequest.subscribe((event) => {
      if (event.data.room_id === roomId) {
        if (event.type === 'create') {
          setRequests((prev) => [event.data, ...prev]);
        }
        if (event.type === 'update') {
          setRequests((prev) =>
            prev.map((r) => (r.id === event.id ? event.data : r))
          );
        }
      }
    });
    return unsubscribe;
  }, [roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRequest.trim()) return;

    try {
      setLoading(true);
      await base44.entities.ServicePrayerRequest.create({
        room_id: roomId,
        user_id: user.id,
        user_name: user.full_name,
        request_text: newRequest.trim(),
        status: 'pending',
      });
      setNewRequest('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    } catch (e) {
      console.error('Failed to submit:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (reqId) => {
    try {
      await base44.entities.ServicePrayerRequest.update(reqId, {
        status: 'read',
        read_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  const handleMarkPrayed = async (reqId) => {
    try {
      await base44.entities.ServicePrayerRequest.update(reqId, {
        status: 'prayed',
        prayed_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Failed to mark prayed:', e);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {requests.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No prayer requests yet</p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="p-2 bg-blue-50 rounded-lg border border-blue-200 group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-semibold text-gray-900">{req.user_name}</p>
                <Badge variant="outline" className="text-xs bg-white">
                  {req.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-700 break-words">{req.request_text}</p>

              {isHost && (
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {req.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={() => handleMarkRead(req.id)}
                    >
                      Read
                    </Button>
                  )}
                  {req.status === 'read' && (
                    <Button
                      size="sm"
                      className="h-6 text-xs bg-green-600"
                      onClick={() => handleMarkPrayed(req.id)}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Prayed
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Share your prayer request..."
          value={newRequest}
          onChange={(e) => setNewRequest(e.target.value)}
          disabled={loading}
          className="h-16 text-xs"
        />
        <Button
          type="submit"
          disabled={loading || !newRequest.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs"
        >
          {submitted ? '✓ Sent' : 'Send Prayer Request'}
        </Button>
      </form>
    </div>
  );
}