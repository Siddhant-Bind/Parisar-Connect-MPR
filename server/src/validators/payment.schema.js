import { z } from "zod";
import { PAYMENT_STATUS } from "../constants.js";

// Create Payment Request Schema
export const createPaymentSchema = z.object({
  body: z.object({
    residentId: z.string().uuid("Invalid resident ID"),
    amount: z.number().positive("Amount must be greater than 0"),
    type: z.string().min(2, "Payment type is required").max(100),
    dueDate: z.string().datetime("Invalid due date format"),
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format")
      .optional(),
  }),
});

// Mark Payment as Paid Schema
export const markPaymentPaidSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid payment ID"),
  }),
});
