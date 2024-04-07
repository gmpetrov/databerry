import cuid from 'cuid';

import { FormConfigSchema } from '../types/dtos';

type FormTemplate = {
  name: string;
  // category: 'marketing' | 'product' | 'sales' | 'support';
  description?: string;
  schema: FormConfigSchema;
};

export const FROM_SCRATCH: FormTemplate = {
  name: 'Start From Scratch',
  description:
    'Create a form from scratch. You can add any field you want and customize the design.',
  // category: 'marketing',
  schema: {
    fields: [
      {
        id: cuid(),
        type: 'email',
        shouldCreateContact: true,
        name: 'email',
        required: true,
      },
    ],
    startScreen: {
      title: 'Title',
      description: 'Description',
    },
  },
};

export const LEAD_FORM: FormTemplate = {
  name: 'Lead Form',
  description: 'A form to capture lead information including email and phone.',
  schema: {
    overview: `This form is designed to capture essential lead information, including email and phone, to facilitate further communication.`,
    fields: [
      {
        id: cuid(),
        type: 'email',
        shouldCreateContact: true,
        name: 'email',
        required: true,
        placeholder: 'Enter your email',
      },
      {
        id: cuid(),
        type: 'phoneNumber',
        name: 'phone',
        required: true,
        placeholder: 'Enter your phone number',
      },
      {
        id: cuid(),
        type: 'textArea',
        name: 'comment',
        required: false,
        placeholder: 'Enter any additional comments',
      },
    ],
    startScreen: {
      title: 'Get in Touch',
      description: "We're here to help! Please fill out the form below.",
    },
  },
};

export const PRODUCT_FEEDBACK_FORM: FormTemplate = {
  name: 'Product Feedback Form',
  description: 'A form to gather feedback on our products.',
  schema: {
    overview: `This form is designed to collect feedback on our products. Your input is valuable to us and helps us improve our offerings.`,
    fields: [
      {
        id: cuid(),
        type: 'email',
        shouldCreateContact: true,
        name: 'email',
        required: true,
        placeholder: 'Enter your email',
      },
      {
        id: cuid(),
        type: 'select',
        name: 'type',
        required: true,
        options: ['Feature Request', 'Bug Report', 'Other'],
        placeholder: 'Select feedback type',
      },
      {
        id: cuid(),
        type: 'textArea',
        name: 'comment',
        required: true,
        placeholder: 'Enter your feedback here',
      },
      {
        id: cuid(),
        type: 'file',
        name: 'files',
        required: false,
        placeholder: 'Attach files (optional)',
      },
    ],
    startScreen: {
      title: 'Your Feedback Matters',
      description:
        "We're here to listen! Please share your thoughts on our products.",
    },
  },
};

export const ONBOARDING_FORM: FormTemplate = {
  name: 'Onboarding Form',
  description: 'A form to gather initial information about new users.',
  schema: {
    overview: `This form is designed to collect initial information about new users to help us tailor our services to their needs.`,
    fields: [
      {
        id: cuid(),
        type: 'email',
        shouldCreateContact: true,
        name: 'email',
        required: true,
        placeholder: 'Enter your email',
      },
      {
        id: cuid(),
        type: 'select',
        name: 'industry',
        required: true,
        options: [
          'Technology',
          'E-commerce',
          'Healthcare',
          'Finance',
          'Retail',
          'Manufacturing',
          'Other',
        ],
        placeholder: 'Select your industry',
      },
      {
        id: cuid(),
        type: 'select',
        name: 'company size',
        required: true,
        options: ['1-10', '10-100', '100+'],
        placeholder: 'Select your company size',
      },
      {
        id: cuid(),
        type: 'select',
        name: 'Where did you hear about us ?',
        required: true,
        options: [
          'Google',
          'Social Media',
          'Newsletter',
          'Word of Mouth',
          'Trade Show',
          'Other',
        ],
        placeholder: 'Where did you hear about us?',
      },
    ],
    startScreen: {
      title: 'Welcome to Our Platform',
      description: "We're excited to have you here! Let's get started.",
    },
  },
};

export const INBOUND_LEAD: FormTemplate = {
  name: 'Inbound Lead',
  description:
    'Attract potential clients at the beginning of any funnel, prompting them to submit their contact information.',
  // category: 'marketing',
  schema: {
    overview: `A conversation to convince potential prospect about Acme Inc. solution.

    Start by giving a brief intro about Acme.
    
    Ask for the email only if they are interested in receiving email updates.`,
    fields: [
      {
        id: cuid(),
        type: 'text',
        name: 'firstName',
        required: true,
      },
      {
        id: cuid(),
        type: 'email',
        shouldCreateContact: true,
        name: 'email',
        required: true,
      },
      {
        id: cuid(),
        type: 'select',
        name: 'Intested in',
        options: [
          'Website Dev',
          'Content Marketing',
          'Social Media',
          'UI/UX Design',
        ],
        required: true,
      },
    ],
    startScreen: {
      title: 'Awesome Company',
      description: "Welcome on board! Let's get to know each other!",
    },
  },
};

export const CONTACT_SALES: FormTemplate = {
  name: 'Contact sales',
  description:
    'Prepare and assess potential clients before they arrange a discussion with your sales representatives.',
  // category: 'marketing',
  schema: {
    overview: `A conversation to convince potential prospect about Acme Inc. solution.

    Start by giving a brief intro about Acme.
    
    Ask for the email only if they are interested in receiving email updates.
    
    
    At Acme Inc., we're dedicated to providing top-notch solutions and services to meet your needs. 
    With a team of experts committed to excellence, we strive to deliver innovative products that redefine industry standards.
    `,
    fields: [
      {
        id: cuid(),
        type: 'text',
        name: 'firstName',
        required: true,
      },
      {
        id: cuid(),
        type: 'email',
        shouldCreateContact: true,
        name: 'email',
        required: true,
      },
      {
        id: cuid(),
        type: 'select',
        name: 'Interested in',
        options: [
          'Website Dev',
          'Content Marketing',
          'Social Media',
          'UI/UX Design',
        ],
        required: true,
      },
    ],
    startScreen: {
      title: 'Contact sales',
      description: 'Learn about our Enterprise Plan',
    },
  },
};

export const FEEDBACK: FormTemplate = {
  name: 'Product Feedback',
  description:
    'Obtain opinions on a product through an engaging dialogue-based approach.',
  // category: 'marketing',
  schema: {
    overview: `Gather feedback from new customer of one of our model of sneaker
    Acme Clothes is a distinguished fashion brand renowned for its high-quality, stylish apparel. 
    Offering a wide range of clothing options for men, women, and kids, Acme Clothes combines comfort with contemporary trends to create unique and versatile pieces suitable for every occasion.
    `,
    fields: [
      {
        id: cuid(),
        type: 'text',
        name: 'model purchased',
        required: true,
      },
      {
        id: cuid(),
        type: 'text',
        name: 'Size fitting',
        required: true,
      },
      {
        id: cuid(),
        type: 'text',
        name: 'Price value assessment ',
        required: true,
      },
      {
        id: cuid(),
        type: 'number',
        name: 'Overall satisfaction (1-5)',
        required: true,
      },
    ],
    startScreen: {
      title: 'Sneaker.com',
      description: 'Let us know how we can improve our product',
    },
  },
};
