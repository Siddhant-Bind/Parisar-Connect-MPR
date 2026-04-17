// Vercel Serverless Function entry point
// Wraps the existing Express app for the serverless runtime.

import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" });

import { app } from "../server/src/app.js";

export default app;
