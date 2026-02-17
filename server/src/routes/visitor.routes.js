import { Router } from "express";
import {
  logVisitorEntry,
  logVisitorExit,
  getAllVisitors,
} from "../controllers/visitor.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(logVisitorEntry).get(getAllVisitors);
router.route("/:id/exit").patch(logVisitorExit);

export default router;
