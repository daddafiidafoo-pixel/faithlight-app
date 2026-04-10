import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useI18n } from '../I18nProvider';

const PRAYERS = [
  'Lord, guide my heart today and help me walk in faith, trusting that your plans for me are good.',
  'Father, fill me with your peace that surpasses all understanding, and let your love flow through me.',
  'Lord, give me wisdom and strength for the challenges ahead. May your light shine through my life.',
  'Heavenly Father, thank you for your grace. Help me to love others as you have loved me.',
  'Lord, renew my mind and spirit. Let every thought and action today bring glory to your name.',
  'Father, protect and guide my family. May our home be filled with your presence and peace.',
  'Lord, open my eyes to see the needs around me, and give me a willing heart to serve others.',
];

export default function PrayerOfTheDayCard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const prayer = PRAYERS[new Date().getDate() % PRAYERS.length];

  return (
    <div className="rounded-2xl p-5 mb-4 border border-purple-100"
      style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🙏</span>
        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
          {t('home.prayerOfDay', 'Prayer of the Day')}
        </p>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed italic mb-4">
        "{prayer}"
      </p>
      <button
        onClick={() => navigate(createPageUrl('PrayerWall'))}
        className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-semibold transition-colors"
      >
        {t('home.prayNow', 'Pray Now')}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}