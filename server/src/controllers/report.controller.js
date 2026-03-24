import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import prisma from "../db/prisma.js";

/**
 * GET /reports/stats
 * Returns aggregated analytics for the admin's society.
 */
const getReportStats = asyncHandler(async (req, res) => {
  const sid = req.user.societyId;

  // ── 1. Summary counts (parallel) ─────────────────────────
  const [
    totalResidents,
    totalComplaints,
    openComplaints,
    resolvedComplaints,
    totalPayments,
    paidPayments,
    pendingPaymentAmount,
    paidPaymentAmount,
    totalVisitors,
    visitorsThisMonth,
  ] = await Promise.all([
    prisma.user.count({
      where: { role: "RESIDENT", societyId: sid, deletedAt: null },
    }),
    prisma.complaint.count({
      where: { societyId: sid, deletedAt: null },
    }),
    prisma.complaint.count({
      where: {
        societyId: sid,
        deletedAt: null,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    }),
    prisma.complaint.count({
      where: {
        societyId: sid,
        deletedAt: null,
        status: { in: ["RESOLVED", "REJECTED"] },
      },
    }),
    prisma.payment.count({
      where: { societyId: sid, deletedAt: null },
    }),
    prisma.payment.count({
      where: { societyId: sid, deletedAt: null, status: "PAID" },
    }),
    prisma.payment.aggregate({
      where: { societyId: sid, deletedAt: null, status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { societyId: sid, deletedAt: null, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.visitor.count({
      where: { societyId: sid, deletedAt: null },
    }),
    prisma.visitor.count({
      where: {
        societyId: sid,
        deletedAt: null,
        entryTime: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  const complaintResolutionRate =
    totalComplaints > 0
      ? Math.round((resolvedComplaints / totalComplaints) * 100)
      : 0;

  const paymentCollectionRate =
    totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0;

  // ── 2. Monthly complaints (last 6 months) ────────────────
  // Use Date.UTC to avoid setMonth() edge cases at month boundaries
  const now = new Date();
  const sixMonthsAgo = new Date(
    Date.UTC(now.getFullYear(), now.getMonth() - 6, 1)
  );

  const rawComplaints = await prisma.complaint.findMany({
    where: {
      societyId: sid,
      deletedAt: null,
      createdAt: { gte: sixMonthsAgo },
    },
    select: { createdAt: true, status: true },
  });

  const monthlyComplaints = groupByMonth(
    rawComplaints,
    (c) => c.createdAt,
    (acc, c) => {
      acc.total += 1;
      if (c.status === "OPEN" || c.status === "IN_PROGRESS") acc.open += 1;
      else acc.resolved += 1;
    },
    () => ({ open: 0, resolved: 0, total: 0 }),
  );

  // ── 3. Monthly payments (last 6 months) ──────────────────
  const rawPayments = await prisma.payment.findMany({
    where: {
      societyId: sid,
      deletedAt: null,
      createdAt: { gte: sixMonthsAgo },
    },
    select: { createdAt: true, status: true, amount: true },
  });

  const monthlyPayments = groupByMonth(
    rawPayments,
    (p) => p.createdAt,
    (acc, p) => {
      if (p.status === "PAID") acc.paid += p.amount;
      else acc.pending += p.amount;
    },
    () => ({ paid: 0, pending: 0 }),
  );

  // ── 4. Monthly visitors (last 6 months) ──────────────────
  const rawVisitors = await prisma.visitor.findMany({
    where: {
      societyId: sid,
      deletedAt: null,
      entryTime: { gte: sixMonthsAgo },
    },
    select: { entryTime: true },
  });

  const monthlyVisitors = groupByMonth(
    rawVisitors,
    (v) => v.entryTime,
    (acc) => {
      acc.count += 1;
    },
    () => ({ count: 0 }),
  );

  // ── 5. Top complaint categories ──────────────────────────
  const categoryGroups = await prisma.complaint.groupBy({
    by: ["category"],
    where: { societyId: sid, deletedAt: null },
    _count: { category: true },
    orderBy: { _count: { category: "desc" } },
    take: 5,
  });

  const topCategories = categoryGroups.map((g) => ({
    category: g.category,
    count: g._count.category,
  }));

  // ── Response ─────────────────────────────────────────────
  const stats = {
    summary: {
      totalResidents,
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      complaintResolutionRate,
      totalPayments,
      paidPayments,
      paymentCollectionRate,
      pendingPaymentAmount: pendingPaymentAmount._sum.amount || 0,
      paidPaymentAmount: paidPaymentAmount._sum.amount || 0,
      totalVisitors,
      visitorsThisMonth,
    },
    monthlyComplaints,
    monthlyPayments,
    monthlyVisitors,
    topCategories,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Report stats fetched"));
});

// ── Helper: group records by month ─────────────────────────
function groupByMonth(records, getDate, accumulate, initAcc) {
  const grouped = {};
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (const record of records) {
    const d = new Date(getDate(record));
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (!grouped[key]) grouped[key] = { month: key, ...initAcc() };
    accumulate(grouped[key], record);
  }

  // Sort chronologically
  const sorted = Object.values(grouped).sort((a, b) => {
    const [aM, aY] = a.month.split(" ");
    const [bM, bY] = b.month.split(" ");
    return (
      new Date(`${aM} 1, ${aY}`).getTime() -
      new Date(`${bM} 1, ${bY}`).getTime()
    );
  });

  return sorted;
}

export { getReportStats };
