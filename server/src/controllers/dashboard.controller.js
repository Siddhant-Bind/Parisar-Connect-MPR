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
    societyData,
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
    prisma.society.findUnique({
      where: { id: sid },
      select: { name: true }
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
    societyName: societyData?.name || "Your Society",
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard stats fetched"));
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const sid = req.user.societyId;
  if (!sid) {
    throw new ApiError(400, "User is not associated with any society");
  }

  // Fetch recent entries from all major activities
  const [visitors, complaints, payments] = await Promise.all([
    prisma.visitor.findMany({
      where: { societyId: sid, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    prisma.complaint.findMany({
      where: { societyId: sid, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { resident: { select: { name: true, wing: true, flatNumber: true } } }
    }),
    prisma.payment.findMany({
      where: { societyId: sid, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { resident: { select: { name: true, wing: true, flatNumber: true } } }
    })
  ]);

  // Normalize mapping for frontend presentation
  const activities = [
    ...visitors.map(v => ({
      id: v.id,
      type: 'VISITOR',
      title: `Visitor: ${v.name}`,
      description: v.status === 'ENTERED' ? 'Checked in' : v.status === 'APPROVED' ? 'Pre-approved' : v.status === 'EXITED' ? 'Checked out' : 'Pending',
      timestamp: v.updatedAt,
      icon: 'Shield'
    })),
    ...complaints.map(c => ({
      id: c.id,
      type: 'COMPLAINT',
      title: `Complaint: ${c.title}`,
      description: `${c.status.replace("_", " ")} | By ${c.resident?.wing}-${c.resident?.flatNumber} (${c.resident?.name})`,
      timestamp: c.updatedAt,
      icon: 'Bell'
    })),
    ...payments.map(p => ({
      id: p.id,
      type: 'PAYMENT',
      title: `Payment: ₹${p.amount}`,
      description: `${p.status} | By ${p.resident?.wing}-${p.resident?.flatNumber} (${p.resident?.name})`,
      timestamp: p.updatedAt,
      icon: 'CreditCard'
    }))
  ];

  // Sort universally by exact time and crop strictly to 5
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recent5 = activities.slice(0, 5);

  return res.status(200).json(new ApiResponse(200, recent5, "Recent activities fetched"));
});

export { getDashboardStats, getRecentActivity };
