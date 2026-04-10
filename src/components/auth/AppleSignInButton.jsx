import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Apple, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AppleSignInButton({ onSuccess, className = '' }) {
  const [loading, setLoading] = useState(false);
  const [hasAppleSupport, setHasAppleSupport] = useState(false);

  useEffect(() => {
    // Check if Apple Sign In is available
    // On iOS, check for AppleID capability
    // On web, check if we're on Apple device
    const isAppleDevice = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
    const hasAppleID = window.AppleID !== undefined;
    setHasAppleSupport(isAppleDevice || hasAppleID);
  }, []);

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      // Attempt native iOS Apple Sign-In first
      if (window.AppleID) {
        window.AppleID.auth.init({
          clientId: 'app.faithlight.signin',
          teamId: 'TEAM_ID_HERE', // Will be set in deployment
          redirectURI: window.location.origin + '/auth-callback',
          scope: ['name', 'email'],
          usePopup: true,
        });

        const response = await window.AppleID.auth.signIn();
        if (response?.user) {
          // Handle web sign-in response
          await handleAppleResponse(response);
        }
      } else {
        // Fallback: use base44 auth with Apple provider
        const response = await base44.functions.invoke('appleSignInAuth', {
          action: 'initiate',
        });

        if (response.data?.authUrl) {
          // Redirect to Apple auth flow
          window.location.href = response.data.authUrl;
        }
      }
    } catch (error) {
      console.error('Apple Sign-In error:', error);
      toast.error('Apple Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleResponse = async (response) => {
    try {
      const { user } = response;

      // Send to backend for verification and user creation
      const result = await base44.functions.invoke('appleSignInAuth', {
        action: 'verify',
        identityToken: response.authorization?.id_token,
        userInfo: {
          email: user?.email,
          name: user?.name,
          fullName: `${user?.name?.firstName || ''} ${user?.name?.lastName || ''}`.trim(),
        },
      });

      if (result.data?.authToken) {
        // Store auth token locally
        localStorage.setItem('faithlight_auth_token', result.data.authToken);
        localStorage.setItem('faithlight_user', JSON.stringify(result.data.user));

        toast.success(`Welcome, ${result.data.user?.full_name}!`);
        onSuccess?.(result.data.user);
      }
    } catch (error) {
      toast.error('Failed to verify Apple Sign-In');
    }
  };

  if (!hasAppleSupport) {
    return null; // Hide on non-Apple devices
  }

  return (
    <Button
      onClick={handleAppleSignIn}
      disabled={loading}
      className={`bg-black hover:bg-gray-800 text-white flex items-center gap-2 ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Apple className="w-4 h-4" />}
      Sign in with Apple
    </Button>
  );
}