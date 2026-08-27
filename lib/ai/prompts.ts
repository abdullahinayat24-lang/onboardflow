import { PlatformAccessLocker, PaymentInfo } from '@/types';

export interface BriefGenerationContext {
  agencyName: string;
  clientName: string;
  clientCompany?: string | null;
  clientEmail: string;
  serviceCategory?: string;
  platformAccess?: PlatformAccessLocker | null;
  paymentInfo?: PaymentInfo | null;
  questionAnswers: Array<{
    question: string;
    answer: string;
    required: boolean;
  }>;
  uploadedFiles: Array<{
    filename: string;
    category: string;
  }>;
  completedChecklistItems: string[];
}

export function buildSystemPrompt(): string {
  return `You are an elite Creative Agency Project Director and Operations Strategist.
Your job is to analyze client onboarding submissions (questionnaire answers, uploaded assets, contracts, social media access, Google Drive links, and checklist items) and generate:
1. A concise, punchy Executive Summary (2-3 paragraphs) capturing the client's core vision, brand aesthetic, posting/deliverable frequency, target audience, and key value proposition.
2. A comprehensive, beautifully formatted Markdown Project Brief ready for direct handoff to design, content creation, social media, and engineering teams.
3. Structured JSON arrays for:
   - "goals": Top primary project goals and KPI success metrics.
   - "scope": Core deliverables and functional scope boundaries.
   - "key_assets": Summary of provided assets, brand status, and documents.
   - "open_gaps": Unaddressed requirements, missing access/files, or questions the agency needs to clarify immediately.
   - "next_steps": Recommended concrete next steps for the project kickoff team.

Maintain an actionable, clear, professional tone. If this is a Social Media or Artwork project, emphasize visual style, content pillars, channel strategy, and asset readiness.`;
}

export function buildUserPrompt(context: BriefGenerationContext): string {
  const qaSection =
    context.questionAnswers.length > 0
      ? context.questionAnswers
          .map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer || '[No answer provided]'}`)
          .join('\n\n')
      : '[No questionnaire responses submitted yet]';

  const filesSection =
    context.uploadedFiles.length > 0
      ? context.uploadedFiles
          .map((f, i) => `${i + 1}. ${f.filename} (Category: ${f.category})`)
          .join('\n')
      : '[No uploaded files or assets yet]';

  const checklistSection =
    context.completedChecklistItems.length > 0
      ? context.completedChecklistItems.map((c) => `- [x] ${c}`).join('\n')
      : '[No checklist items completed yet]';

  const accessDetails = context.platformAccess
    ? `Instagram: ${context.platformAccess.instagram_handle || 'N/A'}
Facebook: ${context.platformAccess.facebook_page_url || 'N/A'}
Google Drive / Cloud Link: ${context.platformAccess.google_drive_folder_url || 'N/A'}
Access Notes / Meta ID: ${context.platformAccess.login_credentials_notes || 'N/A'}`
    : 'No platform access details submitted';

  return `Please review the following client onboarding data and generate the Executive Summary and Project Brief:

--- AGENCY INFORMATION ---
Agency: ${context.agencyName}

--- CLIENT INFORMATION ---
Client Name: ${context.clientName}
Company: ${context.clientCompany || 'Not Specified'}
Email: ${context.clientEmail}
Service Category: ${context.serviceCategory || 'Creative Retainer'}

--- PLATFORM & CLOUD ACCESS DETAILS ---
${accessDetails}

--- QUESTIONNAIRE RESPONSES ---
${qaSection}

--- UPLOADED ASSETS & CONTRACTS ---
${filesSection}

--- COMPLETED ONBOARDING CHECKLIST ITEMS ---
${checklistSection}

--- OUTPUT FORMAT REQUIREMENTS ---
Return a VALID JSON object matching this exact schema:
{
  "ai_summary": "High-level 2-3 paragraph executive summary in markdown format...",
  "ai_brief": "Complete structured project brief in markdown format with headings (## 🎯 Project Overview, ## 👥 Target Audience & Aesthetic, ## 📦 Scope & Deliverables, ## 📱 Platform & Content Strategy, ## 📂 Assets & Resources, ## ⚠️ Risks & Missing Info, ## 🚀 Kickoff Action Plan)...",
  "goals": ["Goal 1", "Goal 2", "Goal 3"],
  "scope": ["Deliverable 1", "Deliverable 2", "Deliverable 3"],
  "key_assets": ["Asset 1", "Asset 2"],
  "open_gaps": ["Missing item 1", "Clarification needed on item 2"],
  "next_steps": ["Step 1", "Step 2", "Step 3"]
}`;
}
