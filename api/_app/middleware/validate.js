/**
 * validate.js
 * Zod-based request body validation middleware.
 *
 * Usage in routes:
 *   const { validate } = require('../middleware/validate');
 *   const { createTransactionSchema } = require('../schemas');
 *   router.post('/', validate(createTransactionSchema), controller.create);
 */

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const issues = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        error: "Validation failed",
        issues,
      });
    }

    // Replace req.body with the parsed (sanitized) data
    req.body = result.data;
    next();
  };
}

module.exports = { validate };
