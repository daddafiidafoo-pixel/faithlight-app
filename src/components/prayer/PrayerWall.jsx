import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Send, Loader } from 'lucide-react';

export default function PrayerWall() {
  const [prayers, setPrayers] = useState([]);
  const [newPrayer, setNewPrayer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPrayers();
    const unsubscribe = base44.entities.PrayerRequest.subscribe((event) => {
      if (event.type === 'create') {
        setPrayers((prev) => [event.data, ...prev]);
      }
    });
    return unsubscribe;
  }, []);

  const loadPrayers = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.PrayerRequest.list('-created_date', 50);
      setPrayers(data || []);
    } catch (err) {
      console.error('Failed to load prayers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newPrayer.trim()) return;

    setSubmitting(true);
    try {
      await base44.entities.PrayerRequest.create({
        content: newPrayer,
        isAnonymous: true,
        prayerCount: 0,
      });
      setNewPrayer('');
    } catch (err) {
      console.error('Failed to post prayer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePray = async (prayerId, currentCount) => {
    try {
      await base44.entities.PrayerRequest.update(prayerId, {
        prayerCount: currentCount + 1,
      });
      setPrayers((prev) =>
        prev.map((p) =>
          p.id === prayerId ? { ...p, prayerCount: currentCount + 1 } : p
        )
      );
    } catch (err) {
      console.error('Failed to add prayer support:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Prayer Wall</h1>
        <p className="text-gray-600 mt-2">Share your prayer requests and support others</p>
      </div>

      {/* Prayer Submission */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Share a Prayer Request (Anonymous)
        </label>
        <Textarea
          value={newPrayer}
          onChange={(e) => setNewPrayer(e.target.value)}
          placeholder="What would you like prayer for?"
          className="w-full mb-3"
          rows={3}
        />
        <Button
          onClick={handleSubmit}
          disabled={submitting || !newPrayer.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {submitting ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Share Prayer
            </>
          )}
        </Button>
      </div>

      {/* Prayers List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading prayers...</div>
        ) : prayers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No prayers yet. Be the first to share.
          </div>
        ) : (
          prayers.map((prayer) => (
            <div
              key={prayer.id}
              className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-400 hover:shadow-lg transition-shadow"
            >
              <p className="text-gray-800">{prayer.content}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-500">
                  {new Date(prayer.created_date).toLocaleDateString()}
                </span>
                <Button
                  onClick={() => handlePray(prayer.id, prayer.prayerCount || 0)}
                  variant="outline"
                  className="gap-2 text-purple-600 hover:bg-purple-50"
                >
                  <Heart className="w-4 h-4" />
                  {prayer.prayerCount || 0} Praying
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}