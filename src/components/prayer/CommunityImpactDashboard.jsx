import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { t } from '@/lib/i18n';

export default function CommunityImpactDashboard({ uiLang }) {
  const [stats, setStats] = useState({
    totalPrayers: 0,
    answeredPrayers: 0,
    topCategories: [],
    activePrayers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const posts = await base44.entities.CommunityPrayerPost?.list?.('-created_date', 100) || [];
      
      if (!posts.length) {
        setStats({
          totalPrayers: 0,
          answeredPrayers: 0,
          topCategories: [],
          activePrayers: 0,
        });
        setLoading(false);
        return;
      }

      // Calculate stats
      let totalPrayers = 0;
      let answeredCount = 0;
      const categoryMap = {};
      let activePrayersCount = 0;

      posts.forEach(post => {
        totalPrayers += post.prayedCount || 0;
        if (post.status === 'answered') answeredCount++;
        if (post.status === 'active') activePrayersCount++;

        const cat = post.category || 'other';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });

      const topCategories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, count]) => ({ category: cat, count }));

      setStats({
        totalPrayers,
        answeredPrayers: answeredCount,
        topCategories,
        activePrayers: activePrayersCount,
      });
    } catch (err) {
      console.error('Failed to load impact stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const categoryLabels = {
    health: 'Health',
    family: 'Family',
    faith: 'Faith',
    work: 'Work',
    relationships: 'Relationships',
    gratitude: 'Gratitude',
    guidance: 'Guidance',
    other: 'Other',
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-indigo-600" />
        {t(uiLang, 'communityImpact.title') || 'Community Impact'}
      </h2>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-2xl h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Total Prayers */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide">
                  {t(uiLang, 'communityImpact.totalPrayers') || 'Total Prayers'}
                </p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.totalPrayers}</p>
              </div>
              <Heart size={28} className="text-indigo-400" />
            </div>
          </div>

          {/* Answered Prayers */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
                  {t(uiLang, 'communityImpact.answered') || 'Answered'}
                </p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.answeredPrayers}</p>
              </div>
              <CheckCircle size={28} className="text-green-400" />
            </div>
          </div>

          {/* Active Requests */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">
                  {t(uiLang, 'communityImpact.activeRequests') || 'Active Requests'}
                </p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{stats.activePrayers}</p>
              </div>
              <Users size={28} className="text-orange-400" />
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                  {t(uiLang, 'communityImpact.successRate') || 'Answer Rate'}
                </p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {stats.activePrayers + stats.answeredPrayers === 0
                    ? '0%'
                    : `${Math.round((stats.answeredPrayers / (stats.activePrayers + stats.answeredPrayers)) * 100)}%`}
                </p>
              </div>
              <TrendingUp size={28} className="text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Top Categories */}
      {stats.topCategories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
            {t(uiLang, 'communityImpact.topCategories') || 'Top Prayer Categories'}
          </h3>
          <div className="space-y-2">
            {stats.topCategories.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-sm text-gray-700 font-medium">
                    {categoryLabels[item.category] || item.category}
                  </span>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}