import React from 'react';
import { Lightbulb, BookOpen, CheckCircle, BarChart3, Trash2 } from 'lucide-react';

export default function SermonAnalysisResults({ analysis, onDelete }) {
  const handleDelete = () => {
    if (window.confirm('Delete this analysis?')) {
      onDelete?.(analysis.id);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#F8F6F1' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1F2937' }}>
              {analysis.sermon_title}
            </h2>
            {analysis.preacher_name && (
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                By {analysis.preacher_name}
              </p>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg transition-colors hover:bg-red-50"
            style={{ color: '#DC2626' }}
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6' }}>
            {analysis.main_theme}
          </div>
          <div className="px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
            {new Date(analysis.created_date).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            {analysis.summary}
          </p>
        </div>
      )}

      {/* Key Takeaways */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5" style={{ color: '#8B5CF6' }} />
          <h3 className="font-bold text-lg" style={{ color: '#1F2937' }}>
            Key Takeaways
          </h3>
        </div>
        <div className="space-y-3">
          {analysis.key_takeaways?.map((takeaway, idx) => (
            <div key={idx} className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                style={{ backgroundColor: '#8B5CF6' }}
              >
                {idx + 1}
              </div>
              <p style={{ color: '#374151' }} className="pt-0.5">
                {takeaway}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Biblical References */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5" style={{ color: '#8B5CF6' }} />
          <h3 className="font-bold text-lg" style={{ color: '#1F2937' }}>
            Biblical References
          </h3>
        </div>
        <div className="space-y-3">
          {analysis.biblical_references?.map((ref, idx) => (
            <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: '#F8F6F1' }}>
              <p className="font-semibold text-sm" style={{ color: '#8B5CF6' }}>
                {ref.reference}
              </p>
              {ref.book && (
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  {ref.book}
                </p>
              )}
              {ref.context && (
                <p className="text-sm mt-2" style={{ color: '#374151' }}>
                  {ref.context}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Personal Action Plan */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5" style={{ color: '#8B5CF6' }} />
          <h3 className="font-bold text-lg" style={{ color: '#1F2937' }}>
            Personal Action Plan
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {analysis.personal_action_plan?.map((plan, idx) => {
            const day = days.find(d => d === plan.day) || plan.day;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border-l-4 transition-all hover:shadow-md"
                style={{
                  borderColor: '#8B5CF6',
                  backgroundColor: '#F8F6F1'
                }}
              >
                <p className="font-bold text-sm" style={{ color: '#8B5CF6' }}>
                  {day}
                </p>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: '#374151' }}>
                  {plan.action}
                </p>
                {plan.scripture && (
                  <p className="text-xs mt-2 italic" style={{ color: '#6B7280' }}>
                    {plan.scripture}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}