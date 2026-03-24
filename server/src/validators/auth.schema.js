import { z } from "zod";

// ── Auth schemas ──────────────────────────────────────

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

// ── Resident registration ─────────────────────────────

export const registerResidentSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
    contact: z
      .string()
      .regex(/^\+?[\d\s-]{10,15}$/, "Invalid contact number")
      .optional(),
    wing: z.string().min(1, "Wing is required"),
    flatNumber: z.string().min(1, "Flat number is required"),
  }),
});

// ── Guard registration ────────────────────────────────

export const registerGuardSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    contact: z
      .string()
      .regex(/^\+?[\d\s-]{10,15}$/, "Invalid contact number")
      .optional(),
  }),
});

// ── Admin registration ────────────────────────────────

export const registerAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    contact: z
      .string()
      .regex(/^\+?[\d\s-]{10,15}$/, "Invalid contact number")
      .optional(),
  }),
});
