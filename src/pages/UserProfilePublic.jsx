import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PublicProfileView from '../components/profile/PublicProfileView';

export default function UserProfilePublicPage() {
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const targetUserId = searchParams.get('userId');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  if (!currentUser || !targetUserId) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <PublicProfileView userId={targetUserId} currentUserId={currentUser.id} />
      </div>
    </div>
  );
}