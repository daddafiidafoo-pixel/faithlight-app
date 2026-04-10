import React, { useState, useRef } from 'react';
import { Mic, Square, Play, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function VoicePrayerRecorder({ 
  onRecorded, 
  currentEmail, 
  currentName,
  category = 'other',
  isAnonymous = false,
  uiLang = 'en' 
}) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      toast.error('Unable to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleUpload = async () => {
    if (!audioBlob || !currentEmail) {
      toast.error('Unable to upload prayer');
      return;
    }

    setUploading(true);
    try {
      const file = new File([audioBlob], 'prayer.webm', { type: 'audio/webm' });
      const uploadRes = await base44.integrations.Core.UploadFile({ file });

      if (uploadRes?.file_url) {
        const post = await base44.entities.CommunityPrayerPost.create({
          authorEmail: currentEmail,
          authorName: currentName || 'Anonymous',
          title: `🎙️ Voice Prayer`,
          body: '',
          audioUrl: uploadRes.file_url,
          category: category.toLowerCase(),
          isAnonymous,
          prayedByEmails: [],
          prayedCount: 0,
          status: 'active',
          hasAttachedVerse: false,
        });

        toast.success('Voice prayer posted!');
        setAudioBlob(null);
        onRecorded(post);
      }
    } catch (err) {
      toast.error('Failed to post voice prayer');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-2xl p-4 space-y-3">
      {/* Recording indicator */}
      {recording && (
        <div className="flex items-center gap-2 text-rose-600 animate-pulse">
          <div className="w-2 h-2 bg-rose-600 rounded-full" />
          <span className="text-xs font-semibold">Recording prayer...</span>
        </div>
      )}

      {/* Audio preview */}
      {audioBlob && (
        <div className="space-y-2">
          <audio
            ref={audioRef}
            src={URL.createObjectURL(audioBlob)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <div className="flex items-center gap-2 bg-white rounded-xl p-2.5 border border-rose-100">
            <button
              onClick={playAudio}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg transition-colors"
              aria-label="Play recording"
            >
              <Play size={16} fill="currentColor" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700">Prayer recorded</p>
              <p className="text-xs text-gray-500">{(audioBlob.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => setAudioBlob(null)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600"
              aria-label="Remove recording"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!recording && !audioBlob && (
          <button
            onClick={startRecording}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            <Mic size={16} />
            Record Prayer
          </button>
        )}

        {recording && (
          <button
            onClick={stopRecording}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            <Square size={16} />
            Stop Recording
          </button>
        )}

        {audioBlob && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            <Send size={16} />
            {uploading ? 'Posting...' : 'Post Prayer'}
          </button>
        )}

        {audioBlob && (
          <button
            onClick={() => setAudioBlob(null)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-white hover:bg-gray-50 text-gray-600 rounded-xl border border-gray-200 transition-colors"
            aria-label="Discard recording"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}