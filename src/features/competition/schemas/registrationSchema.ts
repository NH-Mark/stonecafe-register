import { z } from "zod";

export const eventRegistrationSchema = z.object({

  full_name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20, "Phone number is too long"),

  gender: z.enum(["male", "female"], {
    message: "Please select your gender",
  }),

  company: z
    .string()
    .trim()
    .max(150, "Company name is too long")
    .optional()
    .or(z.literal("")),
});

export type EventRegistrationFormValues = z.infer<
  typeof eventRegistrationSchema
>;