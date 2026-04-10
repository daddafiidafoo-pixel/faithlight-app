import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const INTEREST_OPTIONS = [
  'Bible Study', 'Prayer', 'Theology', 'Worship', 'Youth', 'Women',
  'Men', 'Marriage', 'Parenting', 'Discipleship', 'Missions', 'Evangelism',
  'Leadership', 'Prophecy', 'Spiritual Gifts', 'Church History',
];

const BIBLE_BOOK_OPTIONS = [
  'Genesis', 'Exodus', 'Psalms', 'Proverbs', 'Isaiah', 'Jeremiah',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Corinthians',
  'Galatians', 'Ephesians', 'Philippians', 'Colossians', 'Hebrews',
  'James', 'Peter', 'Revelation',
];

const GROUP_TYPE_OPTIONS = [
  { value: 'bible_book', label: '📖 Bible Book Study' },
  { value: 'topic', label: '🎯 Topic/Theme Study' },
  { value: 'course', label: '🎓 Course Study Group' },
  { value: 'general', label: '💬 General Community' },
];

export default function CreateGroupModal({ open, onOpenChange, onGroupCreated }) {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [groupType, setGroupType] = useState('general');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [bibleBook, setBibleBook] = useState('');
  const [customTopics, setCustomTopics] = useState('');
  const [meetingFrequency, setMeetingFrequency] = useState('weekly');
  const [meetingDay, setMeetingDay] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    if (open) getUser();
  }, [open]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setIsLoading(true);
    try {
      const topics = bibleBook ? [bibleBook, ...selectedInterests] : selectedInterests;
      const group = await base44.entities.Group.create({
        name: name.trim(),
        description: description.trim(),
        privacy: privacy,
        group_type: groupType,
        interests: topics,
        custom_topics: customTopics ? customTopics.split(',').map(t => t.trim()).filter(Boolean) : [],
        bible_book_focus: bibleBook || null,
        meeting_schedule: meetingDay && meetingTime ? {
          frequency: meetingFrequency,
          day_of_week: meetingDay,
          time: meetingTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        } : null,
        owner_id: user.id,
        creator_user_id: user.id,
        creator_name: user.full_name,
        member_count: 1,
        is_active: true,
        language_code: user.preferred_language_code || 'en',
      });

      // Add owner as member
      await base44.entities.GroupMember.create({
        group_id: group.id,
        user_id: user.id,
        user_name: user.full_name,
        role: 'admin',
        joined_at: new Date().toISOString(),
      });

      toast.success('Group created successfully!');
      onGroupCreated?.();
      onOpenChange(false);
      
      // Reset form
      setName('');
      setDescription('');
      setPrivacy('public');
      setGroupType('general');
      setSelectedInterests([]);
      setBibleBook('');
      setCustomTopics('');
      setMeetingFrequency('weekly');
      setMeetingDay('');
      setMeetingTime('');
    } catch (error) {
      toast.error('Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Study Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group Type</label>
            <div className="grid grid-cols-2 gap-2">
              {GROUP_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setGroupType(opt.value)}
                  className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    groupType === opt.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {groupType === 'bible_book' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bible Book Focus</label>
              <Select value={bibleBook} onValueChange={setBibleBook}>
                <SelectTrigger><SelectValue placeholder="Select a book..." /></SelectTrigger>
                <SelectContent>
                  {BIBLE_BOOK_OPTIONS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Daily Bible Study"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              className="h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy
            </label>
            <Select value={privacy} onValueChange={setPrivacy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invite_only">🔒 Invite Only</SelectItem>
                <SelectItem value="public">🌐 Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests <span className="text-gray-500 text-xs">(select up to 3)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => {
                    if (selectedInterests.includes(interest)) {
                      setSelectedInterests(
                        selectedInterests.filter(i => i !== interest)
                      );
                    } else if (selectedInterests.length < 3) {
                      setSelectedInterests([...selectedInterests, interest]);
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedInterests.includes(interest)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Study Topics <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <Input
              value={customTopics}
              onChange={(e) => setCustomTopics(e.target.value)}
              placeholder="e.g., Romans, Prayer, Discipleship (comma-separated)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Schedule <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <div className="space-y-2">
              <Select value={meetingFrequency} onValueChange={setMeetingFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Select value={meetingDay} onValueChange={setMeetingDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  placeholder="Time"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isLoading || !name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}