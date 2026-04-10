import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '../components/I18nProvider';
import { Users, MessageSquare, Heart, Plus, Loader } from 'lucide-react';
import StudyGroupForm from '../components/groups/StudyGroupForm';
import GroupCard from '../components/groups/GroupCard';

export default function StudyGroupHub() {
  const { t, lang } = useI18n();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          base44.auth.redirectToLogin();
          return;
        }
        const me = await base44.auth.me();
        setUser(me);
        loadGroups(me.id);
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    init();
  }, []);

  const loadGroups = async (userId) => {
    try {
      const members = await base44.entities.StudyGroupMember.filter(
        { user_id: userId },
        '-joined_date',
        100
      );

      const groupIds = members.map(m => m.group_id);
      if (groupIds.length === 0) {
        setGroups([]);
        setLoading(false);
        return;
      }

      const groupPromises = groupIds.map(gid =>
        base44.entities.StudyGroup.filter({ id: gid }, null, 1)
      );
      const groupResults = await Promise.all(groupPromises);
      const allGroups = groupResults.flat();
      setGroups(allGroups || []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const newGroup = await base44.entities.StudyGroup.create({
        creator_id: user.id,
        ...groupData,
        member_count: 1,
        created_date: new Date().toISOString(),
      });

      await base44.entities.StudyGroupMember.create({
        group_id: newGroup.id,
        user_id: user.id,
        role: 'admin',
        joined_date: new Date().toISOString(),
      });

      setGroups([...groups, newGroup]);
      setShowForm(false);
    } catch (err) {
      console.error('Create error:', err);
      alert('Failed to create group');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-[var(--faith-light-primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[var(--faith-light-primary-dark)] mb-2">
            {t('group.hub', 'Study Groups')}
          </h1>
          <p className="text-gray-600">{t('group.subtitle', 'Join or create a group to study together')}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[var(--faith-light-primary)] gap-2">
          <Plus className="w-4 h-4" />
          {t('group.create', 'Create Group')}
        </Button>
      </div>

      {showForm && (
        <StudyGroupForm
          onSubmit={handleCreateGroup}
          onCancel={() => setShowForm(false)}
          lang={lang}
        />
      )}

      {groups.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center text-gray-500">
            {t('group.empty', 'No groups yet. Create one to get started!')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {groups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              onSelect={() => setSelectedGroup(group)}
            />
          ))}
        </div>
      )}

      {selectedGroup && (
        <GroupDetailTabs group={selectedGroup} user={user} />
      )}
    </div>
  );
}

function GroupDetailTabs({ group, user }) {
  const { t } = useI18n();
  const [posts, setPosts] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadGroupData();
  }, [group.id]);

  const loadGroupData = async () => {
    try {
      const [postsData, prayersData, membersData] = await Promise.all([
        base44.entities.GroupPost.filter({ group_id: group.id }, '-created_date', 100),
        base44.entities.GroupPrayerRequest.filter({ group_id: group.id }, '-created_date', 100),
        base44.entities.StudyGroupMember.filter({ group_id: group.id }, '-joined_date', 100),
      ]);
      setPosts(postsData || []);
      setPrayers(prayersData || []);
      setMembers(membersData || []);
    } catch (err) {
      console.error('Load group data error:', err);
    }
  };

  return (
    <Card className="mt-6 border-2 border-[var(--faith-light-primary)]">
      <CardHeader>
        <CardTitle>{group.group_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed" className="gap-1">
              <MessageSquare className="w-4 h-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="prayers" className="gap-1">
              <Heart className="w-4 h-4" />
              Prayers
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4 mt-4">
            <div className="space-y-3">
              {posts.length === 0 ? (
                <p className="text-gray-500 text-sm">{t('group.noPosts', 'No posts yet')}</p>
              ) : (
                posts.map(post => (
                  <Card key={post.id} className="bg-gray-50">
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-700">{post.content}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>💬 {post.comments_count}</span>
                        <span>❤️ {post.likes_count}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="prayers" className="space-y-4 mt-4">
            <div className="space-y-3">
              {prayers.length === 0 ? (
                <p className="text-gray-500 text-sm">{t('group.noPrayers', 'No prayer requests yet')}</p>
              ) : (
                prayers.map(prayer => (
                  <Card key={prayer.id} className="bg-red-50 border-red-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-700">{prayer.content}</p>
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span className="text-gray-500 capitalize">{prayer.category}</span>
                        <span className="text-red-600 font-medium">❤️ {prayer.prayer_count} prayed</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4 mt-4">
            <div className="space-y-2">
              {members.length === 0 ? (
                <p className="text-gray-500 text-sm">{t('group.noMembers', 'No members')}</p>
              ) : (
                members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{member.user_id}</span>
                    <span className="text-xs font-semibold text-gray-600 capitalize">{member.role}</span>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}