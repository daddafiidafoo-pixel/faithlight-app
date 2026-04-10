import { base44 } from '@/api/base44Client';

export async function analyzeUserContent(userId, contentType, contentText, contentId = null) {
  try {
    // Use LLM to analyze the content
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are FaithLight AI, a respectful Christian assistant analyzing user content to provide better spiritual guidance.

CORE FAITHLIGHT AI GUIDELINES:
- Always be respectful of Christian beliefs and biblical truth
- Do not judge or condemn; analyze with compassion
- Identify areas where users need encouragement or clarity
- Respect denominational diversity
- Focus on guiding users toward Scripture and community

Analyze this user's ${contentType} for spiritual guidance insights:

"${contentText}"

Provide a JSON analysis with:
1. sentiment: "positive" | "neutral" | "struggling" | "confused" | "seeking"
2. key_themes: array of main biblical themes (e.g., ["faith", "prayer", "grace"])
3. confusion_areas: array of topics they seem confused about
4. spiritual_maturity_indicator: "new_believer" | "growing" | "mature" | "teaching_level"
5. recommended_topics: array of 3-5 topics they should study next
6. personalized_feedback: a brief, encouraging message (2-3 sentences) addressing their question/concern

Be compassionate, biblically sound, and specific.`,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment: { type: "string" },
          key_themes: { type: "array", items: { type: "string" } },
          confusion_areas: { type: "array", items: { type: "string" } },
          spiritual_maturity_indicator: { type: "string" },
          recommended_topics: { type: "array", items: { type: "string" } },
          personalized_feedback: { type: "string" }
        }
      }
    });

    // Store the analysis
    const analysisRecord = await base44.entities.UserContentAnalysis.create({
      user_id: userId,
      content_type: contentType,
      content_id: contentId,
      content_text: contentText.substring(0, 500), // Limit storage
      ...analysis
    });

    return analysis;
  } catch (error) {
    console.error('Content analysis failed:', error);
    return null;
  }
}

export async function getUserInsights(userId) {
  try {
    const recentAnalyses = await base44.entities.UserContentAnalysis.filter(
      { user_id: userId },
      '-created_date',
      10
    );

    if (recentAnalyses.length === 0) return null;

    // Aggregate insights
    const allThemes = recentAnalyses.flatMap(a => a.key_themes || []);
    const allConfusions = recentAnalyses.flatMap(a => a.confusion_areas || []);
    
    // Count theme frequency
    const themeCount = {};
    allThemes.forEach(theme => {
      themeCount[theme] = (themeCount[theme] || 0) + 1;
    });

    const topThemes = Object.entries(themeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);

    const mostRecentSentiment = recentAnalyses[0].sentiment;
    const maturityLevel = recentAnalyses[0].spiritual_maturity_indicator;

    return {
      topThemes,
      confusionAreas: [...new Set(allConfusions)].slice(0, 5),
      recentSentiment: mostRecentSentiment,
      maturityLevel,
      totalAnalyses: recentAnalyses.length
    };
  } catch (error) {
    console.error('Failed to get user insights:', error);
    return null;
  }
}

export async function getPersonalizedRecommendations(userId, userInsights) {
  try {
    if (!userInsights) return [];

    // Fetch available courses and lessons
    const [courses, lessons] = await Promise.all([
      base44.entities.Course.filter({ published: true }, '-created_date', 50),
      base44.entities.Lesson.filter({ status: 'approved' }, '-created_date', 50)
    ]);

    const recommendations = [];

    // Match courses to user themes
    userInsights.topThemes.forEach(theme => {
      const matchingCourses = courses.filter(c => 
        c.title.toLowerCase().includes(theme.toLowerCase()) ||
        c.description?.toLowerCase().includes(theme.toLowerCase())
      ).slice(0, 2);

      matchingCourses.forEach(course => {
        if (!recommendations.find(r => r.id === course.id)) {
          recommendations.push({
            type: 'course',
            id: course.id,
            title: course.title,
            description: course.description,
            reason: `Based on your interest in ${theme}`,
            url: `/CourseDetail?id=${course.id}`
          });
        }
      });
    });

    // Address confusion areas
    userInsights.confusionAreas.forEach(confusion => {
      const matchingLessons = lessons.filter(l =>
        l.title.toLowerCase().includes(confusion.toLowerCase()) ||
        l.content?.toLowerCase().includes(confusion.toLowerCase())
      ).slice(0, 1);

      matchingLessons.forEach(lesson => {
        if (!recommendations.find(r => r.id === lesson.id)) {
          recommendations.push({
            type: 'lesson',
            id: lesson.id,
            title: lesson.title,
            description: `Helps clarify: ${confusion}`,
            reason: `To help with ${confusion}`,
            url: `/LessonView?id=${lesson.id}`
          });
        }
      });
    });

    return recommendations.slice(0, 5);
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return [];
  }
}