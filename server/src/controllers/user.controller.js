import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import supabase from "../db/supabase.js";
import prisma from "../db/prisma.js";
import crypto from "crypto";

const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, contact } = req.body;

  if ([name, email, password].some((f) => !f?.trim())) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new ApiError(409, "User with email already exists");

  // Create auth user in Supabase (role = ADMIN)
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "ADMIN" },
    });

  if (authError || !authData.user) {
    throw new ApiError(500, authError?.message || "Failed to create auth user");
  }

  // Create profile in Prisma — no societyId yet (set after society creation/join)
  try {
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        name,
        email,
        role: "ADMIN",
        contact: contact || null,
        // societyId will be set when admin creates/joins a society
      },
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { id: user.id, name: user.name, email: user.email, role: user.role },
          "Admin registered successfully",
        ),
      );
  } catch (error) {
    // Rollback Supabase user if Prisma fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new ApiError(
      500,
      "Failed to create user profile in database. Auth account rolled back.",
    );
  }
});

const registerResident = asyncHandler(async (req, res) => {
  const { name, email, password, contact, wing, flatNumber } = req.body;

  if (
    [name, email, contact, wing, flatNumber].some(
      (field) => field?.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required except password");
  }

  // Generate a random temporary password if none provided
  const tempPassword =
    password?.trim() || crypto.randomBytes(12).toString("base64url") + "!A1";

  // Check if user exists in Prisma (Profile) or Supabase (Auth)
  // Ideally check Supabase first or rely on error.
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "User with email already exists");
  }

  // Create auth user in Supabase
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm for now
      user_metadata: { name, role: "RESIDENT" },
    });

  if (authError || !authData.user) {
    throw new ApiError(500, authError?.message || "Failed to create auth user");
  }

  // Create profile in Prisma
  try {
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        name,
        email,
        role: "RESIDENT",
        wing,
        flatNumber,
        contact: contact || null,
        societyId: req.user.societyId,
        mustChangePassword: true, // Force change on first login
      },
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { ...user, tempPassword },
          "Resident registered successfully",
        ),
      );
  } catch (error) {
    // Rollback Supabase user if Prisma fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new ApiError(
      500,
      "Failed to create user profile in database. Auth account rolled back.",
    );
  }
});

const getAllResidents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [residents, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "RESIDENT",
        societyId: req.user.societyId,
        deletedAt: null,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({
      where: {
        role: "RESIDENT",
        societyId: req.user.societyId,
        deletedAt: null,
      },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: residents,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Residents fetched successfully",
    ),
  );
});

const deleteResident = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Delete from Auth (Supabase)
  await supabase.auth.admin.deleteUser(id);

  // Soft delete from Prisma
  const user = await prisma.user.update({
    where: { id, societyId: req.user.societyId },
    data: { deletedAt: new Date() },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Resident deleted successfully"));
});

const getResidentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Allow self-access or admin
  if (req.user.role !== "ADMIN" && req.user.id !== id) {
    throw new ApiError(403, "Access denied");
  }

  const user = await prisma.user.findUnique({
    where: { id, role: "RESIDENT", societyId: req.user.societyId },
  });

  if (!user) throw new ApiError(404, "Resident not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Resident fetched successfully"));
});

const updateResident = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, contact, wing, flatNumber } = req.body;

  // Allow self-access or admin
  if (req.user.role !== "ADMIN" && req.user.id !== id) {
    throw new ApiError(403, "Access denied");
  }

  const user = await prisma.user.update({
    where: { id, societyId: req.user.societyId },
    data: { name, email, wing, flatNumber, contact },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Resident updated successfully"));
});

const registerGuard = asyncHandler(async (req, res) => {
  const { name, email, password, contact } = req.body;

  if ([name, email, password, contact].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "User with email already exists");
  }

  // Create auth user
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "GUARD" },
    });

  if (authError || !authData.user) {
    throw new ApiError(500, authError?.message || "Failed to create auth user");
  }

  // Create profile
  try {
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        name,
        email,
        role: "GUARD",
        contact: contact || null,
        societyId: req.user.societyId,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, user, "Guard registered successfully"));
  } catch (error) {
    // Rollback Supabase user if Prisma fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new ApiError(
      500,
      "Failed to create user profile in database. Auth account rolled back.",
    );
  }
});

const getAllGuards = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [guards, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: "GUARD", societyId: req.user.societyId, deletedAt: null },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({
      where: { role: "GUARD", societyId: req.user.societyId, deletedAt: null },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: guards,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Guards fetched successfully",
    ),
  );
});

const getGuardById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const guard = await prisma.user.findUnique({
    where: { id, role: "GUARD", societyId: req.user.societyId },
  });

  if (!guard) throw new ApiError(404, "Guard not found");

  return res
    .status(200)
    .json(new ApiResponse(200, guard, "Guard fetched successfully"));
});

const deleteGuard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await supabase.auth.admin.deleteUser(id);
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Guard deleted successfully"));
});

const updateGuard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, contact } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { name, email },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Guard updated successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "username or email is required");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const user = await prisma.user.findUnique({
    where: { id: data.user.id },
  });

  if (!user) {
    throw new ApiError(404, "User profile not found in database.");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", data.session.access_token, options)
    .cookie("refreshToken", data.session.refresh_token, options)
    .json(
      new ApiResponse(
        200,
        {
          user,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        },
        "User logged In Successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Supabase stateless auth, just clear cookies
  // Optionally: await supabase.auth.admin.signOut(req.user.session_id) if we tracked it

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

export {
  loginUser,
  logoutUser,
  registerAdmin,
  registerResident,
  getAllResidents,
  getResidentById,
  deleteResident,
  updateResident,
  registerGuard,
  getAllGuards,
  getGuardById,
  deleteGuard,
  updateGuard,
};
