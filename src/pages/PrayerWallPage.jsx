import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import PrayerWall from '@/components/prayer/PrayerWall';
import { useI18n } from '@/components/I18nProvider';

export default function PrayerWallPage() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { base44 } = await import('@/api/base44Client');
        const authenticated = await base44.auth.isAuthenticated();
        if (authenticated) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };
    loadUser();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <Heart className="w-10 h-10 text-red-500" />
          {t('prayer.title', 'Prayer Wall')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t('prayer.subtitle', 'Share your prayers and support others in their faith journey')}
        </p>
      </div>

      {/* Prayer Wall Component */}
      <PrayerWall user={user} />

      {/* Instructions */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-3">{t('prayer.how_it_works', 'How It Works')}</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>✨ {t('prayer.instruction1', 'Post your prayer request anonymously to the community')}</li>
          <li>❤️ {t('prayer.instruction2', 'Support others\' prayers by clicking the heart icon')}</li>
          <li>🙏 {t('prayer.instruction3', 'All prayers are uplifted with love and confidentiality')}</li>
          <li>✅ {t('prayer.instruction4', 'Mark prayers as answered when God moves')}</li>
        </ul>
      </div>
    </div>
  );
}