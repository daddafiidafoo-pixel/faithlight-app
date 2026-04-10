import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Circle, Square, FileText, Download, Loader2, CheckCircle2, Radio } from 'lucide-react';

const STATUS_CONFIG = {
  recording: { label: 'Recording', color: 'bg-red-500/20 text-red-400 border-red-500/30', pulse: true },
  processing: { label: 'Processing…', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', pulse: false },
  ready: { label: 'Ready', color: 'bg-green-500/20 text-green-300 border-green-500/30', pulse: false },
  starting: { label: 'Starting…', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', pulse: false },
  failed: { label: 'Failed', color: 'bg-red-500/20 text-red-400 border-red-500/30', pulse: false },
};

export default function RecordingControls({ room, sessionId, isHost, isCohost }) {
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [settings, setSettings] = useState({
    recording_enabled: room?.recording_enabled ?? false,
    auto_record: room?.auto_record ?? false,
    transcript_enabled: room?.transcript_enabled ?? false,
  });

  const canControl = isHost || isCohost;
  const isLive = room?.status === 'live';

  // Load active recording on mount
  useEffect(() => {
    if (!room?.id || !sessionId) return;
    base44.entities.EventRecording.filter({ event_id: room.id, session_id: sessionId })
      .then(recs => {
        if (recs.length > 0) setRecording(recs[recs.length - 1]);
      });
  }, [room?.id, sessionId]);

  // Auto-record: start when room goes live if enabled
  useEffect(() => {
    if (isLive && settings.auto_record && !recording && canControl) {
      handleStartRecording();
    }
  }, [isLive]);

  const saveSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await base44.entities.LiveRoom.update(room.id, { [key]: value });
  };

  const handleStartRecording = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('startAgoraRecording', {
      event_id: room.id,
      session_id: sessionId,
    });
    if (res.data?.recording) setRecording(res.data.recording);
    setLoading(false);
  };

  const handleStopRecording = async () => {
    setLoading(true);
    await base44.functions.invoke('stopAgoraRecording', {
      event_id: room.id,
      session_id: sessionId,
    });
    setRecording(prev => prev ? { ...prev, status: 'processing' } : prev);
    setLoading(false);
  };

  const handleGenerateTranscript = async () => {
    setTranscriptLoading(true);
    const res = await base44.functions.invoke('generateSessionTranscript', {
      event_id: room.id,
      session_id: sessionId,
    });
    if (res.data?.transcript) setTranscript(res.data.transcript);
    setTranscriptLoading(false);
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${room.title?.replace(/\s+/g, '-') || room.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isRecording = recording?.status === 'recording';
  const statusCfg = recording ? STATUS_CONFIG[recording.status] : null;

  if (!canControl) return null;

  return (
    <div className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-red-400" />
          <span className="text-white/80 text-xs font-semibold uppercase tracking-wide">Recording</span>
        </div>
        {statusCfg && (
          <Badge className={`text-[10px] border ${statusCfg.color} flex items-center gap-1`}>
            {statusCfg.pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
            {statusCfg.label}
          </Badge>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Settings toggles */}
        <div className="space-y-2">
          {[
            { key: 'recording_enabled', label: 'Enable recording', desc: 'Allow this session to be recorded' },
            { key: 'auto_record', label: 'Auto-start on go live', desc: 'Begin recording immediately when session starts', depends: 'recording_enabled' },
            { key: 'transcript_enabled', label: 'Generate transcript', desc: 'AI transcript available after session', depends: 'recording_enabled' },
          ].map(({ key, label, desc, depends }) => {
            const disabled = depends && !settings[depends];
            return (
              <label
                key={key}
                className={`flex items-start gap-2.5 cursor-pointer group ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
              >
                <div
                  onClick={() => !disabled && saveSetting(key, !settings[key])}
                  className={`mt-0.5 w-8 h-4 rounded-full transition-colors flex-shrink-0 relative ${
                    settings[key] ? 'bg-indigo-500' : 'bg-white/10'
                  }`}
                >
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                    settings[key] ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </div>
                <div>
                  <p className="text-white/70 text-xs font-medium leading-none">{label}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">{desc}</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Record / Stop buttons — only shown when live */}
        {isLive && settings.recording_enabled && (
          <div className="pt-1 border-t border-white/10 space-y-1.5">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                disabled={loading || recording?.status === 'processing'}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Circle className="w-4 h-4 fill-red-400" />}
                Start Recording
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                disabled={loading}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                Stop Recording
              </button>
            )}
          </div>
        )}

        {/* Transcript section — shown after recording stops */}
        {settings.transcript_enabled && recording && ['processing', 'ready'].includes(recording.status) && (
          <div className="pt-1 border-t border-white/10 space-y-1.5">
            {!transcript ? (
              <button
                onClick={handleGenerateTranscript}
                disabled={transcriptLoading}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 disabled:opacity-50 transition-colors"
              >
                {transcriptLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <FileText className="w-4 h-4" />
                }
                {transcriptLoading ? 'Generating…' : 'Generate Transcript'}
              </button>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-green-400 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Transcript ready
                </div>
                <div className="bg-black/30 rounded-lg p-2 max-h-28 overflow-y-auto">
                  <p className="text-white/50 text-[10px] leading-relaxed whitespace-pre-line">{transcript.slice(0, 400)}{transcript.length > 400 ? '…' : ''}</p>
                </div>
                <button
                  onClick={downloadTranscript}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download .txt
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}