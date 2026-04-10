import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Edit2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function DisplayNameAvatarSettings({ user, onUpdated }) {
  const [displayName, setDisplayName] = useState(user?.display_name || user?.full_name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (newName) => {
      const updated = await base44.auth.updateMe({
        display_name: newName,
      });
      return updated;
    },
    onSuccess: (updatedUser) => {
      setSaved(true);
      setIsEditing(false);
      onUpdated(updatedUser);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = () => {
    if (displayName.trim() && displayName !== (user?.display_name || user?.full_name)) {
      updateMutation.mutate(displayName.trim());
    } else {
      setIsEditing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit2 className="w-5 h-5" />
          Display Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display Name */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="displayName" className="font-medium">Display Name</Label>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-xs"
              >
                Edit
              </Button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you'll appear to other users"
                className="mt-2"
              />
              <p className="text-xs text-gray-600">
                This is the name other users will see in the community
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 flex-1"
                  size="sm"
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDisplayName(user?.display_name || user?.full_name || '');
                    setIsEditing(false);
                  }}
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900">{displayName}</p>
            </div>
          )}
        </div>

        {/* Public Email Visibility */}
        <div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="emailVisible"
              defaultChecked={user?.email_visible !== false}
              onChange={(e) => {
                base44.auth.updateMe({ email_visible: e.target.checked });
              }}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer"
            />
            <label htmlFor="emailVisible" className="flex-1 cursor-pointer">
              <p className="font-medium text-sm text-gray-900">Show Email in Profile</p>
              <p className="text-xs text-gray-600 mt-0.5">Let other users see and contact you via email</p>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}