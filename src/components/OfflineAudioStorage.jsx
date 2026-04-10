/**
 * Offline Audio Storage Manager
 * Manages downloading and storing Bible audio for offline access
 */

const OFFLINE_AUDIO_KEY = 'faithlight_offline_audio';
const AUDIO_METADATA_KEY = 'faithlight_audio_metadata';

export const OfflineAudioStorage = {
  // Save audio for offline access
  saveAudio: (audio) => {
    try {
      const audioData = OfflineAudioStorage.getAllAudio();
      const key = `${audio.translation_code}_${audio.book}_${audio.chapter}`;
      
      audioData[key] = {
        ...audio,
        downloadedAt: new Date().toISOString(),
        isOffline: true
      };

      localStorage.setItem(OFFLINE_AUDIO_KEY, JSON.stringify(audioData));
      OfflineAudioStorage.updateAudioMetadata();
      return true;
    } catch (error) {
      console.error('Failed to save audio offline:', error);
      return false;
    }
  },

  // Get all offline audio
  getAllAudio: () => {
    try {
      const stored = localStorage.getItem(OFFLINE_AUDIO_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get offline audio:', error);
      return {};
    }
  },

  // Get specific audio
  getAudio: (translationCode, book, chapter) => {
    const key = `${translationCode}_${book}_${chapter}`;
    const allAudio = OfflineAudioStorage.getAllAudio();
    return allAudio[key] || null;
  },

  // Check if audio is available offline
  isAudioOffline: (translationCode, book, chapter) => {
    return !!OfflineAudioStorage.getAudio(translationCode, book, chapter);
  },

  // Remove audio from offline storage
  removeAudio: (translationCode, book, chapter) => {
    try {
      const audioData = OfflineAudioStorage.getAllAudio();
      const key = `${translationCode}_${book}_${chapter}`;
      delete audioData[key];
      localStorage.setItem(OFFLINE_AUDIO_KEY, JSON.stringify(audioData));
      OfflineAudioStorage.updateAudioMetadata();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Create blob URL for offline audio playback
  createOfflineAudioUrl: (translationCode, book, chapter) => {
    try {
      const audio = OfflineAudioStorage.getAudio(translationCode, book, chapter);
      if (!audio || !audio.audioData) return null;
      
      const blob = new Blob([audio.audioData], { type: `audio/${audio.format || 'mp3'}` });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to create offline audio URL:', error);
      return null;
    }
  },

  // Get storage size estimate
  getStorageSize: () => {
    try {
      const audioData = localStorage.getItem(OFFLINE_AUDIO_KEY) || '';
      const sizeInBytes = audioData.length;
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      const audioCount = Object.keys(OfflineAudioStorage.getAllAudio()).length;

      return {
        bytes: sizeInBytes,
        mb: sizeInMB,
        audioCount
      };
    } catch (error) {
      return { bytes: 0, mb: '0', audioCount: 0 };
    }
  },

  // Update audio metadata
  updateAudioMetadata: () => {
    try {
      const allAudio = OfflineAudioStorage.getAllAudio();
      const metadata = {
        audioItems: Object.keys(allAudio),
        lastUpdated: new Date().toISOString(),
        totalCount: Object.keys(allAudio).length
      };
      localStorage.setItem(AUDIO_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to update audio metadata:', error);
    }
  },

  // Clear all offline audio
  clearAll: () => {
    try {
      localStorage.removeItem(OFFLINE_AUDIO_KEY);
      localStorage.removeItem(AUDIO_METADATA_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }
};