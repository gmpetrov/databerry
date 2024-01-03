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
        type: 'text',
        name: 'email',
        required: true,
      },
    ],
    startScreen: {
      title: 'Title',
      description: 'Description',
      cta: {
        label: 'Start',
      },
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
        type: 'text',
        name: 'email',
        required: true,
      },
      {
        id: cuid(),
        type: 'multiple_choice',
        name: 'Intested in',
        choices: [
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
      cta: {
        label: '🎉 Start',
      },
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
        type: 'text',
        name: 'email',
        required: true,
      },
      {
        id: cuid(),
        type: 'multiple_choice',
        name: 'Interested in',
        choices: [
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
      cta: {
        label: 'Talk to sales',
      },
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
        type: 'text',
        name: 'Overall satisfaction (1-5)',
        required: true,
      },
    ],
    startScreen: {
      title: 'Sneaker.com',
      description: 'Let us know how we can improve our product',
      cta: {
        label: '💬 Share Feedback',
      },
    },
  },
};
