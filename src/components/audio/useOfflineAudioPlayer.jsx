import { useState, useCallback } from 'react';
import { resolveAudioSource } from '@/lib/offlineAudioManager';

export function useOfflineAudioPlayer(audioId) {
  const [playOffline, setPlayOffline] = useState(false);
  const [currentSource, setCurrentSource] = useState(null);
  const [isResolvingSource, setIsResolvingSource] = useState(false);

  const resolveSource = useCallback(
    async (onlineUrl) => {
      setIsResolvingSource(true);
      try {
        const source = await resolveAudioSource({
          id: audioId,
          onlineUrl,
          playOffline,
        });
        setCurrentSource(source);
      } catch (error) {
        console.error('Failed to resolve audio source:', error);
        setCurrentSource(onlineUrl);
      } finally {
        setIsResolvingSource(false);
      }
    },
    [audioId, playOffline]
  );

  return {
    playOffline,
    setPlayOffline,
    currentSource,
    setCurrentSource,
    resolveSource,
    isResolvingSource,
  };
}