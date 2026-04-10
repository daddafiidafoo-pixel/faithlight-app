import { base44 } from '@/api/base44Client';

/**
 * Synchronous role-based permission check used by EventManager and similar components.
 * @param {string} userRole - e.g. 'admin', 'moderator', 'user'
 * @param {string} action   - e.g. 'CREATE_EVENTS', 'MODERATE_CHAT'
 * @returns {boolean}
 */
export function checkPermission(userRole, action) {
  if (!userRole) return false;
  if (userRole === 'admin') return true;
  if (userRole === 'moderator') {
    const modActions = ['READ', 'MODERATE_CHAT', 'MUTE_USERS', 'REMOVE_MESSAGES', 'MOD_QUEUE', 'CREATE_EVENTS', 'MANAGE_EVENTS'];
    return modActions.includes(action);
  }
  return action === 'READ';
}

/**
 * Alias for checkPermission — used by AdminModeration and community pages.
 * @param {object} user - user object with .role property
 * @param {string} action
 * @returns {boolean}
 */
export function can(user, action) {
  return checkPermission(user?.role, action);
}

/**
 * Check if a user has a specific permission
 * @param {string} permissionId - Permission ID to check (e.g., 'MODERATE_CHAT')
 * @param {object} user - User object
 * @returns {Promise<boolean>}
 */
export async function hasPermission(permissionId, user) {
  if (!user) return false;

  // Admin has all permissions
  if (user.role === 'admin') return true;

  try {
    // Get user's assigned roles
    const userRoles = await base44.entities.UserRole.filter({
      user_id: user.id,
      is_active: true,
    });

    if (userRoles.length === 0) return false;

    // Get role details and check permissions
    for (const userRole of userRoles) {
      const roles = await base44.entities.Role.filter({ id: userRole.role_id });
      if (roles.length > 0 && roles[0].permissions.includes(permissionId)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Get all permissions for a user
 * @param {object} user - User object
 * @returns {Promise<string[]>} Array of permission IDs
 */
export async function getUserPermissions(user) {
  if (!user) return [];

  // Admin has all permissions
  if (user.role === 'admin') {
    return [
      'MANAGE_TRAINING', 'CREATE_COURSES', 'EDIT_COURSES', 'APPROVE_COURSES', 'DELETE_COURSES',
      'MODERATE_CHAT', 'MUTE_USERS', 'REMOVE_MESSAGES', 'BAN_USERS',
      'CREATE_EVENTS', 'MANAGE_EVENTS', 'MANAGE_GROUPS', 'CREATE_SESSIONS',
      'MANAGE_USERS', 'MANAGE_ROLES', 'VIEW_REPORTS',
    ];
  }

  try {
    const userRoles = await base44.entities.UserRole.filter({
      user_id: user.id,
      is_active: true,
    });

    const permissions = new Set();

    for (const userRole of userRoles) {
      const roles = await base44.entities.Role.filter({ id: userRole.role_id });
      if (roles.length > 0 && roles[0].permissions) {
        roles[0].permissions.forEach(p => permissions.add(p));
      }
    }

    return Array.from(permissions);
  } catch (error) {
    console.error('Get permissions error:', error);
    return [];
  }
}

/**
 * Get user's roles
 * @param {object} user - User object
 * @returns {Promise<object[]>} Array of role objects
 */
export async function getUserRoles(user) {
  if (!user) return [];

  try {
    return await base44.entities.UserRole.filter({
      user_id: user.id,
      is_active: true,
    });
  } catch (error) {
    console.error('Get roles error:', error);
    return [];
  }
}