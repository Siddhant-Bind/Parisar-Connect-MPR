import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import prisma from "../db/prisma.js";

// GET /societies  → public — returns all active societies for the "Join" dropdown
const listSocieties = asyncHandler(async (req, res) => {
  const societies = await prisma.society.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, name: true, address: true },
    orderBy: { name: "asc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, societies, "Societies fetched"));
});

// POST /societies/create  → Admin creates a new society
// Sets creatorId = req.user.id and assigns this society back to the admin's profile
const createSociety = asyncHandler(async (req, res) => {
  const { name, address } = req.body;

  if (!name) throw new ApiError(400, "Society name is required");

  // Check if society name already exists
  const existing = await prisma.society.findFirst({
    where: { name, deletedAt: null },
  });
  if (existing)
    throw new ApiError(409, "A society with this name already exists");

  // Create society and assign it to the admin in a transaction
  const society = await prisma.$transaction(async (tx) => {
    const newSociety = await tx.society.create({
      data: {
        name,
        address: address || null,
        creatorId: req.user.id,
      },
    });

    // Assign the new society to this admin user
    await tx.user.update({
      where: { id: req.user.id },
      data: {
        societyId: newSociety.id,
        isApprovedAdmin: true, // Creator is auto-approved
      },
    });

    return newSociety;
  });

  return res
    .status(201)
    .json(new ApiResponse(201, society, "Society created successfully"));
});

// POST /societies/join  → Admin requests to join an existing society
const joinSociety = asyncHandler(async (req, res) => {
  const { societyId } = req.body;

  if (!societyId) throw new ApiError(400, "Society ID is required");

  const society = await prisma.society.findUnique({
    where: { id: societyId, deletedAt: null },
  });

  if (!society) throw new ApiError(404, "Society not found");

  // If admin already has a society, prevent double-join
  if (req.user.societyId) {
    throw new ApiError(400, "You are already part of a society");
  }

  // Assign society — pending approval by Creator Admin
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      societyId,
      isApprovedAdmin: false, // Must be approved by creator
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { societyId },
        "Join request submitted. Awaiting Creator Admin approval.",
      ),
    );
});

// GET /societies/admins/pending  → Creator Admin only
const getPendingAdmins = asyncHandler(async (req, res) => {
  if (!req.user.societyId) {
    throw new ApiError(400, "You are not associated with any society");
  }

  // Verify current admin is the creator of the society
  const society = await prisma.society.findUnique({
    where: { id: req.user.societyId },
  });

  if (!society || society.creatorId !== req.user.id) {
    throw new ApiError(403, "Only the Society Creator can view pending admins");
  }

  const pending = await prisma.user.findMany({
    where: {
      societyId: req.user.societyId,
      role: "ADMIN",
      isApprovedAdmin: false,
      deletedAt: null,
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, pending, "Pending admins fetched"));
});

// PATCH /societies/admins/:id/approve  → Creator Admin only
const approveAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify current admin is the creator of the society
  const society = await prisma.society.findUnique({
    where: { id: req.user.societyId },
  });

  if (!society || society.creatorId !== req.user.id) {
    throw new ApiError(403, "Only the Society Creator can approve admins");
  }

  const adminToApprove = await prisma.user.findUnique({
    where: { id },
  });

  if (
    !adminToApprove ||
    adminToApprove.societyId !== req.user.societyId ||
    adminToApprove.role !== "ADMIN" ||
    adminToApprove.deletedAt !== null
  ) {
    throw new ApiError(404, "Pending admin not found in this society");
  }

  if (adminToApprove.isApprovedAdmin) {
    throw new ApiError(400, "Admin is already approved");
  }

  const updatedAdmin = await prisma.user.update({
    where: { id },
    data: { isApprovedAdmin: true },
    select: { id: true, name: true, email: true, isApprovedAdmin: true },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedAdmin, "Admin approved successfully"));
});

export {
  listSocieties,
  createSociety,
  joinSociety,
  getPendingAdmins,
  approveAdmin,
};
