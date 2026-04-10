import { base44 } from '@/api/base44Client';

/**
 * Check if user is allowed to perform an action based on safety profile
 * Returns { allowed: boolean, reason?: string }
 */
export async function checkUserSafety(userId) {
  try {
    const safetyProfiles = await base44.entities.UserSafetyProfile.filter(
      { user_id: userId },
      '-created_date',
      1
    );

    if (safetyProfiles.length === 0) {
      return { allowed: true };
    }

    const profile = safetyProfiles[0];

    // Check if banned
    if (profile.status === 'banned') {
      return {
        allowed: false,
        reason: `Your account has been banned. Reason: ${profile.ban_reason}`,
      };
    }

    // Check if suspended
    if (profile.status === 'suspended' && profile.suspended_until) {
      const now = new Date();
      const suspendedUntil = new Date(profile.suspended_until);

      if (now < suspendedUntil) {
        return {
          allowed: false,
          reason: `Your account is suspended until ${suspendedUntil.toLocaleString()}`,
        };
      } else {
        // Suspension has expired, reset status
        await base44.entities.UserSafetyProfile.update(profile.id, {
          status: 'active',
          suspended_until: null,
        });
        return { allowed: true };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking user safety:', error);
    return { allowed: true }; // Allow by default if check fails
  }
}

/**
 * Check if user is blocked by another user
 */
export async function isUserBlocked(userId, potentialBlockerId) {
  try {
    const blocks = await base44.entities.UserBlock.filter(
      {
        blocker_id: potentialBlockerId,
        blocked_id: userId,
      },
      null,
      1
    );
    return blocks.length > 0;
  } catch (error) {
    console.error('Error checking block status:', error);
    return false;
  }
}

/**
 * Get or create user safety profile
 */
export async function getOrCreateSafetyProfile(userId) {
  try {
    const profiles = await base44.entities.UserSafetyProfile.filter(
      { user_id: userId },
      null,
      1
    );

    if (profiles.length > 0) {
      return profiles[0];
    }

    // Create new profile
    return await base44.entities.UserSafetyProfile.create({
      user_id: userId,
      status: 'active',
      strikes: 0,
    });
  } catch (error) {
    console.error('Error getting/creating safety profile:', error);
    return null;
  }
}