import { Router } from "express";
import {
  createNotice,
  getAllNotices,
  deleteNotice,
} from "../controllers/notice.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createNoticeSchema,
  deleteNoticeSchema,
} from "../validators/notice.schema.js";
import { ROLES } from "../constants.js";

const router = Router();

// 🔒 All notice routes require authentication
router.use(verifyJWT);

// All authenticated users can read notices
// Only admins can create/delete
router
  .route("/")
  .post(checkRole([ROLES.ADMIN]), validate(createNoticeSchema), createNotice)
  .get(getAllNotices);

router
  .route("/:id")
  .delete(checkRole([ROLES.ADMIN]), validate(deleteNoticeSchema), deleteNotice);

export default router;
