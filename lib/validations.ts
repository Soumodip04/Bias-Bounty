import { z } from 'zod'

// File validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 100 * 1024 * 1024, {
      message: 'File size must be less than 100MB',
    })
    .refine(
      (file) => {
        const allowedTypes = [
          'text/csv',
          'application/json',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/plain',
        ]
        return allowedTypes.includes(file.type) || file.name.endsWith('.csv')
      },
      {
        message: 'File must be CSV, JSON, Excel, or TXT format',
      }
    ),
})

// Auth validation schemas
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
})

export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, dashes, and underscores'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Dataset validation
export const datasetUploadSchema = z.object({
  name: z
    .string()
    .min(3, 'Dataset name must be at least 3 characters')
    .max(100, 'Dataset name must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 100 * 1024 * 1024, {
      message: 'File size must be less than 100MB',
    })
    .refine(
      (file) => {
        const allowedTypes = [
          'text/csv',
          'application/json',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/plain',
        ]
        return allowedTypes.includes(file.type) || file.name.endsWith('.csv')
      },
      {
        message: 'File must be CSV, JSON, Excel, or TXT format',
      }
    ),
})

// Profile update validation
export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, dashes, and underscores'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  avatar_url: z
    .string()
    .url('Invalid URL')
    .optional()
    .or(z.literal('')),
})

// Code analysis validation
export const codeAnalysisSchema = z.object({
  code: z
    .string()
    .min(10, 'Code must be at least 10 characters')
    .max(50000, 'Code must be less than 50,000 characters'),
  language: z.enum(['python', 'javascript', 'java', 'cpp', 'csharp', 'ruby', 'go', 'rust']),
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name is too long')
    .optional(),
})

// Bias report validation
export const biasReportSchema = z.object({
  dataset_id: z.string().uuid('Invalid dataset ID'),
  bias_type: z
    .string()
    .min(3, 'Bias type must be at least 3 characters')
    .max(100, 'Bias type is too long'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  evidence: z.record(z.string(), z.unknown()).optional(),
})

// Search validation
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query is too long'),
})

// Export types for TypeScript
export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type DatasetUploadInput = z.infer<typeof datasetUploadSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type CodeAnalysisInput = z.infer<typeof codeAnalysisSchema>
export type BiasReportInput = z.infer<typeof biasReportSchema>
export type SearchInput = z.infer<typeof searchSchema>
