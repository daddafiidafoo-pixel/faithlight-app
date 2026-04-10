import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DeleteAccountModal({ userEmail, onClose, onDeleted }) {
  const [step, setStep] = useState('warning'); // warning | password | processing | done
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!password.trim()) {
      setError('Please enter your password to confirm');
      return;
    }

    setLoading(true);
    setError('');
    setStep('processing');

    try {
      const response = await base44.functions.invoke('authBackend', {
        action: 'deleteAccount',
        email: userEmail,
        password,
      });

      if (response.data?.success) {
        setStep('done');
        toast.success('Account deleted successfully');
        
        // Clear local token/session
        localStorage.removeItem('auth_token');
        sessionStorage.clear();
        
        // Redirect to onboarding after 2 seconds
        setTimeout(() => {
          onDeleted?.();
          window.location.href = '/OnboardingFlow';
        }, 2000);
      } else {
        setStep('password');
        setError(response.data?.error || 'Failed to delete account. Please check your password and try again.');
      }
    } catch (err) {
      setStep('password');
      setError(err.message || 'An error occurred. Please try again.');
      toast.error('Deletion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        
        {/* Warning Step */}
        {step === 'warning' && (
          <div className="p-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Account?</h2>
            <p className="text-gray-600 text-center mb-4 text-sm">
              This action is <strong>permanent and cannot be undone.</strong>
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-800 space-y-2">
              <p className="font-semibold">Everything will be deleted:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Your account and profile</li>
                <li>Prayer journal entries</li>
                <li>Saved verses and highlights</li>
                <li>Reading progress and streaks</li>
                <li>All personal data</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep('password')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Password Confirmation Step */}
        {step === 'password' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Confirm Password</h2>
            <p className="text-gray-600 text-sm mb-6">
              Enter your password to confirm account deletion.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 accent-red-600"
              />
              <span className="text-xs text-gray-700">
                I understand this will <strong>permanently delete</strong> my account and all my data.
              </span>
            </label>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('warning');
                  setPassword('');
                  setError('');
                }}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleDelete}
                disabled={!confirmed || !password.trim() || loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting…
                  </>
                ) : (
                  'Delete Account'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="p-6 text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900">Deleting your account…</h2>
            <p className="text-gray-600 text-sm mt-2">Please wait, this may take a moment.</p>
          </div>
        )}

        {/* Done Step */}
        {step === 'done' && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Account Deleted</h2>
            <p className="text-gray-600 text-sm mt-2">
              Your account and all personal data have been permanently deleted. You will be redirected to onboarding.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}