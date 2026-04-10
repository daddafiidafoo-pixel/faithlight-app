import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Loader2, Play, Pause, Download, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const VOICES = [
  { id: 'en-US-1', name: 'Standard (US)', lang: 'en-US' },
  { id: 'en-US-2', name: 'Deep (US)', lang: 'en-US' },
  { id: 'en-GB-1', name: 'British', lang: 'en-GB' },
  { id: 'en-AU-1', name: 'Australian', lang: 'en-AU' },
];

export default function SermonTextToSpeech({ outline }) {
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const sermonText = outline
    ? `${outline.title}. ${outline.big_idea}. ${(outline.outline_sections || [])
        .map(s => `${s.title}. ${s.content}`)
        .join(' ')} ${outline.application} ${outline.closing_prayer}`
    : '';

  const handleGenerateAudio = async () => {
    if (!sermonText.trim()) {
      toast.error('No sermon content to convert');
      return;
    }

    setGenerating(true);
    try {
      // Use Web Speech API for client-side TTS (free alternative)
      const utterance = new SpeechSynthesisUtterance(sermonText);
      const voiceObj = VOICES.find(v => v.id === selectedVoice);
      utterance.lang = voiceObj.lang;
      utterance.rate = 0.95;
      utterance.pitch = 1;

      // For production, use a backend service like Google Cloud TTS or Azure Speech
      // This is a basic implementation using native browser TTS
      window.speechSynthesis.speak(utterance);
      setPlaying(true);
      toast.success('Audio generation started');
    } catch (e) {
      toast.error('Failed to generate audio: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleDownloadAudio = async () => {
    toast.info('Audio download feature requires backend TTS service');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Volume2 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-gray-900">Text to Speech</h3>
      </div>

      <div className="space-y-4">
        {/* Voice Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Voice</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {VOICES.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleGenerateAudio}
            disabled={generating || !sermonText.trim()}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                Generate Audio
              </>
            )}
          </Button>

          {audioUrl && (
            <>
              <Button
                onClick={handlePlayPause}
                variant="outline"
                className="gap-2"
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {playing ? 'Pause' : 'Play'}
              </Button>
              <Button
                onClick={handleDownloadAudio}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </>
          )}
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} onEnded={() => setPlaying(false)} />

        {/* Info */}
        <p className="text-xs text-gray-500">
          Browser-based TTS uses system voices. For production use, integrate Google Cloud TTS, AWS Polly, or Azure Speech Services.
        </p>
      </div>
    </div>
  );
}