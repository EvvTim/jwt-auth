import { z } from "zod";

const emailSchema = z.string().email().min(1).max(255);
const passwordSchema = z.string().min(6).max(255);
const nameSchema = z.string().min(2).max(255);
const surnameSchema = z.string().min(2).max(255);
const userAgentSchema = z.string().optional();
const confirmedPasswordSchema = z.string().min(6).max(255);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: userAgentSchema,
});

export const registerSchema = loginSchema
  .extend({
    name: nameSchema,
    surname: surnameSchema,
    confirmedPassword: confirmedPasswordSchema,
  })
  .refine((data) => data.password === data.confirmedPassword, {
    message: "Passwords do not match",
    path: ["confirmedPassword"],
  });

export const verificationCodeSchema = z.string().min(1).max(24);
