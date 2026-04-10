import React, { useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';

export default function SharedVersesFeed() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
  }, []);

  const { data: publicShares = [] } = useQuery({
    queryKey: ['sharedVersesPublic'],
    queryFn: async () => {
      return await base44.entities.SharedVerse.filter({ visibility: 'public' }, '-created_date', 50);
    }
  });

  const { data: myShares = [] } = useQuery({
    queryKey: ['sharedVersesMine', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.SharedVerse.filter({ user_id: user.id }, '-created_date', 50);
    },
    enabled: !!user
  });

  const { data: friendsShares = [] } = useQuery({
    queryKey: ['sharedVersesFriends', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.SharedVerse.filter({ visibility: 'friends' }, '-created_date', 50);
    },
    enabled: !!user
  });

  const VerseCard = ({ share }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
          {share.user_name?.[0] || '?'}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{share.user_name}</span>
            <span className="text-xs text-gray-500">{moment(share.created_date).fromNow()}</span>
          </div>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-3">
            <p className="text-sm font-semibold text-indigo-900 mb-2">{share.reference}</p>
            <p className="text-sm text-gray-800 leading-relaxed">{share.text}</p>
            <p className="text-xs text-gray-500 mt-2">{share.translation}</p>
          </div>

          {share.caption && (
            <p className="text-sm text-gray-700 mb-3">{share.caption}</p>
          )}

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Heart className="w-4 h-4 mr-1" />
              {share.like_count || 0}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-4 h-4 mr-1" />
              {share.comment_count || 0}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shared Verses</h1>
        <p className="text-gray-600 mt-2">Discover and share inspiring scripture with the community</p>
      </div>

      <Tabs defaultValue="public" className="space-y-6">
        <TabsList>
          <TabsTrigger value="public">Public Feed</TabsTrigger>
          {user && <TabsTrigger value="friends">Friends</TabsTrigger>}
          {user && <TabsTrigger value="mine">My Shares</TabsTrigger>}
        </TabsList>

        <TabsContent value="public" className="space-y-4">
          {publicShares.map(share => <VerseCard key={share.id} share={share} />)}
          {publicShares.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-gray-500">No shared verses yet. Be the first to share!</p>
            </Card>
          )}
        </TabsContent>

        {user && (
          <>
            <TabsContent value="friends" className="space-y-4">
              {friendsShares.map(share => <VerseCard key={share.id} share={share} />)}
              {friendsShares.length === 0 && (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">No friend shares yet</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="mine" className="space-y-4">
              {myShares.map(share => <VerseCard key={share.id} share={share} />)}
              {myShares.length === 0 && (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">You haven't shared any verses yet</p>
                </Card>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}