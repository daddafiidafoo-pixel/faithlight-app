import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Trophy, Zap, Crown, BookOpen, Users, Flame } from 'lucide-react';

const BADGE_CONFIG = {
  first_public_note: {
    name: 'First Steps',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-800',
    description: 'Shared your first public note'
  },
  first_public_highlight: {
    name: 'Highlighter',
    icon: Star,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Highlighted your first verse publicly'
  },
  first_discussion: {
    name: 'Conversation Starter',
    icon: Users,
    color: 'bg-purple-100 text-purple-800',
    description: 'Started your first discussion'
  },
  top_contributor: {
    name: 'Top Contributor',
    icon: Trophy,
    color: 'bg-amber-100 text-amber-800',
    description: 'Ranked in top 10 contributors'
  },
  daily_engagement_7: {
    name: '7-Day Streak',
    icon: Flame,
    color: 'bg-orange-100 text-orange-800',
    description: 'Engaged 7 days in a row'
  },
  daily_engagement_30: {
    name: '30-Day Warrior',
    icon: Flame,
    color: 'bg-red-100 text-red-800',
    description: 'Engaged 30 days in a row'
  },
  helpful_100: {
    name: 'Helper',
    icon: Zap,
    color: 'bg-green-100 text-green-800',
    description: '100+ helpful contributions'
  },
  scholar: {
    name: 'Scholar',
    icon: Award,
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Deep engagement with Scripture'
  },
  community_leader: {
    name: 'Community Leader',
    icon: Crown,
    color: 'bg-pink-100 text-pink-800',
    description: 'Outstanding community leadership'
  },
  verse_master: {
    name: 'Verse Master',
    icon: BookOpen,
    color: 'bg-teal-100 text-teal-800',
    description: 'Mastered many Bible passages'
  }
};

export default function BadgeDisplay({ badges, showAll = false, compact = false }) {
  if (!badges || badges.length === 0) return null;

  const displayBadges = showAll ? badges : badges.slice(0, 3);

  if (compact) {
    return (
      <div className="flex gap-1 flex-wrap">
        {displayBadges.map((badge) => {
          const config = BADGE_CONFIG[badge.badge_type] || {};
          const Icon = config.icon || Award;
          return (
            <div
              key={badge.id}
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${config.color || 'bg-gray-100'}`}
              title={`${config.name}: ${config.description}`}
            >
              <Icon className="w-3 h-3" />
            </div>
          );
        })}
        {!showAll && badges.length > 3 && (
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs">
            +{badges.length - 3}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {displayBadges.map((badge) => {
        const config = BADGE_CONFIG[badge.badge_type] || {};
        const Icon = config.icon || Award;
        return (
          <Badge
            key={badge.id}
            className={`${config.color || 'bg-gray-100 text-gray-800'} gap-1`}
            title={config.description}
          >
            <Icon className="w-3 h-3" />
            {config.name || badge.badge_name}
          </Badge>
        );
      })}
      {!showAll && badges.length > 3 && (
        <Badge variant="outline">+{badges.length - 3} more</Badge>
      )}
    </div>
  );
}