import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/components/I18nProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Plus, MessageCircle, BookOpen, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function BibleStudyGroups() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    is_private: true
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Load user's groups
        const userGroups = await base44.entities.StudyGroup.filter(
          { creator_id: currentUser.id },
          '-created_date',
          20
        );
        setGroups(userGroups);
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateGroup = async () => {
    if (!formData.group_name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    setCreating(true);
    try {
      const newGroup = await base44.entities.StudyGroup.create({
        creator_id: user.id,
        group_name: formData.group_name,
        description: formData.description,
        is_private: formData.is_private,
        member_count: 1,
        created_date: new Date().toISOString()
      });

      setGroups(prev => [newGroup, ...prev]);
      setFormData({ group_name: '', description: '', is_private: true });
      setShowCreateModal(false);
      toast.success('Group created!');
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center space-y-4">
          <Users className="w-12 h-12 text-indigo-600 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Join a Study Group</h2>
          <p className="text-gray-500 text-sm">Sign in to create or join Bible study groups.</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="w-full bg-indigo-600 hover:bg-indigo-700">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('studyGroups.title', 'Bible Study Groups')}</h1>
            <p className="text-gray-500 mt-1">{t('studyGroups.subtitle', 'Create or join groups to study Scripture together')}</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('studyGroups.createGroup', 'Create Group')}
          </Button>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">{t('studyGroups.newGroup', 'Create New Group')}</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={formData.group_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, group_name: e.target.value }))}
                  placeholder="e.g., Romans Study Group"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What will this group focus on?"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="private"
                  checked={formData.is_private}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="private" className="text-sm text-gray-700">
                  {t('studyGroups.privateOnly', 'Private group (invitation only)')}
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateGroup}
                  disabled={creating}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Groups List */}
        {groups.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <Users className="w-16 h-16 text-gray-300 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-700">{t('studyGroups.noGroups', 'No groups yet')}</h3>
            <p className="text-gray-500">{t('studyGroups.createFirst', 'Create your first study group to get started')}</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mx-auto bg-indigo-600 hover:bg-indigo-700"
            >
              Create Group
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map(group => (
              <Link key={group.id} to={createPageUrl(`StudyGroupDetail?id=${group.id}`)}>
                <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{group.group_name}</h3>
                      <p className="text-xs text-gray-500">{group.member_count} {group.member_count === 1 ? 'member' : 'members'}</p>
                    </div>
                  </div>

                  {group.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                  )}

                  {group.current_reading_book && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700 font-medium">
                        📖 Currently: {group.current_reading_book} {group.current_reading_chapter}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {t('studyGroups.view', 'View Details')}
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}