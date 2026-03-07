import { NotebookTemplateType } from '@/types/notebook-templates';

export interface TemplatePointsConfig {
  templateId: NotebookTemplateType;
  points: number;
  tier: 'basic' | 'standard' | 'premium' | 'elite';
}

// Point values based on template complexity and features
export const TEMPLATE_POINTS: Record<NotebookTemplateType, TemplatePointsConfig> = {
  'simple': {
    templateId: 'simple',
    points: 1,
    tier: 'basic',
  },
  'meeting-notes': {
    templateId: 'meeting-notes',
    points: 2,
    tier: 'basic',
  },
  'document': {
    templateId: 'document',
    points: 3,
    tier: 'standard',
  },
  'diary': {
    templateId: 'diary',
    points: 2,
    tier: 'basic',
  },
  'journal': {
    templateId: 'journal',
    points: 2,
    tier: 'basic',
  },
  'todo': {
    templateId: 'todo',
    points: 1,
    tier: 'basic',
  },
  'doodle': {
    templateId: 'doodle',
    points: 3,
    tier: 'standard',
  },
  'custom': {
    templateId: 'custom',
    points: 2,
    tier: 'basic',
  },
  'dashboard': {
    templateId: 'dashboard',
    points: 5,
    tier: 'premium',
  },
  'code-notebook': {
    templateId: 'code-notebook',
    points: 4,
    tier: 'standard',
  },
  'planner': {
    templateId: 'planner',
    points: 3,
    tier: 'standard',
  },
  'ai-research': {
    templateId: 'ai-research',
    points: 8,
    tier: 'elite',
  },
  'project': {
    templateId: 'project',
    points: 4,
    tier: 'standard',
  },
  'loop': {
    templateId: 'loop',
    points: 5,
    tier: 'premium',
  },
  'story': {
    templateId: 'story',
    points: 4,
    tier: 'standard',
  },
  'storytelling': {
    templateId: 'storytelling',
    points: 6,
    tier: 'premium',
  },
  'typewriter': {
    templateId: 'typewriter',
    points: 2,
    tier: 'basic',
  },
  'n8n': {
    templateId: 'n8n',
    points: 7,
    tier: 'elite',
  },
  'image-prompt': {
    templateId: 'image-prompt',
    points: 5,
    tier: 'premium',
  },
  'video-prompt': {
    templateId: 'video-prompt',
    points: 6,
    tier: 'premium',
  },
  'link': {
    templateId: 'link',
    points: 2,
    tier: 'basic',
  },
  'studybook': {
    templateId: 'studybook',
    points: 4,
    tier: 'standard',
  },
  'flashcard': {
    templateId: 'flashcard',
    points: 3,
    tier: 'standard',
  },
  'whiteboard': {
    templateId: 'whiteboard',
    points: 6,
    tier: 'premium',
  },
  'recipe': {
    templateId: 'recipe',
    points: 3,
    tier: 'standard',
  },
  'expense': {
    templateId: 'expense',
    points: 3,
    tier: 'standard',
  },
  'trip': {
    templateId: 'trip',
    points: 4,
    tier: 'standard',
  },
  'sound-box': {
    templateId: 'sound-box',
    points: 5,
    tier: 'premium',
  },
  'book-notes': {
    templateId: 'book-notes',
    points: 3,
    tier: 'standard',
  },
  'habit-tracker': {
    templateId: 'habit-tracker',
    points: 3,
    tier: 'standard',
  },
  'workout-log': {
    templateId: 'workout-log',
    points: 3,
    tier: 'standard',
  },
  'budget-planner': {
    templateId: 'budget-planner',
    points: 4,
    tier: 'standard',
  },
  'class-notes': {
    templateId: 'class-notes',
    points: 3,
    tier: 'standard',
  },
  'research-builder': {
    templateId: 'research-builder',
    points: 7,
    tier: 'elite',
  },
  'grocery-list': {
    templateId: 'grocery-list',
    points: 1,
    tier: 'basic',
  },
  'expense-sharer': {
    templateId: 'expense-sharer',
    points: 4,
    tier: 'standard',
  },
  'project-pipeline': {
    templateId: 'project-pipeline',
    points: 5,
    tier: 'premium',
  },
  'prompt-diary': {
    templateId: 'prompt-diary',
    points: 3,
    tier: 'standard',
  },
  'save-the-date': {
    templateId: 'save-the-date',
    points: 2,
    tier: 'basic',
  },
  'important-urls': {
    templateId: 'important-urls',
    points: 2,
    tier: 'basic',
  },
  'language-translator': {
    templateId: 'language-translator',
    points: 5,
    tier: 'premium',
  },
  'dictionary': {
    templateId: 'dictionary',
    points: 3,
    tier: 'standard',
  },
  'meals-planner': {
    templateId: 'meals-planner',
    points: 3,
    tier: 'standard',
  },
  'games-scorecard': {
    templateId: 'games-scorecard',
    points: 3,
    tier: 'standard',
  },
  'sticker-book': {
    templateId: 'sticker-book',
    points: 4,
    tier: 'standard',
  },
  'tutorial-learn': {
    templateId: 'tutorial-learn',
    points: 5,
    tier: 'premium',
  },
  'mind-map': {
    templateId: 'mind-map',
    points: 5,
    tier: 'premium',
  },
  'goal-tracker': {
    templateId: 'goal-tracker',
    points: 4,
    tier: 'standard',
  },
  'ai-prompt-studio': {
    templateId: 'ai-prompt-studio',
    points: 8,
    tier: 'elite',
  },
};

// Plan configurations
export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    maxNotebooks: 1,
    maxTemplates: 0, // Can only use templates they purchase with credits
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 0,
    features: [
      '1 Notebook',
      'Basic templates only',
      'Community support',
      'Purchase credits for premium templates',
    ],
  },
  pro: {
    name: 'Pro',
    maxNotebooks: 10,
    maxTemplates: 10,
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    credits: 50,
    features: [
      'Up to 10 Notebooks',
      'Choose 10 templates',
      '50 bonus credits/month',
      'Priority support',
      'Advanced features',
      'Export to PDF',
    ],
  },
  ultra: {
    name: 'Ultra',
    maxNotebooks: -1, // Unlimited
    maxTemplates: -1, // All templates
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    credits: 150,
    features: [
      'Unlimited Notebooks',
      'All templates included',
      '150 bonus credits/month',
      'Premium support',
      'All advanced features',
      'Priority AI processing',
      'Custom branding',
      'Team collaboration',
    ],
  },
};

// Credit packages for purchase
export const CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    credits: 10,
    price: 10,
    popular: false,
  },
  {
    id: 'credits_25',
    credits: 25,
    price: 25,
    popular: false,
  },
  {
    id: 'credits_50',
    credits: 50,
    price: 50,
    popular: true,
    discount: 'Best Value',
  },
  {
    id: 'credits_100',
    credits: 115,
    price: 100,
    popular: false,
    discount: '15% bonus',
  },
  {
    id: 'credits_250',
    credits: 300,
    price: 250,
    popular: false,
    discount: '20% bonus',
  },
];

// Helper functions
export function getTemplatePoints(templateId: NotebookTemplateType): number {
  return TEMPLATE_POINTS[templateId]?.points || 0;
}

export function getTemplateTier(templateId: NotebookTemplateType): string {
  return TEMPLATE_POINTS[templateId]?.tier || 'basic';
}

export function canAccessTemplate(
  planType: 'free' | 'pro' | 'ultra',
  templateId: NotebookTemplateType,
  selectedTemplates: string[]
): boolean {
  if (planType === 'ultra') return true;
  if (planType === 'pro') {
    return selectedTemplates.includes(templateId);
  }
  // Free users can only access basic templates or purchased ones
  return TEMPLATE_POINTS[templateId]?.tier === 'basic' || selectedTemplates.includes(templateId);
}

export function calculateDiscount(billingCycle: 'monthly' | 'yearly', planType: 'pro' | 'ultra'): number {
  if (billingCycle === 'yearly') {
    const monthlyTotal = PLAN_CONFIG[planType].monthlyPrice * 12;
    const yearlyPrice = PLAN_CONFIG[planType].yearlyPrice;
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
  }
  return 0;
}
