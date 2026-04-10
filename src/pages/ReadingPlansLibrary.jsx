import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import ReadingPlanGenerator from '@/components/reading/ReadingPlanGenerator';
import ReadingPlanCard from '@/components/reading/ReadingPlanCard';

export default function ReadingPlansLibrary() {
  const [userPlans, setUserPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUserPlans();
  }, []);

  const loadUserPlans = async () => {
    try {
      setLoading(true);
      const plans = await base44.entities.ReadingPlan.filter({
        user_email: 'anonymous', // Public app
        is_active: true,
      });
      setUserPlans(plans);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanCreated = (newPlan) => {
    setUserPlans([newPlan, ...userPlans]);
    queryClient.invalidateQueries({ queryKey: ['readingPlans'] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Reading Plans
          </h1>
          <p className="text-lg text-gray-600">
            Choose a theme and start a personalized 7-day Bible reading journey
          </p>
        </div>

        {/* Generator */}
        <div className="mb-12">
          <ReadingPlanGenerator onPlanCreated={handlePlanCreated} />
        </div>

        {/* My Plans */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            My Reading Plans {userPlans.length > 0 && `(${userPlans.length})`}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={24} className="text-indigo-600 animate-spin" />
            </div>
          ) : userPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userPlans.map(plan => (
                <ReadingPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <p className="text-gray-600 mb-4">
                Create your first reading plan to get started!
              </p>
              <ArrowRight className="mx-auto text-gray-400 mb-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}