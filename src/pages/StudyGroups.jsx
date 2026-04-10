import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Lock, Globe, Copy, Check, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const READING_PLANS = [
  { id: 'overcoming_anxiety', title: 'Overcoming Anxiety' },
  { id: 'spiritual_growth', title: 'Spiritual Growth' },
  { id: 'strength', title: 'Building Strength' },
  { id: 'forgiveness', title: 'Path to Forgiveness' },
];

function CreateGroupModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    planId: 'overcoming_anxiety',
    isPrivate: true,
  });
  const [copied, setCopied] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const group = await base44.entities.StudyGroup.create({
        ...formData,
        createdByEmail: user.email,
        createdByName: user.full_name,
        memberEmails: [user.email],
        inviteCode,
      });
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyGroups'] });
      toast.success('Study group created!');
      onCreated();
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl max-w-md w-full p-6"
      >
        <h2 className="text-2xl font-bold mb-4">Create Study Group</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning Prayers Group"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this group about?"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none h-20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reading Plan</label>
            <select
              value={formData.planId}
              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {READING_PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Privacy</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.isPrivate}
                  onChange={() => setFormData({ ...formData, isPrivate: true })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Private (invite only)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!formData.isPrivate}
                  onChange={() => setFormData({ ...formData, isPrivate: false })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Public</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-lg py-2 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-violet-600 text-white rounded-lg py-2 font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              Create Group
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function GroupCard({ group, onSelect }) {
  const planName = READING_PLANS.find((p) => p.id === group.planId)?.title;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onSelect(group)}
      className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">{group.name}</h3>
          <p className="text-sm text-gray-500">{planName}</p>
        </div>
        {group.isPrivate ? (
          <Lock size={18} className="text-gray-400" />
        ) : (
          <Globe size={18} className="text-gray-400" />
        )}
      </div>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users size={16} />
          <span>{group.memberCount} members</span>
        </div>
        <ArrowRight size={16} className="text-violet-600" />
      </div>
    </motion.div>
  );
}

function GroupDetailModal({ group, onClose }) {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const queryClient = useQueryClient();

  const { data: discussions = [] } = useQuery({
    queryKey: ['groupDiscussions', group.id],
    queryFn: () => base44.entities.StudyGroupDiscussion.filter({ groupId: group.id }),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['groupPosts', selectedDay, group.id],
    queryFn: () => base44.entities.StudyGroupPost.filter({ groupId: group.id }),
    select: (data) => data.filter((p) => !p.replyToPostId),
  });

  const postMutation = useMutation({
    mutationFn: async (content) => {
      let discussion = discussions.find((d) => d.dayNumber === selectedDay);
      if (!discussion) {
        discussion = await base44.entities.StudyGroupDiscussion.create({
          groupId: group.id,
          dayNumber: selectedDay,
          createdByEmail: user.email,
          createdByName: user.full_name,
        });
      }
      return base44.entities.StudyGroupPost.create({
        discussionId: discussion.id,
        groupId: group.id,
        authorEmail: user.email,
        authorName: user.full_name,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupDiscussions'] });
      queryClient.invalidateQueries({ queryKey: ['groupPosts'] });
      setNewPost('');
      toast.success('Posted!');
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{group.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {READING_PLANS.find((p) => p.id === group.planId)?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Day selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  Day {day}
                </option>
              ))}
            </select>
          </div>

          {/* Posts */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{post.authorName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(post.created_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{post.content}</p>
              </div>
            ))}
          </div>

          {/* New post */}
          <div className="border-t pt-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts on today's reading..."
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none h-20"
            />
            <button
              onClick={() => postMutation.mutate(newPost)}
              disabled={!newPost.trim() || postMutation.isPending}
              className="mt-2 w-full bg-violet-600 text-white rounded-lg py-2 font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              Post Reply
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function StudyGroups() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['studyGroups'],
    queryFn: () =>
      base44.entities.StudyGroup.filter({}).then((all) =>
        all.filter((g) => g.memberEmails?.includes(user?.email))
      ),
    enabled: !!user?.email,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Study Groups</h1>
          <p className="text-gray-500 mb-4">Sign in to join or create a group</p>
          <button
            onClick={() => navigate('/OnboardingFlow')}
            className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pb-24">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Study Groups</h1>
            <p className="text-gray-500 mt-1">
              Connect with others on your reading journey
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Plus size={18} />
            New Group
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No study groups yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700"
            >
              <Plus size={18} />
              Create One
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onSelect={setSelectedGroup}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}

      {selectedGroup && (
        <GroupDetailModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
}