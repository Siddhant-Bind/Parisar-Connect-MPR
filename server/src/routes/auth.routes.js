import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerAdmin,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, registerAdminSchema } from "../validators/auth.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import supabase from "../db/supabase.js";
import prisma from "../db/prisma.js";

const router = Router();

// POST /auth/register  → Admin self-registration (role hardcoded to ADMIN)
router.route("/register").post(validate(registerAdminSchema), registerAdmin);

// POST /auth/login
router.route("/login").post(validate(loginSchema), loginUser);

// POST /auth/logout  (requires JWT)
router.route("/logout").post(verifyJWT, logoutUser);

// POST /auth/change-password  (requires JWT)
router.route("/change-password").post(
  verifyJWT,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Current password and new password are required");
    }

    if (newPassword.length < 8) {
      throw new ApiError(400, "New password must be at least 8 characters");
    }

    // Verify current password via Supabase signIn
    // Note: signInWithPassword creates a Supabase session as a side-effect,
    // but our auth is JWT-based via cookies, so the session is not used.
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: currentPassword,
    });

    if (verifyError) {
      throw new ApiError(401, "Current password is incorrect");
    }

    // Update password via Supabase Admin API
    const { error } = await supabase.auth.admin.updateUserById(req.user.id, {
      password: newPassword,
    });

    if (error) {
      throw new ApiError(500, error.message || "Failed to update password");
    }

    // Clear mustChangePassword flag
    await prisma.user.update({
      where: { id: req.user.id },
      data: { mustChangePassword: false },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"));
  }),
);

// POST /auth/forget-password  (Supabase sends password reset email)
router.route("/forget-password").post(
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      // Don't reveal whether the email exists for security
      console.error("Password reset error:", error.message);
    }

    // Always return success to prevent email enumeration
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If the email exists, a password reset link has been sent",
        ),
      );
  }),
);

// POST /auth/refreshtoken  (Supabase handles client-side)
router.route("/refreshtoken").post(
  asyncHandler(async (req, res) => {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Token refresh is handled client-side via Supabase SDK",
        ),
      );
  }),
);

export default router;
