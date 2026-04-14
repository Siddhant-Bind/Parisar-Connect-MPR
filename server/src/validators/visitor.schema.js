import { z } from "zod";
import { VISITOR_STATUS } from "../constants.js";

// Create Visitor Schema
// Note: Some fields (contact, vehicleNumber, documentImage) accept empty strings
// because guards may log walk-ins without these details, and residents pre-approve
// visitors with minimal info. Stricter validation would break these flows.
export const createVisitorSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    purpose: z
      .string()
      .min(3, "Purpose must be at least 3 characters")
      .max(500),
    wing: z.string().min(1, "Wing is required").max(10),
    flatNumber: z.string().min(1, "Flat number is required").max(10),
    contact: z
      .string()
      .regex(/^(\+91)?\d{10}$/, "Invalid phone number (10 digits, optional +91 prefix)")
      .optional()
      .or(z.literal("")), // allow empty strings
    visitorType: z.string().optional(), // allow string from form, or optional
    vehicleNumber: z
      .string()
      .max(20)
      .regex(/^[A-Za-z0-9\s-]*$/, "Vehicle number must be alphanumeric")
      .optional()
      .or(z.literal("")),
    documentImage: z.string().optional().or(z.literal("")).nullable(),
  }),
});

// Update Visitor Exit Schema
export const updateVisitorExitSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid visitor ID"),
  }),
});

// Get Visitors Query Schema
export const getVisitorsQuerySchema = z.object({
  query: z
    .object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      search: z.string().max(100).optional(),
      status: z
        .enum([
          VISITOR_STATUS.PENDING,
          VISITOR_STATUS.APPROVED,
          VISITOR_STATUS.ENTERED,
          VISITOR_STATUS.EXITED,
        ])
        .optional(),
      page: z.string().regex(/^\d+$/).transform(Number).default("1"),
      limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
    })
    .optional(),
});
