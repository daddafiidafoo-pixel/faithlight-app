import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, UserPlus, Globe, Linkedin, Twitter, Youtube, Instagram } from 'lucide-react';
import UserAvatar from '../user/UserAvatar';

export default function PublicProfileView({ userId, currentUserId }) {
  const [profile, setProfile] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const [profileData, userData, friendData] = await Promise.all([
        base44.asServiceRole.entities.UserProfile.filter({ user_id: userId }),
        base44.asServiceRole.entities.User.filter({ id: userId }),
        base44.entities.Friend.filter({ friend_id: userId })
      ]);

      setProfile(profileData?.[0]);
      setUserInfo(userData?.[0]);
      setFriendStatus(friendData?.[0]?.status || null);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener('profile-image-updated', loadProfile);
    return () => window.removeEventListener('profile-image-updated', loadProfile);
  }, [userId]);

  const handleAddFriend = async () => {
    try {
      await base44.functions.invoke('requestFriendship', { friendId: userId });
      setFriendStatus('pending');
    } catch (err) {
      console.error('Error adding friend:', err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!profile?.is_public && userId !== currentUserId) {
    return <div className="p-4 text-gray-500">This profile is private</div>;
  }

  const socialIcons = {
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    instagram: Instagram
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-6">
            <UserAvatar
              imageUrl={userInfo?.profileImageUrl}
              name={userInfo?.full_name}
              size="xl"
              rounded="full"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{userInfo?.full_name}</h1>
              {profile?.location && (
                <p className="text-gray-600">{profile.location}</p>
              )}
              {profile?.bio && (
                <p className="text-sm text-gray-700 mt-2">{profile.bio}</p>
              )}
              <div className="flex gap-2 mt-4">
                {userId !== currentUserId && (
                  <>
                    <Button
                      size="sm"
                      variant={friendStatus ? 'outline' : 'default'}
                      onClick={handleAddFriend}
                      disabled={friendStatus !== null}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      {friendStatus === 'accepted'
                        ? 'Friends'
                        : friendStatus === 'pending'
                        ? 'Pending'
                        : 'Add Friend'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expertise */}
      {profile?.expertise?.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Expertise & Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((exp) => (
                <div
                  key={exp}
                  className="bg-blue-100 text-blue-900 rounded-full px-3 py-1 text-sm"
                >
                  {exp}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex gap-4">
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {Object.entries(profile.social_links).map(([social, url]) => {
                const Icon = socialIcons[social];
                return Icon ? (
                  <a
                    key={social}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}