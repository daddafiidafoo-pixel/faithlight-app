import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, BookOpen, Loader2, AlertCircle, Download, ExternalLink } from 'lucide-react';

const MATERIAL_ICONS = {
  pdf: FileText,
  video: Video,
  link: ExternalLink,
  document: BookOpen,
  image: BookOpen,
};

export default function MaterialViewer({ material, onClose }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (material.material_type === 'link') {
      window.open(material.file_url, '_blank');
      return;
    }

    try {
      setIsLoading(true);
      const link = document.createElement('a');
      link.href = material.file_url;
      link.download = material.title || 'material';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = MATERIAL_ICONS[material.material_type] || FileText;
  const isRequiredBadge = material.is_required && (
    <Badge className="bg-red-100 text-red-800">Required</Badge>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5 text-blue-600" />
              <CardTitle>{material.title}</CardTitle>
              {isRequiredBadge}
            </div>
            {material.description && (
              <p className="text-sm text-gray-600">{material.description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Material Type Info */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Material Type:</p>
            <p className="font-semibold text-gray-900 capitalize">
              {material.material_type.replace('_', ' ')}
            </p>
            {material.file_size_bytes && (
              <p className="text-xs text-gray-500 mt-1">
                File size: {(material.file_size_bytes / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>

          {/* Preview/Embed based on type */}
          {material.material_type === 'video' && (
            <div className="bg-black rounded-lg overflow-hidden aspect-video">
              <iframe
                src={material.file_url}
                className="w-full h-full"
                allowFullScreen
                title={material.title}
              />
            </div>
          )}

          {material.material_type === 'image' && (
            <div className="rounded-lg overflow-hidden bg-gray-100">
              <img
                src={material.file_url}
                alt={material.title}
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
          )}

          {material.material_type === 'link' && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">External Resource:</p>
              <p className="break-all text-sm text-blue-600 mb-3">
                {material.file_url}
              </p>
              <Button
                onClick={() => window.open(material.file_url, '_blank')}
                variant="outline"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Link
              </Button>
            </div>
          )}

          {/* Download Button */}
          {material.material_type !== 'link' && (
            <Button
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Material
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}