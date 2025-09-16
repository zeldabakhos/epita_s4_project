// /backend/validators/mood.schema.js
const { z } = require("zod");

exports.createEntrySchema = z.object({
  userId: z.string().min(1), // required again
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      value: z.number().int()
    })
  ).min(1)
});
