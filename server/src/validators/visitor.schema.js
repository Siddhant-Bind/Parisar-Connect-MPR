import { z } from "zod";
import { VISITOR_STATUS } from "../constants.js";

// Create Visitor Schema
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
      .regex(/^\+?[\d\s-]{10,15}$/, "Invalid contact number")
      .optional(),
    visitorType: z.enum(["Guest", "Delivery", "Staff"]).default("Guest"),
    vehicleNumber: z.string().max(20).optional(),
    documentImage: z.string().optional(), // Base64 or URL
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
