import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import AnonymousPrayerWall from '@/components/prayer/AnonymousPrayerWall';
import { base44 } from '@/api/base44Client';

export default function AnonymousPrayerWallPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 pb-20">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Anonymous Prayer Wall</h1>
        <p className="text-gray-500 text-base">
          Share your heart anonymously. Others will commit to praying for you.
        </p>
      </div>
      <AnonymousPrayerWall user={user} />
    </div>
  );
}