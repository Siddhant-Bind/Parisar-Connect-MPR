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
    visibility: z.enum(["PRIVATE", "PUBLIC"]).default("PRIVATE").optional(),
    eventLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    targetSocieties: z.array(z.string().uuid("Invalid territory ID")).optional().default([]),
  }).superRefine((data, ctx) => {
    if (data.type === NOTICE_TYPE.EVENT) {
      if (!data.eventLink || data.eventLink.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["eventLink"],
          message: "Event registration link is required for Event notices",
        });
      }
      if (data.visibility === "PUBLIC" && (!data.targetSocieties || data.targetSocieties.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetSocieties"],
          message: "Please select at least one society for public events",
        });
      }
    }
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
    visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
    eventLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    targetSocieties: z.array(z.string().uuid("Invalid territory ID")).optional(),
  }).superRefine((data, ctx) => {
    if (data.type === NOTICE_TYPE.EVENT) {
      // In updates, we don't strictly require these if they are not provided 
      // but if we are switching to public event, we check.
      // Usually the FE sends all fields for update anyway.
      if (data.eventLink !== undefined && data.eventLink.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["eventLink"],
          message: "Event registration link cannot be empty",
        });
      }
      if (data.visibility === "PUBLIC" && data.targetSocieties && data.targetSocieties.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetSocieties"],
          message: "Please select at least one society for public events",
        });
      }
    }
  }),
});

// Delete Notice Schema
export const deleteNoticeSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid notice ID"),
  }),
});