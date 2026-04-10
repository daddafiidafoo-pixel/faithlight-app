import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdvancedSearch from '../components/search/AdvancedSearch';

export default function GlobalSearch() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('Not authenticated');
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Search FaithLight
          </h1>
          <p className="text-gray-600">
            Find sermons, discussions, groups, and more across the platform
          </p>
        </div>

        <AdvancedSearch user={user} />
      </div>
    </div>
  );
}