import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import prisma from "../db/prisma.js";

// GET /notifications  → Fetch all notifications for the logged-in user
const getMyNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.max(1, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({
      where: { userId: req.user.id },
    }),
    prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: notifications,
        unreadCount,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Notifications fetched",
    ),
  );
});

// PATCH /notifications/:id/read  → Mark a specific notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification || notification.userId !== req.user.id) {
    throw new ApiError(404, "Notification not found");
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Notification marked as read"));
});

// PATCH /notifications/read-all  → Mark all of the user's notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedCount: result.count },
        "All notifications marked as read",
      ),
    );
});

// GET /notifications/count  → Fetch lightweight unread count for polling
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.user.id, isRead: false },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { count }, "Unread count fetched"));
});

export { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount };
