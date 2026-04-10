import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heart, Send, Loader2 } from 'lucide-react';

export default function CommunityPrayerBoard() {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const allRequests = await base44.entities.PrayerRequest.filter(
          { is_active: true },
          '-created_date',
          50
        );
        setRequests(allRequests);
      } catch (error) {
        console.error('Failed to load prayer requests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to post a prayer request');
      return;
    }

    setSubmitting(true);
    try {
      const newRequest = await base44.entities.PrayerRequest.create({
        user_email: user.email,
        user_name: user.full_name || user.email,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        prayer_count: 0,
        prayed_by_emails: [],
      });

      setRequests([newRequest, ...requests]);
      setFormData({ title: '', description: '', category: 'other' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to post request:', error);
      alert('Failed to post prayer request');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePray = async (requestId) => {
    if (!user) {
      alert('Please sign in to pray');
      return;
    }

    try {
      const request = requests.find((r) => r.id === requestId);
      if (!request) return;

      const alreadyPrayed = request.prayed_by_emails?.includes(user.email);
      const updatedEmails = alreadyPrayed
        ? request.prayed_by_emails.filter((e) => e !== user.email)
        : [...(request.prayed_by_emails || []), user.email];

      const updated = await base44.entities.PrayerRequest.update(requestId, {
        prayer_count: updatedEmails.length,
        prayed_by_emails: updatedEmails,
      });

      setRequests(requests.map((r) => (r.id === requestId ? updated : r)));
    } catch (error) {
      console.error('Failed to update prayer count:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Community Prayer Board</CardTitle>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            {showForm ? 'Cancel' : 'Post Request'}
          </Button>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-4 border-t pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Prayer request title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Textarea
                placeholder="Describe your prayer request..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="min-h-24"
              />
              <Select value={formData.category} onValueChange={(value) => 
                setFormData({ ...formData, category: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="faith">Faith</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={submitting} className="w-full gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post Prayer Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No prayer requests yet. Be the first to share!</p>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition">
              <CardContent className="pt-6 space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                      <p className="text-xs text-gray-500">
                        by {request.user_name} • {request.category}
                      </p>
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      {request.prayer_count} praying
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{request.description}</p>
                </div>
                <Button
                  onClick={() => handlePray(request.id)}
                  variant={
                    user && request.prayed_by_emails?.includes(user.email)
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  className="gap-2"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      user && request.prayed_by_emails?.includes(user.email)
                        ? 'fill-current'
                        : ''
                    }`}
                  />
                  Pray for This
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}