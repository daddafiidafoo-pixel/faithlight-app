import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguageStore } from '@/stores/languageStore';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

export default function PinnedPrayerSection() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const [pinnedRequests, setPinnedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPinnedRequests();
  }, []);

  const loadPinnedRequests = async () => {
    try {
      const requests = await base44.entities.PinnedPrayerRequest.filter({
        is_pinned: true,
        status: 'active',
      }, '-created_date', 5);
      setPinnedRequests(requests || []);
    } catch (err) {
      console.error('Failed to load pinned requests:', err);
      setPinnedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePray = async (request) => {
    try {
      // Placeholder for prayer action
      toast.success('Prayer recorded');
    } catch (err) {
      toast.error('Failed to record prayer');
    }
  };

  const handleMarkPrayed = async (request) => {
    try {
      await base44.entities.PinnedPrayerRequest.update(request.id, {
        status: 'prayed_for',
      });
      setPinnedRequests(p => p.filter(r => r.id !== request.id));
      toast.success('Request marked as prayed for');
    } catch (err) {
      toast.error('Failed to update request');
    }
  };

  if (loading || pinnedRequests.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-bold text-gray-900">📌 Pinned Prayers</h2>
        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
          {pinnedRequests.length}
        </span>
      </div>

      <div className="space-y-2">
        {pinnedRequests.map(request => (
          <div
            key={request.id}
            className="bg-indigo-50 rounded-xl p-3 border border-indigo-100"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 truncate">
                  {request.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {request.description}
                </p>
              </div>
              <button
                onClick={() => handleMarkPrayed(request)}
                aria-label={`Mark ${request.title} as prayed for`}
                className="flex-shrink-0 min-h-[44px] min-w-[44px] p-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center text-indigo-600"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePray(request)}
                aria-label={`Pray for ${request.title}`}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Heart size={14} />
                Pray
              </button>
              <button
                aria-label={`View comments for ${request.title}`}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageCircle size={14} />
                {request.comment_count || 0}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}