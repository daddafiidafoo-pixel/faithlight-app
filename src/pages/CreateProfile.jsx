import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import LanguageCountryOnboarding from '../components/LanguageCountryOnboarding';

export default function CreateProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showLanguageCountrySetup, setShowLanguageCountrySetup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    photo_url: '',
    bio: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Check if user already has profile
        const existingProfile = await base44.entities.User.filter(
          { id: currentUser.id },
          '-created_date',
          1
        );
        
        if (existingProfile.length > 0) {
          navigate(createPageUrl('Home'));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username required';
    } else if (!/^[a-z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username must be lowercase letters, numbers, underscore only';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkUsernameUnique = async (username) => {
    const existing = await base44.entities.User.filter(
      { username: username.toLowerCase() },
      '-created_date',
      1
    );
    return existing.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const isUnique = await checkUsernameUnique(formData.username);
      
      if (!isUnique) {
        setErrors({ username: 'Username already taken' });
        setSubmitting(false);
        return;
      }

      await base44.auth.updateMe({
        username: formData.username.toLowerCase(),
        display_name: formData.display_name,
        photo_url: formData.photo_url || null,
        bio: formData.bio || null
      });

      toast.success('Profile created successfully!');
      setShowLanguageCountrySetup(true);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (showLanguageCountrySetup) {
    return (
      <LanguageCountryOnboarding 
        onComplete={() => navigate(createPageUrl('Home'))}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto pt-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Profile</h1>
          <p className="text-gray-600 mb-8">Set up your FaithLight community profile</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <Input
                type="text"
                placeholder="john_doe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-red-600 text-xs mt-1">{errors.username}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Lowercase, letters/numbers/underscore only</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className={errors.display_name ? 'border-red-500' : ''}
              />
              {errors.display_name && (
                <p className="text-red-600 text-xs mt-1">{errors.display_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo URL (optional)
              </label>
              <Input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio (optional)
              </label>
              <Textarea
                placeholder="Tell others about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="h-20"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Create Profile'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}