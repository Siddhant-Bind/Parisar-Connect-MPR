import { Router } from "express";
import {
  createPaymentRequest,
  getAllPayments,
  markAsPaid,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPaymentRequest).get(getAllPayments);
router.route("/:id/pay").patch(markAsPaid);

export default router;
