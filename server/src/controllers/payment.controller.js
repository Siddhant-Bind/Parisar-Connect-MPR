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
      dueDate: new Date(dueDate), // Ensure Date object
      month,
      status: "PENDING",
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
  const filter = {};
  if (req.user.role === "RESIDENT") {
    filter.residentId = req.user.id;
  }

  const payments = await prisma.payment.findMany({
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
  });

  return res
    .status(200)
    .json(new ApiResponse(200, payments, "Payments fetched"));
});

export { createPaymentRequest, markAsPaid, getAllPayments };
