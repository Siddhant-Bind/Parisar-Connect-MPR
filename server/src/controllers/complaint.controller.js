import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import prisma from "../db/prisma.js";

const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!title || !description || !category) {
    throw new ApiError(400, "Title, description, and category are required");
  }

  const complaint = await prisma.complaint.create({
    data: {
      title,
      description,
      category,
      priority: priority || "MEDIUM",
      residentId: req.user.id,
      societyId: req.user.societyId,
      history: [
        { status: "OPEN", remark: "Complaint raised", updatedAt: new Date() },
      ],
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, complaint, "Complaint raised successfully"));
});

const getAllComplaints = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  if (!req.user.societyId) {
    throw new ApiError(400, "User is not associated with any society");
  }

  let filter = { societyId: req.user.societyId, deletedAt: null };
  if (req.user.role === "RESIDENT") {
    // Residents see their own complaints + all GENERAL complaints in the society
    filter = {
      AND: [
        { societyId: req.user.societyId },
        { deletedAt: null },
        {
          OR: [{ residentId: req.user.id }, { category: "GENERAL" }],
        },
      ],
    };
  }

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      include: {
        resident: {
          select: { name: true, flatNumber: true, wing: true },
        },
      },
      skip,
      take: limit,
    }),
    prisma.complaint.count({ where: filter }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: complaints,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Complaints fetched successfully",
    ),
  );
});

// GET /complaints/:id
const getComplaintById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      resident: {
        select: { name: true, flatNumber: true, wing: true },
      },
    },
  });

  if (!complaint) throw new ApiError(404, "Complaint not found");

  // Residents can only see their own complaints
  if (req.user.role === "RESIDENT" && complaint.residentId !== req.user.id) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, complaint, "Complaint fetched"));
});

// PATCH /complaints/:id/status  (Admin only — enforced at route level)
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remark } = req.body;

  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) throw new ApiError(404, "Complaint not found");
  if (complaint.societyId !== req.user.societyId)
    throw new ApiError(403, "Access denied");
  if (complaint.deletedAt)
    throw new ApiError(404, "Complaint has been deleted");

  const newHistoryEntry = {
    status,
    remark: remark || `Status updated to ${status}`,
    updatedAt: new Date(),
    updatedBy: req.user.id,
  };

  const updatedHistory = Array.isArray(complaint.history)
    ? [...complaint.history, newHistoryEntry]
    : [newHistoryEntry];

  const updatedComplaint = await prisma.complaint.update({
    where: { id },
    data: { status, history: updatedHistory },
    include: { resident: { select: { id: true } } },
  });

  // Notify the resident about the status change
  if (updatedComplaint.resident?.id) {
    await prisma.notification.create({
      data: {
        title: "Complaint Status Updated",
        message: `Your complaint "${updatedComplaint.title}" status has been changed to ${status}.`,
        type: "COMPLAINT",
        userId: updatedComplaint.resident.id,
        societyId: updatedComplaint.societyId,
      },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComplaint, "Complaint status updated"));
});

// DELETE /complaints/:id  (Admin only — enforced at route level)
const deleteComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) throw new ApiError(404, "Complaint not found");
  if (complaint.societyId !== req.user.societyId)
    throw new ApiError(403, "Access denied");
  if (complaint.deletedAt)
    throw new ApiError(404, "Complaint has already been deleted");

  await prisma.complaint.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return res.status(200).json(new ApiResponse(200, {}, "Complaint deleted"));
});

export {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
};
