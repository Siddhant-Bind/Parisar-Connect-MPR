import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

// Register Resident Schema
export const registerResidentSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    wing: z.string().min(1, "Wing is required").max(10),
    flatNumber: z.string().min(1, "Flat number is required").max(10),
    contact: z
      .string()
      .regex(/^\+?[\d\s-]{10,15}$/, "Invalid contact number")
      .optional(),
  }),
});

// Register Guard Schema
export const registerGuardSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    contact: z
      .string()
      .regex(/^\+?[\d\s-]{10,15}$/, "Invalid contact number")
      .optional(),
  }),
});

// Change Password Schema
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  }),
});
