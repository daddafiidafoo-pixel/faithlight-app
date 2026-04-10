import React from 'react';
import { Phone, Video, MoreVertical, X, Flag, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ConversationHeader({ 
  conversation, 
  otherUser,
  onCall,
  onClose,
  onReport,
  onBlock,
  onMembersClick
}) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">
            {conversation?.title || otherUser?.full_name}
          </h2>
          <p className="text-xs text-gray-600">
            {conversation?.type === 'dm' ? 'Direct Message' : `Group • ${conversation?.member_count} members`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Call Buttons */}
          {conversation?.type === 'dm' && (
            <>
              <Button
                onClick={() => onCall('audio')}
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-gray-100"
                title="Audio call"
              >
                <Phone className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => onCall('video')}
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-gray-100"
                title="Video call"
              >
                <Video className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* Group Members Button */}
          {conversation?.type === 'group' && onMembersClick && (
            <Button
              onClick={onMembersClick}
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-gray-100"
              title="Manage members"
            >
              <Phone className="w-5 h-5" />
            </Button>
          )}

          {/* More Menu */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {conversation?.type === 'dm' && (
                <>
                  <button
                    onClick={onReport}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-b border-gray-100"
                  >
                    <Flag className="w-4 h-4" />
                    Report User
                  </button>
                  <button
                    onClick={onBlock}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Block User
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}