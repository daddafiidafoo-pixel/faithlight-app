import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// v2 - accessibility updated
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  User, Mail, Calendar, Edit3, Save, X, Globe, Flame, Star, Trophy,
  BookOpen, BookMarked, Award, TrendingUp, Camera, Check, Loader2, Heart, MessageCircle, Users, Lock, Key, AlertCircle
} from 'lucide-react';
import UserAvatar from '../components/user/UserAvatar';
import ProfilePhotoManager from '../components/user/ProfilePhotoManager';
import { toast } from 'sonner';
import { format } from 'date-fns';
import SavedVersesSection from '../components/profile/SavedVersesSection';
import LearningActivitySection from '../components/community/LearningActivitySection';
import { TestimonySection, MyPrayerRequestsSection, FavoriteVersesSection } from '../components/profile/ProfileExtendedSections';
import { FollowingSection, FollowStats } from '../components/profile/FollowingSystem';
import { useSafeQuery } from '../components/useSafeQuery';
import { LoadingFallback, ErrorFallback as SafeQueryFallback } from '../components/SafeQueryFallback';
import PasswordChangeForm from '../components/profile/PasswordChangeForm';
import PrayerStreakCard from '../components/profile/PrayerStreakCard';
import BibleReadingProgressTracker from '../components/profile/BibleReadingProgressTracker';
import FaithJourneyRoadmap from '../components/profile/FaithJourneyRoadmap';
import DeleteAccountModal from '../components/profile/DeleteAccountModal';
import DailyVerseNotificationSettings from '../components/notifications/DailyVersNotificationSettings';
import MyHighlightsSection from '../components/profile/MyHighlightsSection';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ar', label: 'العربية' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ha', label: 'Hausa' },
  { code: 'zh', label: '中文' },
];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value ?? '—'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserProfile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const BIBLE_BOOKS = ['Genesis','Psalms','Proverbs','Isaiah','Matthew','John','Romans','Ephesians','Philippians','Hebrews','James','Revelation'];
  const INTEREST_OPTIONS = ['Prayer','Worship','Theology','Apologetics','Church History','Prophecy','Discipleship','Evangelism','Family Faith','Healing','Spiritual Growth','Bible Study'];
  const TRANSLATIONS = ['WEB','KJV','NIV','ESV','NASB','NLT','CSB','NKJV','MSG','AMP'];
  const PRIVACY_OPTIONS = [{ value: 'public', label: 'Public — anyone can view' }, { value: 'members', label: 'Members only' }, { value: 'private', label: 'Private — only me' }];


  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        setFormData({
          full_name: u.full_name,
          bio: u.bio || '',
          preferred_language: u.preferred_language || 'en',
          location: u.location || '',
          favorite_bible_books: u.favorite_bible_books || [],
          interests: u.interests || [],
          spiritual_goals: u.spiritual_goals || '',
          preferred_translation: u.preferred_translation || 'WEB',
          profile_visibility: u.profile_visibility || 'public',
          notify_messages: u.notify_messages !== false,
          notify_group_activity: u.notify_group_activity !== false,
          notify_streak_reminders: u.notify_streak_reminders !== false,
          notify_friend_requests: u.notify_friend_requests !== false,
          notify_email: u.notify_email !== false,
        });
      })
      .catch(() => base44.auth.redirectToLogin(window.location.href));
  }, []);

  // Gamification stats with SafeQuery
  const userPointsQuery = useSafeQuery(
    ['user-points', user?.id],
    () => base44.entities.UserPoints.filter({ user_id: user.id }, '-updated_date', 1).then(d => d[0]),
    { enabled: !!user, errorCode: 'LOAD_POINTS_FAILED' }
  );

  const userStreakQuery = useSafeQuery(
    ['user-streak', user?.id],
    () => base44.entities.UserStreak.filter({ user_id: user.id }, '-updated_date', 1).then(d => d[0]),
    { enabled: !!user, errorCode: 'LOAD_STREAK_FAILED' }
  );

  const userBadgesQuery = useSafeQuery(
    ['user-badges', user?.id],
    () => base44.entities.UserBadge.filter({ user_id: user.id }, '-updated_date', 20),
    { enabled: !!user, errorCode: 'LOAD_BADGES_FAILED' }
  );

  const courseProgressQuery = useSafeQuery(
    ['user-course-progress', user?.id],
    () => base44.entities.UserCourseProgress.filter({ user_id: user.id }, '-updated_date', 50),
    { enabled: !!user, errorCode: 'LOAD_COURSES_FAILED' }
  );

  const groupMembershipsQuery = useSafeQuery(
    ['group-memberships', user?.id],
    () => base44.entities.GroupMember.filter({ user_id: user.id }, '-updated_date', 50),
    { enabled: !!user, errorCode: 'LOAD_GROUPS_FAILED' }
  );

  const saveMutation = useMutation({
    mutationFn: () => base44.auth.updateMe(formData),
    onSuccess: (updated) => {
      setUser(updated);
      setIsEditing(false);
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to save profile'),
  });

  const handleProfileImageUpdate = (fields) => {
    setUser(prev => ({ ...prev, ...fields }));
  };

  const handlePasswordChange = async (currentPassword, newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      // Call backend function to change password
      const response = await base44.functions.invoke('changeUserPassword', {
        currentPassword,
        newPassword
      });
      if (response.data?.success) {
        toast.success('Password changed successfully!');
      } else {
        toast.error('Password change failed: ' + (response.data?.error || 'Unknown error'));
      }
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      const response = await base44.functions.invoke('stripePortalSession', {});
      if (response.data?.portalUrl) {
        window.open(response.data.portalUrl, '_blank');
      } else {
        toast.error('Failed to open subscription manager');
      }
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setPortalLoading(false);
    }
  };

  const completedCourses = (courseProgressQuery.data || []).filter(p => p.status === 'completed').length;
  const inProgressCourses = (courseProgressQuery.data || []).filter(p => p.status === 'in_progress').length;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const initials = user.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 pt-10 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-end gap-5 flex-wrap">
            {/* Avatar */}
            <ProfilePhotoManager user={user} onUpdate={handleProfileImageUpdate} />

            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold">{user.full_name}</h1>
              <p className="text-indigo-200 text-sm">{user.email}</p>
              {user.bio && <p className="text-indigo-100 text-sm mt-1 max-w-md">{user.bio}</p>}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {user.location && (
                  <span className="text-xs text-indigo-200 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {user.location}
                  </span>
                )}
                <span className="text-xs text-indigo-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {user.created_date ? format(new Date(user.created_date), 'MMM yyyy') : 'recently'}
                </span>
                <Badge className="bg-white/20 text-white border-0 text-xs capitalize">{user.role || 'member'}</Badge>
              </div>
            </div>

            <Button
              onClick={() => isEditing ? saveMutation.mutate() : setIsEditing(true)}
              className={isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-white/20 hover:bg-white/30 text-white border-0'}
              disabled={saveMutation.isPending}
            >
              {isEditing ? (
                saveMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save</>
              ) : (
                <><Edit3 className="w-4 h-4" /> Edit Profile</>
              )}
            </Button>
            {isEditing && (
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10">
        {/* Edit Form */}
        {isEditing && (
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Display Name</Label>
                <Input
                  value={formData.full_name || ''}
                  onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location || ''}
                  onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Lagos, Nigeria"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Preferred Language</Label>
                <Select value={formData.preferred_language || 'en'} onValueChange={v => setFormData(p => ({ ...p, preferred_language: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio || ''}
                  onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell others about yourself..."
                  rows={3}
                  className="mt-1 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{(formData.bio || '').length}/500</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 mt-4">
          {userPointsQuery.isLoading ? (
            <div className="h-20 bg-gray-100 animate-pulse rounded-lg" />
          ) : userPointsQuery.isError ? (
            <Card className="bg-amber-50"><CardContent className="pt-4 text-xs text-amber-700">Points unavailable</CardContent></Card>
          ) : (
            <StatCard icon={Star} label="Total Points" value={userPointsQuery.data?.total_points?.toLocaleString() || 0} color="bg-amber-500" />
          )}
          
          {userStreakQuery.isLoading ? (
            <div className="h-20 bg-gray-100 animate-pulse rounded-lg" />
          ) : userStreakQuery.isError ? (
            <Card className="bg-orange-50"><CardContent className="pt-4 text-xs text-orange-700">Streak unavailable</CardContent></Card>
          ) : (
            <StatCard icon={Flame} label="Day Streak" value={userStreakQuery.data?.current_streak || 0} color="bg-orange-500" />
          )}
          
          {courseProgressQuery.isLoading ? (
            <div className="h-20 bg-gray-100 animate-pulse rounded-lg" />
          ) : courseProgressQuery.isError ? (
            <Card className="bg-green-50"><CardContent className="pt-4 text-xs text-green-700">Courses unavailable</CardContent></Card>
          ) : (
            <StatCard icon={BookOpen} label="Courses Done" value={completedCourses} color="bg-green-600" />
          )}
          
          {userBadgesQuery.isLoading ? (
            <div className="h-20 bg-gray-100 animate-pulse rounded-lg" />
          ) : userBadgesQuery.isError ? (
            <Card className="bg-purple-50"><CardContent className="pt-4 text-xs text-purple-700">Badges unavailable</CardContent></Card>
          ) : (
            <StatCard icon={Award} label="Badges" value={userBadgesQuery.data?.length || 0} color="bg-purple-600" />
          )}
        </div>

        {/* Follow Stats */}
        <div className="mb-4 px-1">
          <FollowStats userId={user.id} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4 mb-2 text-xs">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my_content">My Content</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-4 mb-6 text-xs">
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="highlights">Highlights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-5">
            {/* Prayer Streak */}
            <PrayerStreakCard userId={user.id} />

            {/* Bible Reading Progress */}
            <BibleReadingProgressTracker userId={user.id} />

            {/* Faith Journey Roadmap */}
            <FaithJourneyRoadmap userId={user.id} />

            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courseProgressQuery.isLoading ? (
                  <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
                ) : courseProgressQuery.isError ? (
                  <SafeQueryFallback query={courseProgressQuery} title="Failed to load courses" />
                ) : courseProgressQuery.data?.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No course activity yet. Start a course to track progress!</p>
                ) : (
                  <div className="space-y-3">
                    {courseProgressQuery.data.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{p.course_id?.slice(0, 12)}…</span>
                            <span className="text-gray-500">{p.progress_percentage || 0}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${p.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'}`}
                              style={{ width: `${p.progress_percentage || 0}%` }}
                            />
                          </div>
                        </div>
                        <Badge variant={p.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize whitespace-nowrap">
                          {p.status === 'completed' ? <><Check className="w-3 h-3 mr-1" />Done</> : p.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                    {courseProgressQuery.data.length > 5 && (
                      <p className="text-xs text-gray-400 text-center pt-1">+{courseProgressQuery.data.length - 5} more courses</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Community Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" /> Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupMembershipsQuery.isLoading ? (
                  <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
                ) : groupMembershipsQuery.isError ? (
                  <SafeQueryFallback query={groupMembershipsQuery} title="Failed to load groups" />
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <p className="text-2xl font-bold text-indigo-700">{groupMembershipsQuery.data?.length || 0}</p>
                      <p className="text-xs text-gray-600 mt-1">Groups Joined</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-2xl font-bold text-purple-700">{inProgressCourses}</p>
                      <p className="text-xs text-gray-600 mt-1">Courses In Progress</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Content Tab */}
          <TabsContent value="my_content" className="space-y-5">
            <TestimonySection user={user} />
            <MyPrayerRequestsSection user={user} />
            <FavoriteVersesSection user={user} />
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections">
            <FollowingSection userId={user?.id} />
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning">
            <LearningActivitySection userId={user?.id} />
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" /> Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userBadgesQuery.isLoading ? (
                  <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
                ) : userBadgesQuery.isError ? (
                  <SafeQueryFallback query={userBadgesQuery} title="Failed to load badges" />
                ) : userBadgesQuery.data?.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No badges yet. Complete courses and challenges to earn them!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {userBadgesQuery.data.map(badge => (
                      <div key={badge.id} className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded-xl text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                          {badge.icon || '🏅'}
                        </div>
                        <p className="text-xs font-semibold text-gray-700 leading-tight">{badge.badge_name || badge.badge_id}</p>
                        {badge.earned_at && (
                          <p className="text-xs text-gray-400">{format(new Date(badge.earned_at), 'MMM d, yyyy')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interests Tab */}
          <TabsContent value="interests" className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Bible & Spiritual Interests</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Favorite Bible Books</Label>
                  <div className="flex flex-wrap gap-2">
                    {BIBLE_BOOKS.map(book => {
                      const sel = (formData.favorite_bible_books || []).includes(book);
                      return (
                        <button key={book}
                          onClick={() => setFormData(p => ({ ...p, favorite_bible_books: sel ? p.favorite_bible_books.filter(b => b !== book) : [...(p.favorite_bible_books || []), book] }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${sel ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                          {book}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Areas of Interest</Label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map(interest => {
                      const sel = (formData.interests || []).includes(interest);
                      return (
                        <button key={interest}
                          onClick={() => setFormData(p => ({ ...p, interests: sel ? p.interests.filter(i => i !== interest) : [...(p.interests || []), interest] }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${sel ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}>
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1 block">Spiritual Goals</Label>
                  <textarea
                    value={formData.spiritual_goals || ''}
                    onChange={e => setFormData(p => ({ ...p, spiritual_goals: e.target.value }))}
                    placeholder="e.g. Deepen my prayer life, understand the Old Testament..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1 block">Preferred Bible Translation</Label>
                  <div className="flex flex-wrap gap-2">
                    {TRANSLATIONS.map(t => {
                      const sel = formData.preferred_translation === t;
                      return (
                        <button key={t}
                          onClick={() => { setFormData(p => ({ ...p, preferred_translation: t })); localStorage.setItem('preferred_translation', t); }}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${sel ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'}`}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                  {saveMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Interests</>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-5">
            {/* Subscription Management */}
            {user?.subscription_status === 'active' ? (
              <Card className="border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">⭐</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">FaithLight Premium</p>
                    <p className="text-xs text-green-700">Your subscription is active</p>
                    {user.subscription_expires_at && (
                      <p className="text-xs text-green-600 mt-1">
                        Renews {format(new Date(user.subscription_expires_at), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleOpenPortal}
                  disabled={portalLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Manage Subscription'}
                </Button>
              </Card>
            ) : (
              <Link to="/SubscriptionPage">
                <Card className="p-4 flex items-center gap-3 hover:bg-yellow-50 transition-colors cursor-pointer border-yellow-100">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-xl" aria-hidden="true">⭐</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">Subscription</p>
                    <p className="text-xs text-gray-500">Upgrade to FaithLight Premium</p>
                  </div>
                  <span className="text-gray-400 text-sm">→</span>
                </Card>
              </Link>
            )}

            {/* Accessibility shortcut */}
            <Link to="/AccessibilitySettings">
              <Card className="p-4 flex items-center gap-3 hover:bg-indigo-50 transition-colors cursor-pointer border-indigo-100">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl" aria-hidden="true">♿</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Accessibility</p>
                  <p className="text-xs text-gray-500">Text size, contrast, motion, captions</p>
                </div>
                <span className="text-gray-400 text-sm">→</span>
              </Card>
            </Link>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Key className="w-4 h-4" /> Account Security</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <PasswordChangeForm onSubmit={handlePasswordChange} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Privacy Settings</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 block">Profile Visibility</Label>
                {PRIVACY_OPTIONS.map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.profile_visibility === opt.value ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="visibility" value={opt.value} checked={formData.profile_visibility === opt.value}
                      onChange={() => setFormData(p => ({ ...p, profile_visibility: opt.value }))} className="text-indigo-600" />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Daily Verse Notification */}
            <DailyVerseNotificationSettings />

            <Card>
              <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: 'notify_messages', label: 'Direct Messages', desc: 'When someone sends you a message' },
                  { key: 'notify_friend_requests', label: 'Friend Requests', desc: 'When someone sends a friend request' },
                  { key: 'notify_group_activity', label: 'Group Activity', desc: 'New posts and events in your groups' },
                  { key: 'notify_streak_reminders', label: 'Streak Reminders', desc: 'Daily reminders to maintain your streak' },
                  { key: 'notify_email', label: 'Email Notifications', desc: 'Receive important updates via email' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-medium text-gray-900" id={`label-${item.key}`}>{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={!!formData[item.key]}
                      aria-labelledby={`label-${item.key}`}
                      aria-label={`${item.label}: ${formData[item.key] ? 'On' : 'Off'}`}
                      onClick={() => setFormData(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${formData[item.key] ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData[item.key] ? 'translate-x-6' : 'translate-x-1'}`} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 gap-2 mt-2">
                  {saveMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Settings</>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Verses Tab */}
          <TabsContent value="saved">
            <SavedVersesSection user={user} />
          </TabsContent>

          {/* Highlights Tab */}
          <TabsContent value="highlights">
            <MyHighlightsSection userEmail={user.email} />
          </TabsContent>
        </Tabs>

        {/* Legal & Danger Zone */}
        <div className="mt-6 space-y-3 pb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Legal</p>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/PrivacyPolicy" className="bg-white border border-gray-100 rounded-xl p-3 text-sm font-medium text-gray-700 text-center hover:bg-gray-50 transition-colors">Privacy Policy</Link>
            <Link to="/TermsOfUse" className="bg-white border border-gray-100 rounded-xl p-3 text-sm font-medium text-gray-700 text-center hover:bg-gray-50 transition-colors">Terms of Use</Link>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mt-4">Account</p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 hover:bg-red-100 transition-colors text-left"
            aria-label="Delete my account"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-700">Delete My Account</p>
              <p className="text-xs text-red-500">Permanently remove your data</p>
            </div>
          </button>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <DeleteAccountModal
            userEmail={user.email}
            onClose={() => setShowDeleteModal(false)}
            onDeleted={() => base44.auth.logout()}
          />
        )}
      </div>
    </div>
  );
}