import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
// NOTE: xss-clean was removed — it uses require() internally which crashes
// in ESM ("type": "module") projects. Helmet CSP headers provide baseline XSS
// protection, but CSP is NOT a substitute for proper input sanitization.
// Sanitize user inputs at the application/validation layer as well.

/**
 * Configure comprehensive security middleware for the Express app
 * Includes: Helmet, Rate Limiting, HPP, Mongo Sanitize, Logging
 */
export const configureSecurity = (app) => {
  // 1. Helmet - Set security HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false, // Allow embedding if needed
    }),
  );

  // 2. HPP - Protect against HTTP Parameter Pollution
  app.use(hpp());

  // 3. Mongo Sanitize - Prevent NoSQL injection
  app.use(mongoSanitize());

  // 4. Morgan - HTTP request logger
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev")); // Colored, concise output for development
  } else {
    app.use(morgan("combined")); // Standard Apache combined log for production
  }

  // 5. General API Rate Limiting
  const isDev = process.env.NODE_ENV === "development";
  const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: isDev ? 1000 : 100, // 1000 in dev, 100 in production
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
  });
  app.use("/api/", apiLimiter);

  // 6. Strict Login Rate Limiting (5 attempts per 15 minutes)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 login attempts
    skipSuccessfulRequests: true, // Don't count successful logins
    message: {
      success: false,
      message: "Too many login attempts. Please try again after 15 minutes.",
    },
  });
  app.use("/api/v1/users/login", loginLimiter);

  // 7. Password Change Rate Limiting (3 attempts per hour)
  const passwordChangeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
      success: false,
      message: "Too many password change attempts. Please try again later.",
    },
  });
  app.use("/api/v1/users/change-password", passwordChangeLimiter);
};
