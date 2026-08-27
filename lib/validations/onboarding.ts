import { z } from 'zod';

export const saveResponsesSchema = z.object({
  token: z.string().min(10, 'Invalid onboarding token'),
  responses: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.number()])),
});

export const toggleChecklistSchema = z.object({
  token: z.string().min(10, 'Invalid onboarding token'),
  checklist_item_id: z.string().uuid(),
  is_completed: z.boolean(),
  notes: z.string().optional().nullable(),
});

export const submitOnboardingSchema = z.object({
  token: z.string().min(10, 'Invalid onboarding token'),
  responses: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.number()])).optional(),
});

export type SaveResponsesInput = z.infer<typeof saveResponsesSchema>;
export type ToggleChecklistInput = z.infer<typeof toggleChecklistSchema>;
export type SubmitOnboardingInput = z.infer<typeof submitOnboardingSchema>;
