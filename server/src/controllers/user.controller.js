import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import supabase from "../db/supabase.js";
import prisma from "../db/prisma.js";

const registerResident = asyncHandler(async (req, res) => {
  const { name, email, password, contact, wing, flatNumber } = req.body;

  if (
    [name, email, password, contact, wing, flatNumber].some(
      (field) => field?.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

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
      password,
      email_confirm: true, // Auto-confirm for now
      user_metadata: { name, role: "RESIDENT" },
    });

  if (authError || !authData.user) {
    throw new ApiError(500, authError?.message || "Failed to create auth user");
  }

  // Create profile in Prisma
  const user = await prisma.user.create({
    data: {
      id: authData.user.id,
      name,
      email,
      role: "RESIDENT",
      wing,
      flatNumber,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(200, user, "Resident registered successfully"));
});

const getAllResidents = asyncHandler(async (req, res) => {
  const residents = await prisma.user.findMany({
    where: { role: "RESIDENT" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, residents, "Residents fetched successfully"));
});

const deleteResident = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Delete from Auth (Supabase)
  await supabase.auth.admin.deleteUser(id);

  // Delete from Prisma (Cascade should handle relations if configured, user might need explicit delete)
  const user = await prisma.user.delete({
    where: { id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Resident deleted successfully"));
});

const updateResident = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, contact, wing, flatNumber } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      wing,
      flatNumber,
    },
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
  const user = await prisma.user.create({
    data: {
      id: authData.user.id,
      name,
      email,
      role: "GUARD",
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(200, user, "Guard registered successfully"));
});

const getAllGuards = asyncHandler(async (req, res) => {
  const guards = await prisma.user.findMany({
    where: { role: "GUARD" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, guards, "Guards fetched successfully"));
});

const deleteGuard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await supabase.auth.admin.deleteUser(id);
  await prisma.user.delete({ where: { id } });

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
  registerResident,
  getAllResidents,
  deleteResident,
  updateResident,
  registerGuard,
  getAllGuards,
  deleteGuard,
  updateGuard,
};
