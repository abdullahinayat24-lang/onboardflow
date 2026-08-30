import { z } from 'zod';

export const saveResponsesSchema = z.object({
  token: z.string().min(8, 'Invalid onboarding token'),
  responses: z.record(z.string(), z.any()),
});

export const toggleChecklistSchema = z.object({
  token: z.string().min(8, 'Invalid onboarding token'),
  checklist_item_id: z.string(),
  is_completed: z.boolean(),
  notes: z.string().optional().nullable(),
});

export const submitOnboardingSchema = z.object({
  token: z.string().min(8, 'Invalid onboarding token'),
  responses: z.record(z.string(), z.any()).optional(),
  platform_access: z.any().optional(),
  payment: z.any().optional(),
});

export type SaveResponsesInput = z.infer<typeof saveResponsesSchema>;
export type ToggleChecklistInput = z.infer<typeof toggleChecklistSchema>;
export type SubmitOnboardingInput = z.infer<typeof submitOnboardingSchema>;
