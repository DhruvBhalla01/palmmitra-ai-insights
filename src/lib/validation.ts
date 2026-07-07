import { z } from 'zod';

/**
 * Shared client + server validation schemas.
 * Every form and edge-function payload uses these — never trust the client.
 */

// ─── Name ────────────────────────────────────────────────────────────────────
// Trim, collapse repeated spaces, must contain at least one letter,
// block angle brackets / braces to prevent trivial HTML injection.
export const nameSchema = z
  .string({ required_error: 'Name is required' })
  .transform((v) => v.replace(/\s+/g, ' ').trim())
  .pipe(
    z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name must be under 60 characters')
      .regex(/[A-Za-z\u00C0-\u024F\u0900-\u097F]/, 'Please enter a valid name')
      .regex(/^[^<>{}$]*$/, 'Name contains invalid characters')
      .refine((v) => !/^\d+$/.test(v), 'Name cannot be only numbers'),
  );

// ─── Age ─────────────────────────────────────────────────────────────────────
export const ageSchema = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .pipe(
    z
      .string()
      .regex(/^\d{1,3}$/, 'Age must be a whole number')
      .transform((v) => parseInt(v, 10))
      .pipe(
        z
          .number()
          .int('Age must be a whole number')
          .min(13, 'You must be at least 13')
          .max(100, 'Please enter a valid age'),
      ),
  );

// ─── Email ───────────────────────────────────────────────────────────────────
export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .transform((v) => v.trim().toLowerCase())
  .pipe(
    z
      .string()
      .email('Please enter a valid email address')
      .max(254, 'Email is too long'),
  );


// ─── Message (contact form) ──────────────────────────────────────────────────
export const messageSchema = z
  .string({ required_error: 'Message is required' })
  .transform((v) => v.trim())
  .pipe(
    z
      .string()
      .min(10, 'Please write at least 10 characters')
      .max(2000, 'Message must be under 2000 characters')
      .regex(/^[^<>]*$/, 'Message contains invalid characters'),
  );

// ─── Relationship type (PalmMatch) ───────────────────────────────────────────
export const relationshipTypeSchema = z.enum([
  'Partner',
  'Spouse',
  'Friend',
  'Sibling',
  'Parent-Child',
  'Business Partner',
]);

// ─── Report / UUID id ────────────────────────────────────────────────────────
export const uuidSchema = z
  .string()
  .uuid('Invalid report ID');

// Loose id for PalmMatch (prefix + timestamp + rand)
export const palmMatchIdSchema = z
  .string()
  .regex(/^pm_\d+_[a-z0-9]+$/i, 'Invalid PalmMatch report ID');

// ─── Client-side image file validation ───────────────────────────────────────
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MIN_IMAGE_BYTES = 20 * 1024;        // 20 KB

export interface ImageValidationResult {
  ok: boolean;
  reason?: string;
  suggestion?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { ok: false, reason: 'No file selected.', suggestion: 'Please choose a photo.' };
  }
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return {
      ok: false,
      reason: 'Unsupported file type.',
      suggestion: 'Please upload a JPG, PNG, WEBP or HEIC image.',
    };
  }
  if (file.size < MIN_IMAGE_BYTES) {
    return {
      ok: false,
      reason: 'This image is too small to analyze.',
      suggestion: 'Please upload a clearer, higher-resolution photo.',
    };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      reason: 'This image is over the 10 MB limit.',
      suggestion: 'Please compress or resize the photo before uploading.',
    };
  }
  return { ok: true };
}

// ─── Helper: format Zod errors into { field: message } ───────────────────────
export function zodFieldErrors<T>(err: z.ZodError<T>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.errors) {
    const key = issue.path[0]?.toString() ?? '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
