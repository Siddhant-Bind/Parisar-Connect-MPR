import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import prisma from "../db/prisma.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  const sid = req.user.societyId;
  if (!sid) {
    throw new ApiError(400, "User is not associated with any society");
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Parallel execution for performance — all scoped to society
  const [
    totalResidents,
    openComplaints,
    pendingPaymentsCount,
    visitorsToday,
    currentVisitors,
    pendingApprovals,
  ] = await Promise.all([
    prisma.user.count({
      where: { role: "RESIDENT", societyId: sid, deletedAt: null },
    }),
    prisma.complaint.count({
      where: { status: "OPEN", societyId: sid, deletedAt: null },
    }),
    prisma.payment.count({
      where: { status: "PENDING", societyId: sid, deletedAt: null },
    }),
    prisma.visitor.count({
      where: {
        societyId: sid,
        deletedAt: null,
        entryTime: {
          gte: today,
          lt: tomorrow,
        },
      },
    }),
    prisma.visitor.count({
      where: { status: "ENTERED", societyId: sid, deletedAt: null },
    }),
    prisma.visitor.count({
      where: { status: "APPROVED", societyId: sid, deletedAt: null },
    }),
  ]);

  // Calculate collection rate
  const totalPayments = await prisma.payment.count({
    where: { societyId: sid, deletedAt: null },
  });
  const paidPayments = await prisma.payment.count({
    where: { status: "PAID", societyId: sid, deletedAt: null },
  });
  const collectionRate =
    totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0;

  const stats = {
    totalResidents,
    openComplaints,
    pendingPayments: pendingPaymentsCount,
    collectionRate,
    visitorsToday,
    currentVisitors,
    pendingApprovals,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard stats fetched"));
});

export { getDashboardStats };
