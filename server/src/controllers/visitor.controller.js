import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import prisma from "../db/prisma.js";

const logVisitorEntry = asyncHandler(async (req, res) => {
  const { name, purpose, wing, flatNumber, documentImage } = req.body;

  // Determine status based on role
  // If Admin/Guard adds it -> ENTERED (Log Entry)
  // If Resident adds it -> APPROVED (Pre-approval)
  const status = req.user.role === "RESIDENT" ? "APPROVED" : "ENTERED";

  const visitor = await prisma.visitor.create({
    data: {
      name,
      purpose,
      wing,
      flatNumber,
      status,
      documentImage: req.user.role === "RESIDENT" ? null : documentImage, // Residents don't scan docs
      enteredBy: req.user.id,
      entryTime: new Date(),
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, visitor, "Visitor entry logged"));
});

const logVisitorExit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const visitor = await prisma.visitor.update({
      where: { id },
      data: {
        status: "EXITED",
        exitTime: new Date(),
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, visitor, "Visitor exit logged"));
  } catch (error) {
    throw new ApiError(404, "Visitor log not found");
  }
});

const getAllVisitors = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "RESIDENT") {
    filter.wing = req.user.wing;
    filter.flatNumber = req.user.flatNumber;
  }

  const visitors = await prisma.visitor.findMany({
    where: filter,
    orderBy: { entryTime: "desc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, visitors, "Visitor logs fetched"));
});

export { logVisitorEntry, logVisitorExit, getAllVisitors };
