import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VoicePrayerInput({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript)
          .join(' ');
        onTranscript(transcript);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        if (e.error !== 'no-speech') toast.error('Voice input error. Try again.');
        setListening(false);
      };

      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const toggle = () => {
    if (!supported) {
      toast.error('Voice input is not supported in this browser');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      recognitionRef.current?.start();
      setListening(true);
      toast.info('Listening… speak your prayer request');
    }
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? 'Stop recording' : 'Speak your prayer request'}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
        listening
          ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
          : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-500'
      }`}
    >
      {listening ? (
        <><MicOff className="w-4 h-4" /> Stop</>
      ) : (
        <><Mic className="w-4 h-4" /> Voice</>
      )}
    </button>
  );
}