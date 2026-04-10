import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, LogIn, BookMarked, Target, GraduationCap, MessageSquare } from 'lucide-react';

const TYPE_CONFIG = {
  bible_book: { label: 'Bible Book', icon: BookMarked, color: 'bg-amber-100 text-amber-700' },
  topic:      { label: 'Topic Study', icon: Target,    color: 'bg-blue-100 text-blue-700' },
  course:     { label: 'Course',      icon: GraduationCap, color: 'bg-green-100 text-green-700' },
  general:    { label: 'Community',   icon: MessageSquare, color: 'bg-purple-100 text-purple-700' },
};

// Generate gradient color based on group name
const getGradientColor = (name) => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-indigo-500 to-indigo-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-rose-500 to-rose-600',
    'from-green-500 to-green-600',
    'from-teal-500 to-teal-600',
    'from-cyan-500 to-cyan-600',
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function GroupCard({ group, memberCount = 0, isJoined = false, onJoin }) {
  const initials = group.name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
  
  const gradientClass = getGradientColor(group.name);

  return (
    <Link to={`${createPageUrl('GroupDetail')}?id=${group.id}`}>
    <Card className="hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer hover:scale-105 transform">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{group.name}</CardTitle>
            <p className="text-xs text-gray-600 mt-1">
              {group.privacy === 'public' ? '🌐 Public' : '🔒 Private'}
            </p>
          </div>
          {group.group_photo_url ? (
            <img
              src={group.group_photo_url}
              alt={group.name}
              className="w-14 h-14 rounded-xl object-cover shadow-md"
            />
          ) : (
            <div className={`bg-gradient-to-br ${gradientClass} w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md`}>
              {initials}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3">
        {/* Group type badge */}
        {group.group_type && TYPE_CONFIG[group.group_type] && (() => {
          const cfg = TYPE_CONFIG[group.group_type];
          const Icon = cfg.icon;
          return (
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
              <Icon className="w-3 h-3" /> {cfg.label}
            </span>
          );
        })()}
        {group.bible_book_focus && (
          <p className="text-xs text-amber-700 font-medium">📖 {group.bible_book_focus}</p>
        )}

        {group.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
        )}

        {group.interests && group.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {group.interests.slice(0, 3).map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
            {group.interests.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{group.interests.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600 mt-auto py-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-gray-900">{memberCount.toLocaleString()}</span>
          <span className="text-gray-500">members</span>
        </div>

        {!isJoined && (
          <Button
            onClick={(e) => {
              e.preventDefault();
              onJoin?.(group);
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2 transition-all duration-300"
            size="sm"
          >
            <LogIn className="w-4 h-4" />
            Join
          </Button>
        )}
      </CardContent>
    </Card>
    </Link>
  );
}