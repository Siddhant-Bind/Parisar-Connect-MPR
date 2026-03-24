import { Router } from "express";
import {
  registerResident,
  getAllResidents,
  getResidentById,
  updateResident,
  deleteResident,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerResidentSchema } from "../validators/auth.schema.js";
import { ROLES } from "../constants.js";

const router = Router();

// All resident routes require authentication
router.use(verifyJWT);

// POST /residents  → Admin only
// GET  /residents  → Admin only
router
  .route("/")
  .post(
    checkRole([ROLES.ADMIN]),
    validate(registerResidentSchema),
    registerResident,
  )
  .get(checkRole([ROLES.ADMIN]), getAllResidents);

// GET    /residents/:id  → Admin or the resident themselves
// PUT    /residents/:id  → Admin or the resident themselves
// DELETE /residents/:id  → Admin only
router
  .route("/:id")
  .get(getResidentById) // controller enforces self-or-admin
  .put(updateResident) // controller enforces self-or-admin
  .delete(checkRole([ROLES.ADMIN]), deleteResident);

export default router;
