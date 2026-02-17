import prisma from "../db/prisma.js";

/**
 * Soft delete a record by setting deletedAt timestamp
 * @param {string} model - Prisma model name (e.g., 'user', 'complaint')
 * @param {string} id - Record ID to soft delete
 * @returns {Promise<object>} Deleted record
 */
export const softDelete = async (model, id) => {
  return await prisma[model].update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

/**
 * Find many records excluding soft-deleted ones
 * @param {string} model - Prisma model name
 * @param {object} where - Where clause
 * @param {object} options - Additional Prisma options (orderBy, include, etc.)
 * @returns {Promise<Array>} Active records
 */
export const findManyActive = async (model, where = {}, options = {}) => {
  return await prisma[model].findMany({
    where: { ...where, deletedAt: null },
    ...options,
  });
};

/**
 * Find unique active record (not soft-deleted)
 * @param {string} model - Prisma model name
 * @param {object} where - Where clause
 * @param {object} options - Additional Prisma options
 * @returns {Promise<object|null>} Active record or null
 */
export const findUniqueActive = async (model, where, options = {}) => {
  const record = await prisma[model].findUnique({
    where,
    ...options,
  });

  // Return null if soft-deleted
  if (record && record.deletedAt) {
    return null;
  }

  return record;
};

/**
 * Count active records (excluding soft-deleted)
 * @param {string} model - Prisma model name
 * @param {object} where - Where clause
 * @returns {Promise<number>} Count of active records
 */
export const countActive = async (model, where = {}) => {
  return await prisma[model].count({
    where: { ...where, deletedAt: null },
  });
};

/**
 * Restore a soft-deleted record
 * @param {string} model - Prisma model name
 * @param {string} id - Record ID to restore
 * @returns {Promise<object>} Restored record
 */
export const restoreSoftDeleted = async (model, id) => {
  return await prisma[model].update({
    where: { id },
    data: { deletedAt: null },
  });
};
