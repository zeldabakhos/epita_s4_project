// validate.js
module.exports = (schema) => (req, res, next) => {
    try {
      req.body = schema.parse(req.body); // throws if invalid
      next();
    } catch (err) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors, // array of issues from Zod
      });
    }
  };
  