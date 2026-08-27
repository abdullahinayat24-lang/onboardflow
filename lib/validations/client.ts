import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  questionnaire_template_id: z.string().uuid().optional().nullable(),
  checklist_template_id: z.string().uuid().optional().nullable(),
  send_invitation_email: z.boolean().default(true),
});

export const updateClientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  company: z.string().optional().nullable(),
  status: z.enum(['invited', 'in_progress', 'completed']).optional(),
  questionnaire_template_id: z.string().uuid().optional().nullable(),
  checklist_template_id: z.string().uuid().optional().nullable(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
