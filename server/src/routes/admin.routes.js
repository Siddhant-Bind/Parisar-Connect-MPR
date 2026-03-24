import { Router } from "express";
import {
  registerGuard,
  getAllGuards,
  getGuardById,
  updateGuard,
  deleteGuard,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerGuardSchema } from "../validators/auth.schema.js";
import { ROLES } from "../constants.js";

const router = Router();

// All /admins routes require authentication + Admin role
router.use(verifyJWT);
router.use(checkRole([ROLES.ADMIN]));

// POST /admins  → register a new guard
// GET  /admins  → list all guards
router
  .route("/")
  .post(validate(registerGuardSchema), registerGuard)
  .get(getAllGuards);

// GET    /admins/:id  → get single guard
// PUT    /admins/:id  → update guard
// DELETE /admins/:id  → remove guard
router.route("/:id").get(getGuardById).put(updateGuard).delete(deleteGuard);

export default router;
