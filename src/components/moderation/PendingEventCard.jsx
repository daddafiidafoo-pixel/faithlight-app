import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function PendingEventCard({ event, onAction }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      await base44.entities.LiveEvent.update(event.id, {
        is_approved: true,
        approved_by: event.created_by,
        approved_at: now
      });
      onAction('approved');
    } catch (error) {
      console.error('Approve failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await base44.entities.LiveEvent.update(event.id, {
        is_published: false,
        status: 'cancelled',
        moderation_reason: 'Removed by moderation'
      });
      onAction('removed');
    } catch (error) {
      console.error('Remove failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <p className="text-xs text-gray-500 mt-1">By: {event.created_by}</p>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-medium">{event.event_type}</p>
          </div>
          <div>
            <p className="text-gray-500">Mode</p>
            <p className="font-medium capitalize">{event.mode}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">Start Time</p>
            <p className="font-medium">{format(new Date(event.start_at), 'PPpp')}</p>
          </div>
        </div>

        {event.description && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
          </div>
        )}

        <div className="flex gap-2 pt-3">
          <Button
            onClick={handleApprove}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
            size="sm"
          >
            <Check className="w-4 h-4" />
            Approve
          </Button>
          <Button
            onClick={handleRemove}
            disabled={isLoading}
            variant="destructive"
            className="flex-1 gap-2"
            size="sm"
          >
            <X className="w-4 h-4" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}