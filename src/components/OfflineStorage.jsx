// Offline storage utility for lessons, Bible translations, and courses
const OFFLINE_LESSONS_KEY = 'faithlight_offline_lessons';
const OFFLINE_VERSES_KEY = 'faithlight_offline_verses';
const OFFLINE_COURSES_KEY = 'faithlight_offline_courses';
const OFFLINE_METADATA_KEY = 'faithlight_offline_metadata';

export const OfflineStorage = {
  // Save lesson for offline access
  saveLesson: (lesson) => {
    try {
      const offlineLessons = OfflineStorage.getAllLessons();
      offlineLessons[lesson.id] = {
        ...lesson,
        downloadedAt: new Date().toISOString()
      };
      localStorage.setItem(OFFLINE_LESSONS_KEY, JSON.stringify(offlineLessons));
      
      // Update metadata
      const metadata = OfflineStorage.getMetadata();
      metadata.lessonIds = Object.keys(offlineLessons);
      metadata.lastUpdated = new Date().toISOString();
      localStorage.setItem(OFFLINE_METADATA_KEY, JSON.stringify(metadata));
      
      return true;
    } catch (error) {
      console.error('Failed to save lesson offline:', error);
      return false;
    }
  },

  // Get a specific offline lesson
  getLesson: (lessonId) => {
    try {
      const offlineLessons = OfflineStorage.getAllLessons();
      return offlineLessons[lessonId] || null;
    } catch (error) {
      console.error('Failed to get offline lesson:', error);
      return null;
    }
  },

  // Get all offline lessons
  getAllLessons: () => {
    try {
      const stored = localStorage.getItem(OFFLINE_LESSONS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get offline lessons:', error);
      return {};
    }
  },

  // Check if lesson is available offline
  isLessonOffline: (lessonId) => {
    const offlineLessons = OfflineStorage.getAllLessons();
    return !!offlineLessons[lessonId];
  },

  // Remove lesson from offline storage
  removeLesson: (lessonId) => {
    try {
      const offlineLessons = OfflineStorage.getAllLessons();
      delete offlineLessons[lessonId];
      localStorage.setItem(OFFLINE_LESSONS_KEY, JSON.stringify(offlineLessons));
      
      // Update metadata
      const metadata = OfflineStorage.getMetadata();
      metadata.lessonIds = Object.keys(offlineLessons);
      metadata.lastUpdated = new Date().toISOString();
      localStorage.setItem(OFFLINE_METADATA_KEY, JSON.stringify(metadata));
      
      return true;
    } catch (error) {
      console.error('Failed to remove offline lesson:', error);
      return false;
    }
  },

  // Get metadata about offline storage
  getMetadata: () => {
    try {
      const stored = localStorage.getItem(OFFLINE_METADATA_KEY);
      return stored ? JSON.parse(stored) : { lessonIds: [], lastUpdated: null };
    } catch (error) {
      return { lessonIds: [], lastUpdated: null };
    }
  },

  // Clear all offline lessons
  clearAll: () => {
    try {
      localStorage.removeItem(OFFLINE_LESSONS_KEY);
      localStorage.removeItem(OFFLINE_METADATA_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear offline storage:', error);
      return false;
    }
  },

  // Save Bible translation for offline access
  saveTranslation: (translation, verses) => {
    try {
      const offlineVersesData = OfflineStorage.getAllTranslations();
      offlineVersesData[translation] = {
        code: translation,
        verses: verses,
        downloadedAt: new Date().toISOString(),
        verseCount: verses.length
      };
      localStorage.setItem(OFFLINE_VERSES_KEY, JSON.stringify(offlineVersesData));
      OfflineStorage.updateMetadata();
      return true;
    } catch (error) {
      console.error('Failed to save translation offline:', error);
      return false;
    }
  },

  // Get all downloaded translations
  getAllTranslations: () => {
    try {
      const stored = localStorage.getItem(OFFLINE_VERSES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get offline translations:', error);
      return {};
    }
  },

  // Get verses from offline translation
  getTranslationVerses: (translationCode) => {
    try {
      const translations = OfflineStorage.getAllTranslations();
      return translations[translationCode]?.verses || [];
    } catch (error) {
      return [];
    }
  },

  // Remove translation from offline storage
  removeTranslation: (translationCode) => {
    try {
      const offlineVersesData = OfflineStorage.getAllTranslations();
      delete offlineVersesData[translationCode];
      localStorage.setItem(OFFLINE_VERSES_KEY, JSON.stringify(offlineVersesData));
      OfflineStorage.updateMetadata();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Save course for offline access
  saveCourse: (course, lessons) => {
    try {
      const offlineCoursesData = OfflineStorage.getAllCourses();
      offlineCoursesData[course.id] = {
        ...course,
        lessons,
        downloadedAt: new Date().toISOString()
      };
      localStorage.setItem(OFFLINE_COURSES_KEY, JSON.stringify(offlineCoursesData));
      OfflineStorage.updateMetadata();
      return true;
    } catch (error) {
      console.error('Failed to save course offline:', error);
      return false;
    }
  },

  // Get all offline courses
  getAllCourses: () => {
    try {
      const stored = localStorage.getItem(OFFLINE_COURSES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  },

  // Remove course from offline storage
  removeCourse: (courseId) => {
    try {
      const offlineCoursesData = OfflineStorage.getAllCourses();
      delete offlineCoursesData[courseId];
      localStorage.setItem(OFFLINE_COURSES_KEY, JSON.stringify(offlineCoursesData));
      OfflineStorage.updateMetadata();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Update metadata with all offline content
  updateMetadata: () => {
    try {
      const metadata = {
        lessonIds: Object.keys(OfflineStorage.getAllLessons()),
        translationCodes: Object.keys(OfflineStorage.getAllTranslations()),
        courseIds: Object.keys(OfflineStorage.getAllCourses()),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(OFFLINE_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
  },

  // Get storage size estimate
  getStorageSize: () => {
    try {
      const lessons = localStorage.getItem(OFFLINE_LESSONS_KEY) || '';
      const verses = localStorage.getItem(OFFLINE_VERSES_KEY) || '';
      const courses = localStorage.getItem(OFFLINE_COURSES_KEY) || '';
      const sizeInBytes = lessons.length + verses.length + courses.length;
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      
      return {
        bytes: sizeInBytes,
        mb: sizeInMB,
        lessonCount: Object.keys(OfflineStorage.getAllLessons()).length,
        translationCount: Object.keys(OfflineStorage.getAllTranslations()).length,
        courseCount: Object.keys(OfflineStorage.getAllCourses()).length
      };
    } catch (error) {
      return { bytes: 0, mb: '0', lessonCount: 0, translationCount: 0, courseCount: 0 };
    }
  }
};