import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  service_category: z.string().optional().nullable(),
  questionnaire_template_id: z.string().optional().nullable(),
  checklist_template_id: z.string().optional().nullable(),
  manager_id: z.string().optional().nullable(),
  assigned_staff_ids: z.array(z.string()).optional(),
  send_invitation_email: z.boolean().default(true),
});

export const updateClientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  service_category: z.string().optional().nullable(),
  status: z.enum(['invited', 'in_progress', 'completed']).optional(),
  is_starred: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  manager_id: z.string().optional().nullable(),
  assigned_staff_ids: z.array(z.string()).optional(),
  project_status: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  questionnaire_template_id: z.string().optional().nullable(),
  checklist_template_id: z.string().optional().nullable(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
