import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import DailyVerseCard from '@/components/home/DailyVerseCard';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function DailyVersePage() {
  const fetchNewVerse = async () => {
    try {
      const response = await base44.functions.invoke('fetchDailyVerse', {});
      alert('Daily verse updated!');
      window.location.reload();
    } catch (error) {
      console.error('Failed to fetch verse:', error);
      alert('Failed to fetch new verse');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Daily Verse</h1>
          <p className="text-gray-600">Meditate on God's word each day</p>
        </div>

        <DailyVerseCard />

        <div className="mt-6 flex justify-center">
          <Button onClick={fetchNewVerse} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Verse
          </Button>
        </div>
      </div>
    </div>
  );
}