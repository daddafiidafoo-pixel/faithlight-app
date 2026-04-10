import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Plus, X } from 'lucide-react';

export default function EnhancedProfileEditor({ user, onSave }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState({});
  const [expertise, setExpertise] = useState([]);
  const [expertiseInput, setExpertiseInput] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profiles = await base44.entities.UserProfile.filter({
          user_id: user.id
        });
        setProfile(profiles?.[0] || {});
        setSocialLinks(profiles?.[0]?.social_links || {});
        setExpertise(profiles?.[0]?.expertise || []);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user.id]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({
        file
      });
      setProfile({ ...profile, avatar_url: file_url });
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = {
        bio: profile.bio || '',
        avatar_url: profile.avatar_url,
        location: profile.location,
        website_url: profile.website_url,
        social_links: socialLinks,
        expertise,
        is_public: profile.is_public !== false
      };

      if (profile.id) {
        await base44.entities.UserProfile.update(profile.id, data);
      } else {
        await base44.entities.UserProfile.create({
          user_id: user.id,
          ...data
        });
      }

      onSave?.(profile);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const addExpertise = () => {
    if (expertiseInput.trim()) {
      setExpertise([...expertise, expertiseInput.trim()]);
      setExpertiseInput('');
    }
  };

  const removeExpertise = (idx) => {
    setExpertise(expertise.filter((_, i) => i !== idx));
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400">No photo</span>
            )}
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Photo
              </span>
            </Button>
          </label>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <Textarea
            placeholder="Tell us about yourself..."
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            maxLength={500}
            className="h-24"
          />
          <p className="text-xs text-gray-500 mt-1">{(profile.bio || '').length}/500</p>
        </div>

        {/* Location & Website */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Input
              placeholder="City, Country"
              value={profile.location || ''}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <Input
              placeholder="https://example.com"
              type="url"
              value={profile.website_url || ''}
              onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
            />
          </div>
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium mb-2">Social Media</label>
          <div className="space-y-2">
            {['twitter', 'linkedin', 'youtube', 'instagram'].map((social) => (
              <Input
                key={social}
                placeholder={`${social} URL`}
                value={socialLinks[social] || ''}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, [social]: e.target.value })
                }
              />
            ))}
          </div>
        </div>

        {/* Expertise */}
        <div>
          <label className="block text-sm font-medium mb-2">Expertise & Interests</label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add expertise (e.g. Bible Study, Leadership)"
              value={expertiseInput}
              onChange={(e) => setExpertiseInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
            />
            <Button size="sm" onClick={addExpertise} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {expertise.map((exp, idx) => (
              <div
                key={idx}
                className="bg-blue-100 text-blue-900 rounded-full px-3 py-1 text-sm flex items-center gap-2"
              >
                {exp}
                <button onClick={() => removeExpertise(idx)}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Public Profile Toggle */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={profile.is_public !== false}
            onChange={(e) => setProfile({ ...profile, is_public: e.target.checked })}
          />
          <span className="text-sm">Make profile public</span>
        </label>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </CardContent>
    </Card>
  );
}