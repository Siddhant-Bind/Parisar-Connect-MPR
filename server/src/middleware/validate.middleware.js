import { z, ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";

/**
 * Generic validation middleware using Zod schemas
 * @param {ZodSchema} schema - Zod schema to validate against
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw new ApiError(400, "Validation Error", errors);
      }
      next(error);
    }
  };
};
