import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Adaptive Learning Path Engine
 * Analyzes user progress, quiz results, and interests to generate personalized
 * discipleship module recommendations and AI assistant suggestions
 */

Deno.serve(async (req) => {
  try {
    if (req.method === 'GET') {
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({
        success: true,
        userProfile: { spiritualLevel: 1, lessonsCompleted: 0, averageQuizScore: null, strugglingAreas: [], strengths: [], interests: [], coursesCompleted: 0, learningPace: 'moderate', preferredContentType: 'mixed', theologicalLeanings: ['evangelical'], teachingStyle: 'balanced' },
        recommendations: { modules: [], sermonTopics: [], learningPaths: [] },
        timestamp: new Date().toISOString()
      });
    }

    const body = await req.json().catch(() => ({}));
    const { userId = user.id } = body;

    // Fetch user's learning data in parallel
    const [
      userProgress,
      userSpiritualProgress,
      quizResults,
      userInterests,
      completedCourses,
      currentLearningPaths
    ] = await Promise.all([
      base44.entities.UserProgress.filter({ user_id: userId }, '-updated_date', 100).catch(() => []),
      base44.entities.UserSpiritualProgress.filter({ user_id: userId }).catch(() => null),
      base44.entities.UserQuizResult.filter({ user_id: userId }, '-created_date', 50).catch(() => []),
      base44.entities.UserInterest.filter({ user_id: userId }).catch(() => []),
      base44.entities.CourseEnrollment.filter({ user_id: userId, completed: true }).catch(() => []),
      base44.entities.UserLearningPath.filter({ user_id: userId, status: 'in_progress' }).catch(() => [])
    ]);

    // Analyze user's learning profile
    const profile = analyzeUserProfile(
      userProgress,
      userSpiritualProgress,
      quizResults,
      userInterests,
      completedCourses
    );

    // Generate module recommendations
    const moduleRecommendations = generateModuleRecommendations(profile);

    // Generate AI sermon suggestions based on theology + teaching style
    const sermonSuggestions = generateSermonSuggestions(profile);

    // Generate adaptive learning path suggestions
    const pathSuggestions = generatePathSuggestions(profile, currentLearningPaths);

    return Response.json({
      success: true,
      userId,
      userProfile: profile,
      recommendations: {
        modules: moduleRecommendations,
        sermonTopics: sermonSuggestions,
        learningPaths: pathSuggestions
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Adaptive recommendations error:', error);
    return Response.json({
      success: true,
      userProfile: { spiritualLevel: 1, lessonsCompleted: 0, averageQuizScore: null, strugglingAreas: [], strengths: [], interests: [], coursesCompleted: 0, learningPace: 'moderate', preferredContentType: 'mixed', theologicalLeanings: ['evangelical'], teachingStyle: 'balanced' },
      recommendations: { modules: [], sermonTopics: [], learningPaths: [] }
    });
  }
});

function analyzeUserProfile(userProgress, spiritualProgress, quizResults, interests, completedCourses) {
  const profile = {
    spiritualLevel: spiritualProgress?.current_level || 1,
    lessonsCompleted: userProgress?.filter(p => p.completed).length || 0,
    averageQuizScore: calculateAverageQuizScore(quizResults),
    strugglingAreas: identifyStrugglingAreas(quizResults),
    strengths: identifyStrengths(quizResults),
    interests: interests?.map(i => i.interest_name) || [],
    coursesCompleted: completedCourses?.length || 0,
    learningPace: determineLearningPace(userProgress),
    preferredContentType: determinePreferredContentType(userProgress),
    theologicalLeanings: determineTheologicalLeanings(interests),
    teachingStyle: determineTeachingStyle(userProgress)
  };

  return profile;
}

function calculateAverageQuizScore(quizResults) {
  if (!quizResults || quizResults.length === 0) return null;
  const sum = quizResults.reduce((acc, q) => acc + (q.score_percentage || 0), 0);
  return Math.round(sum / quizResults.length);
}

function identifyStrugglingAreas(quizResults) {
  if (!quizResults || quizResults.length === 0) return [];
  
  const scoresByTopic = {};
  quizResults.forEach(q => {
    if (q.topic_or_lesson) {
      if (!scoresByTopic[q.topic_or_lesson]) {
        scoresByTopic[q.topic_or_lesson] = [];
      }
      scoresByTopic[q.topic_or_lesson].push(q.score_percentage || 0);
    }
  });

  const averagesByTopic = Object.entries(scoresByTopic).map(([topic, scores]) => ({
    topic,
    average: scores.reduce((a, b) => a + b) / scores.length
  }));

  return averagesByTopic
    .filter(t => t.average < 70)
    .sort((a, b) => a.average - b.average)
    .map(t => t.topic)
    .slice(0, 3);
}

function identifyStrengths(quizResults) {
  if (!quizResults || quizResults.length === 0) return [];
  
  const scoresByTopic = {};
  quizResults.forEach(q => {
    if (q.topic_or_lesson) {
      if (!scoresByTopic[q.topic_or_lesson]) {
        scoresByTopic[q.topic_or_lesson] = [];
      }
      scoresByTopic[q.topic_or_lesson].push(q.score_percentage || 0);
    }
  });

  const averagesByTopic = Object.entries(scoresByTopic).map(([topic, scores]) => ({
    topic,
    average: scores.reduce((a, b) => a + b) / scores.length
  }));

  return averagesByTopic
    .filter(t => t.average >= 85)
    .sort((a, b) => b.average - a.average)
    .map(t => t.topic)
    .slice(0, 3);
}

function determineLearningPace(userProgress) {
  if (!userProgress || userProgress.length < 2) return 'moderate';
  
  const recent = userProgress.slice(0, 10);
  const daysSpan = recent.length > 1
    ? (new Date(recent[0].updated_date) - new Date(recent[recent.length - 1].updated_date)) / (1000 * 60 * 60 * 24)
    : 1;

  const lessonsPerDay = recent.length / Math.max(daysSpan, 1);

  if (lessonsPerDay > 2) return 'fast';
  if (lessonsPerDay > 0.5) return 'moderate';
  return 'slow';
}

function determinePreferredContentType(userProgress) {
  if (!userProgress || userProgress.length === 0) return 'mixed';

  const withAudio = userProgress.filter(p => p.content_type === 'audio').length;
  const withText = userProgress.filter(p => p.content_type === 'text').length;
  const withVideo = userProgress.filter(p => p.content_type === 'video').length;

  const types = [
    { type: 'audio', count: withAudio },
    { type: 'text', count: withText },
    { type: 'video', count: withVideo }
  ];

  const mostUsed = types.sort((a, b) => b.count - a.count)[0];
  return mostUsed.count > 0 ? mostUsed.type : 'mixed';
}

function determineTheologicalLeanings(interests) {
  if (!interests || interests.length === 0) return [];

  const theologicalKeywords = {
    reformed: ['sovereignty', 'predestination', 'covenant', 'grace'],
    arminian: ['free will', 'responsibility', 'prevenient grace'],
    pentecostal: ['holy spirit', 'gifts', 'baptism in spirit', 'healing'],
    baptist: ['believer baptism', 'church autonomy', 'priesthood of believers'],
    evangelical: ['conversion', 'authority of scripture', 'evangelism'],
    catholic: ['sacraments', 'tradition', 'communion of saints'],
    charismatic: ['prophetic', 'gifts of spirit', 'divine guidance']
  };

  const userInterestNames = interests.map(i => i.interest_name?.toLowerCase() || '');
  const detected = [];

  for (const [theology, keywords] of Object.entries(theologicalKeywords)) {
    const matches = keywords.filter(k => userInterestNames.some(i => i.includes(k)));
    if (matches.length > 0) {
      detected.push(theology);
    }
  }

  return detected.length > 0 ? detected : ['evangelical'];
}

function determineTeachingStyle(userProgress) {
  if (!userProgress || userProgress.length === 0) return 'balanced';

  const expository = userProgress.filter(p => p.lesson_style === 'expository').length;
  const topical = userProgress.filter(p => p.lesson_style === 'topical').length;
  const narrative = userProgress.filter(p => p.lesson_style === 'narrative').length;

  const styles = [
    { style: 'expository', count: expository },
    { style: 'topical', count: topical },
    { style: 'narrative', count: narrative }
  ];

  const mostUsed = styles.sort((a, b) => b.count - a.count)[0];
  return mostUsed.count > 0 ? mostUsed.style : 'balanced';
}

function generateModuleRecommendations(profile) {
  const recommendations = [];

  // Level-based progression
  if (profile.spiritualLevel === 1) {
    recommendations.push(
      {
        type: 'course',
        title: 'Foundations of Faith',
        description: 'Core beliefs every new believer should know',
        priority: 'high',
        reason: 'You\'re starting your journey—build a strong foundation',
        modules: ['Gospel basics', 'Who is Jesus?', 'Salvation explained', 'Bible overview']
      },
      {
        type: 'bible_study',
        title: 'Gospel of John',
        description: 'Start with the clearest Gospel account',
        priority: 'high',
        reason: 'John shows Jesus\'s character and teachings clearly',
        estimatedLength: '4 weeks'
      }
    );
  }

  if (profile.spiritualLevel === 2) {
    recommendations.push(
      {
        type: 'course',
        title: 'Discipleship Essentials',
        description: 'Deepen your walk with Christ',
        priority: 'high',
        reason: 'You\'re growing—go deeper into Scripture and spiritual disciplines',
        modules: ['Prayer life', 'Bible study methods', 'Spiritual gifts', 'Community']
      },
      {
        type: 'audio_study',
        title: 'Romans Deep Dive',
        description: 'Paul\'s masterpiece on grace and faith',
        priority: 'medium',
        reason: 'Perfect for intermediate believers',
        estimatedLength: '6 weeks'
      }
    );
  }

  if (profile.spiritualLevel >= 3) {
    recommendations.push(
      {
        type: 'course',
        title: 'Advanced Theology',
        description: 'Study deeper theological themes',
        priority: 'high',
        reason: 'Your maturity allows for advanced biblical study',
        modules: ['Soteriology', 'Eschatology', 'Pneumatology', 'Ecclesiology']
      }
    );
  }

  // Add based on struggling areas
  if (profile.strugglingAreas && profile.strugglingAreas.length > 0) {
    profile.strugglingAreas.slice(0, 2).forEach(area => {
      recommendations.push({
        type: 'reinforcement',
        title: `Master: ${area}`,
        description: `Review and deepen understanding of ${area}`,
        priority: 'high',
        reason: `Quiz results show this is an area to strengthen`,
        relatedArea: area
      });
    });
  }

  // Add based on interests
  if (profile.interests && profile.interests.length > 0) {
    const topicMap = {
      'leadership': { type: 'course', title: 'Biblical Leadership', description: 'Lead like Christ' },
      'prayer': { type: 'course', title: 'Prayer Practicum', description: 'Deepen your prayer life' },
      'evangelism': { type: 'course', title: 'Sharing Your Faith', description: 'Witness effectively' },
      'missions': { type: 'course', title: 'Global Missions', description: 'Understand God\'s global plan' }
    };

    profile.interests.slice(0, 2).forEach(interest => {
      const rec = topicMap[interest.toLowerCase()];
      if (rec) {
        recommendations.push({
          ...rec,
          priority: 'medium',
          reason: `Based on your interest in ${interest}`
        });
      }
    });
  }

  return recommendations.slice(0, 5);
}

function generateSermonSuggestions(profile) {
  const suggestions = [];

  // Theological-based suggestions
  const theologySuggestions = {
    reformed: [
      { topic: 'God\'s Sovereignty in Salvation', theme: 'Predestination & Election', style: 'expository' },
      { topic: 'The Covenant of Grace', theme: 'God\'s Redemptive Plan', style: 'expository' },
      { topic: 'Total Depravity & Divine Grace', theme: 'Anthropology & Soteriology', style: 'topical' }
    ],
    arminian: [
      { topic: 'Human Responsibility & Divine Grace', theme: 'Free Will & Salvation', style: 'topical' },
      { topic: 'Prevenient Grace Explained', theme: 'God\'s Enabling Work', style: 'teaching' },
      { topic: 'Conditional Election', theme: 'God\'s Foreknowledge', style: 'expository' }
    ],
    pentecostal: [
      { topic: 'Baptism in the Holy Spirit', theme: 'Spirit Empowerment', style: 'topical' },
      { topic: 'Gifts of the Spirit Today', theme: 'Charismatic Gifting', style: 'teaching' },
      { topic: 'Divine Healing in Scripture', theme: 'God\'s Compassion', style: 'topical' }
    ],
    evangelical: [
      { topic: 'The Authority of Scripture', theme: 'God\'s Reliable Word', style: 'topical' },
      { topic: 'Personal Conversion Stories', theme: 'Born Again', style: 'narrative' },
      { topic: 'Sharing the Gospel Effectively', theme: 'Evangelism', style: 'teaching' }
    ]
  };

  // Level-based sermon suggestions
  const levelSuggestions = {
    1: [
      { topic: 'What Does It Mean to Be a Christian?', style: 'teaching', audience: 'new believers' },
      { topic: 'Who Is Jesus?', style: 'topical', audience: 'new believers' },
      { topic: 'Understanding the Gospel', style: 'expository', audience: 'new believers' }
    ],
    2: [
      { topic: 'Spiritual Disciplines for Growth', style: 'topical', audience: 'growing believers' },
      { topic: 'Walking in Faith', style: 'expository', audience: 'growing believers' },
      { topic: 'God\'s Purpose in Trials', style: 'topical', audience: 'growing believers' }
    ],
    3: [
      { topic: 'Deep Theology for Leaders', style: 'expository', audience: 'leaders' },
      { topic: 'Biblical Hermeneutics', style: 'teaching', audience: 'leaders' },
      { topic: 'Discipling Others Effectively', style: 'topical', audience: 'leaders' }
    ]
  };

  // Add theology-based suggestions
  if (profile.theologicalLeanings && profile.theologicalLeanings.length > 0) {
    const theology = profile.theologicalLeanings[0];
    if (theologySuggestions[theology]) {
      suggestions.push(...theologySuggestions[theology].slice(0, 2));
    }
  }

  // Add level-based suggestions
  const levelSuggs = levelSuggestions[profile.spiritualLevel] || levelSuggestions[1];
  suggestions.push(...levelSuggs.slice(0, 2));

  // Adapt based on teaching style preference
  const styleFilter = (s) => {
    if (profile.teachingStyle === 'balanced') return true;
    return s.style === profile.teachingStyle || s.style === 'topical'; // topical is most flexible
  };

  return suggestions.filter(styleFilter).slice(0, 5);
}

function generatePathSuggestions(profile, currentPaths) {
  const suggestions = [];

  // If no active paths, suggest starting one
  if (!currentPaths || currentPaths.length === 0) {
    const levelPaths = {
      1: {
        name: 'New Believer Essentials',
        description: 'Your first 30 days of discipleship',
        courses: 3,
        estimatedWeeks: 4
      },
      2: {
        name: 'Growing in Faith',
        description: 'Deepen your walk and discover your gifts',
        courses: 5,
        estimatedWeeks: 8
      },
      3: {
        name: 'Leadership Development',
        description: 'Prepare to lead and teach others',
        courses: 6,
        estimatedWeeks: 12
      }
    };

    const pathRec = levelPaths[profile.spiritualLevel] || levelPaths[1];
    suggestions.push({
      type: 'learning_path',
      name: pathRec.name,
      description: pathRec.description,
      courses: pathRec.courses,
      estimatedWeeks: pathRec.estimatedWeeks,
      priority: 'high',
      reason: 'Structured paths accelerate growth'
    });
  }

  // Suggest advancement path
  if (profile.spiritualLevel < 4 && profile.averageQuizScore > 80) {
    suggestions.push({
      type: 'advancement',
      name: `Ready for Level ${profile.spiritualLevel + 1}`,
      description: 'Your progress shows you\'re ready for deeper study',
      priority: 'medium',
      reason: 'Quiz performance indicates readiness'
    });
  }

  return suggestions;
}