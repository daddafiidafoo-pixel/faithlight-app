import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Heart, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function LaunchMetricsBoard() {
  const [selectedPhase, setSelectedPhase] = useState('public');
  const [selectedCountry, setSelectedCountry] = useState('global');

  const { data: metrics } = useQuery({
    queryKey: ['launchMetrics', selectedPhase, selectedCountry],
    queryFn: async () => {
      const query = { launch_phase: selectedPhase };
      if (selectedCountry !== 'global') {
        query.country_code = selectedCountry;
      }
      const result = await base44.entities.LaunchMetrics.filter(query, '-metric_date', 1);
      return result?.[0] || null;
    }
  });

  const metricCard = (title, value, icon, color, unit = '%') => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>
              {typeof value === 'number' ? value.toFixed(1) : 'N/A'}{unit}
            </p>
          </div>
          <div className={`${color.replace('text-', 'bg-').replace('-700', '-100')} p-3 rounded-full`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Launch Metrics Dashboard</h1>
        
        <div className="flex gap-4 mb-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Phase</label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="beta">Beta (Month 1)</option>
              <option value="public">Public (Month 2)</option>
              <option value="optimization">Optimization (Month 3)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Region</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="global">Global</option>
              <option value="ET">Ethiopia</option>
              <option value="KE">Kenya</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
            </select>
          </div>
        </div>
      </div>

      {metrics ? (
        <>
          {/* Acquisition Metrics */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Acquisition</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metricCard(
                'Total Signups',
                metrics.total_signups,
                <Users className="w-6 h-6 text-blue-600" />,
                'text-blue-600',
                ''
              )}
              {metricCard(
                'Trial Start Rate',
                metrics.trial_start_rate,
                <TrendingUp className="w-6 h-6 text-green-600" />,
                'text-green-600'
              )}
            </div>
          </div>

          {/* Activation Metrics */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 Activation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metricCard(
                'Level 1 Completion',
                metrics.level_1_completion_rate,
                <Target className="w-6 h-6 text-orange-600" />,
                'text-orange-600'
              )}
              {metricCard(
                'Day 7 Retention',
                metrics.day_7_retention,
                <TrendingUp className="w-6 h-6 text-purple-600" />,
                'text-purple-600'
              )}
            </div>
          </div>

          {/* Engagement Metrics */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">💬 Engagement</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metricCard(
                'Daily Active Users',
                metrics.daily_active_users,
                <Users className="w-6 h-6 text-indigo-600" />,
                'text-indigo-600',
                ''
              )}
              {metricCard(
                'Avg Session (min)',
                metrics.average_session_duration_minutes,
                <TrendingUp className="w-6 h-6 text-cyan-600" />,
                'text-cyan-600',
                ''
              )}
              {metricCard(
                'Day 30 Retention',
                metrics.day_30_retention,
                <Heart className="w-6 h-6 text-red-600" />,
                'text-red-600'
              )}
            </div>
          </div>

          {/* Conversion Metrics */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">💳 Conversion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metricCard(
                'Trial → Paid',
                metrics.trial_to_paid_conversion,
                <TrendingUp className="w-6 h-6 text-green-600" />,
                'text-green-600'
              )}
              {metricCard(
                'Referral Rate',
                metrics.referral_rate,
                <Users className="w-6 h-6 text-blue-600" />,
                'text-blue-600'
              )}
            </div>
          </div>

          {/* Mission Metrics */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">🕊 Mission Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metricCard(
                'Scholarship Applications',
                metrics.scholarship_application_rate,
                <Heart className="w-6 h-6 text-red-600" />,
                'text-red-600'
              )}
              {metricCard(
                'Sponsorship Rate',
                metrics.sponsorship_participation_rate,
                <Heart className="w-6 h-6 text-pink-600" />,
                'text-pink-600'
              )}
            </div>
          </div>

          {/* Health Metrics */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">💪 Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metricCard(
                'Churn Rate',
                metrics.churn_rate,
                <TrendingUp className="w-6 h-6 text-red-600" />,
                'text-red-600'
              )}
              {metricCard(
                'NPS Score',
                metrics.nps_score,
                <Heart className="w-6 h-6 text-yellow-600" />,
                'text-yellow-600',
                ''
              )}
            </div>
          </div>

          {/* Insights */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">📈 Key Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Top Feature:</strong> {metrics.top_feature_used || 'N/A'}
              </p>
              <p>
                <strong>Dropout Point:</strong> {metrics.top_dropout_point || 'N/A'}
              </p>
              <p>
                <strong>Phase Goal Status:</strong>
                {selectedPhase === 'beta' && ` Target: 1,000 users → Current: ${metrics.total_signups}`}
                {selectedPhase === 'public' && ` Target: 10,000 users → Current: ${metrics.total_signups}`}
                {selectedPhase === 'optimization' && ` Target: Optimize → Focus on retention & conversion`}
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-gray-600">
            No metrics data yet for this phase/region
          </CardContent>
        </Card>
      )}
    </div>
  );
}