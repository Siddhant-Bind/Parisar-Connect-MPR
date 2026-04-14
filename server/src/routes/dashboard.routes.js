import { Router } from "express";
import { getDashboardStats, getRecentActivity } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/stats").get(getDashboardStats);
router.route("/activity").get(getRecentActivity);

export default router;
