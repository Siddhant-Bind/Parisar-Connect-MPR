import { uploadBase64Image } from "./src/utils/upload.utils.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

async function testInternalUpload() {
  try {
    const rawData =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    console.log("Calling uploadBase64Image...");

    const url = await uploadBase64Image(rawData, "visitors");

    console.log("Returned URL:", url);
  } catch (err) {
    console.error("Internal Error:", err);
  }
}

testInternalUpload();
