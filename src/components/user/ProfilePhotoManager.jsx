import React, { useRef, useState } from 'react';
import { Camera, ImageIcon, X, Upload, Loader2, AlertCircle } from 'lucide-react';
import UserAvatar from './UserAvatar';
import {
  updateProfileImageFromGallery,
  removeProfileImage,
} from '@/lib/profileImageService';
import { toast } from 'sonner';

/**
 * Profile photo section — shows avatar, change button, remove button.
 * Calls onUpdate(newUrl) after a successful change.
 */
export default function ProfilePhotoManager({ user, onUpdate }) {
  const fileInputRef = useRef(null);
  const [showSheet, setShowSheet] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGallerySelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowSheet(false);
    setLoading(true);
    try {
      const url = await updateProfileImageFromGallery(file);
      onUpdate?.({ profileImageUrl: url, profileImageSource: 'gallery', profileVerseCardId: null });
      window.dispatchEvent(new Event('profile-image-updated'));
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error(err.message || 'Unable to upload profile picture. Please try again.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleRemove = async () => {
    setShowSheet(false);
    setLoading(true);
    try {
      await removeProfileImage();
      onUpdate?.({ profileImageUrl: null, profileImageSource: null, profileVerseCardId: null });
      window.dispatchEvent(new Event('profile-image-updated'));
      toast.success('Profile photo removed.');
    } catch {
      toast.error('Failed to remove profile photo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar with camera overlay */}
      <div className="relative">
        <UserAvatar
          imageUrl={user?.profileImageUrl}
          name={user?.full_name}
          size="2xl"
          rounded="2xl"
          className="border-4 border-white shadow-lg"
        />
        {loading && (
          <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-white" />
          </div>
        )}
        <button
          onClick={() => setShowSheet(true)}
          disabled={loading}
          className="absolute -bottom-2 -right-2 w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white disabled:opacity-60"
          aria-label="Change profile photo"
        >
          <Camera className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowSheet(true)}
          disabled={loading}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 min-h-[36px] px-3"
        >
          Change Photo
        </button>
        {user?.profileImageUrl && (
          <button
            onClick={handleRemove}
            disabled={loading}
            className="text-sm font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 min-h-[36px] px-3"
          >
            Remove
          </button>
        )}
      </div>

      {/* Action sheet overlay */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setShowSheet(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-t-3xl p-5 pb-8 space-y-3 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-base font-bold text-gray-900">Change Profile Photo</p>
              <button onClick={() => setShowSheet(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Upload from gallery */}
            <label className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition-colors min-h-[60px]">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Upload from Gallery</p>
                <p className="text-xs text-gray-500">JPG, PNG, or WebP · max 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleGallerySelect}
              />
            </label>

            {/* Cancel */}
            <button
              onClick={() => setShowSheet(false)}
              className="w-full py-3 rounded-2xl bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors min-h-[48px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}