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

const router = Router();

// Dashboard
router.get("/dashboard", getDashboardStats);

// Residents
router.route("/residents").post(registerResident).get(getAllResidents); // Added get
router.route("/residents/:id").patch(updateResident).delete(deleteResident);

// Guards
router.route("/guards").post(registerGuard).get(getAllGuards);
router.route("/guards/:id").patch(updateGuard).delete(deleteGuard);

// Notices
router.route("/notices").post(createNotice);
router.route("/notices/:id").patch(updateNotice).delete(deleteNotice);

// Complaints
router.route("/complaints").get(getAllComplaints);
router.route("/complaints/:id").patch(updateComplaintStatus);

// Payments
router.route("/payments").get(getAllPayments).post(createPaymentRequest);

// Visitors
router.route("/visitors").get(getAllVisitors);

export default router;
