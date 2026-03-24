import { Router } from "express";
import {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
} from "../controllers/complaint.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
} from "../validators/complaint.schema.js";
import { ROLES } from "../constants.js";

const router = Router();

// All complaint routes require authentication
router.use(verifyJWT);

// POST /complaints  → Resident only
// GET  /complaints  → All roles (controller filters by role)
router
  .route("/")
  .post(
    checkRole([ROLES.RESIDENT]),
    validate(createComplaintSchema),
    createComplaint,
  )
  .get(getAllComplaints);

// GET    /complaints/:id  → All roles (controller enforces resident restriction)
// DELETE /complaints/:id  → Admin only
router
  .route("/:id")
  .get(getComplaintById)
  .delete(checkRole([ROLES.ADMIN]), deleteComplaint);

// PATCH /complaints/:id/status  → Admin only
router
  .route("/:id/status")
  .patch(
    checkRole([ROLES.ADMIN]),
    validate(updateComplaintStatusSchema),
    updateComplaintStatus,
  );

export default router;
