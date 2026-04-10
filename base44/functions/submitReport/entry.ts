/**
 * submitReport
 * 
 * Submit a report for post/comment content
 * 
 * Body:
 * {
 *   content_type: 'post' | 'comment',
 *   content_id: string,
 *   reason: 'spam' | 'harassment' | 'hate_speech' | 'sexual_content' | 'violence' | 'misinformation' | 'other',
 *   details: string (optional)
 * }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content_type, content_id, reason, details } = body;

    if (!content_type || !content_id || !reason) {
      return Response.json(
        { error: 'content_type, content_id, and reason are required' },
        { status: 400 }
      );
    }

    // Check if user already reported this content
    const existing = await base44.entities.CommunityReport.filter({
      reporter_user_id: user.id,
      content_type,
      content_id,
      status: 'open',
    });

    if (existing.length > 0) {
      return Response.json(
        { error: 'You have already reported this content' },
        { status: 400 }
      );
    }

    // Create report
    const report = await base44.entities.CommunityReport.create({
      reporter_user_id: user.id,
      content_type,
      content_id,
      reason,
      details: details || null,
      status: 'open',
    });

    return Response.json({
      success: true,
      report_id: report.id,
    });
  } catch (error) {
    console.error('submitReport error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});