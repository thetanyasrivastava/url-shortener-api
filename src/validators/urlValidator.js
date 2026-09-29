const { z } = require('zod');

const httpUrl = z.string().trim().url().refine((value) => {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}, 'URL must use http or https').max(8192);

const createUrlSchema = z.object({
  url: httpUrl,
  alias: z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9_-]+$/, 'Alias may contain letters, numbers, hyphens, and underscores').optional(),
  expiresAt: z.union([z.iso.datetime({ offset: true }), z.coerce.date()]).optional()
}).strict().refine((data) => !data.expiresAt || new Date(data.expiresAt) > new Date(), {
  message: 'expiresAt must be in the future', path: ['expiresAt']
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

module.exports = { createUrlSchema, paginationSchema };
