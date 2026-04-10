import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Mic, Send, Trash2, Play, Pause } from 'lucide-react';
import { useI18n } from '../I18nProvider';
import { toast } from 'sonner';

const MAX_DURATION = 60;

export default function VoiceMessageRecorder({ onSend, isPremium, isOnline }) {
  const { lang } = useI18n();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const handleMouseDown = async () => {
    if (!isPremium) {
      toast.error(lang === 'om' ? 'Tajaajila Premium barbaada' : 'Premium feature required');
      return;
    }
    if (!isOnline) {
      toast.error(lang === 'om' ? 'Internettii barbaada' : 'Internet connection required');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setDuration(0);

      // Timer
      timerIntervalRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= MAX_DURATION) {
            mediaRecorder.stop();
            setIsRecording(false);
            clearInterval(timerIntervalRef.current);
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      toast.error(lang === 'om' ? 'Mikiroofoni dogoggora' : 'Microphone error');
      console.error(error);
    }
  };

  const handleMouseUp = () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleDeleteRecording = () => {
    setAudioBlob(null);
    setDuration(0);
    setIsPlaying(false);
  };

  const handlePlayPreview = () => {
    if (!audioPlayerRef.current) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSendVoice = async () => {
    if (!audioBlob || !duration) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.webm');
      formData.append('duration', duration.toString());
      formData.append('mimeType', 'audio/webm');

      const result = await base44.functions.invoke('uploadVoiceMessage', formData);

      if (result.data?.audio_url) {
        onSend({
          message_type: 'voice',
          audio_url: result.data.audio_url,
          audio_duration_sec: result.data.duration_sec,
          audio_size_bytes: result.data.size_bytes,
          mime_type: result.data.mime_type,
        });

        setAudioBlob(null);
        setDuration(0);
        setIsPlaying(false);
        toast.success(lang === 'om' ? 'Ergilame' : 'Voice message sent');
      } else {
        toast.error(result.data?.error || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      toast.error(lang === 'om' ? 'Erguun dogoggora' : 'Send failed. Retry.');
    } finally {
      setIsUploading(false);
    }
  };

  // Recording state - show preview
  if (audioBlob) {
    return (
      <div className="space-y-3">
        <audio
          ref={audioPlayerRef}
          src={URL.createObjectURL(audioBlob)}
          onEnded={() => setIsPlaying(false)}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {lang === 'om' ? 'Dursee dhaggeeffadhu' : 'Preview'}
            </span>
            <span className="text-xs text-gray-600">{duration}s</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPreview}
              disabled={isUploading}
              className="flex-1"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  {lang === 'om' ? 'Dhaabi' : 'Pause'}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {lang === 'om' ? 'Dhaggeeffadhu' : 'Play'}
                </>
              )}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteRecording}
              disabled={isUploading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendVoice}
            disabled={isUploading}
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4" />
            {isUploading
              ? lang === 'om'
                ? 'Erguun...'
                : 'Sending...'
              : lang === 'om'
              ? 'Ergi'
              : 'Send'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        variant="ghost"
        size="icon"
        title={
          !isPremium
            ? lang === 'om'
              ? 'Tajaajila Premium'
              : 'Premium only'
            : lang === 'om'
            ? 'Qabiitii sagalee waraabi'
            : 'Hold to record'
        }
        className={isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200' : ''}
      >
        <Mic className="w-5 h-5" />
      </Button>

      {isRecording && (
        <div className="absolute bottom-16 left-4 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">
          {lang === 'om' ? 'Waraabaa jira' : 'Recording'} {duration}s
        </div>
      )}
    </div>
  );
}