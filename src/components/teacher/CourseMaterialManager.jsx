import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, FileText, Trash2, Plus, Upload } from 'lucide-react';

export default function CourseMaterialManager({ lessonId, courseId }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState('link');
  const [fileUrl, setFileUrl] = useState('');
  const [isRequired, setIsRequired] = useState(false);

  const { data: materials = [] } = useQuery({
    queryKey: ['lesson-materials', lessonId],
    queryFn: () =>
      base44.entities.CourseMaterial.filter({ lesson_id: lessonId }, '-order'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      base44.entities.CourseMaterial.create({
        lesson_id: lessonId,
        course_id: courseId,
        title,
        description,
        material_type: materialType,
        file_url: fileUrl,
        is_required: isRequired,
        order: materials.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-materials', lessonId]);
      setTitle('');
      setDescription('');
      setFileUrl('');
      setMaterialType('link');
      setIsRequired(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (materialId) => base44.entities.CourseMaterial.delete(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-materials', lessonId]);
    },
  });

  const handleFileUpload = async (file) => {
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(response.file_url);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && fileUrl.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Course Materials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Material Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Title
            </label>
            <Input
              placeholder="e.g., Lesson Notes, Readings"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Description
            </label>
            <Textarea
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Type
              </label>
              <Select value={materialType} onValueChange={setMaterialType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">External Link</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Required
              </label>
              <Button
                type="button"
                variant={isRequired ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setIsRequired(!isRequired)}
              >
                {isRequired ? 'Required' : 'Optional'}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              URL or Link
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com or paste file URL"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!title.trim() || !fileUrl.trim() || createMutation.isPending}
            className="w-full gap-2"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Material
              </>
            )}
          </Button>
        </form>

        {/* Materials List */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Materials</h3>
          {materials.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-6">No materials added yet</p>
          ) : (
            <div className="space-y-2">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-start justify-between gap-3 p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{material.title}</p>
                      {material.is_required && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">
                          Required
                        </span>
                      )}
                    </div>
                    {material.description && (
                      <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {material.material_type}
                      </span>
                      <a
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(material.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}