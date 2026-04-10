import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Sparkles } from 'lucide-react';

export default function DailyDevotionalCard() {
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevotional = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const result = await base44.entities.DailyDevotional.filter({
          date: today
        });
        if (result.length > 0) {
          setDevotional(result[0]);
        }
      } catch (error) {
        console.error('Failed to fetch devotional:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevotional();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Daily Devotional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!devotional) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Daily Devotional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
          <div>
            <p className="font-semibold text-purple-900">{devotional.verse_reference}</p>
            <p className="text-sm italic text-purple-800 mt-1">{devotional.verse_text}</p>
          </div>
        </div>

        {devotional.theme && (
          <div className="bg-white bg-opacity-50 px-3 py-2 rounded">
            <p className="text-xs font-semibold text-purple-600 uppercase">Today's Theme</p>
            <p className="text-sm text-purple-900">{devotional.theme}</p>
          </div>
        )}

        <div className="bg-white bg-opacity-70 px-3 py-3 rounded">
          <p className="text-sm text-purple-900 leading-relaxed">{devotional.reflection}</p>
        </div>
      </CardContent>
    </Card>
  );
}