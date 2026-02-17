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
      // createdBy: req.user.id // If we add relation later
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, notice, "Notice created successfully"));
});

const getAllNotices = asyncHandler(async (req, res) => {
  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, notices, "Notices fetched successfully"));
});

const updateNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, type, priority } = req.body;

  try {
    const notice = await prisma.notice.update({
      where: { id },
      data: { title, content, type, priority },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, notice, "Notice updated successfully"));
  } catch (error) {
    throw new ApiError(404, "Notice not found");
  }
});

const deleteNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.notice.delete({ where: { id } });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Notice deleted successfully"));
  } catch (error) {
    throw new ApiError(404, "Notice not found");
  }
});

export { createNotice, getAllNotices, deleteNotice, updateNotice };
