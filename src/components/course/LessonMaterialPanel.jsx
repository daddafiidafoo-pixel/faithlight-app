import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import MaterialViewer from './MaterialViewer';

const MATERIAL_ICONS = {
  pdf: FileText,
  video: Video,
  document: BookOpen,
  image: BookOpen,
  link: BookOpen,
};

export default function LessonMaterialPanel({ lessonId, courseId }) {
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Fetch materials for this lesson
  const { data: materials, isLoading, error } = useQuery({
    queryKey: ['lesson-materials', lessonId],
    queryFn: async () => {
      const result = await base44.entities.CourseMaterial.filter(
        { lesson_id: lessonId, course_id: courseId },
        'order',
        100
      );
      return result;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-gray-600">Loading materials...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-800">Failed to load materials</span>
        </CardContent>
      </Card>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600">No materials available for this lesson</p>
        </CardContent>
      </Card>
    );
  }

  // Separate required and optional materials
  const requiredMaterials = materials.filter((m) => m.is_required);
  const optionalMaterials = materials.filter((m) => !m.is_required);

  const MaterialCard = ({ material }) => {
    const Icon = MATERIAL_ICONS[material.material_type] || FileText;

    return (
      <button
        onClick={() => setSelectedMaterial(material)}
        className="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
      >
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 group-hover:text-blue-700" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 truncate text-sm">
                {material.title}
              </h4>
              {material.is_required && (
                <Badge className="bg-red-100 text-red-800 flex-shrink-0">
                  Required
                </Badge>
              )}
            </div>
            {material.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {material.description}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1 capitalize">
              {material.material_type}
            </p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Required Materials */}
        {requiredMaterials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Required Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {requiredMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Optional Materials */}
        {optionalMaterials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {optionalMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Material Viewer Modal */}
      {selectedMaterial && (
        <MaterialViewer
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
    </>
  );
}