import { Router } from "express";
import {
  listSocieties,
  createSociety,
  joinSociety,
  getPendingAdmins,
  approveAdmin,
} from "../controllers/society.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/rbac.middleware.js";
import { ROLES } from "../constants.js";

const router = Router();

// GET /societies  → public (no auth needed, for Join Society dropdown)
router.route("/").get(listSocieties);

// POST /societies/create  → Admin only
router
  .route("/create")
  .post(verifyJWT, checkRole([ROLES.ADMIN]), createSociety);

// POST /societies/join  → Admin only
router.route("/join").post(verifyJWT, checkRole([ROLES.ADMIN]), joinSociety);

// GET /societies/admins/pending → Creator Admin only
router
  .route("/admins/pending")
  .get(verifyJWT, checkRole([ROLES.ADMIN]), getPendingAdmins);

// PATCH /societies/admins/:id/approve → Creator Admin only
router
  .route("/admins/:id/approve")
  .patch(verifyJWT, checkRole([ROLES.ADMIN]), approveAdmin);

export default router;
