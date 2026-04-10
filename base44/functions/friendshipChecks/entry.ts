import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Check if two users are friends
 * @param {string} userId1 
 * @param {string} userId2 
 * @returns {Promise<boolean>}
 */
export async function areFriends(base44, userId1, userId2) {
  if (!userId1 || !userId2 || userId1 === userId2) return false;
  
  try {
    const [user1, user2] = [userId1, userId2].sort();
    const friendship = await base44.entities.Friend.filter({
      user_id_a: user1,
      user_id_b: user2
    }, '', 1);
    
    return friendship && friendship.length > 0;
  } catch (error) {
    console.error('Error checking friendship:', error);
    return false;
  }
}

/**
 * Check if one user has blocked another
 * @param {string} blockerId - User who blocked
 * @param {string} blockedId - User who was blocked
 * @returns {Promise<boolean>}
 */
export async function isBlocked(base44, blockerId, blockedId) {
  if (!blockerId || !blockedId) return false;
  
  try {
    const blocks = await base44.entities.UserBlock.filter({
      blocker_id: blockerId,
      blocked_id: blockedId
    }, '', 1);
    
    return blocks && blocks.length > 0;
  } catch (error) {
    console.error('Error checking block status:', error);
    return false;
  }
}

/**
 * Enforce friendship + block rules before messaging/calling
 * @param {string} viewerId - User initiating action
 * @param {string} targetId - User being contacted
 * @returns {Promise<{allowed: boolean, reason: string}>}
 */
export async function canContact(base44, viewerId, targetId) {
  if (viewerId === targetId) {
    return { allowed: false, reason: 'Cannot contact yourself' };
  }

  // Check if blocked
  if (await isBlocked(base44, targetId, viewerId)) {
    return { allowed: false, reason: 'This user has blocked you' };
  }

  if (await isBlocked(base44, viewerId, targetId)) {
    return { allowed: false, reason: 'You have blocked this user' };
  }

  // Check if friends
  if (!(await areFriends(base44, viewerId, targetId))) {
    return { allowed: false, reason: 'You must be friends to message or call' };
  }

  return { allowed: true, reason: '' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userId1, userId2 } = await req.json();

    if (action === 'areFriends') {
      const result = await areFriends(base44, userId1, userId2);
      return Response.json({ result });
    }

    if (action === 'isBlocked') {
      const result = await isBlocked(base44, userId1, userId2);
      return Response.json({ result });
    }

    if (action === 'canContact') {
      const result = await canContact(base44, user.id, userId2);
      return Response.json({ result });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});