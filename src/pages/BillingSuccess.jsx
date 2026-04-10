import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BillingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('No session ID');
        }

        // User should be authenticated at this point
        // The webhook will have updated their subscription status
        const user = await base44.auth.me();
        
        if (user?.subscription_status === 'active') {
          setSuccess(true);
        } else {
          // Wait a moment for webhook to process
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        console.error('Error verifying subscription:', error);
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifySubscription();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to FaithLight Premium</h1>
          <p className="text-gray-600">Your subscription is now active</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✓ Unlimited AI usage unlocked<br/>
            ✓ Premium devotionals available<br/>
            ✓ Advanced features enabled
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Home className="w-5 h-5" />
          Return to FaithLight
        </button>
      </div>
    </div>
  );
}