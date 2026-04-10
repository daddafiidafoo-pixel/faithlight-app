import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Trash2 } from 'lucide-react';

export default function FlaggedContentQueue({ roomId }) {
  const [flaggedItems, setFlaggedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFlagged = async () => {
      try {
        const messages = await base44.entities.ServiceChat.filter(
          { room_id: roomId, is_flagged: true, is_reviewed: false },
          '-sent_at',
          20
        );
        setFlaggedItems(messages);
      } catch (e) {
        console.error('Failed to load flagged:', e);
      }
    };

    loadFlagged();

    const unsubscribe = base44.entities.ServiceChat.subscribe((event) => {
      if (event.data.room_id === roomId && event.data.is_flagged) {
        if (event.type === 'create' || event.type === 'update') {
          loadFlagged();
        }
      }
    });

    return unsubscribe;
  }, [roomId]);

  const handleApprove = async (id) => {
    try {
      setLoading(true);
      await base44.entities.ServiceChat.update(id, {
        is_reviewed: true,
        review_action: 'approved',
        review_at: new Date().toISOString(),
      });
      setFlaggedItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error('Failed to approve:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await base44.entities.ServiceChat.update(id, {
        is_deleted: true,
        is_reviewed: true,
        review_action: 'deleted',
        review_at: new Date().toISOString(),
      });
      setFlaggedItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error('Failed to delete:', e);
    } finally {
      setLoading(false);
    }
  };

  if (flaggedItems.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-green-700">✓ No flagged content</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-300 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          Flagged Content ({flaggedItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {flaggedItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-white border border-orange-200 rounded-lg"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">
                    {item.user_name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 break-words">
                    {item.message}
                  </p>
                </div>
                <Badge className="bg-orange-600 text-white flex-shrink-0">
                  {item.flag_severity || 'Medium'}
                </Badge>
              </div>
              {item.flag_reason && (
                <p className="text-xs text-gray-600 mb-3 italic">
                  Reason: {item.flag_reason}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs gap-1"
                  onClick={() => handleApprove(item.id)}
                  disabled={loading}
                >
                  <Check className="w-3 h-3" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 h-7 text-xs gap-1"
                  onClick={() => handleDelete(item.id)}
                  disabled={loading}
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}