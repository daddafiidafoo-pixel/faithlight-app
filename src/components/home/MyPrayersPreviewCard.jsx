import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useI18n } from '@/components/I18nProvider';
import { Heart, Plus, CheckCircle2 } from 'lucide-react';

const STATUS_COLORS = {
  active: 'bg-amber-100 text-amber-700',
  answered: 'bg-green-100 text-green-700',
  ongoing: 'bg-blue-100 text-blue-700',
};

export default function MyPrayersPreviewCard() {
  const { t } = useI18n();
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return;
        const u = await base44.auth.me();
        setUser(u);
        const data = await base44.entities.PrayerJournal.filter(
          { user_id: u.id, status: 'active' },
          '-created_date',
          3
        );
        setPrayers(data);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMarkAnswered = async (prayer, e) => {
    e.preventDefault();
    e.stopPropagation();
    await base44.entities.PrayerJournal.update(prayer.id, {
      status: 'answered',
      answered_date: new Date().toISOString(),
    });
    setPrayers(prev => prev.filter(p => p.id !== prayer.id));
  };

  if (!user && !loading) return null;
  if (loading) return <div className="mb-5 h-32 rounded-2xl bg-white border border-gray-100 animate-pulse" />;

  return (
    <div className="mb-5 bg-white dark:bg-slate-800 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="bg-rose-100 dark:bg-rose-900/30 p-1.5 rounded-lg">
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
            {t('prayer.myPrayers', 'My Prayers')}
          </span>
          {prayers.length > 0 && (
            <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {prayers.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={createPageUrl('PrayerJournal') + '?add=1'}
            className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('prayer.add', 'Add')}
          </Link>
          <Link
            to={createPageUrl('PrayerJournal')}
            className="text-xs text-gray-400 hover:text-indigo-500 font-medium transition-colors"
          >
            {t('common.viewAll', 'View all →')}
          </Link>
        </div>
      </div>

      {/* Prayer list */}
      <div className="px-4 py-3 space-y-2">
        {prayers.length === 0 ? (
          <Link to={createPageUrl('PrayerJournal')} className="block">
            <div className="text-center py-4 rounded-xl border border-dashed border-rose-200 dark:border-rose-800 hover:border-rose-400 transition-colors">
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('prayer.emptyActive', 'No active prayers')}</p>
              <p className="text-xs text-rose-400 mt-1 font-medium">{t('prayer.tapToAdd', 'Tap + to add one')}</p>
            </div>
          </Link>
        ) : (
          prayers.map(p => (
            <div
              key={p.id}
              className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2.5 group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{p.title}</p>
                {p.category && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[p.status] || STATUS_COLORS.active}`}>
                    {p.category}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => handleMarkAnswered(p, e)}
                title={t('prayer.markAnswered', 'Mark as Answered')}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-300 hover:text-green-500 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}