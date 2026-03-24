import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import prisma from "../db/prisma.js";

const createNotice = asyncHandler(async (req, res) => {
  const { title, content, type, priority } = req.body;

  if (!title || !content) {
    throw new ApiError(400, "Title and content are required");
  }

  const notice = await prisma.notice.create({
    data: {
      title,
      content,
      type: type || "INFO",
      priority: priority || "LOW",
      societyId: req.user.societyId,
    },
  });

  // Notify all residents
  const residents = await prisma.user.findMany({
    where: { societyId: req.user.societyId, role: "RESIDENT", deletedAt: null },
    select: { id: true },
  });

  if (residents.length > 0) {
    await prisma.notification.createMany({
      data: residents.map((r) => ({
        title: `New Notice: ${title}`,
        message:
          content.substring(0, 100) + (content.length > 100 ? "..." : ""),
        type: "NOTICE",
        userId: r.id,
        societyId: req.user.societyId,
      })),
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, notice, "Notice created successfully"));
});

const getAllNotices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where: { societyId: req.user.societyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notice.count({
      where: { societyId: req.user.societyId, deletedAt: null },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: notices,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Notices fetched successfully",
    ),
  );
});

// GET /notices/:id
const getNoticeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice || notice.deletedAt) throw new ApiError(404, "Notice not found");
  if (notice.societyId !== req.user.societyId)
    throw new ApiError(403, "Access denied");

  return res.status(200).json(new ApiResponse(200, notice, "Notice fetched"));
});

// PATCH or PUT /notices/:id  (Admin only — enforced at route level)
const updateNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, type, priority } = req.body;

  const existing = await prisma.notice.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) throw new ApiError(404, "Notice not found");
  if (existing.societyId !== req.user.societyId)
    throw new ApiError(403, "Access denied");

  const notice = await prisma.notice.update({
    where: { id },
    data: { title, content, type, priority },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, notice, "Notice updated successfully"));
});

// DELETE /notices/:id  (Admin only — enforced at route level)
const deleteNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.notice.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) throw new ApiError(404, "Notice not found");
  if (existing.societyId !== req.user.societyId)
    throw new ApiError(403, "Access denied");

  await prisma.notice.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Notice deleted successfully"));
});

export {
  createNotice,
  getAllNotices,
  getNoticeById,
  deleteNotice,
  updateNotice,
};
