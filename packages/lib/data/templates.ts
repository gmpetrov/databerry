type Template = {
  slug: string;
  name: string;
  title?: string;
  description?: string;
  category:
    | 'lead_generation'
    | 'product'
    | 'hr'
    | 'customer_support'
    | 'survey'
    | 'other';
  isPremiumRequired?: boolean;
};

const templates = [
  // For Customer Support
  {
    slug: 'customer-support',
    name: 'Customer Support',
    description:
      'Automate your customer support with an AI chatbot trained on your data',
    category: 'customer_support',
  },
  {
    slug: 'customer-support-gpt-4',
    name: 'Customer Support Powered By GPT-4',
    description:
      'Automate your customer support with a GPT-4 Powered AI chatbot',
    category: 'customer_support',
  },

  // For Lead Generation
  {
    slug: 'lead-generation',
    name: 'Customer Support Powered By GPT-4',
    description:
      'Collect name, email, and phone number from your website visitors',
    category: 'lead_generation',
  },

  // For Product
  // For HR
] as Template[];

export default templates;
