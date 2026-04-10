import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Check } from 'lucide-react';

export default function ProfilePhotoUpload({ user, onPhotoUpdated }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      setIsUploading(true);
      try {
        // Upload file to Base44
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        // Update user profile with new photo URL
        const updated = await base44.auth.updateMe({ 
          profile_photo_url: file_url 
        });
        
        return updated;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: (updatedUser) => {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
      queryClient.invalidateQueries(['user']);
      if (onPhotoUpdated) {
        onPhotoUpdated(updatedUser);
      }
    },
  });

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative group">
      {/* Profile Photo */}
      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
        {user?.profile_photo_url ? (
          <img 
            src={user.profile_photo_url} 
            alt={user.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-4xl font-bold">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Upload Button (appears on hover) */}
      <button
        onClick={handleUploadClick}
        disabled={isUploading}
        className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white p-2 rounded-full shadow-lg transition-all group-hover:scale-110"
      >
        {uploadSuccess ? (
          <Check className="w-4 h-4" />
        ) : isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help Text */}
      <p className="text-xs text-gray-600 mt-2 text-center">Click to upload photo</p>
    </div>
  );
}