'use client';

import React, { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { QuestionnaireBuilder } from '@/components/templates/questionnaire-builder';
import { ChecklistBuilder } from '@/components/templates/checklist-builder';
import { Tabs } from '@/components/ui/tabs';
import { QuestionnaireTemplate, QuestionnaireQuestion, ChecklistTemplate, ChecklistTemplateItem } from '@/types';
import { Layers, CheckCircle2, HelpCircle } from 'lucide-react';

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('questionnaire');

  // Standard initial templates
  const [qTemplate, setQTemplate] = useState<
    QuestionnaireTemplate & { questions: QuestionnaireQuestion[] }
  >({
    id: 'default-q-template',
    agency_id: 'agency-1',
    title: 'Standard Project Intake Questionnaire',
    description: 'Covers core project objectives, target audience, timeline, and branding status.',
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        template_id: 'default-q-template',
        label: 'What are the top 3 goals of this project?',
        description: 'Be as specific as possible about what success looks like.',
        placeholder: 'e.g. 1. Increase conversion rate by 20%, 2. Modernize brand aesthetic...',
        type: 'long_text',
        options: [],
        required: true,
        order_index: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'q2',
        template_id: 'default-q-template',
        label: 'Who is your primary target audience?',
        description: 'Describe your ideal customer, user demographics, and pain points.',
        placeholder: 'e.g. Mid-market B2B executives...',
        type: 'long_text',
        options: [],
        required: true,
        order_index: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 'q3',
        template_id: 'default-q-template',
        label: 'What is your target launch date or critical deadline?',
        description: 'Mention any fixed events or marketing launches.',
        placeholder: 'e.g. Q4 Launch (November 15th)',
        type: 'short_text',
        options: [],
        required: true,
        order_index: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: 'q4',
        template_id: 'default-q-template',
        label: 'Do you have existing brand guidelines & color palettes?',
        description: 'Specify whether you will provide assets or need new branding created.',
        placeholder: '',
        type: 'single_choice',
        options: [
          'Yes, we have complete brand guidelines ready',
          'We have some logos/colors but need guidance',
          'No, we need brand assets created from scratch',
        ],
        required: true,
        order_index: 4,
        created_at: new Date().toISOString(),
      },
    ],
  });

  const [cTemplate, setCTemplate] = useState<
    ChecklistTemplate & { items: ChecklistTemplateItem[] }
  >({
    id: 'default-c-template',
    agency_id: 'agency-1',
    title: 'Standard Onboarding Checklist',
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'c1',
        template_id: 'default-c-template',
        label: 'Complete Intake Questionnaire',
        description: 'Answer project goals, audience, and timeline questions.',
        category: 'questionnaire',
        required: true,
        order_index: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'c2',
        template_id: 'default-c-template',
        label: 'Upload Signed Contract / Agreement',
        description: 'Provide signed client service agreement or MSA.',
        category: 'contract',
        required: true,
        order_index: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 'c3',
        template_id: 'default-c-template',
        label: 'Upload Brand Assets & Logos',
        description: 'Vector logos (.SVG, .AI), high-res images, and typography files.',
        category: 'asset',
        required: true,
        order_index: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: 'c4',
        template_id: 'default-c-template',
        label: 'Provide Required Account Logins / Access',
        description: 'Domain registrar, CMS, analytics, or hosting credentials.',
        category: 'access',
        required: false,
        order_index: 4,
        created_at: new Date().toISOString(),
      },
    ],
  });

  const tabs = [
    {
      id: 'questionnaire',
      label: 'Intake Questionnaire Template',
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      id: 'checklist',
      label: 'Checklist Deliverables Template',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  return (
    <div>
      <Header
        title="Onboarding Templates"
        description="Build reusable questionnaire and checklist templates automatically assigned to new clients"
      />

      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'questionnaire' && (
          <QuestionnaireBuilder
            template={qTemplate}
            onSaved={(updated) => setQTemplate(updated)}
          />
        )}

        {activeTab === 'checklist' && (
          <ChecklistBuilder
            template={cTemplate}
            onSaved={(updated) => setCTemplate(updated)}
          />
        )}
      </div>
    </div>
  );
}
