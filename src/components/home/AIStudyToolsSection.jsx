import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useI18n } from '../I18nProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Lightbulb } from 'lucide-react';

const TOOLS = [
  {
    icon: BookOpen,
    title: 'aiStudy.cards.sermon.title',
    titleEn: 'Sermon Builder',
    desc: 'aiStudy.cards.sermon.desc',
    descEn: 'Create sermon ideas and outlines',
    link: 'SermonBuilder',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Lightbulb,
    title: 'aiStudy.cards.lesson.title',
    titleEn: 'Lesson Creator',
    desc: 'aiStudy.cards.lesson.desc',
    descEn: 'Generate structured lessons',
    link: 'AIStudyPlanBuilder',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Sparkles,
    title: 'aiStudy.cards.devotional.title',
    titleEn: 'Devotional',
    desc: 'aiStudy.cards.devotional.desc',
    descEn: 'Create daily reflections',
    link: 'DailyDevotionals',
    color: 'bg-amber-50 text-amber-600',
  },
];

export default function AIStudyToolsSection() {
  const { t } = useI18n();

  return (
    <div className="mb-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          {t('aiStudy.title', 'AI Study Tools')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.link} to={createPageUrl(tool.link)}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className={`p-2 rounded-lg ${tool.color} w-fit mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base">
                    {t(tool.title, tool.titleEn)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600 mb-4">
                    {t(tool.desc, tool.descEn)}
                  </p>
                  <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    {t('actions.open', 'Open')}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}