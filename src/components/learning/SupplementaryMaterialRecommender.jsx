import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, BookMarked, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function SupplementaryMaterialRecommender({ struggledTopic, isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState(null);

  const recommendMaterials = async () => {
    if (!struggledTopic) {
      toast.error('Please specify a topic');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an educational resource curator. The learner is struggling with: "${struggledTopic}"

Recommend 5-7 supplementary learning materials that would help them master this topic. Consider multiple formats.

Provide JSON:
{
  "materials": [
    {
      "title": "Resource Name",
      "type": "video|article|interactive|book|podcast|course",
      "difficulty": "beginner|intermediate|advanced",
      "description": "Brief description",
      "duration": "estimated time",
      "why_helpful": "why this helps with their struggle"
    }
  ],
  "learning_order": "recommended sequence to learn",
  "estimated_mastery_time": "total time to master topic"
}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            materials: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  type: { type: 'string' },
                  difficulty: { type: 'string' },
                  description: { type: 'string' },
                  duration: { type: 'string' },
                  why_helpful: { type: 'string' }
                }
              }
            },
            learning_order: { type: 'string' },
            estimated_mastery_time: { type: 'string' }
          }
        }
      });

      setMaterials(response);
      toast.success('Materials recommended!');
    } catch (error) {
      console.error('Error recommending materials:', error);
      toast.error('Failed to recommend materials');
    } finally {
      setLoading(false);
    }
  };

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  const getTypeColor = (type) => {
    const colors = {
      video: '#EF4444',
      article: '#3B82F6',
      interactive: '#8B5CF6',
      book: '#F59E0B',
      podcast: '#06B6D4',
      course: '#10B981'
    };
    return colors[type] || primaryColor;
  };

  return (
    <Card style={{ backgroundColor: cardColor, borderColor, border: `1px solid ${borderColor}` }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
          <BookMarked className="w-5 h-5" style={{ color: primaryColor }} />
          Supplementary Materials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p style={{ color: mutedColor }} className="text-sm mb-2">
            Topic: <strong style={{ color: textColor }}>{struggledTopic}</strong>
          </p>
          <Button
            onClick={recommendMaterials}
            disabled={loading}
            className="w-full gap-2"
            style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Finding Resources...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Recommend Materials
              </>
            )}
          </Button>
        </div>

        {materials && (
          <div className="space-y-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: bgColor, borderColor, border: `1px solid ${borderColor}` }}
            >
              <p style={{ color: mutedColor }} className="text-xs mb-1">LEARNING PATH</p>
              <p style={{ color: textColor }} className="text-sm">
                {materials.learning_order}
              </p>
            </div>

            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: bgColor, borderColor, border: `1px solid ${borderColor}` }}
            >
              <p style={{ color: mutedColor }} className="text-xs mb-1">ESTIMATED TIME</p>
              <p style={{ color: textColor }} className="font-semibold">
                {materials.estimated_mastery_time}
              </p>
            </div>

            <div className="space-y-2">
              <p style={{ color: textColor }} className="font-semibold text-sm">
                Recommended Resources
              </p>
              {materials.materials?.slice(0, 5).map((material, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: bgColor, borderColor, border: `1px solid ${borderColor}` }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p style={{ color: textColor }} className="font-semibold text-sm">
                        {material.title}
                      </p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: getTypeColor(material.type) }}
                        >
                          {material.type}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: material.difficulty === 'beginner' ? '#DBEAFE' : material.difficulty === 'intermediate' ? '#FEF3C7' : '#FCE7F3',
                            color: material.difficulty === 'beginner' ? '#1E40AF' : material.difficulty === 'intermediate' ? '#92400E' : '#9D174D'
                          }}
                        >
                          {material.difficulty}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: primaryColor }} />
                  </div>
                  <p style={{ color: mutedColor }} className="text-xs mb-1">
                    {material.description}
                  </p>
                  {material.duration && (
                    <p style={{ color: mutedColor }} className="text-xs mb-1">
                      ⏱️ {material.duration}
                    </p>
                  )}
                  <p style={{ color: primaryColor }} className="text-xs font-semibold">
                    💡 {material.why_helpful}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}