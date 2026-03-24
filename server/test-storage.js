import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBucket() {
  console.log("Checking storage buckets...");

  // 1. List buckets to see if 'visitor-images' exists
  const { data: buckets, error: bucketError } =
    await supabase.storage.listBuckets();

  if (bucketError) {
    console.error("Error fetching buckets:", bucketError);
    return;
  }

  const visitorBucket = buckets.find((b) => b.name === "visitor-images");
  console.log("Visitor Bucket found:", visitorBucket ? "YES" : "NO");

  if (!visitorBucket) {
    console.error(
      "The 'visitor-images' bucket is missing! Create it in the Supabase Dashboard and set to Public.",
    );
    return;
  }

  console.log("Bucket details:", visitorBucket);

  // 2. Try an upload test
  // Strip the data URI prefix before decoding — Buffer.from expects raw base64
  const base64String =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const testBuffer = Buffer.from(base64String, "base64");
  const filename = `test-${Date.now()}.png`;

  console.log("Attempting upload...");
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("visitor-images")
    .upload(filename, testBuffer, { contentType: "image/png" });

  if (uploadError) {
    console.error("Upload failed! Error:", uploadError.message);
  } else {
    console.log("Upload successful:", uploadData);

    // Clean up
    await supabase.storage.from("visitor-images").remove([filename]);
    console.log("Cleaned up test file.");
  }
}

testBucket();
