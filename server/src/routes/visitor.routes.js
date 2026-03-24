import { Router } from "express";
import {
  logVisitorEntry,
  logVisitorExit,
  getAllVisitors,
  getVisitorById,
  updateVisitorStatus,
  deleteVisitor,
} from "../controllers/visitor.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createVisitorSchema } from "../validators/visitor.schema.js";
import { ROLES } from "../constants.js";

const router = Router();

// All visitor routes require authentication
router.use(verifyJWT);

// POST /visitors  → Guard, Admin, and Resident (pre-approval)
// GET  /visitors  → All roles (controller filters by role)
router
  .route("/")
  .post(
    checkRole([ROLES.GUARD, ROLES.ADMIN, ROLES.RESIDENT]),
    validate(createVisitorSchema),
    logVisitorEntry,
  )
  .get(getAllVisitors);

// GET    /visitors/:id  → All roles (controller enforces resident restriction)
// DELETE /visitors/:id  → Admin only
router
  .route("/:id")
  .get(getVisitorById)
  .delete(checkRole([ROLES.ADMIN]), deleteVisitor);

// PATCH /visitors/:id/status  → Resident + Admin + Guard (pre-approval flow)
router
  .route("/:id/status")
  .patch(
    checkRole([ROLES.RESIDENT, ROLES.ADMIN, ROLES.GUARD]),
    updateVisitorStatus,
  );

// PATCH /visitors/:id/exit  → Guard + Admin only
router
  .route("/:id/exit")
  .patch(checkRole([ROLES.GUARD, ROLES.ADMIN]), logVisitorExit);

export default router;
