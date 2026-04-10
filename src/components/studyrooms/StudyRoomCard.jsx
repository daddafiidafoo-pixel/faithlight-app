import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Lock, Globe, Clock } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { formatDistanceToNow } from 'date-fns';

export default function StudyRoomCard({ room, onJoin, isMember, onOpen }) {
  const { t } = useI18n();
  const isPrivate = room.privacy === 'private';

  const lastActive = room.lastActivityAt
    ? formatDistanceToNow(new Date(room.lastActivityAt), { addSuffix: true })
    : null;

  const categoryColors = {
    'Bible Study': 'bg-blue-50 text-blue-700 border-blue-200',
    'Prayer': 'bg-purple-50 text-purple-700 border-purple-200',
    'Youth': 'bg-orange-50 text-orange-700 border-orange-200',
    'Women': 'bg-pink-50 text-pink-700 border-pink-200',
    'Men': 'bg-teal-50 text-teal-700 border-teal-200',
    'Theology': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Daily Devotion': 'bg-amber-50 text-amber-700 border-amber-200',
    'Gospel Outreach': 'bg-green-50 text-green-700 border-green-200',
    'Testimony': 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const handleClick = () => {
    if (isMember && onOpen) onOpen(room);
    else onJoin(room);
  };

  return (
    <Card
      className="p-5 hover:shadow-lg transition-all cursor-pointer border hover:border-indigo-200 group"
      onClick={handleClick}
    >
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
              {room.name}
            </h3>
            {room.created_by && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">by {room.created_by}</p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`flex-shrink-0 flex items-center gap-1 text-xs ${isPrivate ? 'border-amber-300 text-amber-700 bg-amber-50' : 'border-green-300 text-green-700 bg-green-50'}`}
          >
            {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {isPrivate ? t('createRoom.private', 'Private') : t('createRoom.public', 'Public')}
          </Badge>
        </div>

        {/* Category + Language */}
        <div className="flex flex-wrap gap-1.5">
          {room.category && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[room.category] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {room.category}
            </span>
          )}
          {room.language && (
            <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200">
              {room.language}
            </span>
          )}
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{room.description}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {room.memberCount || 1}
          </span>
          {lastActive && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastActive}
            </span>
          )}
        </div>

        {/* Action button */}
        <Button
          onClick={(e) => { e.stopPropagation(); onJoin(room); }}
          className={`w-full text-sm ${isMember ? 'bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          variant={isMember ? 'outline' : 'default'}
        >
          {isMember ? t('studyRooms.open', 'Open') : t('studyRooms.join', 'Join')}
        </Button>
      </div>
    </Card>
  );
}