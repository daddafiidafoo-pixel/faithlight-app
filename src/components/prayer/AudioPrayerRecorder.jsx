import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, Square, Play, Pause, Download, Trash2, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

export default function AudioPrayerRecorder({ userEmail, onSaved, prayerId }) {
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('prayer');

  const uploadMutation = useMutation({
    mutationFn: async (blob) => {
      try {
        const formData = new FormData();
        formData.append('file', blob, `prayer-${Date.now()}.webm`);
        
        const result = await base44.integrations.Core.UploadFile({
          file: blob,
        });
        
        return result.file_url;
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    },
  });

  const savePrayerMutation = useMutation({
    mutationFn: async (audioUrl) => {
      return base44.entities.PrayerAudioEntry.create({
        userEmail,
        audioUrl,
        duration,
        title: title || `Prayer - ${new Date().toLocaleDateString()}`,
        category,
        recordedAt: new Date().toISOString(),
        prayerRequestId: prayerId,
      });
    },
    onSuccess: () => {
      toast.success('Prayer saved!');
      resetRecorder();
      onSaved?.();
    },
  });

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setDuration(Math.round(audioChunksRef.current.length * 2)); // Rough estimate
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
    } catch (error) {
      toast.error('Microphone access denied');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !recordedBlob) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetRecorder = () => {
    setRecordedBlob(null);
    setDuration(0);
    setIsPlaying(false);
    setTitle('');
    setCategory('prayer');
    audioChunksRef.current = [];
  };

  const handleSave = async () => {
    if (!recordedBlob) {
      toast.error('No recording to save');
      return;
    }

    uploadMutation.mutate(recordedBlob);
  };

  useEffect(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onloadedmetadata = () => {
        setDuration(Math.round(audioRef.current.duration));
      };
    }
  }, [recordedBlob]);

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-200 p-6">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <Mic size={18} className="text-indigo-600" />
        Record Audio Prayer
      </h3>

      {!recordedBlob ? (
        <div className="space-y-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isRecording ? (
              <>
                <Square size={18} />
                Stop Recording
              </>
            ) : (
              <>
                <Mic size={18} />
                Start Recording
              </>
            )}
          </button>
          {isRecording && (
            <p className="text-center text-sm text-indigo-600 font-medium animate-pulse">
              🔴 Recording...
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Playback */}
          <div className="flex items-center gap-3 bg-white rounded-lg p-3">
            <button
              onClick={togglePlayback}
              className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors flex-shrink-0"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Duration: {duration}s</p>
            </div>
          </div>

          {/* Title & Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Prayer Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Prayer"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="prayer">Prayer</option>
              <option value="gratitude">Gratitude</option>
              <option value="praise">Praise</option>
              <option value="reflection">Reflection</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={resetRecorder}
              className="flex-1 flex items-center justify-center gap-2 border border-red-300 text-red-600 rounded-lg py-2 hover:bg-red-50 transition-colors font-medium"
            >
              <Trash2 size={16} />
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={uploadMutation.isPending || savePrayerMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
            >
              {uploadMutation.isPending || savePrayerMutation.isPending ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Save Prayer
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}