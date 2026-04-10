import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Triggered by entity automations on:
 *  - GroupForumPost (create)   → notify thread creator + thread participants
 *  - Reaction       (create)   → notify target owner
 *  - PrayerRequest  (create)   → notify group members
 *  - PrayerRequest  (update)   → notify users who reacted 🙏 to it
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data } = body;

    if (!event || !data) return Response.json({ ok: true });

    const entityName = event.entity_name;
    const eventType = event.type;

    // ── 1. New forum reply → notify thread creator & prior repliers ──
    if (entityName === 'GroupForumPost' && eventType === 'create') {
      await handleForumReply(base44, data);
    }

    // ── 2. New reaction → notify the owner of the reacted-to item ──
    if (entityName === 'Reaction' && eventType === 'create') {
      await handleReaction(base44, data);
    }

    // ── 3. New prayer request → notify group members ──
    if (entityName === 'PrayerRequest' && eventType === 'create') {
      await handleNewPrayerRequest(base44, data);
    }

    // ── 4. Prayer request answered → notify users who prayed for it ──
    if (entityName === 'PrayerRequest' && eventType === 'update' && data.status === 'answered') {
      await handlePrayerAnswered(base44, data);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('[groupActivityNotifier] error:', error.message);
    return Response.json({ ok: true }); // always 200 to avoid retry loops
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function createNotif(base44, { user_id, type, title, content, source_user_id, source_user_name, related_id, related_type, group_id, action_url }) {
  // Don't notify yourself
  if (user_id === source_user_id) return;
  // Deduplicate: skip if an unread notif of same type+related_id already exists
  try {
    const existing = await base44.asServiceRole.entities.Notification.filter(
      { user_id, related_id, type, is_read: false }, '-created_date', 1
    );
    if (existing.length > 0) return;
  } catch (_) {}

  await base44.asServiceRole.entities.Notification.create({
    user_id, type, title, content,
    source_user_id, source_user_name,
    related_id, related_type, group_id,
    action_url,
    is_read: false,
  });
}

async function handleForumReply(base44, post) {
  if (!post.thread_id || !post.group_id) return;

  // Fetch the thread to find its creator
  const threads = await base44.asServiceRole.entities.GroupThread.filter(
    { id: post.thread_id }, '-created_date', 1
  ).catch(() => []);
  const thread = threads[0];
  if (!thread) return;

  const actionUrl = `/GroupDetail?id=${post.group_id}&tab=forum`;

  // Notify thread creator
  if (thread.creator_id && thread.creator_id !== post.author_id) {
    await createNotif(base44, {
      user_id: thread.creator_id,
      type: 'thread_reply',
      title: '💬 New reply to your discussion',
      content: `${post.author_name || 'Someone'} replied to "${thread.title}"`,
      source_user_id: post.author_id,
      source_user_name: post.author_name,
      related_id: post.thread_id,
      related_type: 'GroupThread',
      group_id: post.group_id,
      action_url: actionUrl,
    });
  }

  // Notify other recent repliers (up to 20) so thread participants stay in the loop
  const replies = await base44.asServiceRole.entities.GroupForumPost.filter(
    { thread_id: post.thread_id }, '-created_date', 50
  ).catch(() => []);

  const notifiedIds = new Set([thread.creator_id, post.author_id]);
  for (const reply of replies) {
    if (reply.author_id && !notifiedIds.has(reply.author_id)) {
      notifiedIds.add(reply.author_id);
      await createNotif(base44, {
        user_id: reply.author_id,
        type: 'forum_reply',
        title: '💬 New activity in a discussion you joined',
        content: `${post.author_name || 'Someone'} replied in "${thread.title}"`,
        source_user_id: post.author_id,
        source_user_name: post.author_name,
        related_id: post.thread_id,
        related_type: 'GroupThread',
        group_id: post.group_id,
        action_url: actionUrl,
      });
    }
  }
}

async function handleReaction(base44, reaction) {
  const { target_type, target_id, user_id, user_name, reaction_key } = reaction;
  const emojiMap = {
    AMEN:'🤲',PRAYER:'🙏',ENCOURAGED:'❤️',PEACE:'🕊️',SCRIPTURE:'📖',
    INSIGHTFUL:'💡',GROWING:'🌱',PRAISE:'🙌',HOPE:'✨',STRENGTH:'🛡️',
    LOVE:'🤍',MOVED:'🔥',BLESSED:'😇',WORSHIP:'🎵',SUPPORT:'🤝',
  };
  const emoji = emojiMap[reaction_key] || '❤️';

  let ownerId = null;
  let title = `${emoji} Someone reacted to your post`;
  let content = `${user_name || 'Someone'} reacted with ${emoji}`;
  let actionUrl = null;
  let related_type = null;

  if (target_type === 'forum_reply') {
    const posts = await base44.asServiceRole.entities.GroupForumPost.filter(
      { id: target_id }, '-created_date', 1
    ).catch(() => []);
    if (posts[0]) {
      ownerId = posts[0].author_id;
      actionUrl = `/GroupDetail?id=${posts[0].group_id}&tab=forum`;
      related_type = 'GroupForumPost';
    }
  } else if (target_type === 'prayer_request') {
    const reqs = await base44.asServiceRole.entities.PrayerRequest.filter(
      { id: target_id }, '-created_date', 1
    ).catch(() => []);
    if (reqs[0]) {
      ownerId = reqs[0].user_id;
      title = `🙏 Someone is praying for your request`;
      content = `${user_name || 'Someone'} is praying for "${reqs[0].title}"`;
      actionUrl = reqs[0].group_id ? `/GroupDetail?id=${reqs[0].group_id}&tab=prayer` : null;
      related_type = 'PrayerRequest';
    }
  }

  if (!ownerId) return;

  await createNotif(base44, {
    user_id: ownerId,
    type: 'reaction',
    title,
    content,
    source_user_id: user_id,
    source_user_name: user_name,
    related_id: target_id,
    related_type,
    action_url: actionUrl,
  });
}

async function handleNewPrayerRequest(base44, req) {
  if (!req.group_id || req.visibility === 'private') return;

  // Get group members
  const members = await base44.asServiceRole.entities.GroupMember.filter(
    { group_id: req.group_id }, '-created_date', 200
  ).catch(() => []);

  const actionUrl = `/GroupDetail?id=${req.group_id}&tab=prayer`;

  for (const member of members) {
    if (member.user_id === req.user_id) continue;
    await createNotif(base44, {
      user_id: member.user_id,
      type: 'prayer_request_new',
      title: '🙏 New prayer request in your group',
      content: `${req.user_name || 'A member'} shared: "${req.title}"`,
      source_user_id: req.user_id,
      source_user_name: req.user_name,
      related_id: req.id,
      related_type: 'PrayerRequest',
      group_id: req.group_id,
      action_url: actionUrl,
    });
  }
}

async function handlePrayerAnswered(base44, req) {
  // Find everyone who reacted 🙏 to this prayer request
  const prayers = await base44.asServiceRole.entities.Reaction.filter(
    { target_type: 'prayer_request', target_id: req.id, reaction_key: 'PRAYER' },
    '-created_date', 200
  ).catch(() => []);

  const actionUrl = req.group_id ? `/GroupDetail?id=${req.group_id}&tab=prayer` : null;

  for (const prayer of prayers) {
    if (prayer.user_id === req.user_id) continue;
    await createNotif(base44, {
      user_id: prayer.user_id,
      type: 'prayer_request_answered',
      title: '🎉 A prayer request was answered!',
      content: `"${req.title}" has been marked as answered${req.answered_note ? ` — ${req.answered_note.slice(0, 80)}` : ''}`,
      source_user_id: req.user_id,
      source_user_name: req.user_name,
      related_id: req.id,
      related_type: 'PrayerRequest',
      group_id: req.group_id || null,
      action_url: actionUrl,
    });
  }
}