import { base44 } from '@/api/base44Client';

/**
 * Generate personalized course recommendations for a user
 * Based on: learning history, performance, tags, interests
 */
export async function generateCourseRecommendations(userId, limit = 6) {
  try {
    // Fetch user's completed courses
    const completedCourses = await base44.entities.UserTrainingProgress.filter({
      user_id: userId,
      completed: true,
    }, '-completed_at');

    // Fetch user's quiz performance
    const quizResults = await base44.entities.UserQuizResult.filter({
      user_id: userId,
    }, '-created_date', 20);

    // Fetch all available courses
    const allCourses = await base44.entities.TrainingCourse.list('-updated_date');

    // Get completed course IDs to exclude
    const completedCourseIds = new Set(completedCourses.map(p => p.course_id));

    // Extract user interest tags from completed courses
    const userTags = new Set();
    for (const course of allCourses) {
      if (completedCourseIds.has(course.id) && course.tags) {
        course.tags.forEach(tag => userTags.add(tag));
      }
    }

    // Calculate recommendations
    const recommendations = [];

    for (const course of allCourses) {
      // Skip already completed courses
      if (completedCourseIds.has(course.id)) continue;

      let confidenceScore = 0;
      const matchingTags = [];
      let reason = null;

      // 1. Tag matching (highest weight)
      if (course.tags) {
        const commonTags = course.tags.filter(tag => userTags.has(tag));
        if (commonTags.length > 0) {
          confidenceScore += commonTags.length * 20;
          matchingTags.push(...commonTags);
          reason = 'similar_tags';
        }
      }

      // 2. Learning path progression (prerequisite logic)
      if (course.prerequisites?.length > 0) {
        const prereqsMet = course.prerequisites.every(prereqId =>
          completedCourseIds.has(prereqId)
        );
        if (prereqsMet) {
          confidenceScore += 30;
          reason = 'prerequisite_completion';
        }
      }

      // 3. Performance-based recommendations
      if (quizResults.length > 0) {
        const avgScore = Math.round(
          quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
        );

        if (avgScore >= 80 && course.difficulty_level === 'advanced') {
          confidenceScore += 15;
          reason = reason || 'complementary_learning_path';
        } else if (avgScore >= 60 && course.difficulty_level === 'intermediate') {
          confidenceScore += 10;
          reason = reason || 'complementary_learning_path';
        }
      }

      // 4. Trending courses in user's interest areas
      if (course.enrollment_count && course.enrollment_count > 50) {
        if (matchingTags.length > 0) {
          confidenceScore += 10;
          reason = 'trending_in_category';
        }
      }

      if (confidenceScore > 0 && reason) {
        recommendations.push({
          user_id: userId,
          course_id: course.id,
          course_title: course.title,
          reason,
          confidence_score: Math.min(confidenceScore, 100),
          matching_tags: matchingTags.slice(0, 5),
          recommendation_date: new Date().toISOString(),
        });
      }
    }

    // Sort by confidence score and limit
    recommendations.sort((a, b) => b.confidence_score - a.confidence_score);
    const topRecommendations = recommendations.slice(0, limit);

    // Save recommendations to database
    if (topRecommendations.length > 0) {
      // Clear old recommendations
      const oldRecs = await base44.entities.CourseRecommendation.filter({
        user_id: userId,
      });

      for (const oldRec of oldRecs) {
        if (!oldRec.enrolled) {
          await base44.entities.CourseRecommendation.delete(oldRec.id);
        }
      }

      // Create new recommendations
      await base44.entities.CourseRecommendation.bulkCreate(topRecommendations);
    }

    return topRecommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}

/**
 * Track when user enrolls in a recommended course
 */
export async function trackRecommendationEnrollment(userId, courseId) {
  try {
    const recs = await base44.entities.CourseRecommendation.filter({
      user_id: userId,
      course_id: courseId,
    }, '-created_date', 1);

    if (recs.length > 0) {
      await base44.entities.CourseRecommendation.update(recs[0].id, {
        enrolled: true,
      });
    }
  } catch (error) {
    console.error('Error tracking enrollment:', error);
  }
}