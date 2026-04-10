import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Eye, EyeOff, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePrivacySettings({ user, isDarkMode }) {
  const [privacySettings, setPrivacySettings] = useState({
    showReadingProgress: true,
    showFavoriteVerses: true,
    showFriendsActivity: true,
    allowFriendRequests: true,
    profileVisibility: 'friends' // public, friends, private
  });
  
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      return base44.auth.updateMe({
        privacy_settings: JSON.stringify(settings)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      toast.success('Privacy settings updated!');
      setSaving(false);
    },
    onError: () => {
      toast.error('Failed to update settings');
      setSaving(false);
    }
  });

  const handleSaveSettings = async () => {
    setSaving(true);
    updateSettingsMutation.mutate(privacySettings);
  };

  const toggleSetting = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-4">
      <Card style={{ backgroundColor: cardColor, borderColor }}>
        <CardHeader>
          <CardTitle style={{ color: textColor }}>Privacy & Sharing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Visibility */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold" style={{ color: textColor }}>
              Who Can See Your Profile?
            </h4>
            <div className="space-y-2">
              {[
                { value: 'public', label: 'Public - Everyone can view', icon: Globe },
                { value: 'friends', label: 'Friends Only - Only your friends', icon: Lock },
                { value: 'private', label: 'Private - Just me', icon: EyeOff }
              ].map(option => (
                <label
                  key={option.value}
                  className="flex items-center p-3 rounded-lg border cursor-pointer"
                  style={{
                    borderColor,
                    backgroundColor: privacySettings.profileVisibility === option.value ? primaryColor : bgColor,
                    color: privacySettings.profileVisibility === option.value ? '#FFFFFF' : textColor
                  }}
                >
                  <input
                    type="radio"
                    name="profileVisibility"
                    value={option.value}
                    checked={privacySettings.profileVisibility === option.value}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                    className="w-4 h-4 mr-3"
                  />
                  <option.icon className="w-4 h-4 mr-2" />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Activity Sharing */}
          <div className="border-t pt-4" style={{ borderColor }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: textColor }}>
              Share Activity
            </h4>
            <div className="space-y-2">
              <label className="flex items-center p-3 rounded-lg border" style={{ borderColor, backgroundColor: bgColor }}>
                <input
                  type="checkbox"
                  checked={privacySettings.showReadingProgress}
                  onChange={() => toggleSetting('showReadingProgress')}
                  className="w-4 h-4 mr-3"
                />
                <div>
                  <p className="text-sm" style={{ color: textColor }}>Show reading progress</p>
                  <p className="text-xs mt-1" style={{ color: mutedColor }}>
                    Let others see what you're reading
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 rounded-lg border" style={{ borderColor, backgroundColor: bgColor }}>
                <input
                  type="checkbox"
                  checked={privacySettings.showFavoriteVerses}
                  onChange={() => toggleSetting('showFavoriteVerses')}
                  className="w-4 h-4 mr-3"
                />
                <div>
                  <p className="text-sm" style={{ color: textColor }}>Show favorite verses</p>
                  <p className="text-xs mt-1" style={{ color: mutedColor }}>
                    Share your collection of favorite verses
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 rounded-lg border" style={{ borderColor, backgroundColor: bgColor }}>
                <input
                  type="checkbox"
                  checked={privacySettings.showFriendsActivity}
                  onChange={() => toggleSetting('showFriendsActivity')}
                  className="w-4 h-4 mr-3"
                />
                <div>
                  <p className="text-sm" style={{ color: textColor }}>Show friends what you're reading</p>
                  <p className="text-xs mt-1" style={{ color: mutedColor }}>
                    Friends can see your current Bible reading
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 rounded-lg border" style={{ borderColor, backgroundColor: bgColor }}>
                <input
                  type="checkbox"
                  checked={privacySettings.allowFriendRequests}
                  onChange={() => toggleSetting('allowFriendRequests')}
                  className="w-4 h-4 mr-3"
                />
                <div>
                  <p className="text-sm" style={{ color: textColor }}>Allow friend requests</p>
                  <p className="text-xs mt-1" style={{ color: mutedColor }}>
                    Let others add you as a friend
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full"
            style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
          >
            {saving ? 'Saving...' : 'Save Privacy Settings'}
          </Button>

          {/* Info Box */}
          <Card style={{ backgroundColor: bgColor, borderColor }}>
            <CardContent className="pt-4">
              <p className="text-xs" style={{ color: mutedColor }}>
                💡 Your privacy settings are important to us. You control what information is shared and with whom. These settings can be changed at any time.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}