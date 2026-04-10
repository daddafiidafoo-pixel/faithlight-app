import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RecordingUploader({ event, onRecordingUploaded }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadRecordingMutation = useMutation({
    mutationFn: async (recordingData) => {
      // Upload file first
      setIsUploading(true);
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      // Create recording record
      return base44.entities.EventRecording.create({
        event_id: event.id,
        recording_url: uploadResult.file_url,
        duration_minutes: 0, // TODO: calculate from file
        file_size_mb: file.size / (1024 * 1024),
        is_public: true,
      });
    },
    onSuccess: async (recording) => {
      // Update LiveRoom with recording URL
      await base44.entities.LiveRoom.update(event.id, {
        audio_url: recording.recording_url,
      });

      toast.success('Recording uploaded successfully!');
      queryClient.invalidateQueries(['live-event']);
      queryClient.invalidateQueries(['event-recordings']);
      onRecordingUploaded?.();
      setFile(null);
      setIsUploading(false);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload recording');
      setIsUploading(false);
    },
  });

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Recording
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept="audio/*,video/*"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={isUploading}
          />
          {file && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        <Button
          onClick={() => uploadRecordingMutation.mutate()}
          disabled={!file || isUploading || uploadRecordingMutation.isPending}
          className="w-full gap-2"
        >
          {isUploading || uploadRecordingMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Recording
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500">
          Supported formats: MP3, MP4, M4A, WAV. Max size: 500MB
        </p>
      </CardContent>
    </Card>
  );
}