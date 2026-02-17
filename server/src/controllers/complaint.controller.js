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
  const filter = {};
  if (req.user.role === "RESIDENT") {
    filter.residentId = req.user.id;
  }

  const complaints = await prisma.complaint.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
    include: {
      resident: {
        select: {
          name: true,
          flatNumber: true,
          wing: true,
        },
      },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, complaints, "Complaints fetched successfully"));
});

const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remark } = req.body;

  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

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
    data: {
      status,
      history: updatedHistory,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComplaint, "Complaint status updated"));
});

export { createComplaint, getAllComplaints, updateComplaintStatus };
