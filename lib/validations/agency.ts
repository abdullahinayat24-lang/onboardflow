import { z } from 'zod';

export const updateAgencyBrandingSchema = z.object({
  name: z.string().min(2, 'Agency name is required'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional().nullable(),
  logo_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  brand_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color code like #3B82F6'),
  website: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  support_email: z.string().email('Must be a valid email').optional().nullable().or(z.literal('')),
});

export const updateReminderSettingsSchema = z.object({
  days_before_reminder: z.number().int().min(1, 'Minimum 1 day').max(30, 'Maximum 30 days'),
  max_reminders: z.number().int().min(1, 'Minimum 1 reminder').max(5, 'Maximum 5 reminders'),
  enabled: z.boolean(),
  custom_message: z.string().optional().nullable(),
});

export type UpdateAgencyBrandingInput = z.infer<typeof updateAgencyBrandingSchema>;
export type UpdateReminderSettingsInput = z.infer<typeof updateReminderSettingsSchema>;
