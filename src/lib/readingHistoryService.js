import { base44 } from '@/api/base44Client';

export const recordReading = async (userEmail, reading) => {
  try {
    const existing = await base44.entities.ReadingHistory.filter({
      user_email: userEmail,
      content_type: reading.content_type,
      book_id: reading.book_id,
      chapter: reading.chapter,
    });

    if (existing.length > 0) {
      await base44.entities.ReadingHistory.update(existing[0].id, {
        ...reading,
        last_accessed: new Date().toISOString(),
      });
    } else {
      await base44.entities.ReadingHistory.create({
        ...reading,
        user_email: userEmail,
        last_accessed: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error recording reading history:', error);
  }
};

export const getContinueReading = async (userEmail, limit = 5) => {
  try {
    const history = await base44.entities.ReadingHistory.filter(
      { user_email: userEmail },
      '-last_accessed',
      limit
    );
    return history;
  } catch (error) {
    console.error('Error fetching reading history:', error);
    return [];
  }
};

export const getRecentPassages = async (userEmail) => {
  try {
    return await base44.entities.ReadingHistory.filter(
      {
        user_email: userEmail,
        content_type: 'bible_passage',
      },
      '-last_accessed',
      10
    );
  } catch (error) {
    console.error('Error fetching recent passages:', error);
    return [];
  }
};

export const updateReadingProgress = async (historyId, progressPercentage) => {
  try {
    await base44.entities.ReadingHistory.update(historyId, {
      progress_percentage: progressPercentage,
      last_accessed: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating reading progress:', error);
  }
};