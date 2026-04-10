import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useI18n } from '../I18nProvider';
import { Button } from '@/components/ui/button';
import { BookOpen, Headphones } from 'lucide-react';

export default function BibleExperienceCard() {
  const { t, isRTL } = useI18n();

  return (
    <div className="mb-6">
      {/* Section Title */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {t('bibleExperience.title', 'Experience the Bible')}
        </h2>
        <p className="text-sm text-gray-600">
          {t('bibleExperience.subtitle', 'Read with your eyes or listen with audio')}
        </p>
      </div>

      {/* Two Card Layout */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Read Card */}
        <Link to={createPageUrl('BibleReader')} className="group">
          <div className="h-full bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">
                  {t('bibleExperience.readTitle', 'Read the Bible')}
                </h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('bibleExperience.readDesc', 'Read Scripture chapter by chapter in a clean and focused view.')}
            </p>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              {t('bibleExperience.readButton', 'Start Reading')}
            </Button>
          </div>
        </Link>

        {/* Listen Card */}
        <Link to={createPageUrl('AudioBibleV2')} className="group">
          <div className="h-full bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
                <Headphones className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">
                  {t('bibleExperience.listenTitle', 'Listen to the Bible')}
                </h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('bibleExperience.listenDesc', 'Hear the Bible with audio playback anytime, even while traveling.')}
            </p>
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
              {t('bibleExperience.listenButton', 'Start Listening')}
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
}