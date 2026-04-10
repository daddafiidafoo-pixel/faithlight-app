import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Check if user is a member of a group conversation
 * @param {string} conversationId 
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
export async function isGroupMember(base44, conversationId, userId) {
  if (!conversationId || !userId) return false;

  try {
    const membership = await base44.entities.ConversationMember.filter({
      conversation_id: conversationId,
      user_id: userId,
      is_active: true
    }, '', 1);

    return membership && membership.length > 0;
  } catch (error) {
    console.error('Error checking group membership:', error);
    return false;
  }
}

/**
 * Get user's role in a group
 * @param {string} conversationId 
 * @param {string} userId 
 * @returns {Promise<string|null>}
 */
export async function getUserGroupRole(base44, conversationId, userId) {
  if (!conversationId || !userId) return null;

  try {
    const membership = await base44.entities.ConversationMember.filter({
      conversation_id: conversationId,
      user_id: userId,
      is_active: true
    }, '', 1);

    if (membership && membership.length > 0) {
      return membership[0].role; // 'owner', 'admin', 'member'
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Enforce group membership before allowing action
 * @param {string} conversationId 
 * @param {string} userId 
 * @returns {Promise<{allowed: boolean, reason: string, role: string|null}>}
 */
export async function canParticipateInGroup(base44, conversationId, userId) {
  const isMember = await isGroupMember(base44, conversationId, userId);

  if (!isMember) {
    return {
      allowed: false,
      reason: 'You must be a member of this group to participate',
      role: null
    };
  }

  const role = await getUserGroupRole(base44, conversationId, userId);

  return {
    allowed: true,
    reason: '',
    role
  };
}

/**
 * Check if user can manage members (owner or admin)
 * @param {string} conversationId 
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
export async function canManageMembers(base44, conversationId, userId) {
  const role = await getUserGroupRole(base44, conversationId, userId);
  return role === 'owner' || role === 'admin';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, conversationId } = await req.json();

    if (action === 'isGroupMember') {
      const result = await isGroupMember(base44, conversationId, user.id);
      return Response.json({ result });
    }

    if (action === 'getUserGroupRole') {
      const result = await getUserGroupRole(base44, conversationId, user.id);
      return Response.json({ result });
    }

    if (action === 'canParticipateInGroup') {
      const result = await canParticipateInGroup(base44, conversationId, user.id);
      return Response.json({ result });
    }

    if (action === 'canManageMembers') {
      const result = await canManageMembers(base44, conversationId, user.id);
      return Response.json({ result });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});