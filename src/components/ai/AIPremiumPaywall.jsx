import React from 'react';
import { AlertTriangle, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIPremiumPaywall({ feature, language, onUpgrade }) {
  const isOm = language === 'om';

  const FEATURES = {
    study_plan_pro: {
      en: 'Study Plan Builder Pro',
      om: 'Pro Karoorsaa Barumsa',
      desc: 'Personalized 7/14/30/90-day plans with daily readings, reflection questions, and memory verses.',
    },
    sermon_pro: {
      en: 'Sermon Builder Pro',
      om: 'Pro Karoorsaa Kadhannaa',
      desc: 'Full outlines with audience selection, timing, and PDF export.',
    },
    commentary: {
      en: 'AI Bible Commentary',
      om: 'AI Seensa Kitaaba',
      desc: 'Historical context, theological insights, and scholarly references.',
    },
    group_assistant: {
      en: 'Group Leader Assistant',
      om: 'Assistant Hogganaa Garee',
      desc: 'Summarize discussions and generate group guides.',
    },
    unlimited: {
      en: 'Unlimited Messages',
      om: 'Ergaa Hin Xummurre',
      desc: 'Upgrade to send up to 50 messages per day.',
    },
  };

  const info = FEATURES[feature] || FEATURES.unlimited;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
        <Lock className="w-6 h-6 text-indigo-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{isOm ? info.om : info.en}</h3>
      <p className="text-sm text-gray-600 mb-4">{info.desc}</p>
      <Button onClick={onUpgrade} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
        <Sparkles className="w-4 h-4" />
        {isOm ? 'Fooyyessi' : 'Upgrade to Premium'}
      </Button>
      <p className="text-xs text-gray-400 mt-3">
        {isOm ? '$3.99/jida' : '$3.99/month'}
      </p>
    </div>
  );
}