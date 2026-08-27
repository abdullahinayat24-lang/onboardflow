import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nanoid } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateOnboardingToken(): string {
  return `ob_${nanoid(24)}`;
}

export function generateShareToken(): string {
  return `pkg_${nanoid(24)}`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getStatusBadgeVariant(status: string): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        borderClass: 'border-emerald-200 dark:border-emerald-800',
        dotClass: 'bg-emerald-500',
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        bgClass: 'bg-amber-50 dark:bg-amber-950/40',
        textClass: 'text-amber-700 dark:text-amber-300',
        borderClass: 'border-amber-200 dark:border-amber-800',
        dotClass: 'bg-amber-500',
      };
    case 'invited':
    default:
      return {
        label: 'Invited',
        bgClass: 'bg-blue-50 dark:bg-blue-950/40',
        textClass: 'text-blue-700 dark:text-blue-300',
        borderClass: 'border-blue-200 dark:border-blue-800',
        dotClass: 'bg-blue-500',
      };
  }
}

export function calculateCompletionPercent(params: {
  totalQuestions: number;
  answeredQuestions: number;
  totalChecklist: number;
  completedChecklist: number;
  hasContract: boolean;
}): number {
  const totalItems = params.totalQuestions + params.totalChecklist + (params.hasContract ? 1 : 0);
  if (totalItems === 0) return 0;
  
  const completedItems = params.answeredQuestions + params.completedChecklist + (params.hasContract ? 1 : 0);
  return Math.min(100, Math.round((completedItems / totalItems) * 100));
}
