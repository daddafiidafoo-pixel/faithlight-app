import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, CheckCircle } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';

const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-700',
  praying: 'bg-yellow-100 text-yellow-700',
  ongoing: 'bg-yellow-100 text-yellow-700',
  answered: 'bg-green-100 text-green-700'
};

export default function PrayerRequestCard({ prayer, userName, onPray }) {
  const { t } = useI18n();
  const status = prayer.status || 'new';

  return (
    <Card className="p-4 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900">{prayer.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {prayer.isAnonymous ? t('prayer.anonymous', 'Anonymous') : userName}
            </p>
          </div>
          <Badge className={`${STATUS_STYLES[status]} text-xs border-0`}>
            {status === 'answered' && <CheckCircle className="w-3 h-3 mr-1 inline" />}
            {status === 'answered' ? t('room.answered', 'Answered') :
              status === 'praying' || status === 'ongoing' ? t('room.praying', 'Praying') : 'New'}
          </Badge>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{prayer.content}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Heart className="w-3 h-3 text-purple-400" />
            {prayer.prayerCount || 0} {t('room.praying', 'praying')}
          </span>
          {onPray && status !== 'answered' && (
            <Button
              size="sm"
              onClick={onPray}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 h-7 px-3 text-xs"
            >
              <Heart className="w-3 h-3" />
              {t('room.amen', 'Amen')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}