import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { LogIn, Settings, HelpCircle } from 'lucide-react';

export default function ReaderModeMembershipCard({ me }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center max-w-sm mx-auto">
      <div className="text-xl font-bold text-gray-900 mb-2">Membership</div>
      <p className="text-sm text-gray-600 leading-relaxed">
        Subscriptions aren't purchased inside this app.{' '}
        {me?.id
          ? 'Your access will appear automatically if your account is active.'
          : 'Please sign in to access your membership benefits.'}
      </p>

      <div className="mt-5 flex flex-col gap-2">
        {!me?.id ? (
          <Button
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => base44.auth.redirectToLogin()}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
        ) : (
          <Button
            className="w-full gap-2"
            variant="outline"
            onClick={() => window.location.href = '/UserSettings'}
          >
            <Settings className="w-4 h-4" /> View Account Status
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Already subscribed? Sign in with the same email to restore access.
      </p>
    </div>
  );
}