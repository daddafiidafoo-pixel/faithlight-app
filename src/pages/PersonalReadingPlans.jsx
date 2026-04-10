import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Sparkles, ArrowLeft } from 'lucide-react';
import ReadingPlanCard from '../components/readingplan/ReadingPlanCard';
import GeneratePlanModal from '../components/readingplan/GeneratePlanModal';
import ReadingPlanDetail from '../components/readingplan/ReadingPlanDetail';

export default function PersonalReadingPlansPage() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) { setLoading(false); return; }
        const u = await base44.auth.me();
        setUser(u);
        const data = await base44.entities.PersonalReadingPlan.filter({ user_id: u.id }, '-created_date');
        setPlans(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const handleGenerate = async ({ theme, days }) => {
    setGenerating(true);
    setShowGenerate(false);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a ${days}-day Bible reading plan focused on the theme: "${theme}".
Return a JSON object with:
- title: string (catchy plan name)
- description: string (2-sentence overview)
- days: array of ${days} objects, each with:
  - day: number (1 to ${days})
  - reference: string (e.g. "Philippians 4:6-7")
  - title: string (short day title)
  - reflection: string (1-2 sentence reflection prompt)

Make the plan practical, scripture-rich, and spiritually encouraging.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  reference: { type: "string" },
                  title: { type: "string" },
                  reflection: { type: "string" }
                }
              }
            }
          }
        }
      });

      const plan = await base44.entities.PersonalReadingPlan.create({
        user_id: user.id,
        title: result.title,
        theme,
        description: result.description,
        total_days: days,
        completed_days: 0,
        days: result.days.map(d => ({ ...d, completed: false })),
        status: 'active',
        started_date: new Date().toISOString(),
      });
      setPlans(prev => [plan, ...prev]);
      setActivePlan(plan);
    } catch (e) {
      console.error(e);
      alert('Failed to generate plan. Please try again.');
    }
    setGenerating(false);
  };

  const handleUpdatePlan = (updated) => {
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
    setActivePlan(updated);
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center p-8">
          <BookOpen className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Reading Plans</h2>
          <p className="text-gray-500 mb-4">Sign in to create personalized reading plans</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-amber-600 hover:bg-amber-700">Sign In</Button>
        </div>
      </div>
    );
  }

  if (activePlan) {
    return (
      <ReadingPlanDetail
        plan={activePlan}
        onBack={() => setActivePlan(null)}
        onUpdate={handleUpdatePlan}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-600" /> Reading Plans
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">AI-personalized daily Scripture journeys</p>
          </div>
          <Button
            onClick={() => setShowGenerate(true)}
            disabled={generating}
            className="bg-amber-600 hover:bg-amber-700 gap-1.5"
          >
            {generating ? (
              <><Sparkles className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> New Plan</>
            )}
          </Button>
        </div>

        {generating && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5 text-center">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-bounce" />
            <p className="font-semibold text-amber-800">Generating your personalized reading plan…</p>
            <p className="text-sm text-amber-600 mt-1">This takes a few seconds</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-14 h-14 mx-auto mb-3 text-amber-200" />
            <p className="font-semibold text-gray-600 text-lg">No plans yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Tell us a theme and we'll build your plan</p>
            <Button onClick={() => setShowGenerate(true)} className="bg-amber-600 hover:bg-amber-700 gap-2">
              <Sparkles className="w-4 h-4" /> Create My First Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map(plan => (
              <ReadingPlanCard key={plan.id} plan={plan} onClick={() => setActivePlan(plan)} />
            ))}
          </div>
        )}
      </div>

      {showGenerate && (
        <GeneratePlanModal onGenerate={handleGenerate} onClose={() => setShowGenerate(false)} />
      )}
    </div>
  );
}