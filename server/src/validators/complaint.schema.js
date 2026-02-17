import { z } from "zod";
import { COMPLAINT_STATUS, COMPLAINT_PRIORITY } from "../constants.js";

// Create Complaint Schema
export const createComplaintSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(200),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(2000),
    category: z.string().min(2, "Category is required").max(100),
    priority: z
      .enum([
        COMPLAINT_PRIORITY.LOW,
        COMPLAINT_PRIORITY.MEDIUM,
        COMPLAINT_PRIORITY.HIGH,
      ])
      .default(COMPLAINT_PRIORITY.MEDIUM),
  }),
});

// Update Complaint Status Schema
export const updateComplaintStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid complaint ID"),
  }),
  body: z.object({
    status: z.enum([
      COMPLAINT_STATUS.OPEN,
      COMPLAINT_STATUS.IN_PROGRESS,
      COMPLAINT_STATUS.RESOLVED,
      COMPLAINT_STATUS.REJECTED,
    ]),
    remark: z.string().max(500).optional(),
  }),
});
