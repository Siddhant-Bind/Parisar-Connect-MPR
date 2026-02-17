import { Router } from "express";
import {
  registerResident,
  loginUser,
  logoutUser,
  getAllResidents,
  deleteResident,
  updateResident,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  loginSchema,
  registerResidentSchema,
} from "../validators/auth.schema.js";

const router = Router();

router.route("/login").post(validate(loginSchema), loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

router
  .route("/residents")
  .post(validate(registerResidentSchema), registerResident)
  .get(getAllResidents);
router.route("/residents/:id").delete(deleteResident).put(updateResident);

export default router;
