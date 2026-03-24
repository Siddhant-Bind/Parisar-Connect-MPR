import { Router } from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All notification routes require authentication
router.use(verifyJWT);

router.route("/").get(getMyNotifications);
router.route("/count").get(getUnreadCount);
router.route("/read-all").patch(markAllAsRead);
router.route("/:id").patch(markAsRead);

export default router;
