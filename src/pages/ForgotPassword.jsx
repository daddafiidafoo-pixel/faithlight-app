import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/utils';
import { ChevronLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center">
        <button
          onClick={() => navigate(createPageUrl('LogIn'))}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 max-w-md w-full mx-auto">
        {submitted ? (
          <div className="text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Check Your Email</h1>
            <p className="text-gray-600 mb-8">
              We've sent a password reset link to <span className="font-semibold">{email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-8">
              The link will expire in 24 hours. If you don't see the email, check your spam folder.
            </p>

            <Button
              onClick={() => navigate(createPageUrl('LogIn'))}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base font-semibold"
            >
              Back to Log In
            </Button>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600 mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base font-semibold"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}