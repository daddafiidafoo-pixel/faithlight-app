import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/components/I18nProvider';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, TrendingUp, Plus } from 'lucide-react';
import LoadingState from '@/components/states/LoadingState';
import ErrorState from '@/components/states/ErrorState';

export default function PrayerWallCommunity() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ content: '', category: 'personal', isAnonymous: true });
  const [submitting, setSubmitting] = useState(false);
  const [supported, setSupported] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          const me = await base44.auth.me();
          setUser(me);
        }

        const prayerData = await base44.entities.PrayerRequest.filter(
          { status: 'active' },
          '-support_count',
          50
        );
        setPrayers(prayerData);
        setLoading(false);
      } catch (err) {
        console.error('[PrayerWall] Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmitPrayer = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setSubmitting(true);
    try {
      await base44.entities.PrayerRequest.create({
        content: formData.content,
        category: formData.category,
        is_anonymous: formData.isAnonymous,
        user_id: user?.id,
        status: 'active',
        support_count: 0,
        supporters: []
      });

      // Refresh prayers
      const updated = await base44.entities.PrayerRequest.filter(
        { status: 'active' },
        '-support_count',
        50
      );
      setPrayers(updated);

      setFormData({ content: '', category: 'personal', isAnonymous: true });
      setShowForm(false);
      setSubmitting(false);
    } catch (err) {
      console.error('[PrayerWall] Submit error:', err);
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handlePrayForThis = async (prayer) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    try {
      const alreadySupported = prayer.supporters?.includes(user.id);
      const newSupporters = alreadySupported
        ? (prayer.supporters || []).filter(id => id !== user.id)
        : [...(prayer.supporters || []), user.id];

      await base44.entities.PrayerRequest.update(prayer.id, {
        supporters: newSupporters,
        support_count: newSupporters.length
      });

      const updated = await base44.entities.PrayerRequest.filter(
        { status: 'active' },
        '-support_count',
        50
      );
      setPrayers(updated);

      if (alreadySupported) {
        setSupported(prev => {
          const next = new Set(prev);
          next.delete(prayer.id);
          return next;
        });
      } else {
        setSupported(prev => new Set(prev).add(prayer.id));
      }
    } catch (err) {
      console.error('[PrayerWall] Support error:', err);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const trendingPrayers = [...prayers].sort((a, b) => (b.support_count || 0) - (a.support_count || 0)).slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('prayer.communityWall', 'Prayer Wall')}</h1>
        {user && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('prayer.share', 'Share Request')}
          </Button>
        )}
      </div>

      {/* ─── PRAYER FORM ─── */}
      {showForm && (
        <form onSubmit={handleSubmitPrayer} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3">
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder={t('prayer.sharePrayerRequest', 'Share your prayer request...')}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:border-indigo-500 resize-none h-20"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="personal">Personal</option>
              <option value="family">Family</option>
              <option value="health">Health</option>
              <option value="faith">Faith</option>
              <option value="other">Other</option>
            </select>

            <label className="flex items-center gap-2 p-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              />
              {t('prayer.anonymous', 'Anonymous')}
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? t('common.posting', 'Posting...') : t('common.post', 'Post')}
            </Button>
            <Button
              type="button"
              onClick={() => setShowForm(false)}
              variant="outline"
              className="flex-1"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
          </div>
        </form>
      )}

      {/* ─── TRENDING PRAYERS ─── */}
      {trendingPrayers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h2 className="font-bold text-gray-900">{t('prayer.trending', 'Trending Prayers')}</h2>
          </div>
          <div className="space-y-2">
            {trendingPrayers.map((prayer) => (
              <div key={prayer.id} className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-sm text-gray-800 mb-2">{prayer.content}</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                  <span>{prayer.support_count || 0} {t('prayer.pravedFor', 'people praying')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ALL PRAYERS ─── */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">{t('prayer.allRequests', 'All Prayer Requests')}</h2>
        <div className="space-y-3">
          {prayers.length === 0 ? (
            <p className="text-center text-gray-600 py-8">{t('prayer.noRequests', 'No prayer requests yet. Be the first to share.')}</p>
          ) : (
            prayers.map((prayer) => (
              <div key={prayer.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{prayer.is_anonymous ? t('prayer.anonymous', 'Anonymous') : 'Someone'}</p>
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{prayer.category}</span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-3 leading-relaxed">{prayer.content}</p>

                <button
                  onClick={() => handlePrayForThis(prayer)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    supported.has(prayer.id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${supported.has(prayer.id) ? 'fill-red-600' : ''}`} />
                  {prayer.support_count || 0} {t('prayer.prayForThis', 'Prayed for this')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}