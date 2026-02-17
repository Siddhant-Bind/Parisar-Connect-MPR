import { Router } from "express";
import {
  createPaymentRequest,
  getAllPayments,
  markAsPaid,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createPaymentSchema,
  markPaymentPaidSchema,
} from "../validators/payment.schema.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .post(validate(createPaymentSchema), createPaymentRequest)
  .get(getAllPayments);

router.route("/:id/pay").patch(validate(markPaymentPaidSchema), markAsPaid);

export default router;
