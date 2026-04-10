import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ROLE_BADGE = {
  owner: { label: 'Owner', cls: 'bg-indigo-100 text-indigo-700' },
  moderator: { label: 'Mod', cls: 'bg-amber-100 text-amber-700' },
  admin: { label: 'Admin', cls: 'bg-red-100 text-red-700' },
};

export default function ChatMessageBubble({ message, isOwn, userName, role }) {
  const timestamp = message.created_date
    ? formatDistanceToNow(new Date(message.created_date), { addSuffix: true })
    : '';
  const initials = (userName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isVerse = message.messageType === 'verse';
  const roleBadge = ROLE_BADGE[role];

  return (
    <div className={`flex gap-2 mb-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
          <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">{initials}</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {!isOwn && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-gray-700">{userName}</span>
            {roleBadge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleBadge.cls}`}>
                {roleBadge.label}
              </span>
            )}
          </div>
        )}

        <div className={`rounded-2xl px-3 py-2 text-sm break-words ${
          isOwn
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : isVerse
              ? 'bg-indigo-50 text-gray-900 border border-indigo-200 rounded-bl-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}>
          {isVerse && message.verseReference && (
            <div className={`text-xs font-semibold mb-1 flex items-center gap-1 ${isOwn ? 'text-indigo-200' : 'text-indigo-600'}`}>
              <BookOpen className="w-3 h-3" />
              {message.verseReference}
            </div>
          )}
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        <span className="text-[10px] text-gray-400 mt-1">{timestamp}</span>
      </div>
    </div>
  );
}