import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, UserPlus, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfileCard({ user, currentUserId, onMessage, onAddFriend, isActionable = true }) {
  if (!user) return null;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          {user.photo_url ? (
            <img
              src={user.photo_url}
              alt={user.display_name}
              className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-indigo-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-4 text-white text-2xl font-bold">
              {user.display_name?.charAt(0) || 'U'}
            </div>
          )}

          <h3 className="text-xl font-bold text-gray-900">{user.display_name}</h3>
          <p className="text-sm text-gray-600">@{user.username}</p>

          {user.bio && (
            <p className="text-sm text-gray-700 mt-3 max-w-xs">{user.bio}</p>
          )}

          <div className="mt-4 space-y-2 w-full text-xs text-gray-600">
            {user.created_date && (
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>Joined {format(new Date(user.created_date), 'MMM yyyy')}</span>
              </div>
            )}
            {user.last_seen_at && (
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>Active {format(new Date(user.last_seen_at), 'MMM d')}</span>
              </div>
            )}
          </div>

          {isActionable && currentUserId && user.id !== currentUserId && (
            <div className="mt-6 flex gap-2 w-full">
              <Button
                onClick={() => onMessage?.(user)}
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
              >
                <Mail className="w-4 h-4" />
                Message
              </Button>
              <Button
                onClick={() => onAddFriend?.(user)}
                size="sm"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}