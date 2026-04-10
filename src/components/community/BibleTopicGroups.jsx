import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Plus, MessageCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const BIBLE_TOPICS = [
  { name: 'Proverbs & Wisdom', emoji: '🧠' },
  { name: 'Psalms & Prayer', emoji: '🙏' },
  { name: 'Gospel Stories', emoji: '✝️' },
  { name: 'Parables & Teachings', emoji: '📚' },
  { name: 'Old Testament History', emoji: '⛪' },
  { name: 'Prophecy & End Times', emoji: '🔮' },
  { name: 'Letters & Epistles', emoji: '💌' },
  { name: 'Miracles & Signs', emoji: '✨' },
  { name: 'Daily Devotions', emoji: '📖' },
  { name: 'Bible Studies', emoji: '🎓' }
];

export default function BibleTopicGroups({ user, isDarkMode }) {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const queryClient = useQueryClient();

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  // Fetch discussion groups
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['discussionGroups'],
    queryFn: async () => {
      try {
        return await base44.entities.GroupPost.filter({}, '-created_date', 50);
      } catch {
        return [];
      }
    }
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (groupData) => {
      return base44.entities.GroupPost.create({
        creator_id: user?.id,
        creator_name: user?.full_name || 'Anonymous',
        title: groupData.name,
        topic_category: groupData.topic,
        description: groupData.description,
        member_count: 1,
        is_open: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussionGroups'] });
      setGroupName('');
      setGroupDesc('');
      setSelectedTopic(null);
      setShowCreateGroup(false);
      toast.success('Discussion group created!');
    },
    onError: () => {
      toast.error('Failed to create group');
    }
  });

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !selectedTopic || !user) {
      toast.error('Please fill in all fields');
      return;
    }
    createGroupMutation.mutate({
      name: groupName,
      topic: selectedTopic,
      description: groupDesc
    });
  };

  const filteredGroups = selectedTopic 
    ? groups.filter(g => g.topic_category === selectedTopic)
    : groups.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Create Group Button */}
      <Card style={{ backgroundColor: cardColor, borderColor }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
            <BookOpen className="w-5 h-5" style={{ color: primaryColor }} />
            Bible Topic Discussions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowCreateGroup(true)}
            className="w-full gap-2"
            style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
          >
            <Plus className="w-4 h-4" />
            Start Discussion Group
          </Button>
        </CardContent>
      </Card>

      {/* Topic Categories */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {BIBLE_TOPICS.map(topic => (
          <button
            key={topic.name}
            onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
            className="p-3 rounded-lg border text-center transition-all"
            style={{
              backgroundColor: selectedTopic === topic.name ? primaryColor : bgColor,
              borderColor: selectedTopic === topic.name ? primaryColor : borderColor,
              color: selectedTopic === topic.name ? '#FFFFFF' : textColor
            }}
          >
            <div className="text-2xl mb-1">{topic.emoji}</div>
            <p className="text-xs font-semibold">{topic.name}</p>
          </button>
        ))}
      </div>

      {/* Groups List */}
      <div className="space-y-3">
        {filteredGroups.length === 0 ? (
          <Card style={{ backgroundColor: cardColor, borderColor }}>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3" style={{ color: primaryColor, opacity: 0.5 }} />
              <p style={{ color: mutedColor }}>No groups in this topic yet. Be the first to create one!</p>
            </CardContent>
          </Card>
        ) : (
          filteredGroups.map(group => (
            <Card
              key={group.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              style={{ backgroundColor: cardColor, borderColor }}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold" style={{ color: textColor }}>
                      {group.title}
                    </h4>
                    <p className="text-sm mt-1" style={{ color: mutedColor }}>
                      {group.description}
                    </p>
                  </div>
                  <span className="text-2xl">{BIBLE_TOPICS.find(t => t.name === group.topic_category)?.emoji}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor }}>
                  <div className="flex items-center gap-2" style={{ color: mutedColor, fontSize: '14px' }}>
                    <Users className="w-4 h-4" />
                    {group.member_count || 1} members
                  </div>
                  <Button
                    size="sm"
                    style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                  >
                    Join Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Group Modal */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent style={{ backgroundColor: cardColor }}>
          <DialogHeader>
            <DialogTitle style={{ color: textColor }}>Create Discussion Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Topic Selection */}
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                Select Topic
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BIBLE_TOPICS.map(topic => (
                  <button
                    key={topic.name}
                    onClick={() => setSelectedTopic(topic.name)}
                    className="p-2 rounded-lg border text-center text-sm"
                    style={{
                      backgroundColor: selectedTopic === topic.name ? primaryColor : bgColor,
                      borderColor: selectedTopic === topic.name ? primaryColor : borderColor,
                      color: selectedTopic === topic.name ? '#FFFFFF' : textColor
                    }}
                  >
                    {topic.emoji} {topic.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Group Name */}
            <div>
              <label className="text-sm font-semibold mb-1 block" style={{ color: textColor }}>
                Group Name
              </label>
              <Input
                placeholder="e.g., Daily Genesis Study"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={{
                  backgroundColor: bgColor,
                  borderColor,
                  color: textColor
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold mb-1 block" style={{ color: textColor }}>
                Description (optional)
              </label>
              <Textarea
                placeholder="What's this group about?"
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                style={{
                  backgroundColor: bgColor,
                  borderColor,
                  color: textColor
                }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateGroup(false)}
                variant="outline"
                className="flex-1"
                style={{ borderColor, color: textColor }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                className="flex-1"
                style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
              >
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}