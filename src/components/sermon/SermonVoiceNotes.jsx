import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Check } from 'lucide-react';

function VoiceNotePlayer({ url, onDelete }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
      <button onClick={toggle} className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
        {playing ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" />}
      </button>
      <div className="flex-1 h-1.5 bg-indigo-200 rounded-full" />
      <button onClick={onDelete} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
    </div>
  );
}

export default function SermonVoiceNotes({ sectionId, notes, onAdd, onDelete }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const sectionNotes = notes.filter(n => n.sectionId === sectionId);

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        onAdd({ sectionId, url, createdAt: new Date().toISOString() });
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      setError('Microphone access denied. Please allow microphone to record.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="mt-2 space-y-1.5">
      {sectionNotes.map((n, i) => (
        <VoiceNotePlayer key={i} url={n.url} onDelete={() => onDelete(n)} />
      ))}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
          recording ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
        }`}
      >
        {recording ? <><Square className="w-3 h-3" /> Stop Recording</> : <><Mic className="w-3 h-3" /> Add Voice Note</>}
      </button>
    </div>
  );
}