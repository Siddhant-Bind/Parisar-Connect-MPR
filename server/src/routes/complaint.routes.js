import { Router } from "express";
import {
  createComplaint,
  getAllComplaints,
  updateComplaintStatus,
} from "../controllers/complaint.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
} from "../validators/complaint.schema.js";

const router = Router();

router.use(verifyJWT); // Secure all routes

router
  .route("/")
  .post(validate(createComplaintSchema), createComplaint)
  .get(getAllComplaints);

router
  .route("/:id/status")
  .patch(validate(updateComplaintStatusSchema), updateComplaintStatus);

export default router;
