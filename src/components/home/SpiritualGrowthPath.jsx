import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sprout, Leaf, BookOpen, Flame, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const GROWTH_LEVELS = [
  {
    id: 1,
    icon: Sprout,
    color: 'emerald',
    enTitle: 'New to Faith?',
    enDesc: 'Start your spiritual journey',
    omTitle: 'Amantii Keessatti Haaraa?',
    omDesc: 'Asitti Jalqabi',
    lessons: 'Beginner Path',
    lessonCount: 7,
    badge: '🌱',
    action: 'StartJourney',
  },
  {
    id: 2,
    icon: Leaf,
    color: 'green',
    enTitle: 'Spiritual Growth',
    enDesc: 'Strengthen your faith',
    omTitle: 'Guddina Hafuuraa',
    omDesc: 'Amantii jabeessuu',
    lessons: 'Growth Path',
    lessonCount: 12,
    badge: '🌿',
    action: 'Growth',
  },
  {
    id: 3,
    icon: BookOpen,
    color: 'blue',
    enTitle: 'Deep Study',
    enDesc: 'Deep theological foundation',
    omTitle: 'Barnoota Cimaa',
    omDesc: 'Dhugaa Keessatti Hundeeffadhu',
    lessons: 'Study Path',
    lessonCount: 15,
    badge: '📖',
    action: 'DeepStudy',
  },
  {
    id: 4,
    icon: Flame,
    color: 'orange',
    enTitle: 'Leadership Training',
    enDesc: 'Become a faith leader',
    omTitle: 'Leenjii Hogganummaa',
    omDesc: 'Geggeessaa Amantii ta\'uu',
    lessons: 'Leadership Path',
    lessonCount: 18,
    badge: '🔥',
    action: 'Leadership',
  },
];

export default function SpiritualGrowthPath({ userLanguage = 'en' }) {
  const isOmo = userLanguage === 'om';

  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200',
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    orange: 'bg-orange-50 border-orange-200',
  };

  const iconColorMap = {
    emerald: 'text-emerald-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
  };

  return (
    <div className="py-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl px-6 mb-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          {isOmo ? '📚 Imala Kee Itti Fufi' : '📚 Continue Your Journey'}
        </h2>
        <p className="text-lg text-gray-600">
          {isOmo
            ? 'Sadarkaa Buusaa Gara Geggeessummaa'
            : 'A four-level path from beginner to leader'}
        </p>
      </div>

      {/* Growth Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {GROWTH_LEVELS.map((level) => {
          const Icon = level.icon;
          return (
            <Card
              key={level.id}
              className={`border-2 ${colorMap[level.color]} hover:shadow-lg transition-all duration-300 h-full`}
            >
              <CardContent className="pt-6 flex flex-col h-full">
                {/* Icon and Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-6 h-6 ${iconColorMap[level.color]}`} />
                  </div>
                  <Badge className="bg-gray-800 text-white text-lg">{level.badge}</Badge>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {isOmo ? level.omTitle : level.enTitle}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {isOmo ? level.omDesc : level.enDesc}
                </p>

                {/* Lesson Count */}
                <div className="flex items-center justify-between mb-6 mt-auto">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {level.lessons}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {level.lessonCount} {isOmo ? 'barnoota' : 'lessons'}
                  </Badge>
                </div>

                {/* Action Button */}
                <Link
                  to={createPageUrl('PersonalizedLearningPath')}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-gray-300 hover:bg-gray-100"
                  >
                    {isOmo ? 'Jalqabi' : 'Start Level'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-3">
          {isOmo ? 'Imala Jalqabi' : 'Start Your Spiritual Journey'}
        </h3>
        <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
          {isOmo
            ? 'Yesus eenyu akka ta\'e beekuu jalqabi. Guddina hafuuraa itti fufi. Geggeessaa ta\'uu.'
            : 'Understand Jesus. Grow spiritually. Become a leader. All at your own pace.'}
        </p>
        <Link to={createPageUrl('PersonalizedLearningPath')}>
          <Button className="bg-white text-indigo-600 hover:bg-indigo-50 gap-2 font-semibold">
            {isOmo ? 'Itti Fufi' : 'Continue Now'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}