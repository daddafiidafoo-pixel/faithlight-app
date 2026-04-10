import { base44 } from '@/api/base44Client';

/**
 * AI-powered content moderation service
 * Analyzes content for inappropriate material and flags it for review
 */
export const AIContentModerator = {
  /**
   * Moderate content using AI
   * @param {string} content - The text content to moderate
   * @param {string} contentType - Type of content (forum_post, group_post, etc.)
   * @param {string} contentId - ID of the content
   * @param {string} authorId - ID of the author
   * @param {string} authorName - Name of the author
   * @returns {Promise<object>} Moderation result
   */
  async moderateContent(content, contentType, contentId, authorId, authorName) {
    try {
      // Use AI to analyze content
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a content moderation system for a Christian learning platform. Analyze this content for inappropriate material.

Content to moderate:
"${content}"

Check for:
1. Hate speech or discrimination
2. Spam or promotional content
3. Harassment or bullying
4. Inappropriate language
5. Violence or threats
6. Religious misinformation or heresy
7. Off-topic content

Return your analysis as JSON:`,
        response_json_schema: {
          type: 'object',
          properties: {
            is_inappropriate: { type: 'boolean' },
            confidence_score: { type: 'number' },
            flag_reason: { 
              type: 'string',
              enum: ['hate_speech', 'spam', 'harassment', 'inappropriate', 'violence', 'misinformation', 'other', 'none']
            },
            explanation: { type: 'string' }
          }
        }
      });

      // If flagged, create a record
      if (analysis.is_inappropriate && analysis.confidence_score >= 60) {
        await base44.entities.FlaggedContent.create({
          content_type: contentType,
          content_id: contentId,
          content_text: content,
          author_id: authorId,
          author_name: authorName,
          flag_reason: analysis.flag_reason,
          ai_confidence_score: analysis.confidence_score,
          ai_analysis: analysis.explanation,
          status: 'pending'
        });

        return {
          flagged: true,
          reason: analysis.flag_reason,
          confidence: analysis.confidence_score,
          explanation: analysis.explanation
        };
      }

      return {
        flagged: false,
        confidence: analysis.confidence_score
      };
    } catch (error) {
      console.error('AI moderation failed:', error);
      return { flagged: false, error: true };
    }
  },

  /**
   * Check if user has repeat violations
   */
  async checkUserHistory(userId) {
    try {
      const violations = await base44.entities.FlaggedContent.filter({
        author_id: userId,
        status: 'removed'
      });

      return {
        violationCount: violations.length,
        shouldWarn: violations.length >= 3,
        shouldSuspend: violations.length >= 5
      };
    } catch (error) {
      console.error('Failed to check user history:', error);
      return { violationCount: 0, shouldWarn: false, shouldSuspend: false };
    }
  }
};