import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Enforce DM rules: users must be friends and not blocked
 * @param {string} userId1 
 * @param {string} userId2 
 * @returns {Promise<{allowed: boolean, reason: string}>}
 */
export async function canStartDM(base44, userId1, userId2) {
  if (userId1 === userId2) {
    return { allowed: false, reason: 'Cannot message yourself' };
  }

  // Check if blocked
  if (await isBlocked(base44, userId2, userId1)) {
    return { allowed: false, reason: 'This user has blocked you' };
  }

  if (await isBlocked(base44, userId1, userId2)) {
    return { allowed: false, reason: 'You have blocked this user' };
  }

  // Check if friends
  const areFriends = await checkFriendship(base44, userId1, userId2);
  if (!areFriends) {
    return { allowed: false, reason: 'You must be friends to send messages' };
  }

  return { allowed: true, reason: '' };
}

/**
 * Get or create DM conversation between two friends
 * @param {string} userId1 
 * @param {string} userId2 
 * @returns {Promise<object|null>}
 */
export async function getOrCreateDMConversation(base44, userId1, userId2, user1Name, user2Name) {
  // Check access first
  const access = await canStartDM(base44, userId1, userId2);
  if (!access.allowed) {
    throw new Error(access.reason);
  }

  // Check if DM already exists
  const [sortedId1, sortedId2] = [userId1, userId2].sort();
  const existingDM = await base44.entities.Conversation.filter({
    type: 'dm'
  }, '', 100);

  // Find if there's an existing DM between these users by checking members
  for (const conv of existingDM) {
    const members = await base44.entities.ConversationMember.filter({
      conversation_id: conv.id
    }, '', 100);

    const memberIds = members.map(m => m.user_id).sort();
    if (memberIds.length === 2 && 
        memberIds[0] === sortedId1 && 
        memberIds[1] === sortedId2) {
      return conv;
    }
  }

  // Create new DM conversation
  const [sortedName1, sortedName2] = [user1Name, user2Name].sort();
  const dmTitle = `${sortedName1} & ${sortedName2}`;

  const newDM = await base44.entities.Conversation.create({
    type: 'dm',
    title: dmTitle,
    created_by: userId1,
    created_by_name: user1Name,
    is_active: true,
    member_count: 2
  });

  // Add both users as members
  await base44.entities.ConversationMember.create({
    conversation_id: newDM.id,
    user_id: userId1,
    user_name: user1Name,
    role: 'member',
    is_active: true
  });

  await base44.entities.ConversationMember.create({
    conversation_id: newDM.id,
    user_id: userId2,
    user_name: user2Name,
    role: 'member',
    is_active: true
  });

  return newDM;
}

/**
 * Check if user is blocked
 */
async function isBlocked(base44, blockerId, blockedId) {
  try {
    const blocks = await base44.entities.UserBlock.filter({
      blocker_id: blockerId,
      blocked_id: blockedId
    }, '', 1);
    return blocks && blocks.length > 0;
  } catch {
    return false;
  }
}

/**
 * Check friendship
 */
async function checkFriendship(base44, userId1, userId2) {
  try {
    const [userA, userB] = [userId1, userId2].sort();
    const friendship = await base44.entities.Friend.filter({
      user_id_a: userA,
      user_id_b: userB
    }, '', 1);
    return friendship && friendship.length > 0;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, otherUserId, otherUserName } = await req.json();

    if (action === 'canStartDM') {
      const result = await canStartDM(base44, user.id, otherUserId);
      return Response.json({ result });
    }

    if (action === 'getOrCreateDM') {
      const conversation = await getOrCreateDMConversation(
        base44, 
        user.id, 
        otherUserId, 
        user.full_name,
        otherUserName
      );
      return Response.json({ conversation });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});