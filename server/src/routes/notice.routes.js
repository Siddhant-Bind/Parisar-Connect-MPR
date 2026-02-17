import { Router } from "express";
import {
  createNotice,
  getAllNotices,
  deleteNotice,
} from "../controllers/notice.controller.js";

const router = Router();

router.route("/").post(createNotice).get(getAllNotices);
router.route("/:id").delete(deleteNotice);

export default router;
