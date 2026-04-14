import { Router } from "express";
import {
  createPaymentRequest,
  getAllPayments,
  markAsPaid,
  createBulkPaymentRequest,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createPaymentSchema,
  createBulkPaymentSchema,
  markPaymentPaidSchema,
} from "../validators/payment.schema.js";
import { ROLES } from "../constants.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .post(
    checkRole([ROLES.ADMIN]),
    validate(createPaymentSchema),
    createPaymentRequest,
  )
  .get(getAllPayments);

router
  .route("/bulk")
  .post(
    checkRole([ROLES.ADMIN]),
    validate(createBulkPaymentSchema),
    createBulkPaymentRequest,
  );

router
  .route("/:id/pay")
  .patch(checkRole([ROLES.ADMIN]), validate(markPaymentPaidSchema), markAsPaid);

export default router;

