import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';

const BIBLE_BOOKS = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];

const THEMES = ['Love & Compassion', 'Justice & Righteousness', 'Forgiveness', 'Redemption', 'Faith & Trust', 'Prayer', 'Discipleship', 'Leadership', 'Transformation', 'Hope', 'Wisdom', 'Holy Spirit'];

export default function DiscussionGroupCreator({ currentUser, isDarkMode }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [groupType, setGroupType] = useState('book');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  const createGroup = useMutation({
    mutationFn: async () => {
      const groupData = {
        creator_user_id: currentUser.id,
        creator_name: currentUser.full_name,
        name: name || `${groupType === 'book' ? selectedBook : selectedTheme} Discussion`,
        description: description || `Join our ${groupType} study group`,
        group_type: groupType,
        ...(groupType === 'book' && { book: selectedBook }),
        ...(groupType === 'theme' && { theme: selectedTheme })
      };

      const group = await base44.entities.DiscussionGroup.create(groupData);

      // Add creator as member
      await base44.entities.DiscussionGroupMember.create({
        group_id: group.id,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        role: 'creator'
      });

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussionGroups'] });
      queryClient.invalidateQueries({ queryKey: ['myDiscussionGroups'] });
      setIsOpen(false);
      setName('');
      setDescription('');
      setSelectedBook('');
      setSelectedTheme('');
    }
  });

  if (!currentUser) return null;

  const canCreate = (groupType === 'book' && selectedBook) || (groupType === 'theme' && selectedTheme) || name;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent style={{
        backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF'
      }}>
        <DialogHeader>
          <DialogTitle>Create Discussion Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold block mb-2">Group Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['book', 'theme', 'passage', 'general'].map(type => (
                <button
                  key={type}
                  onClick={() => setGroupType(type)}
                  className={`p-2 rounded border text-sm transition ${
                    groupType === type
                      ? 'border-indigo-600 bg-indigo-50 font-semibold'
                      : 'border-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {groupType === 'book' && (
            <div>
              <label className="text-sm font-semibold block mb-2">Select Book</label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Choose a book...</option>
                {BIBLE_BOOKS.map(book => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
            </div>
          )}

          {groupType === 'theme' && (
            <div>
              <label className="text-sm font-semibold block mb-2">Select Theme</label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Choose a theme...</option>
                {THEMES.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold block mb-2">Group Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Custom group name"
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              className="w-full p-2 border rounded text-sm h-20"
            />
          </div>

          <Button
            onClick={() => createGroup.mutate()}
            disabled={createGroup.isPending || !canCreate}
            className="w-full gap-2"
          >
            {createGroup.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Group'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}