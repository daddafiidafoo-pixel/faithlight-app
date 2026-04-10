import React from 'react';
import AIStudyPlanBuilder from '@/components/study/AIStudyPlanBuilder';
import { useI18n } from '@/components/I18nProvider';

export default function AIStudyPlanGeneratorPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">
            AI Study Plan Generator
          </h1>
          <p className="text-lg text-green-700">
            Create personalized 7-day or 30-day Bible study plans powered by AI
          </p>
        </div>

        <AIStudyPlanBuilder />
      </div>
    </div>
  );
}