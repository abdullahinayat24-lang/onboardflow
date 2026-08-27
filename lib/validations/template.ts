import { z } from 'zod';

export const questionSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Question label is required'),
  description: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  type: z.enum(['short_text', 'long_text', 'single_choice', 'multiple_choice', 'number', 'url', 'file']),
  options: z.array(z.string()).optional().default([]),
  required: z.boolean().default(false),
  order_index: z.number().int().default(0),
});

export const questionnaireTemplateSchema = z.object({
  title: z.string().min(2, 'Template title must be at least 2 characters'),
  description: z.string().optional().nullable(),
  is_default: z.boolean().default(false),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

export const checklistItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Item label is required'),
  description: z.string().optional().nullable(),
  category: z.enum(['questionnaire', 'contract', 'asset', 'access', 'general']).default('general'),
  required: z.boolean().default(true),
  order_index: z.number().int().default(0),
});

export const checklistTemplateSchema = z.object({
  title: z.string().min(2, 'Template title must be at least 2 characters'),
  is_default: z.boolean().default(false),
  items: z.array(checklistItemSchema).min(1, 'At least one checklist item is required'),
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type QuestionnaireTemplateInput = z.infer<typeof questionnaireTemplateSchema>;
export type ChecklistItemInput = z.infer<typeof checklistItemSchema>;
export type ChecklistTemplateInput = z.infer<typeof checklistTemplateSchema>;
