import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import prisma from "../db/prisma.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Parallel execution for performance
  const [
    totalResidents,
    openComplaints,
    pendingPaymentsCount,
    visitorsToday,
    currentVisitors,
    pendingApprovals,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "RESIDENT" } }),
    prisma.complaint.count({ where: { status: "OPEN" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.visitor.count({
      where: {
        entryTime: {
          gte: today,
          lt: tomorrow,
        },
      },
    }),
    prisma.visitor.count({ where: { status: "ENTERED" } }),
    prisma.visitor.count({ where: { status: "APPROVED" } }),
  ]);

  // Calculate collection rate (mock logic for now or simple ratio)
  const totalPayments = await prisma.payment.count();
  const paidPayments = await prisma.payment.count({
    where: { status: "PAID" },
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
