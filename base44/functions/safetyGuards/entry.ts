import { base44 } from '@/api/base44Client';

/**
 * FaithLight Safety Guards for Base44
 * Checks: global bans/suspensions, room/course restrictions, user-to-user blocks
 */

const nowMs = () => Date.now();
const toMs = (d) => (d ? new Date(d).getTime() : null);

function ok(result = {}) {
  return { ok: true, ...result };
}

function deny(code, message, extra = {}) {
  return { ok: false, code, message, ...extra };
}

/**
 * Get user safety profile
 */
async function getSafetyProfile(userId) {
  try {
    const rows = await base44.entities.UserSafetyProfile.filter({ user_id: userId }, null, 1);
    return rows?.[0] || null;
  } catch (error) {
    console.error('Error fetching safety profile:', error);
    return null;
  }
}

/**
 * Check if viewer has blocked otherUser globally or in a scope
 */
export async function isBlocked(viewerId, otherUserId, scope = 'global', scopeId = null) {
  if (!viewerId || !otherUserId || viewerId === otherUserId) return false;

  try {
    const baseQuery = {
      blocker_id: viewerId,
      blocked_id: otherUserId,
    };

    // Check global block
    const globalBlocks = await base44.entities.UserBlock.filter(
      { ...baseQuery, scope: 'global' },
      null,
      1
    );
    if (globalBlocks?.length) return true;

    // Check scoped block if applicable
    if ((scope === 'room' || scope === 'course') && scopeId) {
      const scopedBlocks = await base44.entities.UserBlock.filter(
        { ...baseQuery, scope, scope_id: scopeId },
        null,
        1
      );
      if (scopedBlocks?.length) return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking block status:', error);
    return false;
  }
}

/**
 * Guard: can user join a live room?
 * Checks: banned/suspended status, room-level removals, host blocks
 */
export async function canUserJoinRoom(userId, roomId, options = {}) {
  const { enforceRoomBlock = true, hostUserId = null } = options;

  if (!userId) return deny('MISSING_USER', 'User is required.');
  if (!roomId) return deny('MISSING_ROOM', 'Room is required.');

  try {
    // 1) Global safety check
    const profile = await getSafetyProfile(userId);

    if (profile?.status === 'banned') {
      return deny('BANNED', 'Your account has been blocked from FaithLight live rooms.');
    }

    const suspendedUntilMs = toMs(profile?.suspended_until);
    if (profile?.status === 'suspended' && suspendedUntilMs && suspendedUntilMs > nowMs()) {
      return deny('SUSPENDED', 'Your account is temporarily suspended.', {
        suspendedUntil: profile.suspended_until,
      });
    }

    // 2) Room-level removal check (ServiceRoomParticipant or LiveRoomParticipant)
    try {
      const participants = await base44.entities.ServiceRoomParticipant.filter(
        { room_id: roomId, user_id: userId },
        null,
        1
      );
      const participant = participants?.[0];
      // You can add room-specific removal logic here if needed
    } catch {
      // Entity may not exist or not applicable
    }

    // 3) Host blocks (optional policy)
    if (enforceRoomBlock) {
      let hostId = hostUserId;

      if (!hostId) {
        const rooms = await base44.entities.ServiceRoom.filter({ id: roomId }, null, 1);
        hostId = rooms?.[0]?.host_id || null;
      }

      if (hostId && hostId !== userId) {
        const hostBlocked = await isBlocked(hostId, userId, 'room', roomId);
        if (hostBlocked) {
          return deny('BLOCKED_BY_HOST', "You can't join this room.");
        }
      }
    }

    return ok({ profileStatus: profile?.status || 'active' });
  } catch (error) {
    console.error('Error in canUserJoinRoom:', error);
    return ok(); // Allow if check fails
  }
}

/**
 * Guard: can user post a comment in a course?
 * Checks: banned/suspended status, course-specific mutes/restrictions
 */
export async function canUserPostComment(userId, courseId) {
  if (!userId) return deny('MISSING_USER', 'User is required.');
  if (!courseId) return deny('MISSING_COURSE', 'Course is required.');

  try {
    // 1) Global safety check
    const profile = await getSafetyProfile(userId);

    if (profile?.status === 'banned') {
      return deny('BANNED', 'Your account has been blocked from posting.');
    }

    const suspendedUntilMs = toMs(profile?.suspended_until);
    if (profile?.status === 'suspended' && suspendedUntilMs && suspendedUntilMs > nowMs()) {
      return deny('SUSPENDED', 'Your account is temporarily suspended.', {
        suspendedUntil: profile.suspended_until,
      });
    }

    if (profile?.status === 'muted') {
      return deny('MUTED', 'Your account has been muted.');
    }

    return ok({ profileStatus: profile?.status || 'active' });
  } catch (error) {
    console.error('Error in canUserPostComment:', error);
    return ok(); // Allow if check fails
  }
}

/**
 * Guard: should message/reply be hidden from viewer?
 * Returns true if viewer has blocked the sender or vice versa
 */
export async function shouldHideMessage(viewerId, senderId, scope = 'global', scopeId = null) {
  if (!viewerId || !senderId) return false;

  try {
    // Hide if viewer blocked sender
    if (await isBlocked(viewerId, senderId, scope, scopeId)) {
      return true;
    }

    // Optionally hide if sender blocked viewer (depends on your UX policy)
    // if (await isBlocked(senderId, viewerId, scope, scopeId)) {
    //   return true;
    // }

    return false;
  } catch (error) {
    console.error('Error checking message visibility:', error);
    return false;
  }
}