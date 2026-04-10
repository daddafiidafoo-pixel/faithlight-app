import { base44 } from '@/api/base44Client';

export async function generatePersonalizedSermonTopics(userProfile, count = 5) {
  if (!userProfile?.comprehensive_profile) {
    return generateDefaultSermonTopics(count);
  }

  const profile = userProfile.comprehensive_profile;
  
  const prompt = `Based on this user's profile, suggest ${count} sermon topics that align with their spiritual journey:

USER PROFILE:
- Spiritual Goals: ${profile.spiritual_goals?.join(', ') || 'General growth'}
- Ministry Goals: ${profile.ministry_goals?.join(', ') || 'General ministry'}
- Areas for Growth: ${profile.areas_of_growth?.join(', ') || 'General development'}
- Theological Interests: ${profile.theological_interests?.join(', ') || 'General theology'}
- Sermon Prep Focus: ${profile.sermon_prep_focus?.join(', ') || 'General preaching'}
- Content Depth: ${profile.preferred_content_depth || 'medium'}

Generate ${count} sermon topics that:
1. Address their growth areas
2. Align with their theological interests
3. Match their ministry focus
4. Are appropriate for their content depth preference

Return JSON:`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          topics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                passage: { type: 'string' },
                relevance: { type: 'string' },
                difficulty: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return response.topics || [];
  } catch (error) {
    return generateDefaultSermonTopics(count);
  }
}

export async function generatePersonalizedStudyPlan(userProfile) {
  if (!userProfile?.comprehensive_profile) {
    return null;
  }

  const profile = userProfile.comprehensive_profile;
  
  const prompt = `Create a personalized Bible study plan for this user:

USER PROFILE:
- Spiritual Goals: ${profile.spiritual_goals?.join(', ')}
- Learning Goals: ${profile.learning_goals?.join(', ')}
- Learning Style: ${profile.learning_style || 'mixed'}
- Study Preferences: ${profile.study_preferences?.join(', ')}
- Spiritual Disciplines: ${profile.spiritual_disciplines?.join(', ')}
- Areas for Growth: ${profile.areas_of_growth?.join(', ')}
- Theological Interests: ${profile.theological_interests?.join(', ')}
- Content Depth: ${profile.preferred_content_depth}
- Time Availability: ${profile.time_availability || 'Flexible'}

Create a personalized study plan that:
1. Addresses their specific goals and growth areas
2. Matches their learning style
3. Incorporates their preferred spiritual disciplines
4. Aligns with their time availability
5. Focuses on their theological interests

Include:
- Recommended duration (in days/weeks)
- Daily/weekly activities
- Specific Bible passages
- Spiritual disciplines to practice
- Progress milestones

Format as markdown with clear structure.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false
    });

    return response;
  } catch (error) {
    return null;
  }
}

export async function generatePersonalizedForumPrompts(userProfile, context = 'general') {
  if (!userProfile?.comprehensive_profile) {
    return generateDefaultForumPrompts(context);
  }

  const profile = userProfile.comprehensive_profile;
  
  const prompt = `Generate 4 discussion prompts for a Christian forum based on this user's profile:

USER PROFILE:
- Spiritual Goals: ${profile.spiritual_goals?.join(', ')}
- Areas for Growth: ${profile.areas_of_growth?.join(', ')}
- Theological Interests: ${profile.theological_interests?.join(', ')}
- Content Depth: ${profile.preferred_content_depth}

Context: ${context}

Create discussion prompts that:
1. Address their growth areas
2. Align with their theological interests
3. Are appropriate for their spiritual maturity level
4. Encourage meaningful dialogue

Return JSON:`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          prompts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                category: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return response.prompts || [];
  } catch (error) {
    return generateDefaultForumPrompts(context);
  }
}

export async function generatePersonalizedLearningPath(userProfile) {
  if (!userProfile?.comprehensive_profile) {
    return null;
  }

  const profile = userProfile.comprehensive_profile;
  
  const prompt = `Design a personalized learning path based on this user's profile:

USER PROFILE:
- Spiritual Goals: ${profile.spiritual_goals?.join(', ')}
- Learning Goals: ${profile.learning_goals?.join(', ')}
- Ministry Goals: ${profile.ministry_goals?.join(', ')}
- Learning Style: ${profile.learning_style}
- Study Preferences: ${profile.study_preferences?.join(', ')}
- Theological Interests: ${profile.theological_interests?.join(', ')}
- Content Depth: ${profile.preferred_content_depth}

Create a structured learning path with:
1. Clear progression stages (beginner → intermediate → advanced)
2. Specific courses or topics to study
3. Recommended order
4. Estimated timeline
5. Skill milestones
6. Connection to their ministry goals

Format as a structured plan with phases and actionable steps.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false
    });

    return response;
  } catch (error) {
    return null;
  }
}

// Fallback functions
async function generateDefaultSermonTopics(count) {
  return [
    { title: 'The Love of God', passage: '1 John 4:7-21', relevance: 'Foundational truth', difficulty: 'medium' },
    { title: 'Walking in Faith', passage: 'Hebrews 11', relevance: 'Practical living', difficulty: 'medium' },
    { title: 'The Power of Prayer', passage: 'James 5:13-18', relevance: 'Spiritual growth', difficulty: 'simple' }
  ].slice(0, count);
}

async function generateDefaultForumPrompts(context) {
  return [
    {
      question: 'How has your faith grown this week?',
      category: 'Spiritual Growth',
      description: 'Share personal growth experiences'
    },
    {
      question: 'What Bible passage is challenging you right now?',
      category: 'Scripture',
      description: 'Discuss difficult passages together'
    }
  ];
}