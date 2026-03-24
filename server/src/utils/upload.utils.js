import supabase from "../db/supabase.js";
import { v4 as uuidv4 } from "uuid";

/** Allowed MIME types and their file extensions */
const ALLOWED_MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Sanitize folder name to prevent path traversal.
 * Strips `.`, `/`, `\` and collapses to a safe alphanumeric-dash-underscore string.
 */
function sanitizeFolder(folder) {
  return folder
    .replace(/\.\./g, "")
    .replace(/[\/\\]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "") || "general";
}

/**
 * Uploads a base64 image string to Supabase storage.
 * @param {string} base64Image - The base64 encoded image string (e.g., "data:image/jpeg;base64,...")
 * @param {string} folder - The folder to store the image in (e.g., "visitors")
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadBase64Image = async (base64Image, folder = "visitors") => {
  try {
    // 1. Extract the base64 data and mime type
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 string format");
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // 2. Validate MIME type against whitelist
    const extension = ALLOWED_MIME_TYPES[mimeType];
    if (!extension) {
      throw new Error(
        `Unsupported image type: ${mimeType}. Allowed: ${Object.keys(ALLOWED_MIME_TYPES).join(", ")}`
      );
    }

    // 3. Sanitize folder to prevent path traversal
    const safeFolder = sanitizeFolder(folder);

    // 4. Convert base64 string to Buffer
    const buffer = Buffer.from(base64Data, "base64");

    // 5. Generate a unique filename
    const filename = `${safeFolder}/${uuidv4()}.${extension}`;

    // 6. Upload to Supabase bucket 'visitor-images'
    const { data, error } = await supabase.storage
      .from("visitor-images")
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      throw error;
    }

    // 7. Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("visitor-images")
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadBase64Image utility:", error);
    throw new Error("Image upload failed: " + error.message);
  }
};
