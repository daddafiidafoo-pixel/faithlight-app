import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '@/stores/languageStore';

const CIRCLE_STRINGS = {
  en: {
    title: 'Prayer Circles', subtitle: 'Private groups for shared prayer',
    newCircle: 'New Circle', joinWithCode: 'Join with Code',
    searchPlaceholder: 'Search circles...', noCircles: 'No circles yet',
    noCirclesDesc: 'Create a private prayer circle or join one with an invite code.',
    createCircle: 'Create Circle', circleName: 'Circle Name',
    circleDesc: 'Description (optional)', cancel: 'Cancel',
    creating: 'Creating...', create: 'Create', admin: 'Admin',
    members: 'members', prayers: 'prayers', viewCircle: 'View Circle',
    joinCircle: 'Join Circle', joining: 'Joining...',
    circleCreated: 'Circle created!', circleJoined: 'Joined circle!',
    loading: 'Loading...',
  },
  om: {
    title: 'Garee Kadhannaa', subtitle: 'Garee dhuunfaa kadhannaa waliiniif',
    newCircle: 'Garee Haaraa', joinWithCode: 'Koodiin Makamu',
    searchPlaceholder: 'Garee barbaadi...', noCircles: 'Ammaaf garee hin jiru',
    noCirclesDesc: 'Garee kadhannaa dhuunfaa uumi ykn koodii affeerraan makamu.',
    createCircle: 'Garee Uumi', circleName: 'Maqaa Garee',
    circleDesc: 'Ibsa (dirqala miti)', cancel: 'Dhiisi',
    creating: 'Uumamaa jira...', create: 'Uumi', admin: 'Bulchaa',
    members: 'miseensota', prayers: 'kadhannaalee', viewCircle: 'Garee Ilaali',
    joinCircle: 'Garee Makamu', joining: 'Makamaa jira...',
    circleCreated: 'Gareen uumame!', circleJoined: 'Gareedhaan makamte!',
    loading: 'Fe\'amaa jira...',
  },
  am: {
    title: 'የጸሎት ክበቦች', subtitle: 'ለጋራ ጸሎት የግል ቡድኖች',
    newCircle: 'አዲስ ክበብ', joinWithCode: 'በኮድ ተቀላቀል',
    searchPlaceholder: 'ክበቦችን ፈልግ...', noCircles: 'እስካሁን ምንም ክበብ የለም',
    noCirclesDesc: 'የግል የጸሎት ክበብ ፍጠር ወይም በጥሪ ኮድ ተቀላቀል።',
    createCircle: 'ክበብ ፍጠር', circleName: 'የክበብ ስም',
    circleDesc: 'መግለጫ (አማራጭ)', cancel: 'ሰርዝ',
    creating: 'እየተፈጠረ...', create: 'ፍጠር', admin: 'አስተዳዳሪ',
    members: 'አባላት', prayers: 'ጸሎቶች', viewCircle: 'ክበብ ይመልከቱ',
    joinCircle: 'ክበብ ተቀላቀል', joining: 'እየተቀላቀለ...',
    circleCreated: 'ክበብ ተፈጠረ!', circleJoined: 'ወደ ክበቡ ተቀላቀሉ!',
    loading: 'እየተጫነ...',
  },
};

export default function PrayerCirclesHub() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const L = CIRCLE_STRINGS[uiLanguage] || CIRCLE_STRINGS.en;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [circleName, setCircleName] = useState('');
  const [circleDescription, setCircleDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch all public circles
  const { data: allCircles = [], isLoading } = useQuery({
    queryKey: ['prayerCircles'],
    queryFn: async () => {
      try {
        return await base44.entities.PrayerCircle.filter(
          { is_public: true },
          '-created_date'
        );
      } catch {
        return [];
      }
    },
  });

  // Fetch user's circles
  const { data: userCircles = [] } = useQuery({
    queryKey: ['userCircles'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return [];
        const members = await base44.entities.CircleMember.filter(
          { user_email: user.email }
        );
        return members.map((m) => m.circle_id);
      } catch {
        return [];
      }
    },
  });

  // Create circle
  const createMutation = useMutation({
    mutationFn: () =>
      base44.functions.invoke('prayerCircleCreate', {
        name: circleName,
        description: circleDescription,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerCircles'] });
      queryClient.invalidateQueries({ queryKey: ['userCircles'] });
      setCircleName('');
      setCircleDescription('');
      setShowCreateModal(false);
      toast.success(L.circleCreated);
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = allCircles.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{L.title}</h1>
            <p className="text-gray-600 mt-1">{L.subtitle}</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            {L.newCircle}
          </Button>
        </div>

        {/* Search */}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder={L.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Circles Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold mb-2">{L.noCircles}</p>
            <p className="text-gray-500 text-sm">{L.noCirclesDesc}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((circle) => {
              const isMember = userCircles.includes(circle.id);
              return (
                <Card key={circle.id} className="p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {circle.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        By {circle.created_by_name}
                      </p>
                    </div>
                    {circle.created_by === base44.auth.me?.().email && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                  </div>

                  {circle.description && (
                    <p className="text-gray-700 mb-4">{circle.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>{circle.member_count} {L.members}</span>
                    <span>{circle.post_count} {L.prayers}</span>
                  </div>

                  {isMember ? (
                    <Link to={`/prayer-circle/${circle.id}`} className="w-full">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        {L.viewCircle}
                      </Button>
                    </Link>
                  ) : (
                    <JoinButton circleId={circle.id} L={L} />
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {L.createCircle}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {L.circleName}
                </label>
                <Input
                  value={circleName}
                  onChange={(e) => setCircleName(e.target.value)}
                  placeholder={L.circleName}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {L.circleDesc}
                </label>
                <Textarea
                  value={circleDescription}
                  onChange={(e) => setCircleDescription(e.target.value)}
                  placeholder={L.circleDesc}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                className="flex-1"
              >
                {L.cancel}
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!circleName || createMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {createMutation.isPending ? L.creating : L.create}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function JoinButton({ circleId, L }) {
  const queryClient = useQueryClient();
  const joinMutation = useMutation({
    mutationFn: () =>
      base44.functions.invoke('prayerCircleJoin', {
        circle_id: circleId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCircles'] });
      toast.success(L.circleJoined);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Button
      onClick={() => joinMutation.mutate()}
      disabled={joinMutation.isPending}
      className="w-full bg-blue-600 hover:bg-blue-700"
    >
      {joinMutation.isPending ? L.joining : L.joinCircle}
    </Button>
  );
}