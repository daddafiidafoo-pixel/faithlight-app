import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import OfflineDownloadsManager from '../components/offline/OfflineDownloadsManager';
import { HardDrive, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function OfflineDownloadsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (authenticated) {
          const me = await base44.auth.me();
          setUser(me);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-600">Please sign in to manage downloads.</p>
        <Button onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to={createPageUrl('OfflineLibrary')} className="flex-shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Offline Downloads</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">Manage your downloaded Bible text, audio, and courses</p>
          </div>
        </div>

        {/* Manager component */}
        <OfflineDownloadsManager userId={user.id} />
      </div>
    </div>
  );
}