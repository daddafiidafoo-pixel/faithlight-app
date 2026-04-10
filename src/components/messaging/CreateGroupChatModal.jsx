import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Plus, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

export default function CreateGroupChatModal({ isOpen, onClose, onGroupCreated, currentUser }) {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      try {
        const users = await base44.entities.User.list('-created_date', 100);
        const filtered = users.filter(u => 
          u.id !== currentUser?.id && 
          u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setAvailableUsers(filtered);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, currentUser?.id]);

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      if (!groupName.trim() || selectedMembers.length === 0) {
        throw new Error('Group name and members are required');
      }

      // Create conversation
      const conversation = await base44.entities.Conversation.create({
        type: 'group',
        title: groupName,
        created_by: currentUser.id,
        created_by_name: currentUser.full_name,
        is_active: true,
        member_count: selectedMembers.length + 1 // Include creator
      });

      // Add creator as owner
      await base44.entities.ConversationMember.create({
        conversation_id: conversation.id,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        role: 'owner',
        is_active: true
      });

      // Add selected members
      for (const member of selectedMembers) {
        await base44.entities.ConversationMember.create({
          conversation_id: conversation.id,
          user_id: member.id,
          user_name: member.full_name,
          role: 'member',
          is_active: true
        });
      }

      // Create group invite notifications
      try {
        await base44.functions.invoke('createGroupInviteNotification', {
          groupId: conversation.id,
          groupTitle: groupName,
          recipientIds: selectedMembers.map(m => m.id)
        });
      } catch (error) {
        console.error('Error creating group invite notifications:', error);
      }

      return conversation;
    },
    onSuccess: (conversation) => {
      onGroupCreated(conversation);
      setGroupName('');
      setSelectedMembers([]);
      setSearchQuery('');
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Group Chat</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <Input
              placeholder="e.g., Bible Study Group"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Members ({selectedMembers.length})
              </label>
              <div className="space-y-2">
                {selectedMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between bg-indigo-50 rounded-lg p-3"
                  >
                    <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                    <button
                      onClick={() => setSelectedMembers(selectedMembers.filter(m => m.id !== member.id))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Members
            </label>
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-3"
            />

            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availableUsers.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">No users found</p>
              ) : (
                availableUsers.map(user => {
                  const isSelected = selectedMembers.some(m => m.id === user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMembers(selectedMembers.filter(m => m.id !== user.id));
                        } else {
                          setSelectedMembers([...selectedMembers, user]);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-indigo-100 text-gray-900'
                          : 'bg-white hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      <span className="text-sm font-medium">{user.full_name}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createGroupMutation.mutate()}
              disabled={!groupName.trim() || selectedMembers.length === 0 || createGroupMutation.isPending}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}