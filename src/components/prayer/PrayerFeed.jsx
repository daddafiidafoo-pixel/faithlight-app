import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, Check } from 'lucide-react';
import { format } from 'date-fns';

export default function PrayerFeed() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comments, setComments] = useState({});
  const [prayedFor, setPrayedFor] = useState(new Set());

  useEffect(() => {
    fetchRequests();
    const unsubscribe = base44.entities.CommunityPrayerRequest.subscribe((event) => {
      if (event.type === 'create' || event.type === 'update') {
        fetchRequests();
      }
    });
    return unsubscribe;
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await base44.entities.CommunityPrayerRequest.list('-createdAt', 20);
      setRequests(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
      setLoading(false);
    }
  };

  const togglePrayFor = async (requestId) => {
    const newSet = new Set(prayedFor);
    if (newSet.has(requestId)) {
      newSet.delete(requestId);
    } else {
      newSet.add(requestId);
      // Notify subscribers in real-time
      await base44.entities.CommunityPrayerRequest.update(requestId, {
        prayedForCount: (requests.find(r => r.id === requestId)?.prayedForCount || 0) + 1
      });
    }
    setPrayedFor(newSet);
  };

  const markAnswered = async (requestId) => {
    await base44.entities.CommunityPrayerRequest.update(requestId, { isAnswered: true });
    fetchRequests();
  };

  const categoryColors = {
    health: 'bg-red-100 text-red-700',
    family: 'bg-blue-100 text-blue-700',
    work: 'bg-purple-100 text-purple-700',
    faith: 'bg-yellow-100 text-yellow-700',
    relationships: 'bg-pink-100 text-pink-700',
    financial: 'bg-green-100 text-green-700',
    other: 'bg-gray-100 text-gray-700'
  };

  if (loading) return <div className="p-6 text-center">Loading prayer requests...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Prayer Community</h1>
      {requests.map(request => (
        <Card key={request.id} className={`p-6 space-y-4 ${request.isAnswered ? 'bg-green-50 border-green-200' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${categoryColors[request.category]}`}>
                {request.category}
              </span>
            </div>
            {request.isAnswered && (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" />
                Answered
              </div>
            )}
          </div>

          <p className="text-gray-700 text-sm">{request.content}</p>
          <p className="text-xs text-gray-500">{format(new Date(request.createdAt), 'MMM d, yyyy')}</p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePrayFor(request.id)}
              className={prayedFor.has(request.id) ? 'text-red-600' : ''}
            >
              <Heart className={`w-4 h-4 mr-1 ${prayedFor.has(request.id) ? 'fill-current' : ''}`} />
              {request.prayedForCount || 0} Praying
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRequest(request.id === selectedRequest ? null : request.id)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Comments
            </Button>
            {!request.isAnswered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAnswered(request.id)}
              >
                Mark Answered
              </Button>
            )}
          </div>

          {selectedRequest === request.id && (
            <PrayerComments requestId={request.id} onRefresh={fetchRequests} />
          )}
        </Card>
      ))}
    </div>
  );
}

function PrayerComments({ requestId, onRefresh }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [requestId]);

  const fetchComments = async () => {
    try {
      const data = await base44.entities.PrayerRequestComment.filter(
        { prayerRequestId: requestId },
        '-createdAt'
      );
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.PrayerRequestComment.create({
        prayerRequestId: requestId,
        userEmail: user.email,
        content: newComment,
        anonymous: true
      });
      setNewComment('');
      fetchComments();
      onRefresh();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="space-y-2">
        {comments.map(comment => (
          <div key={comment.id} className="bg-white p-3 rounded text-sm">
            <p className="text-gray-700">{comment.content}</p>
            <p className="text-xs text-gray-500 mt-1">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Share an update or encouragement..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <Button size="sm" onClick={handleAddComment} disabled={loading}>
          Post
        </Button>
      </div>
    </div>
  );
}