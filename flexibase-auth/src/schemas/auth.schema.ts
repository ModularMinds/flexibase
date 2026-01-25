import { z } from "zod";

export const signUpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").max(255),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100)
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character",
      ),
  }),
});

export const signInSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").max(255),
    password: z.string().min(1, "Password is required").max(100),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().max(50).optional(),
    bio: z.string().max(160).optional(),
    avatarUrl: z.string().url().optional().or(z.literal("")),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(["USER", "ADMIN"]),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .max(100)
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character",
      ),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});
