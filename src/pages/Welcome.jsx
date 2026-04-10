import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function Welcome() {
  const navigate = useNavigate();

  const handleSignUp = () => navigate(createPageUrl('SignUp'));
  const handleLogIn = () => navigate(createPageUrl('LogIn'));
  const handleGuest = () => navigate(createPageUrl('Home'));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-8">
          <div className="text-7xl mb-4">📖</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to FaithLight</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Read Scripture daily, pray with community, discover churches, and grow spiritually with AI-powered tools.
          </p>
        </div>

        {/* Value Propositions */}
        <div className="grid grid-cols-1 gap-4 mt-12 max-w-md w-full text-left">
          <div className="flex gap-4 items-start">
            <span className="text-2xl">📖</span>
            <div>
              <h3 className="font-semibold text-gray-900">Daily Scripture</h3>
              <p className="text-sm text-gray-600">New verse every day</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="text-2xl">🙏</span>
            <div>
              <h3 className="font-semibold text-gray-900">Prayer Community</h3>
              <p className="text-sm text-gray-600">Support each other in prayer</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="text-2xl">✨</span>
            <div>
              <h3 className="font-semibold text-gray-900">AI Bible Study</h3>
              <p className="text-sm text-gray-600">Smart learning tools</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="text-2xl">⛪</span>
            <div>
              <h3 className="font-semibold text-gray-900">Church Finder</h3>
              <p className="text-sm text-gray-600">Discover local churches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-8 space-y-3 max-w-md w-full mx-auto">
        <Button
          onClick={handleSignUp}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base font-semibold"
        >
          Create Account
        </Button>

        <Button
          onClick={handleLogIn}
          variant="outline"
          className="w-full h-12 text-base font-semibold border-purple-600 text-purple-600 hover:bg-purple-50"
        >
          Log In
        </Button>

        <Button
          onClick={handleGuest}
          variant="ghost"
          className="w-full h-12 text-base font-semibold text-gray-600 hover:bg-gray-100"
        >
          Continue as Guest
        </Button>

        <p className="text-xs text-center text-gray-500 mt-6">
          By signing up, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}