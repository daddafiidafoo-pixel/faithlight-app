import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, BookOpen } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { createPageUrl } from '@/utils';
import StudyRoomCard from '@/components/studyrooms/StudyRoomCard';
import CreateStudyRoomModal from '@/components/studyrooms/CreateStudyRoomModal';
import JoinPrivateRoomModal from '@/components/studyrooms/JoinPrivateRoomModal';

export default function StudyRoomsList() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [rooms, setRooms] = useState([]);
  const [myMemberships, setMyMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinPrivateRoom, setJoinPrivateRoom] = useState(null);
  const [user, setUser] = useState(null);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me().catch(() => null);
      setUser(currentUser);

      const allRooms = await base44.entities.StudyRoom.list('-lastActivityAt', 50);
      setRooms(allRooms || []);

      if (currentUser) {
        const memberships = await base44.entities.StudyRoomMember.filter({
          userId: currentUser.id,
          status: 'active'
        });
        setMyMemberships(memberships || []);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredRooms = rooms.filter(room => {
    const q = search.toLowerCase();
    const matchesSearch = !q || room.name?.toLowerCase().includes(q) ||
      room.description?.toLowerCase().includes(q) ||
      room.category?.toLowerCase().includes(q);

    switch (filter) {
      case 'myRooms':
        return matchesSearch && myMemberships.some(m => m.roomId === room.id);
      case 'public':
        return matchesSearch && room.privacy === 'public';
      case 'private':
        return matchesSearch && room.privacy === 'private';
      default:
        return matchesSearch;
    }
  });

  const handleJoin = async (room) => {
    const isMember = myMemberships.some(m => m.roomId === room.id);
    if (isMember) {
      navigate(createPageUrl('StudyRoomDetail') + `?id=${room.id}`);
      return;
    }
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    if (room.privacy === 'private') {
      setJoinPrivateRoom(room);
      return;
    }
    try {
      await base44.entities.StudyRoomMember.create({
        roomId: room.id,
        userId: user.id,
        role: 'member',
        status: 'active',
        joinedAt: new Date().toISOString()
      });
      await base44.entities.StudyRoom.update(room.id, {
        memberCount: (room.memberCount || 1) + 1
      });
      setMyMemberships(prev => [...prev, { roomId: room.id, userId: user.id, role: 'member', status: 'active' }]);
      navigate(createPageUrl('StudyRoomDetail') + `?id=${room.id}`);
    } catch (err) {
      console.error('Failed to join room:', err);
    }
  };

  const handlePrivateJoined = (room) => {
    setJoinPrivateRoom(null);
    setMyMemberships(prev => [...prev, { roomId: room.id, userId: user.id, role: 'member', status: 'active' }]);
    navigate(createPageUrl('StudyRoomDetail') + `?id=${room.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('studyRooms.title', 'Study Rooms')}</h1>
              <p className="text-gray-500 mt-1 text-sm">{t('studyRooms.subtitle', 'Join believers to study, discuss, and grow together.')}</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2 hidden sm:flex"
            >
              <Plus className="w-4 h-4" />
              {t('studyRooms.createButton', 'Create Room')}
            </Button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('studyRooms.searchPlaceholder', 'Search rooms by name or category…')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="all">{t('studyRooms.filters.all', 'All')}</TabsTrigger>
            <TabsTrigger value="myRooms">{t('studyRooms.filters.myRooms', 'My Rooms')}</TabsTrigger>
            <TabsTrigger value="public">{t('studyRooms.filters.public', 'Public')}</TabsTrigger>
            <TabsTrigger value="private">{t('studyRooms.filters.private', 'Private')}</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-xl border p-5 space-y-3 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-9 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border">
                <BookOpen className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {t('studyRooms.emptyTitle', 'No study rooms yet')}
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {t('studyRooms.emptyText', 'Create the first room and invite others to study together.')}
                </p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                  <Plus className="w-4 h-4" />
                  {t('studyRooms.createButton', 'Create Room')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.map(room => (
                  <StudyRoomCard
                    key={room.id}
                    room={room}
                    isMember={myMemberships.some(m => m.roomId === room.id)}
                    onJoin={handleJoin}
                    onOpen={(r) => navigate(createPageUrl('StudyRoomDetail') + `?id=${r.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-20 right-4 sm:hidden bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showCreateModal && (
        <CreateStudyRoomModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}

      {joinPrivateRoom && (
        <JoinPrivateRoomModal
          room={joinPrivateRoom}
          user={user}
          onClose={() => setJoinPrivateRoom(null)}
          onJoined={handlePrivateJoined}
        />
      )}
    </div>
  );
}