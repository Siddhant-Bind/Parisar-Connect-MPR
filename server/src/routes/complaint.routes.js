import { Router } from "express";
import {
  createComplaint,
  getAllComplaints,
  updateComplaintStatus,
} from "../controllers/complaint.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Secure all routes

router.route("/").post(createComplaint).get(getAllComplaints);
router.route("/:id/status").patch(updateComplaintStatus);

export default router;
