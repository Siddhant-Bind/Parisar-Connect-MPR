// Vercel Serverless Function entry point
// Vercel injects environment variables from the dashboard into process.env
// automatically — no dotenv needed here.

import { app } from "../server/src/app.js";

export default app;
