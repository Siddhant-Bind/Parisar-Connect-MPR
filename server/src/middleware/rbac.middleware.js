import { ApiError } from "../utils/apiError.js";
import prisma from "../db/prisma.js";
import { ROLES } from "../constants.js";

/**
 * Check if user has one of the allowed roles
 */
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized - User not authenticated");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Forbidden - Requires one of: ${allowedRoles.join(", ")}`,
      );
    }

    next();
  };
};

/**
 * Ensure user belongs to a society
 */
export const checkSociety = (req, res, next) => {
  if (!req.user?.societyId) {
    throw new ApiError(400, "User not assigned to any society");
  }
  next();
};

/**
 * Check if user is the Creator Admin of their society
 * Creator has special permissions: approve admins, delete society
 */
export const checkCreatorAdmin = async (req, res, next) => {
  try {
    if (!req.user?.societyId) {
      throw new ApiError(400, "User not assigned to any society");
    }

    const society = await prisma.society.findUnique({
      where: { id: req.user.societyId },
    });

    if (!society) {
      throw new ApiError(404, "Society not found");
    }

    if (society.creatorId !== req.user.id) {
      throw new ApiError(403, "Only Creator Admin can perform this action");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if admin account is approved
 * New admins must be approved by Creator Admin
 */
export const checkApprovedAdmin = (req, res, next) => {
  if (req.user.role === ROLES.ADMIN && !req.user.isApprovedAdmin) {
    throw new ApiError(403, "Admin account pending approval by Creator Admin");
  }
  next();
};

/**
 * Generic resource ownership validator
 * Ensures user can only access/modify their own resources
 */
export const checkOwnership = (modelName, ownershipField = "userId") => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;

      const resource = await prisma[modelName].findUnique({
        where: { id },
      });

      if (!resource) {
        throw new ApiError(404, `${modelName} not found`);
      }

      // Check ownership
      if (resource[ownershipField] !== req.user.id) {
        throw new ApiError(
          403,
          "You don't have permission to access this resource",
        );
      }

      // Attach resource to request for controller use
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};
