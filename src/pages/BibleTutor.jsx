import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, BookOpen, Sparkles, AlertCircle, Target, BookMarked, TrendingUp, Bookmark, MessageSquare, Layers, Share2 } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import BibleVerseDisplay from '../components/BibleVerseDisplay';
import BibleReferenceCard from '../components/BibleReferenceCard';
import { extractAndFetchVerses, createAIPromptWithVerses, extractBibleReferences, parseAndFetchBibleReference } from '../components/bibleUtils';
import PlanLimitChecker, { checkFeatureAccess } from '../components/PlanLimitChecker';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';
import { analyzeUserContent, getUserInsights, getPersonalizedRecommendations } from '../components/ContentAnalysisEngine';
import VerseExplanationGenerator from '../components/bible/VerseExplanationGenerator';
import BookSummaryGenerator from '../components/bible/BookSummaryGenerator';
import DiscussionQuestionGenerator from '../components/bible/DiscussionQuestionGenerator';
import SermonPrepAssistant from '../components/sermon/SermonPrepAssistant';
import SermonOutlineGenerator from '../components/bible/SermonOutlineGenerator';
import DiscipleshipPlanGenerator from '../components/bible/DiscipleshipPlanGenerator';
import VerseMemorizationTool from '../components/bible/VerseMemorizationTool';
import TutorContextPanel from '../components/tutor/TutorContextPanel';

export default function BibleTutor() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedVerses, setDisplayedVerses] = useState([]);
  const [bibleCards, setBibleCards] = useState([]);
  const [userInsights, setUserInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [personalizedFeedback, setPersonalizedFeedback] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [showInterpretations, setShowInterpretations] = useState(false);
  const [currentMessageToSave, setCurrentMessageToSave] = useState(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [tutorContext, setTutorContext] = useState({ tradition: null, contextNote: null, activePlanTitle: null, recentBooks: [] });
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Load user insights
        const insights = await getUserInsights(currentUser.id);
        setUserInsights(insights);
        
        if (insights) {
          const recs = await getPersonalizedRecommendations(currentUser.id, insights);
          setRecommendations(recs);
        }
        
        // Welcome message
        setMessages([{
          role: 'assistant',
          content: `Welcome to the FaithLight Bible Tutor! 📖

I'm here to help you understand Scripture and grow in your faith. I can:

• **Explain verses with historical context** and cultural background
• **Compare interpretations across different Bible translations** (KJV, NIV, ESV, NASB, etc.)
• **Compare theological perspectives** from various Christian traditions
• **Create personalized study plans** tailored to your interests and learning goals
• Generate daily devotionals and practical applications
• Suggest relevant lessons and courses from FaithLight
• Help you explore the deeper meaning of God's Word

**New Features:**
✨ Ask about historical context (e.g., "What's the historical background of Romans 13?")
🔍 Request translation comparisons (e.g., "Compare John 3:16 in KJV, NIV, and ESV")
📚 Get guided study plans (e.g., "Create a 30-day study plan on the book of James")

**Important:** I'm a learning tool to support your Bible study, not a replacement for Scripture, pastoral guidance, or personal study with the Holy Spirit.

How can I help you today?`
        }]);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: () => base44.entities.UserProgress.filter({ user_id: user.id }, '-updated_date', 50).catch(() => []),
    enabled: !!user,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['approved-lessons'],
    queryFn: () => base44.entities.Lesson.filter({ status: 'approved' }, '-updated_date', 50).catch(() => []),
    enabled: !!user,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['published-courses'],
    queryFn: () => base44.entities.Course.filter({ published: true }, '-updated_date', 20).catch(() => []),
    enabled: !!user,
  });

  const { data: userInterests = [] } = useQuery({
    queryKey: ['user-interests', user?.id],
    queryFn: () => base44.entities.UserInterest.filter({ user_id: user.id }, '-updated_date', 30).catch(() => []),
    enabled: !!user,
  });

  const { data: studyPlans = [] } = useQuery({
    queryKey: ['study-plans', user?.id],
    queryFn: () => base44.entities.StudyPlan.filter({ user_id: user.id }, '-updated_date', 20).catch(() => []),
    enabled: !!user,
  });

  const { data: savedExplanations = [] } = useQuery({
    queryKey: ['saved-explanations', user?.id],
    queryFn: () => base44.entities.SavedExplanation.filter({ user_id: user.id }, '-created_date', 50).catch(() => []),
    enabled: !!user
  });

  const { data: quizResults = [] } = useQuery({
    queryKey: ['quiz-results-tutor', user?.id],
    queryFn: () => base44.entities.UserQuizResult.filter({ user_id: user.id }, '-created_date', 20).catch(() => []),
    enabled: !!user
  });

  const trackInterestMutation = useMutation({
    mutationFn: async (interest) => {
      const existing = userInterests.find(
        i => i.interest_type === interest.type && i.interest_value === interest.value
      );
      if (existing) {
        await base44.entities.UserInterest.update(existing.id, {
          weight: existing.weight + 1
        });
      } else {
        await base44.entities.UserInterest.create({
          user_id: user.id,
          interest_type: interest.type,
          interest_value: interest.value,
          weight: 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-interests']);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check AI usage limit
    const usageCheck = checkFeatureAccess(user, 'ai_tutor');
    if (!usageCheck.allowed) {
      alert(usageCheck.message);
      return;
    }

    // Increment AI usage
    try {
      await base44.auth.updateMe({ 
        ai_generations_used: (user.ai_generations_used || 0) + 1 
      });
      setUser({ ...user, ai_generations_used: (user.ai_generations_used || 0) + 1 });
    } catch (error) {
      console.error('Failed to update usage:', error);
    }

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Extract and render BibleReferenceCards with user's preferred translation
      setBibleCards([]);
      const extractedVerses = await extractAndFetchVerses(input.trim(), user?.preferred_translation);
      if (extractedVerses.length > 0) {
        setBibleCards(extractedVerses);
        setDisplayedVerses(extractedVerses);
      }

      const conversationHistory = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');

      // Prepare user context
      const completedLessonIds = userProgress.filter(p => p.completed).map(p => p.lesson_id);
      const completedLessons = lessons.filter(l => completedLessonIds.includes(l.id));
      const incompleteLessons = lessons.filter(l => !completedLessonIds.includes(l.id));

      // Get top interests
      const topInterests = userInterests
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5)
        .map(i => `${i.interest_value} (${i.interest_type})`)
        .join(', ');

      // Get active study plans
      const activePlans = studyPlans.filter(p => p.status === 'active');

      const contextAddendum = [
        tutorContext.tradition ? `Preferred theological tradition for commentary: ${tutorContext.tradition}` : '',
        tutorContext.contextNote ? `User's personal context: ${tutorContext.contextNote}` : '',
        tutorContext.activePlanTitle ? `Currently following study plan: "${tutorContext.activePlanTitle}"` : '',
        tutorContext.recentBooks?.length ? `Recently read Bible books: ${tutorContext.recentBooks.join(', ')}` : '',
      ].filter(Boolean).join('\n');

      const userContext = `
    ${contextAddendum ? `Additional context:\n${contextAddendum}\n` : ''}User's Learning Progress:
    - Completed ${completedLessons.length} lessons
    - Topics studied: ${completedLessons.map(l => l.title).slice(0, 5).join(', ')}${completedLessons.length > 5 ? '...' : ''}
    - User interests: ${topInterests || 'Not yet tracked'}
    - Active study plans: ${activePlans.length > 0 ? activePlans.map(p => p.title).join(', ') : 'None'}
    - Available lessons: ${incompleteLessons.slice(0, 10).map(l => `"${l.title}" (${l.scripture_references || 'General'})`).join(', ')}
    - Available courses: ${courses.slice(0, 5).map(c => `"${c.title}" - ${c.description}`).join(', ')}
    `;

      let response;
      if (extractedVerses.length > 0) {
        // Use specialized prompt with fetched verses
        const userQuestion = `You are a compassionate Bible tutor. Explain the passages below clearly with context and practical application. Cite verses precisely. Be warm and encouraging.

    ${input.trim()}`;
        const specializedPrompt = createAIPromptWithVerses(extractedVerses, userQuestion);
        response = await base44.integrations.Core.InvokeLLM({
          prompt: specializedPrompt,
          add_context_from_internet: false
        });
      } else {
        // Use standard prompt
        response = await base44.integrations.Core.InvokeLLM({
          prompt: `You are FaithLight AI, a respectful Christian assistant designed to help users grow in faith, understand the Bible, and find the right tools inside the FaithLight app.

    CORE FAITHLIGHT AI GUIDELINES (always follow):
    1. Always respond in the user's selected language
    2. Keep answers Biblically grounded and respectful of Christian beliefs
    3. Use Scripture references when explaining Bible topics, but do not claim divine authority
    4. Do not replace pastors, churches, or personal prayer - encourage community and Scripture reading
    5. Avoid controversial or divisive theology. When topics vary by denomination, explain gently and neutrally
    6. If a question goes beyond Scripture or theology, say so honestly and guide the user appropriately
    7. Keep responses clear, encouraging, and practical
    8. Guide users to FaithLight features when helpful (Bible Reader, Audio Bible, Groups, Devotionals)
    
    Your role is to guide, explain, and encourage—not to judge, argue, or command.

    BIBLE TUTOR SPECIFIC GUIDELINES:
    - Provide detailed, Scripture-based explanations with multiple verses when helpful
    - Encourage prayer, church community, and personal Bible study
    - Offer historical and cultural context to deepen understanding
    - Be patient with questions at all spiritual maturity levels

    **HISTORICAL CONTEXT & BACKGROUND:**
    When asked about context or background (keywords: "context", "historical", "background", "culture", "why was this written"):
    1. Provide the **historical setting**: date, author, original audience, and circumstances of writing
    2. Explain **cultural context**: customs, social structures, political climate of that era
    3. Describe **literary context**: genre, structure, and flow of the surrounding passages
    4. Connect to **redemptive history**: how this fits into God's overall story of salvation
    5. Cite relevant archaeological findings or historical sources when applicable
    6. Format with clear headings: Historical Setting, Cultural Background, Literary Context, Theological Significance

    **TRANSLATION COMPARISON:**
    When asked to compare translations (keywords: "compare translations", "different versions", "KJV vs NIV"):
    1. Fetch and display the verse in multiple translations: KJV, NIV, ESV, NASB, NLT, MSG (if applicable)
    2. For each translation, note:
       - Translation philosophy (word-for-word vs thought-for-thought)
       - Key differences in wording and why they matter
       - Original Hebrew/Greek insights that explain variations
    3. Highlight significant theological implications of different renderings
    4. Recommend which translation might be best for different purposes (study, devotional, memorization)
    5. Format as a clear comparison table or side-by-side view

    **COMPARATIVE THEOLOGICAL ANALYSIS:**
    When asked to compare theological perspectives or analyze scripture from different traditions:
    1. Present at least 5-6 theological perspectives (Reformed/Calvinist, Arminian/Wesleyan, Roman Catholic, Eastern Orthodox, Lutheran, Pentecostal/Charismatic, Anglican, Baptist, etc.)
    2. For each perspective, provide:
       - The theological interpretation with nuance
       - Biblical basis and key verses
       - Historical context and church fathers/theologians who held this view (cite names and dates)
       - Denominational distinctives that led to this interpretation
       - Practical implications for believers
       - Modern proponents and representative churches
    3. Use a clear structure with markdown headers for each tradition
    4. Be balanced and scholarly - present each view charitably without favoring any tradition
    5. Include a comparison table showing similarities and differences
    6. Note areas of agreement across traditions
    7. Explain historical reasons for theological divergence

    **DYNAMIC PERSONALIZED STUDY PLANS:**
    When a user asks for a study plan (keywords: "study plan", "learning path", "what should I study", "help me grow"):
    1. **Analyze User Performance Data:**
       - Quiz results to identify weak topics (scores < 70%)
       - Completed lessons to understand current knowledge level
       - User interests and stated goals
       - Learning patterns and preferences
    2. **Create Adaptive Plan** (7-30 days) based on:
       - Starting difficulty aligned with their current level
       - Focus areas addressing their weaknesses
       - Progression that builds on their strengths
       - Integration of their stated interests
    3. **Structure Plan with:**
       - **Clear learning objectives** for each week
       - **Daily breakdown**: Scripture passage + reflection question + application
       - **Recommended FaithLight lessons/courses** matching their level
       - **Weekly milestones** with self-assessment checkpoints
       - **Additional resources**: books, sermons, study tools
       - **Review sessions** for topics they struggled with
    4. **Format beautifully** with markdown headers, bullet points, emojis (📖 📝 🎯 ⚡)
    5. Include **progress tracking suggestions** and encouragement
    
    **SCHOLARLY & HISTORICAL CONTEXT FOR DIFFICULT PASSAGES:**
    When asked about difficult, controversial, or confusing passages (keywords: "difficult", "controversial", "confusing", "what does this mean", "scholars say"):
    1. **Identify the Challenge**: Explain why this passage is difficult/controversial
    2. **Original Language Analysis**:
       - Hebrew/Greek word meanings with transliteration
       - Alternative translations and their implications
       - Grammatical nuances that affect interpretation
    3. **Historical & Cultural Context**:
       - When and why it was written
       - Cultural practices of that era
       - Political/social circumstances
       - Archaeological findings that illuminate the text
    4. **Scholarly Perspectives** (cite specific scholars):
       - Conservative evangelical scholars (e.g., Craig Keener, D.A. Carson, N.T. Wright)
       - Mainline Protestant scholars
       - Catholic and Orthodox scholars
       - Ancient church fathers (Augustine, Chrysostom, etc.)
       - Modern commentators
    5. **Denominational Interpretations**: How different traditions understand it
    6. **Theological Implications**: What's at stake in interpretation
    7. **Practical Application**: How to apply despite controversy
    8. **Recommended Resources**: Specific commentaries and scholarly works

    **PROACTIVE LESSON SUGGESTIONS:**
    - When users ask questions, suggest relevant lessons from their available content
    - Format: "📚 You might enjoy our lesson '[Lesson Title]' which covers [topic]"

    **DAILY DEVOTIONALS:**
    - Generate personalized devotionals based on their interests and progress
    - Include: Scripture passage, reflection, prayer, action step

    - Encourage personal Scripture study and church community involvement
    - Never claim to replace Scripture, pastors, or the Holy Spirit
    - Use internet context for accurate Scripture references and scholarly insights

    ${userContext}

    Previous conversation:
    ${conversationHistory}

    User's question: ${input.trim()}

    Provide a helpful, biblical response. When appropriate, offer historical context, translation comparisons, theological analysis, or guided study plans:`,
          add_context_from_internet: true
        });
      }

      // Analyze user's question for insights
      const analysis = await analyzeUserContent(
        user.id,
        'bible_question',
        input.trim()
      );

      if (analysis) {
        setPersonalizedFeedback(analysis.personalized_feedback);
        
        // Update insights and recommendations
        const updatedInsights = await getUserInsights(user.id);
        setUserInsights(updatedInsights);
        
        if (updatedInsights) {
          const newRecs = await getPersonalizedRecommendations(user.id, updatedInsights);
          setRecommendations(newRecs);
        }
      }

      // Generate follow-up questions based on the response
      const followUpPrompt = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this Bible discussion, generate 3 thoughtful follow-up questions that would deepen understanding.

User asked: ${input.trim()}
AI response: ${response.substring(0, 500)}...

Generate questions that:
1. Explore practical application
2. Connect to related Scripture
3. Deepen theological understanding

Return JSON array of 3 strings (questions only):`,
        response_json_schema: {
          type: 'object',
          properties: {
            questions: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }).catch(() => ({ questions: [] }));

      const assistantMessage = { 
        role: 'assistant', 
        content: response,
        followUpQuestions: followUpPrompt.questions || [],
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setFollowUpQuestions(followUpPrompt.questions || []);

      // Track user interests based on the conversation
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('prayer') || lowerInput.includes('pray')) {
        trackInterestMutation.mutate({ type: 'topic', value: 'Prayer' });
      }
      if (lowerInput.includes('grace') || lowerInput.includes('salvation')) {
        trackInterestMutation.mutate({ type: 'topic', value: 'Salvation' });
      }
      if (lowerInput.includes('reformed') || lowerInput.includes('calvin')) {
        trackInterestMutation.mutate({ type: 'theology', value: 'Reformed Theology' });
      }
      if (lowerInput.includes('arminian') || lowerInput.includes('wesleyan')) {
        trackInterestMutation.mutate({ type: 'theology', value: 'Arminian Theology' });
      }
      // Track Bible book interests
      const bibleBooks = ['genesis', 'exodus', 'matthew', 'john', 'romans', 'revelation', 'psalms', 'proverbs'];
      bibleBooks.forEach(book => {
        if (lowerInput.includes(book)) {
          trackInterestMutation.mutate({ 
            type: 'book', 
            value: book.charAt(0).toUpperCase() + book.slice(1) 
          });
        }
      });
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again or rephrase your question.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bible Tutor</h1>
          <p className="text-gray-600">Ask questions about Scripture, theology, and Christian living</p>
        </div>

        {/* Plan Limit Checker */}
        {user && <PlanLimitChecker user={user} feature="ai_tutor" />}

        {/* Context Panel */}
        {user && (
          <TutorContextPanel
            user={user}
            studyPlans={studyPlans}
            readingHistory={[]}
            onContextChange={setTutorContext}
          />
        )}

        {/* Personalized Insights */}
        {userInsights && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-sm">Your Interests</h3>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {userInsights.topThemes.slice(0, 4).map((theme, i) => (
                    <span key={i} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-sm">Growth Areas</h3>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {userInsights.confusionAreas.slice(0, 3).map((area, i) => (
                    <span key={i} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {area}
                    </span>
                  ))}
                  {userInsights.confusionAreas.length === 0 && (
                    <span className="text-xs text-gray-600">Keep asking questions!</span>
                  )}
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-sm">Your Journey</h3>
                </div>
                <p className="text-sm text-gray-700">
                  {userInsights.maturityLevel === 'new_believer' && '🌱 New believer - keep growing!'}
                  {userInsights.maturityLevel === 'growing' && '🌿 Growing in faith'}
                  {userInsights.maturityLevel === 'mature' && '🌳 Mature believer'}
                  {userInsights.maturityLevel === 'teaching_level' && '👨‍🏫 Ready to teach others'}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* AI Capability Generators */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <SermonOutlineGenerator onInsertToChat={(content) => { setMessages(prev => [...prev, { role: 'assistant', content, timestamp: new Date().toISOString() }]); messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }} />
          <DiscipleshipPlanGenerator user={user} onInsertToChat={(content) => { setMessages(prev => [...prev, { role: 'assistant', content, timestamp: new Date().toISOString() }]); messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }} />
          <VerseMemorizationTool userId={user?.id} />
          <SermonPrepAssistant />
          <VerseExplanationGenerator 
            onExplainVerse={(title, explanation) => {
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `📖 **${title}**\n\n${explanation}`,
                timestamp: new Date().toISOString()
              }]);
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <BookSummaryGenerator 
            onGenerateSummary={(title, summary) => {
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `📚 **${title}**\n\n${summary}`,
                timestamp: new Date().toISOString()
              }]);
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <DiscussionQuestionGenerator 
            onGenerateQuestions={(title, questions) => {
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `💬 **${title}**\n\n${questions}`,
                timestamp: new Date().toISOString()
              }]);
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {/* Personalized Recommendations */}
        {recommendations.length > 0 && (
          <Card className="mb-6 bg-purple-50 border-purple-200">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-purple-600" />
                Recommended for You
              </h3>
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <a
                    key={i}
                    href={rec.url}
                    className="block p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-purple-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{rec.type === 'course' ? '📚' : '📖'}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{rec.title}</h4>
                        <p className="text-xs text-purple-600 mt-1">{rec.reason}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Personalized Feedback */}
        {personalizedFeedback && (
          <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <div className="p-4">
              <p className="text-sm text-gray-700 italic">💡 {personalizedFeedback}</p>
            </div>
          </Card>
        )}

        {/* Saved Explanations Quick Access */}
        {savedExplanations.length > 0 && (
          <Card className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-600" />
                Recently Saved ({savedExplanations.length})
              </h3>
              <div className="space-y-2">
                {savedExplanations.slice(0, 3).map((saved) => (
                  <div
                    key={saved.id}
                    className="p-3 bg-white rounded-lg border border-amber-100 hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm font-medium text-gray-900 mb-1">{saved.question}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{saved.ai_response}</p>
                    {saved.scripture_reference && (
                      <p className="text-xs text-amber-600 mt-1">📖 {saved.scripture_reference}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Save Explanation Modal */}
        {currentMessageToSave && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-indigo-600" />
                  Save This Explanation
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Question:</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{currentMessageToSave.question}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Answer Preview:</label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded line-clamp-4">{currentMessageToSave.answer}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Category:</label>
                    <select
                      id="category"
                      className="w-full border rounded p-2 text-sm"
                      defaultValue="general"
                    >
                      <option value="theological">Theological</option>
                      <option value="historical">Historical Context</option>
                      <option value="devotional">Devotional</option>
                      <option value="interpretation">Interpretation</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Scripture Reference (optional):</label>
                    <input
                      id="scripture"
                      type="text"
                      className="w-full border rounded p-2 text-sm"
                      placeholder="e.g., John 3:16, Romans 8:28"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Personal Notes (optional):</label>
                    <Textarea
                      id="notes"
                      className="w-full"
                      placeholder="Add your thoughts or reflections..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={async () => {
                        const category = document.getElementById('category').value;
                        const scripture = document.getElementById('scripture').value;
                        const notes = document.getElementById('notes').value;
                        
                        try {
                          await base44.entities.SavedExplanation.create({
                            user_id: user.id,
                            question: currentMessageToSave.question,
                            ai_response: currentMessageToSave.answer,
                            scripture_reference: scripture || null,
                            category,
                            notes: notes || null,
                            tags: []
                          });
                          
                          queryClient.invalidateQueries(['saved-explanations']);
                          setCurrentMessageToSave(null);
                          alert('✅ Explanation saved successfully!');
                        } catch (error) {
                          console.error('Failed to save:', error);
                          alert('Failed to save explanation');
                        }
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={() => setCurrentMessageToSave(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Chat Container */}
        <Card className="bg-white shadow-lg">
          <div className="h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {bibleCards.length > 0 && (
                <div className="space-y-3 mb-4">
                  {bibleCards.map((card, idx) => (
                    <BibleReferenceCard
                      key={idx}
                      reference={card.reference}
                      verses={card.verses}
                      translation={card.translation}
                      onAskAI={(passageText, ref) => {
                        const q = `Explain ${ref}:\n${passageText}`;
                        setInput(q);
                        setTimeout(() => {
                          const form = document.querySelector('form');
                          if (form) form.requestSubmit();
                        }, 100);
                      }}
                    />
                  ))}
                </div>
              )}
              {displayedVerses.length > 0 && (
                <div className="space-y-2">
                  {displayedVerses.map((verseGroup, idx) => (
                    <BibleVerseDisplay 
                      key={idx} 
                      verses={verseGroup.verses} 
                      reference={verseGroup.reference}
                    />
                  ))}
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index}>
                  <ChatMessage message={message} />
                  
                  {/* Action Buttons for Assistant Messages */}
                  {message.role === 'assistant' && (
                    <div className="flex gap-2 mt-2 ml-11">
                      <Button
                        onClick={() => setCurrentMessageToSave({ question: messages[index - 1]?.content, answer: message.content })}
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                      >
                        <Bookmark className="w-3 h-3" />
                        Save
                      </Button>
                      
                      {/* Show Interpretations Button */}
                      {(messages[index - 1]?.content.toLowerCase().includes('interpret') || 
                        messages[index - 1]?.content.toLowerCase().includes('mean')) && (
                        <Button
                          onClick={async () => {
                            setIsLoading(true);
                            try {
                              const interpretationsResponse = await base44.integrations.Core.InvokeLLM({
                                prompt: `Provide 3-4 different theological interpretations of this question from various Christian traditions (Reformed, Arminian, Catholic, Orthodox, Pentecostal, etc.):

Question: ${messages[index - 1].content}

For each interpretation:
1. Name the tradition/perspective
2. Their interpretation
3. Biblical basis
4. Key proponents

Format as clear sections with headers.`,
                                add_context_from_internet: true
                              });
                              setMessages(prev => [...prev, { 
                                role: 'assistant', 
                                content: '🔍 **Multiple Theological Perspectives:**\n\n' + interpretationsResponse 
                              }]);
                            } catch (err) {
                              console.error('Failed to load interpretations:', err);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs"
                        >
                          <Layers className="w-3 h-3" />
                          Different Views
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Share & Save Actions */}
                  {message.role === 'assistant' && index > 0 && (
                    <div className="flex gap-2 mt-2 ml-11 flex-wrap">
                      <Button
                        onClick={async () => {
                          try {
                            const prevMessage = messages[index - 1];
                            const explanation = await base44.entities.SharedExplanation.create({
                              user_id: user.id,
                              user_name: user.full_name,
                              question: prevMessage.content,
                              ai_response: message.content,
                              privacy: 'private',
                              category: 'general'
                            });
                            alert('✅ Explanation saved! You can share it with study groups later.');
                          } catch (error) {
                            console.error('Failed to save explanation:', error);
                          }
                        }}
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs text-blue-600 hover:bg-blue-50"
                      >
                        <Bookmark className="w-3 h-3" />
                        Save to Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs text-purple-600 hover:bg-purple-50"
                      >
                        <Share2 className="w-3 h-3" />
                        Share to Group
                      </Button>
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {message.role === 'assistant' && message.followUpQuestions?.length > 0 && (
                    <div className="ml-11 mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <p className="text-xs font-semibold text-indigo-900 mb-2 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Continue exploring:
                      </p>
                      <div className="space-y-1">
                        {message.followUpQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setInput(q);
                              setTimeout(() => {
                                const form = document.querySelector('form');
                                if (form) form.requestSubmit();
                              }, 100);
                            }}
                            className="block w-full text-left text-xs text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100 p-2 rounded transition-colors"
                          >
                            • {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                  <Card className="bg-white">
                    <div className="p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2 mb-3 flex-wrap">
                <Button
                  onClick={() => {
                    setInput('Create a sermon outline on the theme of Grace & Forgiveness using Ephesians 2:1-10');
                    setTimeout(() => { const form = document.querySelector('form'); if (form) form.requestSubmit(); }, 100);
                  }}
                  variant="outline" size="sm" disabled={isLoading} className="gap-1">
                  <BookOpen className="w-3 h-3" />
                  Sermon Outline
                </Button>
                <Button
                  onClick={() => {
                    setInput('Give me a personalized daily devotional');
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Daily Devotional
                </Button>
                <Button
                  onClick={() => {
                    setInput('What is the historical context and background of Ephesians?');
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="gap-1"
                >
                  <BookOpen className="w-3 h-3" />
                  Historical Context
                </Button>
                <Button
                  onClick={() => {
                    setInput('Compare John 3:16 across KJV, NIV, ESV, and NASB translations');
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="gap-1"
                >
                  <BookMarked className="w-3 h-3" />
                  Compare Translations
                </Button>
                <Button
                  onClick={() => {
                    setInput('Create a 21-day study plan on the Sermon on the Mount');
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="gap-1"
                >
                  <Target className="w-3 h-3" />
                  Study Plan
                </Button>
                <Button
                  onClick={() => {
                    setInput('Compare how Reformed, Arminian, Catholic, Orthodox, Lutheran, and Pentecostal traditions interpret Romans 9 on predestination');
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="gap-1"
                >
                  <BookMarked className="w-3 h-3" />
                  Denominational Views
                </Button>
                <Button
                  onClick={async () => {
                    setIsGeneratingPlan(true);
                    try {
                      // Analyze user's learning data
                      const weakTopics = quizResults
                        .filter(q => q.score < 70)
                        .map(q => q.topic)
                        .filter(Boolean)
                        .slice(0, 3);
                      
                      const completedCount = userProgress.filter(p => p.is_completed).length;
                      const level = completedCount < 5 ? 'beginner' : completedCount < 15 ? 'intermediate' : 'advanced';
                      
                      const topInterests = userInterests
                        .sort((a, b) => b.weight - a.weight)
                        .slice(0, 3)
                        .map(i => i.interest_value);

                      const planPrompt = `Generate a personalized 14-day Bible study plan for this user:

Learning Level: ${level}
Weak Topics: ${weakTopics.join(', ') || 'None identified yet'}
Interests: ${topInterests.join(', ') || 'General biblical studies'}
Completed Lessons: ${completedCount}

Create a dynamic plan that:
1. Addresses their weak areas with targeted study
2. Builds on their interests
3. Matches their learning level
4. Includes daily Scripture, reflection, and application
5. Progressive difficulty over 2 weeks

Format with clear markdown headers and daily breakdowns.`;

                      setInput(planPrompt);
                      setIsGeneratingPlan(false);
                      setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) form.requestSubmit();
                      }, 100);
                    } catch (error) {
                      setIsGeneratingPlan(false);
                      console.error(error);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isLoading || isGeneratingPlan}
                  className="gap-1"
                >
                  <Target className="w-3 h-3" />
                  My Custom Plan
                </Button>
                <Button
                  onClick={() => {
                    setInput('Provide scholarly analysis of the difficult passage in Matthew 24 about the end times, including historical context and different interpretations');
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Scholarly Analysis
                </Button>
                <Link to={createPageUrl('SermonBuilder')}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    ✍️ Sermon Prep
                  </Button>
                </Link>
              </div>
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about the Bible..."
                  className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="self-end"
                  size="lg"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}