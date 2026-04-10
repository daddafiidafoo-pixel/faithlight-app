import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

let AgoraRTC = null;

// Lazy load Agora SDK (browser only, using direct fetch to avoid build-time resolution)
const loadAgoraRTC = async () => {
  if (typeof window !== 'undefined' && !AgoraRTC) {
    try {
      // Load from CDN to avoid static import at build time
      const script = document.createElement('script');
      script.src = 'https://download.agora.io/sdk/release/AgoraRTC_N-latest.js';
      script.onload = () => {
        AgoraRTC = window.AgoraRTC;
      };
      document.head.appendChild(script);
      // Wait for script to load
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.warn('Failed to load Agora SDK:', err);
    }
  }
  return AgoraRTC;
};

export function useAgoraClient(roomId, userRole) {
  const clientRef = useRef(null);
  const localTracksRef = useRef({ audio: null, video: null });
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);

  // Initialize Agora client
  useEffect(() => {
    if (!roomId) return;

    const initClient = async () => {
      try {
        setLoading(true);

        // Load Agora SDK
        const SDK = await loadAgoraRTC();
        if (!SDK) {
          throw new Error('Agora SDK not available');
        }

        // Get token from backend
        const response = await base44.functions.invoke('generateAgoraToken', {
          roomId,
          role: userRole
        });

        if (!response.data || !response.data.token) {
          throw new Error('Failed to get Agora token');
        }

        const { appId, token, channelName, uid: agoraUid } = response.data;

        // Create client
        const client = SDK.createClient({
          mode: 'live',
          codec: 'vp8',
          areaCode: 'np' // Default - adjust based on user location
        });

        clientRef.current = client;
        setUid(agoraUid);

        // Join channel
        await client.join(appId, channelName, token, agoraUid);
        setJoined(true);
        setError(null);

      } catch (err) {
        console.error('Agora client error:', err);
        setError(err.message);
        setJoined(false);
      } finally {
        setLoading(false);
      }
    };

    initClient();

    return () => {
      // Cleanup on unmount
      const cleanup = async () => {
        try {
          if (localTracksRef.current.audio) {
            localTracksRef.current.audio.close();
          }
          if (localTracksRef.current.video) {
            localTracksRef.current.video.close();
          }
          if (clientRef.current) {
            await clientRef.current.leave();
          }
        } catch (err) {
          console.error('Cleanup error:', err);
        }
      };
      cleanup();
    };
  }, [roomId, userRole]);

  // Publish audio
  const publishAudio = async () => {
    if (!clientRef.current || !joined) return;

    try {
      const SDK = await loadAgoraRTC();
      if (!SDK) throw new Error('Agora SDK not available');
      
      if (!localTracksRef.current.audio) {
        localTracksRef.current.audio = await SDK.createMicrophoneAudioTrack();
      }
      await clientRef.current.publish([localTracksRef.current.audio]);
      return true;
    } catch (err) {
      console.error('Publish audio error:', err);
      setError(err.message);
      return false;
    }
  };

  // Publish video
  const publishVideo = async () => {
    if (!clientRef.current || !joined) return;

    try {
      const SDK = await loadAgoraRTC();
      if (!SDK) throw new Error('Agora SDK not available');
      
      if (!localTracksRef.current.video) {
        localTracksRef.current.video = await SDK.createCameraVideoTrack();
      }
      await clientRef.current.publish([localTracksRef.current.video]);
      return true;
    } catch (err) {
      console.error('Publish video error:', err);
      setError(err.message);
      return false;
    }
  };

  // Unpublish audio
  const unpublishAudio = async () => {
    if (!clientRef.current || !localTracksRef.current.audio) return;

    try {
      await clientRef.current.unpublish([localTracksRef.current.audio]);
      localTracksRef.current.audio.close();
      localTracksRef.current.audio = null;
    } catch (err) {
      console.error('Unpublish audio error:', err);
    }
  };

  // Unpublish video
  const unpublishVideo = async () => {
    if (!clientRef.current || !localTracksRef.current.video) return;

    try {
      await clientRef.current.unpublish([localTracksRef.current.video]);
      localTracksRef.current.video.close();
      localTracksRef.current.video = null;
    } catch (err) {
      console.error('Unpublish video error:', err);
    }
  };

  // Mute audio
  const muteAudio = async () => {
    if (localTracksRef.current.audio) {
      await localTracksRef.current.audio.setMuted(true);
    }
  };

  // Unmute audio
  const unmuteAudio = async () => {
    if (localTracksRef.current.audio) {
      await localTracksRef.current.audio.setMuted(false);
    }
  };

  // Leave channel
  const leave = async () => {
    try {
      if (localTracksRef.current.audio) {
        localTracksRef.current.audio.close();
        localTracksRef.current.audio = null;
      }
      if (localTracksRef.current.video) {
        localTracksRef.current.video.close();
        localTracksRef.current.video = null;
      }
      if (clientRef.current) {
        await clientRef.current.leave();
      }
      setJoined(false);
    } catch (err) {
      console.error('Leave error:', err);
    }
  };

  return {
    client: clientRef.current,
    joined,
    loading,
    error,
    uid,
    publishAudio,
    publishVideo,
    unpublishAudio,
    unpublishVideo,
    muteAudio,
    unmuteAudio,
    leave
  };
}