import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Plus, Trash2, Flag, Loader, Heart } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';

export default function GroupForums() {
  const { lang } = useI18n();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [threads, setThreads] = useState([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) {
          setUser(currentUser);
          loadGroups(currentUser.id);
        }
      } catch {
        // Not authenticated
      }
    };

    fetchUser();
  }, []);

  const loadGroups = async (userId) => {
    try {
      const userGroups = await base44.entities.Group?.filter(
        { member_ids: userId },
        '-created_date',
        20
      ) || [];
      setGroups(userGroups);

      if (userGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(userGroups[0]);
        loadThreads(userGroups[0].id);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadThreads = async (groupId) => {
    try {
      const groupThreads = await base44.entities.GroupThread?.filter(
        { group_id: groupId },
        '-last_reply_date',
        50
      ) || [];
      setThreads(groupThreads);
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  };

  const createThread = async () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim() || !selectedGroup) return;

    setLoading(true);
    try {
      const thread = await base44.entities.GroupThread?.create({
        group_id: selectedGroup.id,
        title: newThreadTitle,
        content: newThreadContent,
        creator_id: user.id,
        creator_name: user.full_name,
        is_private: false,
        reply_count: 0,
        status: 'active',
      });

      if (thread) {
        setThreads([thread, ...threads]);
        setNewThreadTitle('');
        setNewThreadContent('');
        setShowNewThread(false);
        alert(lang === 'om' ? 'Cufaa kan haaraa uumamee' : 'Thread created successfully!');
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      alert(lang === 'om' ? 'Dogoggora uumuu' : 'Error creating thread');
    } finally {
      setLoading(false);
    }
  };

  const deleteThread = async (threadId) => {
    if (confirm(lang === 'om' ? 'Cufaa hafu?' : 'Delete thread?')) {
      try {
        await base44.entities.GroupThread?.delete(threadId);
        setThreads(threads.filter(t => t.id !== threadId));
      } catch (error) {
        console.error('Error deleting thread:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">
              {lang === 'om' ? 'Seenuu dandeessuu dhaabbichaa' : 'Please login to access group forums'}
            </p>
            <Button onClick={() => base44.auth.redirectToLogin()}>
              {lang === 'om' ? 'Seenuun' : 'Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[var(--faith-light-primary-dark)] mb-2 flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-[var(--faith-light-accent)]" />
          {lang === 'om' ? 'Foora Garee' : 'Group Forums'}
        </h1>
        <p className="text-gray-600">
          {lang === 'om'
            ? 'Jidhaadhu fi garee waliin haasshuu'
            : 'Discuss and engage with your groups'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Groups Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {lang === 'om' ? 'Garee Keessanuu' : 'Your Groups'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {groups.map(group => (
                <button
                  key={group.id}
                  onClick={() => {
                    setSelectedGroup(group);
                    loadThreads(group.id);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedGroup?.id === group.id
                      ? 'bg-[var(--faith-light-primary)] text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium truncate">{group.name}</div>
                  <div className="text-xs opacity-70 truncate">
                    {group.member_count || 0} {lang === 'om' ? 'bulchiinsa' : 'members'}
                  </div>
                </button>
              ))}

              {groups.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  {lang === 'om' ? 'Garee hin jiru' : 'No groups yet'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Threads Section */}
        <div className="lg:col-span-3 space-y-4">
          {selectedGroup ? (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h2>
                  <p className="text-gray-600">{lang === 'om' ? 'Jidhaadhu foora' : 'Group discussion forum'}</p>
                </div>
                <Button
                  onClick={() => setShowNewThread(true)}
                  className="gap-2 bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)]"
                >
                  <Plus className="w-4 h-4" />
                  {lang === 'om' ? 'Cufaa Haaraa' : 'New Thread'}
                </Button>
              </div>

              {/* Create New Thread */}
              {showNewThread && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {lang === 'om' ? 'Cufaa Haaraa Uumuu' : 'Start New Discussion'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <input
                      type="text"
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                      placeholder={lang === 'om' ? 'Mata cufaa' : 'Thread title'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
                    />
                    <Textarea
                      value={newThreadContent}
                      onChange={(e) => setNewThreadContent(e.target.value)}
                      placeholder={lang === 'om' ? 'Miidiyaa barreessi' : 'Share your thoughts...'}
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={createThread}
                        disabled={loading || !newThreadTitle.trim() || !newThreadContent.trim()}
                        className="flex-1 gap-2 bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)]"
                      >
                        {loading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            {lang === 'om' ? 'Uumaa...' : 'Creating...'}
                          </>
                        ) : (
                          lang === 'om' ? 'Haasshuu Jalqabuu' : 'Start Discussion'
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowNewThread(false);
                          setNewThreadTitle('');
                          setNewThreadContent('');
                        }}
                        variant="outline"
                      >
                        {lang === 'om' ? 'Hafu' : 'Cancel'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Thread List */}
              <div className="space-y-3">
                {threads.map(thread => (
                  <Card key={thread.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{thread.title}</CardTitle>
                          <CardDescription>
                            {lang === 'om' ? 'Jalqabaa: ' : 'Started by: '}
                            {thread.creator_name} • {thread.reply_count || 0} {lang === 'om' ? 'deebii' : 'replies'}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {thread.created_by === user.id && (
                            <button
                              onClick={() => deleteThread(thread.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={lang === 'om' ? 'Cufaa hafu' : 'Delete thread'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title={lang === 'om' ? 'Kakaasan' : 'Report'}
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-3">{thread.content}</p>
                      <Button variant="outline" className="gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {lang === 'om' ? 'Deebuu Ibuu' : 'View Replies'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {threads.length === 0 && (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-600">
                        {lang === 'om' ? 'Cufaa hin jiru. Jalqabuu!' : 'No discussions yet. Start one!'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="pt-12 text-center pb-12">
                <p className="text-gray-600">
                  {lang === 'om' ? 'Garee filadhu haasshuu jalqabuuf' : 'Select a group to view discussions'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}