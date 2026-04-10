import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileAudio, Loader2, FileText, Upload, Check, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SermonTranscription({ sermon, onTranscriptionComplete }) {
  const [transcribing, setTranscribing] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [transcription, setTranscription] = useState(sermon?.content || '');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file');
      return;
    }

    setAudioFile(file);
    setUploading(true);

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      setAudioUrl(response.file_url);
      toast.success('Audio uploaded successfully!');
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Failed to upload audio');
    } finally {
      setUploading(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioUrl && !sermon?.audio_url) {
      toast.error('Please upload an audio file first');
      return;
    }

    setTranscribing(true);
    try {
      // Use AI to transcribe (this is a placeholder - you'd use a real transcription service)
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `This is a placeholder for audio transcription. In production, you would use a service like Whisper API or similar.
        
For now, generate a sample sermon transcription based on the title and topic:
Title: ${sermon.title}
Topic: ${sermon.topic || 'N/A'}
Passage: ${sermon.passage_references || 'N/A'}

Create a realistic 3-paragraph sermon transcript that includes:
- Opening greeting and introduction
- Main teaching points
- Closing prayer or call to action`,
        add_context_from_internet: false
      });

      setTranscription(response);
      
      // Save to database
      if (sermon.id) {
        await base44.entities.SharedSermon.update(sermon.id, {
          content: response,
          audio_url: audioUrl || sermon.audio_url
        });
        toast.success('Transcription completed and saved!');
        if (onTranscriptionComplete) onTranscriptionComplete(response);
      }
    } catch (error) {
      console.error('Error transcribing:', error);
      toast.error('Failed to transcribe audio');
    } finally {
      setTranscribing(false);
    }
  };

  const downloadTranscription = () => {
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sermon.title.replace(/[^a-z0-9]/gi, '_')}_transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Transcript downloaded!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="w-5 h-5 text-indigo-600" />
          Audio Transcription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!transcription || transcription.length < 100 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload an audio recording of your sermon to automatically generate a text transcription.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  {uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </>
                  ) : audioFile ? (
                    <>
                      <Check className="w-8 h-8 text-green-600" />
                      <span className="text-sm font-medium">{audioFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click to upload audio file
                      </span>
                      <span className="text-xs text-gray-500">
                        MP3, WAV, M4A up to 100MB
                      </span>
                    </>
                  )}
                </div>
              </label>
            </div>

            {audioUrl && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Audio uploaded:</p>
                <audio controls className="w-full">
                  <source src={audioUrl} />
                </audio>
              </div>
            )}

            <Button 
              onClick={transcribeAudio} 
              disabled={transcribing || (!audioUrl && !sermon?.audio_url)}
              className="w-full"
            >
              {transcribing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transcribing... (This may take a few minutes)
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Start Transcription
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Note: In production, this would use a real transcription service like Whisper API
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{transcription}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadTranscription} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => {
                setTranscription('');
                setAudioFile(null);
                setAudioUrl('');
              }} variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload New Audio
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}