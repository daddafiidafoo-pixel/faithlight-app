import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditProfileModal({ open, onOpenChange, user, onProfileUpdated }) {
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        display_name: displayName,
        bio: bio,
        photo_url: photoUrl,
      });
      toast.success('Profile updated');
      onProfileUpdated?.();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Section */}
          <div className="flex flex-col items-center gap-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {displayName?.charAt(0) || 'U'}
              </div>
            )}
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2 cursor-pointer"
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Change Photo
              </Button>
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                maxLength={200}
                className="h-24"
              />
              <p className="text-xs text-gray-500 mt-1">{bio.length}/200</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}