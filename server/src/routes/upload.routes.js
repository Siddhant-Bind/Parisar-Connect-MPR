import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadBase64Image } from "../utils/upload.utils.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Secure the upload route
router.use(verifyJWT);

// POST /api/v1/upload/image
router.post(
  "/image",
  asyncHandler(async (req, res) => {
    const { image, folder } = req.body;

    if (!image) {
      throw new ApiError(400, "Image data (base64) is required");
    }

    const imageUrl = await uploadBase64Image(image, folder || "visitors");

    return res
      .status(200)
      .json(
        new ApiResponse(200, { url: imageUrl }, "Image uploaded successfully"),
      );
  }),
);

export default router;
