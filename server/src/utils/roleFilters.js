import { ROLES } from "../constants.js";

/**
 * Apply role-based filtering to database queries
 * Ensures users only see data from their own society and appropriate scope
 *
 * @param {object} baseFilter - Initial filter conditions
 * @param {object} user - Authenticated user object from req.user
 * @returns {object} Enhanced filter with role-based conditions
 */
export const applyRoleFilter = (baseFilter, user) => {
  const filter = { ...baseFilter };

  // All users should only see data from their society
  if (user.societyId) {
    filter.societyId = user.societyId;
  }

  // Residents can only see their own data
  if (user.role === ROLES.RESIDENT) {
    filter.residentId = user.id;
  }

  // Guards and Admins see all society data (no additional filter needed)

  return filter;
};

/**
 * Apply society filter to ensure data isolation
 * @param {object} baseFilter - Initial filter
 * @param {string} societyId - Society ID from user
 * @returns {object} Filter with society restriction
 */
export const applySocietyFilter = (baseFilter, societyId) => {
  return {
    ...baseFilter,
    societyId,
  };
};

/**
 * Check if user has permission to modify a resource
 * @param {object} resource - Resource to check
 * @param {object} user - Authenticated user
 * @param {string} ownerField - Field name that contains owner ID (default: 'residentId')
 * @returns {boolean} True if user can modify
 */
export const canModifyResource = (
  resource,
  user,
  ownerField = "residentId",
) => {
  // Admins can modify anything in their society
  if (user.role === ROLES.ADMIN && resource.societyId === user.societyId) {
    return true;
  }

  // Users can only modify their own resources
  if (
    resource[ownerField] === user.id &&
    resource.societyId === user.societyId
  ) {
    return true;
  }

  return false;
};
