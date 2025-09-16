const { z } = require("zod");

exports.signup = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  diagnosis: z.string().optional(),
  cancerStage: z.string().optional(),
  treatments: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
});

exports.login = z.object({
  email: z.string().email(),
  password: z.string(),
});
