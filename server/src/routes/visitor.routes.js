import { Router } from "express";
import {
  logVisitorEntry,
  logVisitorExit,
  getAllVisitors,
} from "../controllers/visitor.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createVisitorSchema,
  updateVisitorExitSchema,
} from "../validators/visitor.schema.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .post(validate(createVisitorSchema), logVisitorEntry)
  .get(getAllVisitors);

router
  .route("/:id/exit")
  .patch(validate(updateVisitorExitSchema), logVisitorExit);

export default router;
