import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import prisma from "../db/prisma.js";

const logVisitorEntry = asyncHandler(async (req, res) => {
  const {
    name,
    purpose,
    wing,
    flatNumber,
    contact,
    visitorType,
    vehicleNumber,
    documentImage,
  } = req.body;

  if (!name || !purpose || !wing || !flatNumber) {
    throw new ApiError(400, "Name, purpose, wing and flat number are required");
  }

  // Guard/Admin logs → ENTERED immediately (walk-in)
  // Resident logs  → APPROVED (pre-approval, no entry yet)
  const isResident = req.user.role === "RESIDENT";
  const status = isResident ? "APPROVED" : "ENTERED";

  const visitor = await prisma.visitor.create({
    data: {
      name,
      purpose,
      wing,
      flatNumber,
      contact: contact || null,
      visitorType: visitorType || null,
      vehicleNumber: vehicleNumber || null,
      status,
      documentImage: isResident ? null : documentImage || null,
      isWalkIn: !isResident,
      enteredBy: req.user.id,
      entryTime: isResident ? null : new Date(), // Only walk-ins get immediate entryTime
      societyId: req.user.societyId,
    },
  });

  // If walk-in (guard logged), notify the flat residents
  if (!isResident) {
    const residents = await prisma.user.findMany({
      where: {
        societyId: req.user.societyId,
        wing,
        flatNumber,
        role: "RESIDENT",
        deletedAt: null,
      },
      select: { id: true },
    });

    if (residents.length > 0) {
      await prisma.notification.createMany({
        data: residents.map((r) => ({
          title: `New Visitor: ${name}`,
          message: `${visitorType || "Visitor"} ${name} has arrived for ${purpose}.`,
          type: "VISITOR",
          userId: r.id,
          societyId: req.user.societyId,
        })),
      });
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(201, visitor, "Visitor entry logged"));
});

const logVisitorExit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const visitor = await prisma.visitor.findUnique({ where: { id } });

  if (!visitor) throw new ApiError(404, "Visitor log not found");
  if (visitor.societyId !== req.user.societyId)
    throw new ApiError(403, "Access denied");
  if (visitor.status === "EXITED")
    throw new ApiError(400, "Visitor has already exited");
  if (visitor.status === "APPROVED")
    throw new ApiError(400, "Visitor has not entered the premises yet");

  const updated = await prisma.visitor.update({
    where: { id },
    data: { status: "EXITED", exitTime: new Date() },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Visitor exit logged"));
});

const getAllVisitors = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const filter = { societyId: req.user.societyId, deletedAt: null };

  if (req.user.role === "RESIDENT") {
    filter.wing = req.user.wing;
    filter.flatNumber = req.user.flatNumber;
  }

  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      where: filter,
      orderBy: { entryTime: "desc" },
      skip,
      take: limit,
    }),
    prisma.visitor.count({ where: filter }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: visitors,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Visitor logs fetched",
    ),
  );
});

// GET /visitors/:id
const getVisitorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const visitor = await prisma.visitor.findUnique({ where: { id } });

  if (!visitor) throw new ApiError(404, "Visitor not found");
  if (visitor.societyId !== req.user.societyId)
    throw new ApiError(403, "Access denied");

  // Residents can only see visitors for their own flat
  if (req.user.role === "RESIDENT") {
    if (
      visitor.wing !== req.user.wing ||
      visitor.flatNumber !== req.user.flatNumber
    ) {
      throw new ApiError(403, "Access denied");
    }
  }

  return res.status(200).json(new ApiResponse(200, visitor, "Visitor fetched"));
});

// PATCH /visitors/:id/status
const updateVisitorStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["APPROVED", "PENDING", "ENTERED", "REJECTED"];
  if (!status || !allowed.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${allowed.join(", ")}`);
  }

  const visitor = await prisma.visitor.findUnique({ where: { id } });
  if (!visitor) throw new ApiError(404, "Visitor not found");
  if (visitor.societyId !== req.user.societyId)
    throw new ApiError(403, "Access denied");

  // Residents can only update status for their own flat's visitors
  if (req.user.role === "RESIDENT") {
    if (
      visitor.wing !== req.user.wing ||
      visitor.flatNumber !== req.user.flatNumber
    ) {
      throw new ApiError(403, "Access denied");
    }
  }

  const dataToUpdate = { status };
  if (status === "ENTERED" && !visitor.entryTime) {
    dataToUpdate.entryTime = new Date();
  }

  const updated = await prisma.visitor.update({
    where: { id },
    data: dataToUpdate,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Visitor status updated"));
});

// DELETE /visitors/:id  (Admin only — enforced at route level)
const deleteVisitor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const visitor = await prisma.visitor.findUnique({ where: { id } });
  if (!visitor) throw new ApiError(404, "Visitor not found");
  if (visitor.societyId !== req.user.societyId)
    throw new ApiError(403, "Access denied");

  await prisma.visitor.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Visitor record deleted"));
});

export {
  logVisitorEntry,
  logVisitorExit,
  getAllVisitors,
  getVisitorById,
  updateVisitorStatus,
  deleteVisitor,
};
