import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import prisma from "../db/prisma.js";

const createPaymentRequest = asyncHandler(async (req, res) => {
  const { residentId, amount, type, dueDate, month } = req.body;

  const payment = await prisma.payment.create({
    data: {
      residentId,
      amount,
      type,
      dueDate: new Date(dueDate),
      month,
      status: "PENDING",
      societyId: req.user.societyId,
    },
  });

  // Notify the resident about new payment
  await prisma.notification.create({
    data: {
      title: `New Payment Request`,
      message: `A new payment of ₹${amount} for ${type} is due by ${dueDate}`,
      type: "PAYMENT",
      userId: residentId,
      societyId: req.user.societyId,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, payment, "Payment request created"));
});

const markAsPaid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // paymentMethod, transactionId might be stored if we add fields to schema.
  // Current schema only has status. I can add fields or just update status.
  // For now updating status.

  try {
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status: "PAID",
        // paidDate: new Date(), // If added to schema
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, payment, "Marked as paid"));
  } catch (error) {
    throw new ApiError(404, "Payment record not found");
  }
});

const getAllPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search?.trim() || "";

  // Build the base filter
  const baseFilter = { societyId: req.user.societyId, deletedAt: null };
  if (req.user.role === "RESIDENT") {
    baseFilter.residentId = req.user.id;
  }

  // Build the final where clause — combine base filter with search using AND
  let filter;
  if (search) {
    filter = {
      AND: [
        baseFilter,
        {
          OR: [
            { type: { contains: search, mode: "insensitive" } },
            { month: { contains: search, mode: "insensitive" } },
            { resident: { name: { contains: search, mode: "insensitive" } } },
            { resident: { flatNumber: { contains: search, mode: "insensitive" } } },
          ],
        },
      ],
    };
  } else {
    filter = baseFilter;
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: filter,
      include: {
        resident: {
          select: {
            name: true,
            flatNumber: true,
            wing: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where: filter }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: payments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Payments fetched",
    ),
  );
});

const createBulkPaymentRequest = asyncHandler(async (req, res) => {
  const { amount, type, dueDate, month } = req.body;

  if (!amount || !type || !dueDate) {
    throw new ApiError(400, "Amount, type, and dueDate are required");
  }

  // Get all residents in the society
  const residents = await prisma.user.findMany({
    where: { societyId: req.user.societyId, role: "RESIDENT", deletedAt: null },
    select: { id: true },
  });

  if (residents.length === 0) {
    throw new ApiError(400, "No active residents found in this society");
  }

  // Create payment requests for all residents
  const paymentData = residents.map((r) => ({
    residentId: r.id,
    amount,
    type,
    dueDate: new Date(dueDate),
    month: month || null,
    status: "PENDING",
    societyId: req.user.societyId,
  }));

  // Wrap payments + notifications in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.payment.createMany({
      data: paymentData,
    });

    // Notify all residents
    await tx.notification.createMany({
      data: residents.map((r) => ({
        title: `New Payment Request`,
        message: `A new payment of ₹${amount} for ${type} is due by ${dueDate}`,
        type: "PAYMENT",
        userId: r.id,
        societyId: req.user.societyId,
      })),
    });
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        null,
        `Bulk payment created for ${residents.length} residents`,
      ),
    );
});

export {
  createPaymentRequest,
  markAsPaid,
  getAllPayments,
  createBulkPaymentRequest,
};
