import { z } from "zod";
import { NOTICE_TYPE, NOTICE_PRIORITY } from "../constants.js";

// Create Notice Schema
export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(200),
    content: z
      .string()
      .min(10, "Content must be at least 10 characters")
      .max(5000),
    type: z
      .enum([NOTICE_TYPE.INFO, NOTICE_TYPE.EVENT, NOTICE_TYPE.ALERT])
      .default(NOTICE_TYPE.INFO),
    priority: z
      .enum([NOTICE_PRIORITY.LOW, NOTICE_PRIORITY.MEDIUM, NOTICE_PRIORITY.HIGH])
      .default(NOTICE_PRIORITY.LOW),
  }),
});

// Update Notice Schema
export const updateNoticeSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid notice ID"),
  }),
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    content: z.string().min(10).max(5000).optional(),
    type: z
      .enum([NOTICE_TYPE.INFO, NOTICE_TYPE.EVENT, NOTICE_TYPE.ALERT])
      .optional(),
    priority: z
      .enum([NOTICE_PRIORITY.LOW, NOTICE_PRIORITY.MEDIUM, NOTICE_PRIORITY.HIGH])
      .optional(),
  }),
});

// Delete Notice Schema
export const deleteNoticeSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid notice ID"),
  }),
});