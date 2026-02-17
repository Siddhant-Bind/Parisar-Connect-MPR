import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key for backend admin tasks

// Ensure environment variables are present
if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase URL or Service Role Key is missing in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;
