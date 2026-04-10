import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, UserPlus, Shield, Trash2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function GroupMemberManager({ 
  conversationId, 
  currentUser,
  isOpen, 
  onClose
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const queryClient = useQueryClient();

  // Fetch group members
  const { data: members = [] } = useQuery({
    queryKey: ['group-members', conversationId],
    queryFn: () => {
      if (!conversationId) return [];
      return base44.entities.ConversationMember.filter(
        { conversation_id: conversationId, is_active: true },
        '-created_date'
      );
    },
    enabled: !!conversationId && isOpen
  });

  // Fetch conversation
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => {
      if (!conversationId) return null;
      return base44.entities.Conversation.filter(
        { id: conversationId },
        '',
        1
      ).then(results => results[0]);
    },
    enabled: !!conversationId && isOpen
  });

  // Fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await base44.entities.User.list('-created_date', 100);
        const memberIds = members.map(m => m.user_id);
        const filtered = users.filter(u => 
          u.id !== currentUser?.id && 
          !memberIds.includes(u.id) &&
          u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setAvailableUsers(filtered);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, members, currentUser?.id]);

  // Add member
  const addMemberMutation = useMutation({
    mutationFn: async (user) => {
      await base44.entities.ConversationMember.create({
        conversation_id: conversationId,
        user_id: user.id,
        user_name: user.full_name,
        role: 'member',
        is_active: true
      });

      // Create notification
      try {
        await base44.functions.invoke('createGroupInviteNotification', {
          groupId: conversationId,
          groupTitle: conversation?.title || 'Group',
          recipientIds: [user.id]
        });
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-members']);
      setSearchQuery('');
    }
  });

  // Remove member
  const removeMemberMutation = useMutation({
    mutationFn: async (member) => {
      await base44.entities.ConversationMember.update(member.id, {
        is_active: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-members']);
    }
  });

  // Change role
  const changeRoleMutation = useMutation({
    mutationFn: async (member, newRole) => {
      await base44.entities.ConversationMember.update(member.id, {
        role: newRole
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-members']);
    }
  });

  if (!isOpen) return null;

  const isOwner = members.some(m => m.user_id === currentUser?.id && m.role === 'owner');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {conversation?.title} - Members
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Members */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Members ({members.length})
            </h3>
            <div className="space-y-2">
              {members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{member.user_name}</p>
                    <p className="text-xs text-gray-600 capitalize">{member.role}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner && member.user_id !== currentUser?.id && (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) => changeRoleMutation.mutate(member, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>

                        <Button
                          onClick={() => removeMemberMutation.mutate(member)}
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {member.role === 'owner' && (
                      <Shield className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Members */}
          {isOwner && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Add Members
              </h3>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {availableUsers.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-4">
                    {searchQuery ? 'No users found' : 'All available users already added'}
                  </p>
                ) : (
                  availableUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between bg-white p-2 rounded hover:bg-gray-50"
                    >
                      <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                      <Button
                        onClick={() => addMemberMutation.mutate(user)}
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}