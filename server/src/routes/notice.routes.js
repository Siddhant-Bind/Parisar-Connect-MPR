import { Router } from "express";
import {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} from "../controllers/notice.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createNoticeSchema,
  updateNoticeSchema,
} from "../validators/notice.schema.js";
import { ROLES } from "../constants.js";

const router = Router();

// All notice routes require authentication
router.use(verifyJWT);

// POST /notices  → Admin only
// GET  /notices  → All roles
router
  .route("/")
  .post(checkRole([ROLES.ADMIN]), validate(createNoticeSchema), createNotice)
  .get(getAllNotices);

// GET  /notices/:id  → All roles
// PATCH/PUT /notices/:id  → Admin only
// DELETE /notices/:id    → Admin only
router
  .route("/:id")
  .get(getNoticeById)
  .patch(checkRole([ROLES.ADMIN]), validate(updateNoticeSchema), updateNotice)
  .put(checkRole([ROLES.ADMIN]), validate(updateNoticeSchema), updateNotice)
  .delete(checkRole([ROLES.ADMIN]), deleteNotice);

export default router;
