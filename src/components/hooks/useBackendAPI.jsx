import { base44 } from '@/api/base44Client';

// Backend API endpoint mapping for language-aware routes
const API_ENDPOINTS = {
  getTranslations: 'getTranslations',
  getVerseOfDay: 'getVerseOfDay',
  supportChat: 'supportChat',
};

export const useBackendAPI = () => {
  const getTranslations = async (language) => {
    try {
      const response = await base44.functions.invoke(API_ENDPOINTS.getTranslations, {
        language,
      });

      if (!response?.success) {
        throw new Error(response?.error?.message || 'Failed to load translations');
      }

      return response.data || {};
    } catch (err) {
      console.error('Failed to load translations:', err);
      return {};
    }
  };

  const getVerseOfDay = async (uiLanguage, bibleLanguage) => {
    try {
      const response = await base44.functions.invoke(API_ENDPOINTS.getVerseOfDay, {
        uiLanguage,
        bibleLanguage,
        version: 'default',
      });

      if (!response?.success) {
        throw new Error(response?.error?.message || 'Failed to load verse of the day');
      }

      return response.data;
    } catch (err) {
      console.error('Failed to load verse of the day:', err);
      throw err;
    }
  };

  const supportChat = async (message, language) => {
    try {
      const response = await base44.functions.invoke(API_ENDPOINTS.supportChat, {
        message,
        language,
      });

      if (!response?.success) {
        throw new Error(response?.error?.message || 'Support service temporarily unavailable');
      }

      return response.data?.answer || '';
    } catch (err) {
      console.error('Support chat failed:', err);
      throw err;
    }
  };

  return {
    getTranslations,
    getVerseOfDay,
    supportChat,
  };
};