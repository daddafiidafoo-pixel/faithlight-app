import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BibleStudyGroupCard({ group, currentUserId, isMember, onJoin, onViewDetails }) {
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!currentUserId) {
      alert('Please login to join groups');
      return;
    }

    setJoining(true);
    try {
      // Create a group membership record
      await base44.entities.GroupMember.create({
        group_id: group.id,
        user_id: currentUserId,
        role: 'member',
      });
      onJoin?.();
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  const focusAreaLabels = {
    old_testament: 'Old Testament',
    new_testament: 'New Testament',
    gospels: 'Gospels',
    prophecy: 'Prophecy',
    theology: 'Theology',
    discipleship: 'Discipleship',
    prayer: 'Prayer',
    other: 'General',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      {group.cover_image && (
        <img 
          src={group.cover_image}
          alt={group.name}
          className="w-full h-32 object-cover"
        />
      )}

      <div className="p-4">
        {/* Header */}
        <h3 className="font-semibold text-lg mb-1">{group.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>

        {/* Focus Area Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
            {focusAreaLabels[group.focus_area] || group.focus_area}
          </span>
        </div>

        {/* Group Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{group.member_count} members</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{group.discussion_count} posts</span>
          </div>
        </div>

        {/* Schedule */}
        {group.meeting_schedule && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Zap className="w-4 h-4" />
            <span>{group.meeting_schedule}</span>
          </div>
        )}

        {/* Books */}
        {group.bible_books && group.bible_books.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Studying:</p>
            <div className="flex flex-wrap gap-1">
              {group.bible_books.slice(0, 3).map(book => (
                <span key={book} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {book}
                </span>
              ))}
              {group.bible_books.length > 3 && (
                <span className="text-xs text-gray-500">+{group.bible_books.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isMember ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={onViewDetails}
              >
                View Group
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={onViewDetails}
              >
                Learn More
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={handleJoin}
                disabled={joining}
              >
                {joining ? 'Joining...' : 'Join'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}