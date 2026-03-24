import { ApiError } from "../utils/apiError.js";

/**
 * Zod validation middleware.
 * Pass a Zod schema that validates req.body, req.params, and/or req.query.
 * Schema shape: z.object({ body: z.object({...}), params: z.object({...}), query: z.object({...}) })
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message).join(", ");
    return next(new ApiError(400, `Validation failed: ${errors}`));
  }

  // Attach parsed (potentially transformed) data back
  if (result.data.body) req.body = result.data.body;
  if (result.data.params) req.params = result.data.params;
  if (result.data.query) req.query = result.data.query;

  next();
};
