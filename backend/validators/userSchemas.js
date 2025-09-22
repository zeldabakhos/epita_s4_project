const { z } = require("zod");

exports.signup = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["patient", "caregiver"]), // NEW

    // patient-only fields
    diagnosis: z.string().optional(),
    cancerStage: z.string().optional(),
    treatments: z.array(z.string()).default([]),
    allergies: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.role === "patient" && !data.diagnosis) {
      ctx.addIssue({
        code: "custom",
        path: ["diagnosis"],
        message: "Diagnosis is required for patients",
      });
    }

    if (data.role === "caregiver") {
      if (data.diagnosis || data.cancerStage || data.treatments.length || data.allergies.length) {
        ctx.addIssue({
          code: "custom",
          path: ["role"],
          message: "Caregivers should not include patient-only fields",
        });
      }
    }
  });

exports.login = z.object({
  email: z.string().email(),
  password: z.string(),
});
