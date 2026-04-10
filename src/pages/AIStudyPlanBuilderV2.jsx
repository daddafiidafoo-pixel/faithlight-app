import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../components/I18nProvider';
import StudyPlanGeneratorForm from '../components/study/StudyPlanGeneratorForm';
import GeneratedPlanViewer from '../components/study/GeneratedPlanViewer';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

/**
 * AIStudyPlanBuilderV2
 * 
 * Main page for study plan generation + caching + starting instances.
 */
export default function AIStudyPlanBuilderV2() {
  const { t } = useI18n();
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [cacheId, setCacheId] = useState(null);
  const [planInstanceId, setPlanInstanceId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePlanGenerated = (planJson, cacheId_) => {
    setGeneratedPlan(planJson);
    setCacheId(cacheId_);
  };

  const handleStartPlan = (instanceId) => {
    setPlanInstanceId(instanceId);
    // Redirect to study plan detail
    setTimeout(() => {
      window.location.href = createPageUrl('StudyPlanDetail') + `?instance_id=${instanceId}`;
    }, 500);
  };

  const handleRegenerate = () => {
    setGeneratedPlan(null);
    setCacheId(null);
    setPlanInstanceId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="sm" className="gap-1 text-gray-600">
              <ChevronLeft className="w-4 h-4" />
              {t('common.back', 'Back')}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('study.aiBuilder', 'AI Study Plan Builder')}
          </h1>
          <p className="text-gray-600 text-sm">
            {t('study.customizeAndGenerate', 'Customize your study preferences, and let AI generate a personalized Bible study plan.')}
          </p>
        </div>

        {/* Main content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Form (left) */}
          <div>
            <StudyPlanGeneratorForm
              onPlanGenerated={handlePlanGenerated}
              loading={loading}
            />
          </div>

          {/* Plan viewer (right) or empty state */}
          <div>
            {generatedPlan ? (
              <>
                <GeneratedPlanViewer
                  plan={generatedPlan}
                  cacheId={cacheId}
                  onStartPlan={handleStartPlan}
                  loading={loading}
                />
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="w-full mt-4"
                >
                  {t('study.generateAnother', 'Generate Another Plan')}
                </Button>
              </>
            ) : (
              <div className="p-8 bg-white border border-gray-200 rounded-lg text-center text-gray-500">
                <p className="text-sm">{t('study.fillFormAndGenerate', 'Fill out the form to generate a personalized plan.')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}