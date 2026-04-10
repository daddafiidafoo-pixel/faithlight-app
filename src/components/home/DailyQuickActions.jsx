import React from 'react';
import { BookOpen, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../I18nProvider';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function DailyQuickActions({ user, isPremium }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  const actions = [
    {
      icon: Sparkles,
      label: t('daily.askAI', 'Ask AI'),
      desc: t('daily.askDesc', 'Scripture questions'),
      onClick: () => navigate(createPageUrl('AskAI')),
      color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200',
    },
    {
      icon: BookOpen,
      label: t('daily.study', 'Study Plan'),
      desc: t('daily.studyDesc', 'Guided learning'),
      onClick: () => navigate(createPageUrl('BibleStudyPlans')),
      color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
    },
    {
      icon: MessageCircle,
      label: t('daily.pray', 'Prayer'),
      desc: t('daily.prayDesc', 'Share a request'),
      onClick: () => navigate(createPageUrl('PrayerWall')),
      color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          onClick={action.onClick}
          variant="outline"
          className={`flex-col items-start h-auto py-3 px-4 justify-start border ${action.color}`}
        >
          <action.icon className="w-5 h-5 mb-2" />
          <div className="text-left">
            <p className="text-sm font-semibold">{action.label}</p>
            <p className="text-xs opacity-75">{action.desc}</p>
          </div>
        </Button>
      ))}
    </div>
  );
}