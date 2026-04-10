import React, { useEffect, useRef } from 'react';
import { useAudioPlayerStore } from '@/components/audio/useAudioPlayerStore';

let globalInitialized = false;

export function GlobalAudioEngine() {
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current && !globalInitialized) {
      initRef.current = true;
      globalInitialized = true;
      const initializeAudio = useAudioPlayerStore.getState().initializeAudio;
      initializeAudio();
    }
  }, []);

  return null;
}

export default React.memo(GlobalAudioEngine);