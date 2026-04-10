/**
 * Role-based permission helper.
 * 
 * Roles: 'admin' | 'moderator' | 'user'  (Base44 stores role on the User entity)
 * 
 * Usage:
 *   import { can } from '../components/permissions';
 *   if (can(user, 'MOD_QUEUE')) { ... }
 */

const ROLE_PERMISSIONS = {
  user: new Set([
    'CREATE',
    'EDIT_OWN',
    'DELETE_OWN',
    'READ_PUBLISHED',
    'READ_NOTIFICATIONS',
  ]),
  moderator: new Set([
    'CREATE',
    'EDIT_OWN',
    'DELETE_OWN',
    'READ_PUBLISHED',
    'READ_NOTIFICATIONS',
    'MOD_QUEUE',
    'APPROVE',
    'REJECT',
    'REMOVE',
    'READ_REPORTS',
    'WARN',
  ]),
  admin: new Set([
    'CREATE',
    'EDIT_OWN',
    'DELETE_OWN',
    'READ_PUBLISHED',
    'READ_NOTIFICATIONS',
    'MOD_QUEUE',
    'APPROVE',
    'REJECT',
    'REMOVE',
    'READ_REPORTS',
    'WARN',
    'SUSPEND',
    'ANNOUNCE',
    'MANAGE_ROLES',
    'MANAGE_SETTINGS',
  ]),
};

/**
 * @param {object|null} user - Base44 user object (has .role)
 * @param {string} action - Permission constant e.g. 'MOD_QUEUE'
 * @returns {boolean}
 */
export function can(user, action) {
  const role = user?.role || 'user';
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

/**
 * Returns true if the user is an admin or moderator.
 */
export function isMod(user) {
  return user?.role === 'admin' || user?.role === 'moderator';
}

/**
 * Returns true if the user is an admin.
 */
export function isAdmin(user) {
  return user?.role === 'admin';
}

/**
 * Legacy helper used by EventManager and similar components.
 * @param {string} userRole - role string e.g. 'admin', 'moderator', 'user'
 * @param {string} action   - permission constant e.g. 'MOD_QUEUE'
 * @returns {boolean}
 */
export function checkPermission(userRole, action) {
  return can({ role: userRole }, action);
}