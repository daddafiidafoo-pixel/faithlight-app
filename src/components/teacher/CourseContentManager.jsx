import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Trash2, FileText, Video, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

const MATERIAL_ICONS = {
  pdf: FileText,
  video: Video,
  document: FileText,
  image: FileText,
  link: LinkIcon,
};

export default function CourseContentManager({ courseId, lessonId }) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [materialType, setMaterialType] = useState('pdf');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [error, setError] = useState('');

  // Fetch materials
  const { data: materials, isLoading } = useQuery({
    queryKey: ['course-materials', lessonId],
    queryFn: async () => {
      const result = await base44.entities.CourseMaterial.filter(
        { lesson_id: lessonId, course_id: courseId },
        'order',
        100
      );
      return result;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (materialId) =>
      base44.entities.CourseMaterial.delete(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-materials', lessonId]);
    },
  });

  // Upload material handler
  const handleUploadMaterial = async (file) => {
    try {
      setError('');
      setIsUploading(true);

      let uploadedUrl = fileUrl;

      // Upload file if it's a file type
      if (file && materialType !== 'link') {
        const uploadResponse = await base44.integrations.Core.UploadFile({
          file,
        });
        if (!uploadResponse.data?.file_url) {
          throw new Error('File upload failed');
        }
        uploadedUrl = uploadResponse.data.file_url;
      }

      if (!uploadedUrl) {
        setError('Please provide a file or URL');
        return;
      }

      // Create material record
      const newMaterial = {
        lesson_id: lessonId,
        course_id: courseId,
        title: title || `Material ${(materials?.length || 0) + 1}`,
        description: description || '',
        material_type: materialType,
        file_url: uploadedUrl,
        file_size_bytes: file?.size || 0,
        is_required: false,
        order: (materials?.length || 0) + 1,
      };

      await base44.entities.CourseMaterial.create(newMaterial);
      queryClient.invalidateQueries(['course-materials', lessonId]);

      // Reset form
      setTitle('');
      setDescription('');
      setFileUrl('');
      setMaterialType('pdf');
    } catch (err) {
      setError(err.message || 'Failed to upload material');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Material</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Material title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="rounded-md border border-input px-3 py-2"
            >
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="image">Image</option>
              <option value="link">External Link</option>
            </select>
          </div>

          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {materialType === 'link' ? (
            <Input
              placeholder="Paste URL"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadMaterial(file);
                    }
                  }}
                />
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Upload className="w-5 h-5" />
                  <span>Click to upload or drag and drop</span>
                </div>
              </label>
            </div>
          )}

          {materialType === 'link' && (
            <Button
              onClick={() => handleUploadMaterial(null)}
              disabled={isUploading || !fileUrl}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Link'
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Materials List */}
      {materials && materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Course Materials ({materials.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {materials.map((material) => {
                const Icon = MATERIAL_ICONS[material.material_type] || FileText;
                return (
                  <div
                    key={material.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Icon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {material.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {material.material_type}
                        {material.file_size_bytes && (
                          <span>
                            {' '}
                            • {(material.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                          </span>
                        )}
                      </p>
                      {material.is_required && (
                        <Badge className="bg-red-100 text-red-800 mt-1 text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(material.id)}
                      disabled={deleteMutation.isPending}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 hover:text-red-700" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}