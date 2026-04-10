import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
// Select replaced with AccessibleSelect for mobile/a11y compliance
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Settings as SettingsIcon, Bell, Shield, LogOut, Trash2, Eye, Lock, Globe, Sparkles, Database, CheckCircle2, Loader2, Palette, Camera, HardDrive, ChevronRight, FileText, Mail, BookOpen, Monitor, Library, Users } from 'lucide-react';
import { AccessibleSelect } from '../components/ui/accessible-select';
import PrayerReminderSettings from '../components/notifications/PrayerReminderSettings';
import MyLibraryManager from '../components/offline/MyLibraryManager';
import { Link, useNavigate } from 'react-router-dom';
import OfflineDownloadManager from '../components/bible/OfflineDownloadManager';
import CountrySelector, { getRegionForCountry } from '../components/CountrySelector';
import { useI18n } from '../components/I18nProvider';
import { useAppStore } from '../components/store/appStore';
import { useLanguageStore } from '../components/languageStore';
import { LANGUAGES } from '../components/LanguageQuickPicker';
import { toast } from 'sonner';
import SpiritualFocusSelector from '../components/settings/SpiritualFocusSelector';
import NotificationPreferencesPanel from '../components/notifications/NotificationPreferencesPanel';
import DailyVerseSubscriptionSettings from '../components/notifications/DailyVerseSubscriptionSettings';
import { Target } from 'lucide-react';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import ResponsiveGrid from '../components/ResponsiveGrid';

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const { lang: currentLanguage, setLang, t } = useI18n();
  const { bibleLanguage, setBibleLanguage, audioLanguage, setAudioLanguage } = useAppStore();
  const { setUiLanguage: setZustandUiLang } = useLanguageStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [profileChanges, setProfileChanges] = useState({});
  const [spiritualFocus, setSpiritualFocus] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spiritual_focus') || '[]'); } catch { return []; }
  });
  const [focusSaved, setFocusSaved] = useState(false);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    group_updates: true,
    friend_requests: true,
    messages: true,
    announcements: true,
    learning_reminders: true,
    sermon_updates: true,
    community_activities: true,
    new_comments: true,
    discussion_replies: true,
    daily_verse_email: true,
  });

  // App settings state
  const [appSettings, setAppSettings] = useState({
    dark_mode: false,
    offline_mode: true,
    auto_play_audio: false,
    show_analytics: true,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Load saved settings from localStorage
        const savedNotifications = localStorage.getItem('notifications_prefs');
        const savedAppSettings = localStorage.getItem('app_settings');
        
        if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
        if (savedAppSettings) setAppSettings(JSON.parse(savedAppSettings));
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.auth.updateMe(data);
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setProfileChanges({});
      queryClient.invalidateQueries(['user']);
      toast.success(t('settings.profileUpdated', 'Profile updated successfully!'));
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: (languageCode) => {
      setLang(languageCode);         // update I18nProvider + syncs Zustand via applyLang
      setZustandUiLang(languageCode); // explicit sync to Zustand (belt-and-suspenders)
      return base44.auth.updateMe({ preferred_language_code: languageCode });
    },
    onSuccess: (data) => {
      setUser(data);
    },
  });

  const countryMutation = useMutation({
    mutationFn: async (countryCode) => {
      const pricingRegion = getRegionForCountry(countryCode);
      await base44.auth.updateMe({ 
        country: countryCode,
        pricing_region: pricingRegion
      });
    },
    onSuccess: async () => {
      const updated = await base44.auth.me();
      setUser(updated);
    },
  });

  const handleProfileChange = (field, value) => {
    setProfileChanges(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    if (Object.keys(profileChanges).length > 0) {
      updateProfileMutation.mutate(profileChanges);
    }
  };

  const handleNotificationChange = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('notifications_prefs', JSON.stringify(updated));
  };

  const handleAppSettingChange = (key) => {
    const updated = { ...appSettings, [key]: !appSettings[key] };
    setAppSettings(updated);
    localStorage.setItem('app_settings', JSON.stringify(updated));
    // Apply dark mode immediately
    if (key === 'dark_mode') {
      document.documentElement.classList.toggle('dark', updated.dark_mode);
    }
  };

  const handleLogout = () => base44.auth.logout();

  const THEMES = [
    { id: 'light',    label: t('settings.theme.light', 'Light'),         bg: '#F8FAFC', accent: '#6366F1' },
    { id: 'dark',     label: t('settings.theme.dark', 'Dark'),          bg: '#0F172A', accent: '#818CF8' },
    { id: 'midnight', label: t('settings.theme.midnight', 'Midnight Blue'), bg: '#0D1B2A', accent: '#3B82F6' },
    { id: 'warm',     label: t('settings.theme.warm', 'Warm Cream'),    bg: '#FDF6EC', accent: '#D97706' },
    { id: 'olive',    label: t('settings.theme.olive', 'Olive Calm'),    bg: '#F0F4EE', accent: '#4D7C0F' },
  ];

  const handleThemeChange = async (themeId) => {
    localStorage.setItem('faithlight_theme', themeId);
    window.dispatchEvent(new CustomEvent('faithlight-theme-change', { detail: themeId }));
    await base44.auth.updateMe({ theme: themeId }).catch(() => {});
    setUser(prev => ({ ...prev, theme: themeId }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(t('settings.photoTooLarge', 'Photo must be under 5MB')); return; }
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_photo_url: file_url });
      setUser(prev => ({ ...prev, profile_photo_url: file_url }));
      toast.success(t('settings.photoUpdated', 'Profile photo updated!'));
    } catch { toast.error(t('settings.uploadFailed', 'Upload failed')); }
  };

  const [seedStatus, setSeedStatus] = useState({});

  const runSeedPack = async (pack) => {
    setSeedStatus(s => ({ ...s, [pack]: 'running' }));
    try {
      // Route special packs to their dedicated functions
      if (pack === 'bible_verses_v1') {
        await base44.functions.invoke('seedBibleVerses', {});
        setSeedStatus(s => ({ ...s, [pack]: 'done' }));
        return;
      }
      if (pack === 'daily_verse_v1') {
        await base44.functions.invoke('seedVerseOfDay', {});
        setSeedStatus(s => ({ ...s, [pack]: 'done' }));
        return;
      }
      const { data } = await base44.functions.invoke('runSeedPack', { pack });
      setSeedStatus(s => ({ ...s, [pack]: data.skipped ? 'skipped' : 'done' }));
    } catch {
      setSeedStatus(s => ({ ...s, [pack]: 'error' }));
    }
  };

  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail.trim().toLowerCase() !== user?.email?.toLowerCase()) {
      toast.error(t('settings.deleteEmailMismatch', 'Email does not match. Please type your email exactly.'));
      return;
    }
    try {
      await base44.functions.invoke('deleteUserAccount', { userEmail: user?.email });
      toast.success(t('settings.deleteSuccess', 'Account deleted successfully'));
      await base44.auth.logout();
    } catch (error) {
      toast.error(t('settings.deleteError', 'Failed to delete account. Please try again.'));
      console.error('Error deleting account:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SafeAreaWrapper>
      <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 w-full overflow-x-hidden" id="main-content">
        {/* Skip to content link */}
         <a href="#settings-content" className="skip-to-content min-h-[44px] min-w-[44px] inline-flex items-center px-4 py-3">{t('common.skipToContent', 'Skip to main content')}</a>

        <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
         <div className="mb-8">
           <div className="flex items-center gap-3 mb-2 flex-wrap">
               <SettingsIcon className="w-6 sm:w-8 h-6 sm:h-8 text-indigo-600" />
               <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded" tabIndex="0">{t('settings.title', 'Settings')}</h1>
             </div>
            <p className="text-sm sm:text-base text-gray-600">{t('settings.desc', 'Manage your account, preferences, and privacy settings')}</p>
         </div>

        {/* Tabs — responsive without horizontal scroll */}
         <main id="settings-content">
           <Tabs defaultValue="profile" className="space-y-6">
           <div className="overflow-x-auto">
             <TabsList className={`grid w-full gap-1 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-${user?.role === 'admin' ? '8' : '7'} min-h-[44px]`}>
            <TabsTrigger value="profile">{t('settings.tabs.profile', 'Profile')}</TabsTrigger>
            <TabsTrigger value="language">{t('settings.tabs.language', 'Languages')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('settings.tabs.notifications', 'Notifications')}</TabsTrigger>
            <TabsTrigger value="app">{t('settings.tabs.app', 'App')}</TabsTrigger>
            <TabsTrigger value="offline">{t('settings.tabs.offline', 'Offline')}</TabsTrigger>
            <TabsTrigger value="account">{t('settings.tabs.account', 'Account')}</TabsTrigger>
            <TabsTrigger value="spiritual">{t('settings.tabs.spiritual', 'Spiritual')}</TabsTrigger>
            {user?.role === 'admin' && <TabsTrigger value="admin">{t('settings.tabs.admin', 'Admin')}</TabsTrigger>}
             </TabsList>
            </div>

          {/* Offline Library Tab */}
          <TabsContent value="offline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Library className="w-5 h-5 text-indigo-600" />
                  {t('settings.myLibrary', 'My Library')}
                </CardTitle>
                <p className="text-sm text-gray-500">{t('settings.myLibraryDesc', 'Select Bible books or reading plans to download for offline access. Available anytime with no data connection.')}</p>
              </CardHeader>
              <CardContent>
                <MyLibraryManager />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  {t('settings.offlineLibrary', 'Advanced Offline Manager')}
                </CardTitle>
                <p className="text-sm text-gray-500">{t('settings.offlineLibraryDesc', 'Download books or series for offline reading. Pause, resume, or cancel downloads anytime.')}</p>
              </CardHeader>
              <CardContent>
                <OfflineDownloadManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Settings */}
          <TabsContent value="language" className="space-y-6">
            {/* ── Core 3-language section ── */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-500" />
                  {t('settings.languagesTitle', 'Languages')}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {t('settings.languagesDescription', 'Manage the language used for the app, Bible reading, and audio.')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-1.5 block text-sm font-medium">{t('language.uiLanguage', 'UI Language')}</Label>
                   <p className="text-xs text-gray-400 mb-2">{t('settings.uiLanguageDesc', 'Buttons, menus, interface text, AI help, support pages')}</p>
                   <AccessibleSelect
                     value={currentLanguage}
                     onValueChange={(v) => updateLanguageMutation.mutate(v)}
                     label={t('language.uiLanguage', 'UI Language')}
                     options={[
                       { value: 'en', label: '🇬🇧 English' },
                       { value: 'om', label: '🇪🇹 Afaan Oromoo' },
                       { value: 'am', label: '🇪🇹 አማርኛ' },
                       { value: 'sw', label: '🇹🇿 Kiswahili' },
                       { value: 'ar', label: '🇸🇦 العربية' },
                       { value: 'fr', label: '🇫🇷 Français' },
                       { value: 'ti', label: '🇪🇷 ትግርኛ' },
                     ]}
                   />
                </div>

                <div>
                  <Label className="mb-1.5 block text-sm font-medium">{t('language.bibleLanguage', 'Bible Reading Language')}</Label>
                   <p className="text-xs text-gray-400 mb-2">{t('settings.bibleLanguageDesc', 'Verse text, Bible Reader, Verse of the Day')}</p>
                   <AccessibleSelect
                     value={bibleLanguage}
                     onValueChange={setBibleLanguage}
                     label={t('language.bibleLanguage', 'Bible Reading Language')}
                     options={[
                       { value: 'en', label: '🇬🇧 English' },
                       { value: 'om', label: '🇪🇹 Afaan Oromoo' },
                       { value: 'am', label: '🇪🇹 አማርኛ' },
                       { value: 'sw', label: '🇹🇿 Kiswahili' },
                       { value: 'ar', label: '🇸🇦 العربية' },
                       { value: 'fr', label: '🇫🇷 Français' },
                       { value: 'ti', label: '🇪🇷 ትግርኛ' },
                     ]}
                   />
                </div>

                <div>
                  <Label className="mb-1.5 block text-sm font-medium">{t('language.audioLanguage', 'Audio Language')}</Label>
                   <p className="text-xs text-gray-400 mb-2">{t('settings.audioLanguageDesc', 'Chapter audio, TTS, spoken Bible playback')}</p>
                   <AccessibleSelect
                     value={audioLanguage}
                     onValueChange={setAudioLanguage}
                     label={t('language.audioLanguage', 'Audio Language')}
                     options={[
                       { value: 'en', label: '🇬🇧 English' },
                       { value: 'om', label: '🇪🇹 Afaan Oromoo' },
                       { value: 'am', label: '🇪🇹 አማርኛ' },
                       { value: 'sw', label: '🇹🇿 Kiswahili' },
                       { value: 'ar', label: '🇸🇦 العربية' },
                       { value: 'fr', label: '🇫🇷 Français' },
                       { value: 'ti', label: '🇪🇷 ትግርኛ' },
                     ]}
                   />
                </div>

                <div className="pt-2 border-t space-y-2">
                  <Label htmlFor="country">{t('settings.country', 'Country')}</Label>
                  <CountrySelector
                    value={user?.country}
                    onChange={(value) => countryMutation.mutate(value)}
                    locked={user?.region_locked}
                    isAdmin={user?.user_role === 'admin'}
                  />
                  <p className="text-xs text-gray-500">{t('settings.countryDesc', 'Used for localized content and regional settings')}</p>
                </div>
              </div>
            </div>

            {/* Content Translation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('settings.translationCoverage', 'Translation Coverage')}</CardTitle>
                <CardDescription>{t('settings.translationCoverageDesc', 'Completion status for each language')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { code: 'en', name: t('language.english', 'English'), percent: 100 },
                    { code: 'om', name: t('language.oromoo', 'Afaan Oromoo'), percent: 95 },
                    { code: 'am', name: t('language.amharic', 'Amharic'), percent: 75 },
                    { code: 'es', name: t('language.spanish', 'Spanish'), percent: 85 },
                    { code: 'fr', name: t('language.french', 'French'), percent: 80 },
                  ].map(lang => (
                    <div key={lang.code} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{lang.name}</span>
                        <span className="text-gray-600">{lang.percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${lang.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5" /> {t('settings.profilePhoto', 'Profile Photo')}</CardTitle>
                <CardDescription>{t('settings.profilePhotoDesc', 'Upload a photo to personalize your profile')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-200">
                    {user.profile_photo_url
                      ? <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                      : <span className="text-3xl font-bold text-indigo-600">{user.full_name?.[0] || '?'}</span>}
                  </div>
                  <div>
                    <label className="cursor-pointer">
                        <Button asChild variant="outline" className="gap-2 cursor-pointer h-[44px]">
                          <span><Camera className="w-4 h-4" /> {user.profile_photo_url ? t('settings.changePhoto', 'Change Photo') : t('settings.uploadPhoto', 'Upload Photo')}</span>
                        </Button>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">{t('settings.photoFormat', 'JPG, PNG up to 5MB')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.profileInfo', 'Profile Information')}</CardTitle>
                <CardDescription>{t('settings.profileInfoDesc', 'Update your basic profile details')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('settings.fullName', 'Full Name')}</Label>
                  <Input
                      id="full_name"
                      value={profileChanges.full_name !== undefined ? profileChanges.full_name : user.full_name}
                      onChange={(e) => handleProfileChange('full_name', e.target.value)}
                      placeholder={t('settings.fullNamePlaceholder', 'Your full name')}
                      className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('settings.email', 'Email Address')}</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-600">{t('settings.emailDesc', 'Email cannot be changed directly. Contact support if you need to update it.')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">{t('settings.displayName', 'Display Name')}</Label>
                  <Input
                    id="display_name"
                    value={profileChanges.display_name !== undefined ? profileChanges.display_name : (user.display_name || '')}
                    onChange={(e) => handleProfileChange('display_name', e.target.value)}
                    placeholder={t('settings.displayNamePlaceholder', 'How others see your name')}
                    className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  />
                  <p className="text-xs text-gray-600">{t('settings.displayNameDesc', 'This is how your name appears in the community')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t('settings.bio', 'Bio (Optional)')}</Label>
                  <Textarea
                        id="bio"
                        value={profileChanges.bio !== undefined ? profileChanges.bio : (user.bio || '')}
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                        placeholder={t('settings.bioPlaceholder', 'Tell us about yourself, your faith journey, or your interests...')}
                        rows={4}
                        className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      />
                  <p className="text-xs text-gray-600">{t('settings.bioDesc', 'This appears on your profile and helps others connect with you')}</p>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  disabled={Object.keys(profileChanges).length === 0 || updateProfileMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {updateProfileMutation.isPending ? t('settings.saving', 'Saving...') : t('settings.saveChanges', 'Save Changes')}
                </Button>
              </CardContent>
            </Card>


          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <DailyVerseSubscriptionSettings userEmail={user?.email} />
            <NotificationPreferencesPanel userEmail={user?.email} language={currentLanguage} />
            <PrayerReminderSettings />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t('settings.notificationPreferences', 'Notification Preferences')}
                </CardTitle>
                <CardDescription>{t('settings.notificationPreferencesDesc', 'Control how and when you receive notifications')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-3">{t('settings.generalNotifications', 'General Notifications')}</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'email_notifications', label: t('settings.emailNotifications', 'Email Notifications'), description: t('settings.emailNotificationsDesc', 'Receive important updates via email') },
                          { key: 'daily_verse_email', label: t('settings.dailyVerseEmail', 'Daily Verse Email'), description: t('settings.dailyVerseEmailDesc', 'Receive the Verse of the Day in your preferred language each morning') },
                          { key: 'announcements', label: t('settings.announcements', 'Platform Announcements'), description: t('settings.announcementsDesc', 'Important platform updates and features') },
                          { key: 'learning_reminders', label: t('settings.learningReminders', 'Learning Reminders'), description: t('settings.learningRemindersDesc', 'Daily reminders to continue learning') },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <Switch
                            checked={notifications[item.key]}
                            onCheckedChange={() => handleNotificationChange(item.key)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-3">{t('settings.communityNotifications', 'Community Notifications')}</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'group_updates', label: t('settings.groupUpdates', 'Group Updates'), description: t('settings.groupUpdatesDesc', 'New posts and activities in your groups') },
                        { key: 'community_activities', label: t('settings.communityActivities', 'Community Activities'), description: t('settings.communityActivitiesDesc', 'Likes, follows, and mentions from other users') },
                        { key: 'friend_requests', label: t('settings.friendRequests', 'Friend Requests'), description: t('settings.friendRequestsDesc', 'When users send you friend requests') },
                        { key: 'messages', label: t('settings.directMessages', 'Direct Messages'), description: t('settings.directMessagesDesc', 'New direct messages from other users') },
                        { key: 'discussion_replies', label: t('settings.discussionReplies', 'Discussion Replies'), description: t('settings.discussionRepliesDesc', 'Replies to your discussion posts') },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <Switch
                            checked={notifications[item.key]}
                            onCheckedChange={() => handleNotificationChange(item.key)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-3">{t('settings.sermonNotifications', 'Sermon Library Notifications')}</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'sermon_updates', label: t('settings.newSermons', 'New Sermons'), description: t('settings.newSermonsDesc', 'When new sermons are shared in the community') },
                        { key: 'new_comments', label: t('settings.sermonComments', 'Sermon Comments'), description: t('settings.sermonCommentsDesc', 'Comments on sermons you\'ve shared or engaged with') },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <Switch
                            checked={notifications[item.key]}
                            onCheckedChange={() => handleNotificationChange(item.key)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Settings */}
          <TabsContent value="app" className="space-y-6">
            {/* Theme picker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> {t('settings.theme', 'Theme')}</CardTitle>
                <CardDescription>{t('settings.themeDesc', 'Choose your preferred app appearance')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {THEMES.map(theme => {
                    const active = (user?.theme || 'light') === theme.id;
                    return (
                      <button
                         key={theme.id}
                         onClick={() => handleThemeChange(theme.id)}
                         className={`flex items-center gap-2 h-[44px] px-4 rounded-xl border-2 text-sm font-medium transition-all ${active ? 'border-indigo-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                       >
                        <span className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0" style={{ background: theme.bg }} />
                        {theme.label}
                        {active && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.appPreferences', 'App Preferences')}</CardTitle>
                <CardDescription>{t('settings.appPreferencesDesc', 'Customize your app experience')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'dark_mode', label: t('settings.darkMode', 'Dark Mode (legacy)'), description: t('settings.darkModeDesc', 'Use a dark theme for reduced eye strain') },
                  { key: 'offline_mode', label: t('settings.offlineMode', 'Offline Mode'), description: t('settings.offlineModeDesc', 'Allow downloading content for offline access') },
                  { key: 'auto_play_audio', label: t('settings.autoPlayAudio', 'Auto-play Audio'), description: t('settings.autoPlayAudioDesc', 'Automatically play audio content') },
                  { key: 'show_analytics', label: t('settings.showAnalytics', 'Show Analytics'), description: t('settings.showAnalyticsDesc', 'Display your learning analytics and progress') },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <Switch
                      checked={appSettings[item.key]}
                      onCheckedChange={() => handleAppSettingChange(item.key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spiritual Focus Tab */}
          <TabsContent value="spiritual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" /> {t('settings.spiritualFocusTitle', 'Spiritual Focus Areas')}
                </CardTitle>
                <CardDescription>
                  {t('settings.spiritualFocusDesc', 'Your AI-powered Verse of the Day reflections will be tailored to these growth areas')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <SpiritualFocusSelector
                  selected={spiritualFocus}
                  onChange={(val) => { setSpiritualFocus(val); setFocusSaved(false); }}
                />
                <Button
                  onClick={async () => {
                    localStorage.setItem('spiritual_focus', JSON.stringify(spiritualFocus));
                    await base44.auth.updateMe({ spiritual_focus: spiritualFocus }).catch(() => {});
                    setFocusSaved(true);
                    toast.success(t('settings.spiritualFocusSaved', 'Spiritual focus saved! Your verse reflections will be updated.'));
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  {focusSaved ? `✓ ${t('common.saved', 'Saved!')}` : t('settings.saveFocusAreas', 'Save Focus Areas')}
                </Button>
                {spiritualFocus.length > 0 && (
                  <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-800">
                    <p className="font-semibold mb-1">✦ Active Focus Areas:</p>
                    <div className="flex flex-wrap gap-2">
                      {spiritualFocus.map(f => (
                        <span key={f} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">{f}</span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-indigo-600">{t('settings.spiritualFocusHint', 'These will shape your daily verse reflections on the home page.')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Settings */}
          {user?.role === 'admin' && (
            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    {t('settings.seedPacks', 'Translation Seed Packs')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.seedPacksDesc', 'Run once to populate the translations database. Uses a server-side lock — safe to click multiple times.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { pack: 'ui_v1', label: t('settings.seedPack.ui', 'UI Translations (Home, Nav, Buttons)'), desc: t('settings.seedPack.uiDesc', 'English, Afaan Oromoo, Amharic, Arabic') },
                    { pack: 'training_v1', label: t('settings.seedPack.training', 'Training Content Translations'), desc: t('settings.seedPack.trainingDesc', 'Start/Continue Course labels') },
                    { pack: 'leadership_v1', label: t('settings.seedPack.leadership', 'Leadership Training Translations'), desc: t('settings.seedPack.leadershipDesc', 'Apply / Leadership labels') },
                    { pack: 'home_v1', label: t('settings.seedPack.home', 'Home Page Translations'), desc: t('settings.seedPack.homeDesc', 'Hero CTAs and welcome text') },
                    { pack: 'bible_verses_v1', label: t('settings.seedPack.bible', '📖 Bible Verses (Core Content)'), desc: t('settings.seedPack.bibleDesc', 'Seeds BibleVerse records — required for Bible Reader') },
                    { pack: 'daily_verse_v1', label: t('settings.seedPack.verse', '✨ Daily Verse / Verse of the Day'), desc: t('settings.seedPack.verseDesc', 'Seeds DailyVerse records — required for Home page') },
                  ].map(({ pack, label, desc }) => {
                    const status = seedStatus[pack];
                    return (
                      <div key={pack} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{label}</p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runSeedPack(pack)}
                          disabled={status === 'running'}
                          className={`gap-1.5 text-xs ${status === 'done' ? 'border-green-500 text-green-700' : status === 'skipped' ? 'border-gray-400 text-gray-500' : status === 'error' ? 'border-red-500 text-red-600' : ''}`}
                        >
                          {status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                           {status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                           {!status && <Database className="w-3 h-3" />}
                           {status === 'running' ? t('common.running', 'Running…') : status === 'done' ? t('common.done', 'Done') : status === 'skipped' ? t('settings.alreadySeeded', 'Already Seeded') : status === 'error' ? t('settings.errorRetry', 'Error – Retry') : t('settings.runSeed', 'Run Seed')}
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t('settings.accountSecurity', 'Account Security')}
                </CardTitle>
                <CardDescription>{t('settings.accountSecurityDesc', 'Manage your account security and privacy')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>{t('common.note', 'Note')}:</strong> {t('settings.passwordNote', 'Your password is managed through your email verification. To change your password, use the "Forgot Password" link on the login page.')}
                  </p>
                </div>

                <Button 
                   variant="outline" 
                   className="w-full justify-start gap-2 opacity-50 cursor-not-allowed"
                   disabled
                   title="Password changes are managed through email verification"
                 >
                   <Lock className="w-4 h-4" />
                   {t('settings.changePassword', 'Change Password')}
                 </Button>

                 <Button 
                   variant="outline" 
                   className="w-full justify-start gap-2 opacity-50 cursor-not-allowed"
                   disabled
                   title="Session management coming soon"
                 >
                   <Eye className="w-4 h-4" />
                   {t('settings.viewSessions', 'View Active Sessions')}
                 </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.sessionManagement', 'Session Management')}</CardTitle>
                <CardDescription>{t('settings.sessionManagementDesc', 'Manage your login sessions')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  {t('settings.logout', 'Logout')}
                  </Button>
                  <p className="text-xs text-gray-600">{t('settings.logoutWarning', 'You will be logged out of your current session')}</p>
              </CardContent>
            </Card>

            {/* Legal Section */}
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-1 text-base font-semibold text-gray-900">
                {t('settings.legalTitle', 'Legal')}
              </div>
              <p className="mb-4 text-sm text-gray-500">
                {t('settings.legalDescription', 'Learn how FaithLight protects your privacy, security, and use of the app.')}
              </p>
              <div className="space-y-2">
                {[
                  { key: 'privacy',  label: t('settings.privacyPolicy', 'Privacy Policy'), icon: <Shield className="w-5 h-5" />,   onClick: () => navigate('/PrivacyPolicy') },
                  { key: 'terms',    label: t('settings.termsOfUse', 'Terms of Use'),      icon: <FileText className="w-5 h-5" />,  onClick: () => navigate('/TermsOfUse') },
                  { key: 'security', label: t('settings.security', 'Security'),             icon: <Lock className="w-5 h-5" />,     onClick: () => navigate('/SecurityPolicy') },
                  { key: 'support',  label: t('settings.contactSupport', 'Contact Support'),icon: <Mail className="w-5 h-5" />,     onClick: () => { window.location.href = 'mailto:support@faithlight.app'; } },
                ].map(({ key, label, icon, onClick }) => (
                  <button
                    key={key}
                    onClick={onClick}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-4 text-left transition hover:bg-gray-50 min-h-[44px]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{icon}</span>
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900">{t('settings.dangerZone', 'Danger Zone')}</CardTitle>
                <CardDescription className="text-red-800">{t('settings.dangerZoneDesc', 'Irreversible account actions')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  {t('settings.deleteAccount', 'Delete Account')}
                </Button>
                <p className="text-xs text-red-800">{t('settings.deleteAccountWarning', 'This action cannot be undone. All your data will be permanently deleted.')}</p>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
          </main>
          </div>
          </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setDeleteConfirmEmail(''); }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              {t('settings.deleteAccountTitle', 'Delete Account?')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                {t('settings.deleteAccountDesc', 'Are you sure you want to permanently delete your account? This action cannot be undone.')}
              </p>
              <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                <li>{t('settings.deleteAccountWill1', 'All your data will be permanently deleted')}</li>
                <li>{t('settings.deleteAccountWill2', 'Your reading plans and progress will be lost')}</li>
                <li>{t('settings.deleteAccountWill3', 'Your journal entries and notes will be removed')}</li>
                <li>{t('settings.deleteAccountWill4', 'This cannot be reversed')}</li>
              </ul>
              <p className="font-semibold text-gray-900">
              {t('settings.deleteAccountConfirm', 'Type your email to confirm:')}
              </p>
              <input
              type="email"
              value={deleteConfirmEmail}
              onChange={e => setDeleteConfirmEmail(e.target.value)}
              placeholder={user?.email || ''}
              className="w-full px-3 py-2 border border-red-300 rounded-lg bg-white text-sm text-red-900 font-mono focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400 focus-visible:ring-offset-2"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmEmail.trim().toLowerCase() !== user?.email?.toLowerCase()}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('settings.deleteAccountPermanently', 'Delete Permanently')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
        </AlertDialog>
        </SafeAreaWrapper>
        );
        }