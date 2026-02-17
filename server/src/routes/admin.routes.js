import { Router } from "express";
import {
  registerResident,
  updateResident,
  deleteResident,
  getAllResidents,
  registerGuard,
  updateGuard,
  deleteGuard,
  getAllGuards,
} from "../controllers/user.controller.js";
import {
  createNotice,
  updateNotice,
  deleteNotice,
} from "../controllers/notice.controller.js";
import {
  getAllComplaints,
  updateComplaintStatus,
} from "../controllers/complaint.controller.js";
import {
  getAllPayments,
  createPaymentRequest,
} from "../controllers/payment.controller.js";
import { getAllVisitors } from "../controllers/visitor.controller.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  checkRole,
  checkApprovedAdmin,
} from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerResidentSchema,
  registerGuardSchema,
} from "../validators/auth.schema.js";
import {
  createNoticeSchema,
  updateNoticeSchema,
} from "../validators/notice.schema.js";
import { createPaymentSchema } from "../validators/payment.schema.js";
import { updateComplaintStatusSchema } from "../validators/complaint.schema.js";
import { ROLES } from "../constants.js";

const router = Router();

// 🔒 CRITICAL: Protect ALL admin routes
router.use(verifyJWT);
router.use(checkRole([ROLES.ADMIN]));
router.use(checkApprovedAdmin); // Ensure admin is approved by Creator

// Dashboard
router.get("/dashboard", getDashboardStats);

// Residents
router
  .route("/residents")
  .post(validate(registerResidentSchema), registerResident)
  .get(getAllResidents);
router.route("/residents/:id").patch(updateResident).delete(deleteResident);

// Guards
router
  .route("/guards")
  .post(validate(registerGuardSchema), registerGuard)
  .get(getAllGuards);
router.route("/guards/:id").patch(updateGuard).delete(deleteGuard);

// Notices
router.route("/notices").post(validate(createNoticeSchema), createNotice);
router
  .route("/notices/:id")
  .patch(validate(updateNoticeSchema), updateNotice)
  .delete(deleteNotice);

// Complaints (Admin can view all, only admin can update status)
router.route("/complaints").get(getAllComplaints);
router
  .route("/complaints/:id")
  .patch(validate(updateComplaintStatusSchema), updateComplaintStatus);

// Payments
router
  .route("/payments")
  .get(getAllPayments)
  .post(validate(createPaymentSchema), createPaymentRequest);

// Visitors
router.route("/visitors").get(getAllVisitors);

export default router;
