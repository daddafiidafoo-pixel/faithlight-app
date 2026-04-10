import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function PasswordChangeForm({ onSubmit }) {
  const [showPasswords, setShowPasswords] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(currentPassword, newPassword, confirmPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">Current Password</Label>
        <div className="relative mt-1">
          <Input
            type={showPasswords ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">New Password</Label>
        <div className="relative mt-1">
          <Input
            type={showPasswords ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min. 8 characters)"
            className="pr-10"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
      </div>

      <div>
        <Label className="text-sm font-medium">Confirm New Password</Label>
        <div className="relative mt-1">
          <Input
            type={showPasswords ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="pr-10"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
        ) : (
          'Change Password'
        )}
      </Button>
    </div>
  );
}