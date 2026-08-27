import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { AIGeneratedBriefOutput } from '@/types';
import { BriefGenerationContext, buildSystemPrompt, buildUserPrompt } from './prompts';

export async function generateProjectBrief(
  context: BriefGenerationContext
): Promise<AIGeneratedBriefOutput> {
  const provider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // 1. Anthropic Claude Implementation
  if ((provider === 'anthropic' || !openaiApiKey) && anthropicApiKey && anthropicApiKey.trim() !== '') {
    try {
      const anthropic = new Anthropic({
        apiKey: anthropicApiKey,
      });

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: buildSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: buildUserPrompt(context),
          },
        ],
      });

      const contentBlock = message.content[0];
      if (contentBlock && contentBlock.type === 'text') {
        const text = contentBlock.text.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as AIGeneratedBriefOutput;
          return sanitizeAIOutput(parsed, context);
        }
      }
    } catch (error) {
      console.warn('Anthropic API brief generation failed or timed out. Falling back to structured synthesizer:', error);
    }
  }

  // 2. OpenAI GPT-4o Implementation
  if ((provider === 'openai' || !anthropicApiKey) && openaiApiKey && openaiApiKey.trim() !== '') {
    try {
      const openai = new OpenAI({
        apiKey: openaiApiKey,
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(),
          },
          {
            role: 'user',
            content: buildUserPrompt(context),
          },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content) as AIGeneratedBriefOutput;
        return sanitizeAIOutput(parsed, context);
      }
    } catch (error) {
      console.warn('OpenAI API brief generation failed or timed out. Falling back to structured synthesizer:', error);
    }
  }

  // 3. Fallback Heuristic Generator (Zero external API dependency, guaranteed stability)
  return generateHeuristicBrief(context);
}

function sanitizeAIOutput(
  raw: Partial<AIGeneratedBriefOutput>,
  context: BriefGenerationContext
): AIGeneratedBriefOutput {
  return {
    ai_summary: raw.ai_summary || `Client onboarding submission for ${context.clientName} (${context.clientCompany || 'Direct Client'}).`,
    ai_brief: raw.ai_brief || `## Project Brief for ${context.clientName}\n\nReview questionnaire responses and uploaded assets.`,
    goals: Array.isArray(raw.goals) && raw.goals.length > 0 ? raw.goals : ['Complete kickoff phase', 'Deliver core milestones on schedule'],
    scope: Array.isArray(raw.scope) && raw.scope.length > 0 ? raw.scope : ['Initial design exploration', 'Implementation & deployment'],
    key_assets: Array.isArray(raw.key_assets) && raw.key_assets.length > 0 ? raw.key_assets : context.uploadedFiles.map(f => f.filename),
    open_gaps: Array.isArray(raw.open_gaps) ? raw.open_gaps : [],
    next_steps: Array.isArray(raw.next_steps) && raw.next_steps.length > 0 ? raw.next_steps : ['Schedule kickoff call', 'Review uploaded brand assets'],
  };
}

function generateHeuristicBrief(context: BriefGenerationContext): AIGeneratedBriefOutput {
  const companyOrClient = context.clientCompany || context.clientName;
  
  // Extract answers from responses
  const goalsAnswer = context.questionAnswers.find(q => 
    q.question.toLowerCase().includes('goal') || q.question.toLowerCase().includes('objective')
  )?.answer;

  const audienceAnswer = context.questionAnswers.find(q => 
    q.question.toLowerCase().includes('audience') || q.question.toLowerCase().includes('target') || q.question.toLowerCase().includes('customer')
  )?.answer;

  const deadlineAnswer = context.questionAnswers.find(q => 
    q.question.toLowerCase().includes('date') || q.question.toLowerCase().includes('deadline') || q.question.toLowerCase().includes('timeline')
  )?.answer;

  const brandAnswer = context.questionAnswers.find(q => 
    q.question.toLowerCase().includes('brand') || q.question.toLowerCase().includes('logo') || q.question.toLowerCase().includes('guideline')
  )?.answer;

  const competitorAnswer = context.questionAnswers.find(q => 
    q.question.toLowerCase().includes('competitor') || q.question.toLowerCase().includes('link') || q.question.toLowerCase().includes('inspirational')
  )?.answer;

  const contactAnswer = context.questionAnswers.find(q => 
    q.question.toLowerCase().includes('contact') || q.question.toLowerCase().includes('decision')
  )?.answer;

  // Goals Extraction
  const goals: string[] = [];
  if (goalsAnswer && goalsAnswer.trim()) {
    const lines = goalsAnswer.split(/\n|,|;/).map(s => s.trim().replace(/^[-*•\d.]+\s*/, '')).filter(Boolean);
    goals.push(...lines.slice(0, 4));
  }
  if (goals.length === 0) {
    goals.push(`Deliver tailored agency solution for ${companyOrClient}`);
    goals.push(`Achieve verified launch readiness for ${context.agencyName} handoff`);
  }

  // Scope & Deliverables
  const scope: string[] = [
    `Discovery & Intake review based on submitted requirements`,
    `Core execution & milestone deliverables tailored to ${companyOrClient}`,
    `Final QA, handoff documentation, and asset delivery`,
  ];

  // Key Assets
  const keyAssets: string[] = [];
  if (context.uploadedFiles.length > 0) {
    context.uploadedFiles.forEach(f => keyAssets.push(`${f.filename} (${f.category})`));
  } else {
    keyAssets.push('Pending upload of initial logo & brand guidelines');
  }

  // Open Gaps
  const openGaps: string[] = [];
  if (!deadlineAnswer) openGaps.push('Target launch date / hard milestone deadlines unconfirmed');
  if (context.uploadedFiles.filter(f => f.category === 'contract').length === 0) {
    openGaps.push('Signed client agreement / contract upload pending verification');
  }
  if (context.questionAnswers.some(q => q.required && (!q.answer || q.answer.trim() === ''))) {
    openGaps.push('One or more required questionnaire questions are awaiting detailed answers');
  }

  // Next Steps
  const nextSteps: string[] = [
    `Conduct internal agency briefing with the project team at ${context.agencyName}`,
    `Send kickoff confirmation and schedule initial project review meeting with ${context.clientName}`,
    `Verify repository, staging environment, and access credentials`,
  ];

  // Executive Summary
  const ai_summary = `**${companyOrClient}** has successfully completed their onboarding intake with **${context.agencyName}**.

${goalsAnswer ? `**Primary Objectives:** ${goalsAnswer}` : `The client has submitted their initial requirements and is prepared for project commencement.`}

**Target Timeline:** ${deadlineAnswer || 'To be finalized during kickoff'}. **Primary Contact:** ${contactAnswer || `${context.clientName} (${context.clientEmail})`}. ${context.uploadedFiles.length} file(s) and assets have been uploaded for the delivery team.`;

  // Markdown Project Brief
  const ai_brief = `# 📋 Project Brief: ${companyOrClient}
*Generated automatically by OnboardFlow for **${context.agencyName}***

---

## 🎯 1. Project Overview & Primary Goals
${goalsAnswer ? goalsAnswer : `Project kickoff for ${companyOrClient}. The client seeks a high-impact delivery aligned with ${context.agencyName}'s service standard.`}

### Key Objectives:
${goals.map(g => `- **${g}**`).join('\n')}

---

## 👥 2. Target Audience & Positioning
${audienceAnswer ? audienceAnswer : `Audience specifications and ideal customer persona to be validated in the discovery call.`}

---

## 📦 3. Scope & Key Deliverables
${scope.map(s => `- ${s}`).join('\n')}

---

## 📅 4. Timeline & Critical Deadlines
- **Target Launch / Milestone:** ${deadlineAnswer || 'TBD at kickoff'}
- **Stakeholder Decision Maker:** ${contactAnswer || `${context.clientName} <${context.clientEmail}>`}

---

## 📂 5. Assets & Documentation Status
- **Brand Guidelines:** ${brandAnswer || 'Review provided files'}
- **Inspirations / References:** ${competitorAnswer || 'None provided'}
- **Files Attached:**
${context.uploadedFiles.length > 0 ? context.uploadedFiles.map(f => `  - \`${f.filename}\` [Category: ${f.category}]`).join('\n') : '  - *No files uploaded yet*'}

---

## ⚠️ 6. Open Information Gaps & Risks
${openGaps.length > 0 ? openGaps.map(g => `- ⚠️ ${g}`).join('\n') : '- ✅ All primary intake requirements and assets provided.'}

---

## 🚀 7. Recommended Action Plan
${nextSteps.map((step, idx) => `${idx + 1}. **${step}**`).join('\n')}
`;

  return {
    ai_summary,
    ai_brief,
    goals,
    scope,
    key_assets: keyAssets,
    open_gaps: openGaps,
    next_steps: nextSteps,
  };
}
