import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { prayerPostId } = await req.json();
    if (!prayerPostId) return Response.json({ error: 'prayerPostId is required' }, { status: 400 });

    const posts = await base44.asServiceRole.entities.CommunityPrayerPost.filter({ id: prayerPostId });
    if (!posts.length) return Response.json({ error: 'Post not found' }, { status: 404 });

    const post = posts[0];
    const alreadyPrayed = (post.prayedByEmails || []).includes(user.email);

    if (alreadyPrayed) {
      return Response.json({ success: true, alreadyPrayed: true, prayedCount: post.prayedCount });
    }

    const updatedEmails = [...(post.prayedByEmails || []), user.email];
    const updatedCount = updatedEmails.length;

    await base44.asServiceRole.entities.CommunityPrayerPost.update(prayerPostId, {
      prayedByEmails: updatedEmails,
      prayedCount: updatedCount
    });

    return Response.json({ success: true, prayedCount: updatedCount });
  } catch (error) {
    console.error('markPrayerForRequest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});