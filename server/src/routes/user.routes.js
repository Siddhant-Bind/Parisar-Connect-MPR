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

const router = Router();

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/residents").post(registerResident).get(getAllResidents);
router.route("/residents/:id").delete(deleteResident).put(updateResident);

export default router;
