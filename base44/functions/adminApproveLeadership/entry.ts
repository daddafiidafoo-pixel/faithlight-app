import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = await req.json();

    // Fetch user's spiritual progress
    const progressRecords = await base44.entities.UserSpiritualProgress.filter({
      user_id: userId,
    });
    const progress = progressRecords?.[0];

    if (!progress) {
      return Response.json(
        { error: 'User spiritual progress not found' },
        { status: 404 }
      );
    }

    // Check if user is eligible
    if (!progress.leader_eligible) {
      return Response.json(
        { error: 'User is not eligible for leadership' },
        { status: 400 }
      );
    }

    // Approve for leadership
    await base44.entities.UserSpiritualProgress.update(progress.id, {
      leader_approved: true,
      current_level: 4,
      level_4_completed: true,
      completed_levels: [1, 2, 3, 4],
      leader_approved_by: user.id,
      leader_approved_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: `Leadership approved for user ${userId}`,
      newLevel: 4,
    });
  } catch (error) {
    console.error('Error approving leadership:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});