import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .email("Please provide a valid email"),
    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    rememberMe: z.boolean().optional(),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Name is required" })
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string({ message: "Email is required" })
      .email("Please provide a valid email"),
    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    role: z
      .enum(["customer", "support", "operations", "admin"])
      .optional()
      .default("customer"),
    inviteToken: z.string().optional(), // For admin invitations
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .email("Please provide a valid email"),
    code: z
      .string({ message: "Verification code is required" })
      .length(6, "Verification code must be 6 digits"),
  }),
});

export const resendCodeSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .email("Please provide a valid email"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .email("Please provide a valid email"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .email("Please provide a valid email"),
    code: z
      .string({ message: "Reset code is required" })
      .length(6, "Reset code must be 6 digits"),
    newPassword: z
      .string({ message: "New password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});
