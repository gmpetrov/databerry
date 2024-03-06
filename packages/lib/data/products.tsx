import { Product } from '../types';

const items: Product[] = [
  {
    slug: 'ai-chatbot',
    name: 'AI Agent',
    title: 'ChatGPT AI Chatbot for Your Website In Minutes',
    description:
      'Train an AI chatbot with your data. Add it to your site or existing tools in minutes! Your chatbot is automatically retrained when your data changes.',
    metadata: {
      title:
        'AI Agent - Custom ChatGPT AI Chatbot for Your Website | Chaindesk',
    },
    logo: '/images/logo.png',
    cta: {
      label: 'Get Started for Free',
      url: 'https://app.chaindesk.ai/agents',
    },
    keywords: [
      'ChatGPT Chatbot For Your Website',
      'Install ChatGPT Chatbot On Website',
    ],
    icon: (props: any) => {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          {...props}
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 0 0 1.28.53l4.184-4.183a.39.39 0 0 1 .266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0 0 12 2.25ZM8.25 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Zm2.625 1.125a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
            clipRule="evenodd"
          />
        </svg>
      );
    },

    youtubeVideoId: '-NkVS2l66Zs',
    features: {
      items: [
        {
          name: 'Import your data',
          description:
            'Import custom data from various data sources like File, Notion, Google, and more.',
        },
        {
          name: 'Training',
          description:
            'After collecting your data, we process it and train your bot. Don’t worry, it’s fast ⚡️',
        },
        {
          name: 'Add to your site',
          description:
            'Easily embed on your website or add it to your existing tools with one of our integrations',
        },
        {
          name: 'Auto Sync',
          description:
            'We keep the bot up to date with your data. \nWe automatically synch your data when possible.\n You can also setup a webhook or manually trigger a synch.',
        },
      ],
    },
  },
  {
    slug: 'ai-form',
    name: 'AI Form',
    title: 'Build AI-Powered Forms in Minutes',
    icon: (props: any) => {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          {...props}
        >
          <path
            fillRule="evenodd"
            d="M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5Zm6.61 10.936a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 14.47a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
            clipRule="evenodd"
          />
          <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
        </svg>
      );
    },
    description:
      'Create beautiful AI-driven forms that talk naturally, ask/answer questions & engage users in any touch point.',
    metadata: {
      title: 'AI Form - Build GPT-Powered form in minutes | Chaindesk',
    },
    logo: '/images/logo.png',
    cta: {
      label: 'Get Started for Free',
      url: 'https://app.chaindesk.ai/forms',
    },
    keywords: ['AI-Driven Forms', 'ChatGPT Form', 'AI Form'],

    youtubeVideoId: 'gfoy81esFVg',
    features: {
      items: [
        {
          name: 'Form Setup',
          description:
            "Use Chaindesk's form builder to configure your form. Give your AI a persona and add fields for data you want to collect.",
        },
        {
          name: 'Publish',
          description:
            'Just click the publish button to get a public link you can share with anyone.',
        },
        {
          name: 'Embed on your website',
          description:
            'Easily embed the form on your website with a simple HTML snippet.',
        },
        {
          name: 'Connect your form to a Chaindesk AI Agent',
          description:
            'Optionally, AI Forms can be connected to a Chaindesk AI Agent to enhance their capabilities.',
        },
      ],
    },
  },
  {
    slug: 'ai-email-support',
    name: 'AI Email Support',
    title: 'Automate Your Email Support',
    description:
      'Automate your email support with the help of AI. Get 10x fast replies!',
    metadata: {
      title: 'Email Support - Automate Your Email Support with AI | Chaindesk',
    },
    logo: '/images/logo.png',
    icon: (props: any) => {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          {...props}
        >
          <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
          <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
        </svg>
      );
    },
    cta: {
      label: 'Get Started for Free',
      url: 'https://app.chaindesk.ai/forms',
    },
    features: {
      title: `AI-Powered email support`,
      description: `Handle all your emails through Chaindesk's convenient dashboard. The Email Inbox uses AI too - it will assist you in resolving the issue faster.`,
      items: [
        {
          name: '2-minutes setup',
          description:
            'Configure Chaindesk to receive and send emails on your behalf - get started in less than 2 minutes.',
        },
        {
          name: 'AI-powered email replies',
          description:
            "Chaindesk's AI will learn - not only from your knowledge base - but from all your previous email conversations.",
        },
        {
          name: 'Smart suggestions',
          description:
            'Our AI will help you handle email support faster by suggesting solutions from similar cases.',
        },
      ],
    },
    keywords: ['AI-Driven Forms', 'ChatGPT Form', 'AI Form'],

    // youtubeVideoId: '-NkVS2l66Zs',
    imageUrl: '/images/email-inbox.jpg',
    // features: [
    //   {
    //     name: 'Just paste your website url',
    //     description:
    //       'We automatically get your website pages.\nOther data sources are available too \n(e.g. PDF, Gdoc, Sheets, Notion, Airtable, etc...)',
    //   },
    //   {
    //     name: 'Training',
    //     description:
    //       'After collecting your data, we process it and train your bot. Don’t worry, it’s fast ⚡️',
    //   },
    //   {
    //     name: 'Copy/Paste the HTML snippet',
    //     description:
    //       'The final step is to the widget on your website. \nJust add the generated HTML code to your website',
    //   },
    //   {
    //     name: 'Auto Sync',
    //     description:
    //       'We keep the bot up to date with your data. \nWe automatically synch your data when possible.\n You can also setup a webhook or manually trigger a synch.',
    //   },
    // ],
  },

  {
    slug: 'shared-inbox',
    name: 'Shared Inbox',
    title: 'Shared Inbox for Your Team',
    description:
      'Monitor and manage all your customer conversations in one place. Take over your AI chatbot when needed. Assign conversations to your team members.',
    metadata: {
      title:
        'Shared Inbox - All your AI chatbot conversations in one place | Chaindesk',
      description: '',
    },
    logo: '/images/logo.png',
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M5.478 5.559A1.5 1.5 0 0 1 6.912 4.5H9A.75.75 0 0 0 9 3H6.912a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H15a.75.75 0 0 0 0 1.5h2.088a1.5 1.5 0 0 1 1.434 1.059l2.213 7.191H17.89a3 3 0 0 0-2.684 1.658l-.256.513a1.5 1.5 0 0 1-1.342.829h-3.218a1.5 1.5 0 0 1-1.342-.83l-.256-.512a3 3 0 0 0-2.684-1.658H3.265l2.213-7.191Z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M12 2.25a.75.75 0 0 1 .75.75v6.44l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V3a.75.75 0 0 1 .75-.75Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    cta: {
      label: 'Get Started for Free',
      url: 'https://app.chaindesk.ai/forms',
    },
    keywords: ['AI-Driven Forms', 'ChatGPT Form', 'AI Form'],

    // youtubeVideoId: '-NkVS2l66Zs',
    imageUrl: '/images/shared-inbox.jpg',
    features: {
      label: 'All in one place',
      title: 'AI-powered shared inbox',
      description: 'Monitor, manage, assign conversations and more.',
      items: [
        {
          name: 'All your conversations in one place',
          description:
            'Monitor and manage all your customer conversations in one place.',
        },
        {
          name: 'Human Handoff',
          description: 'Take over your AI chatbot when needed.',
        },
        {
          name: 'Team Collaboration',
          description: 'Assign conversations to your team members.',
        },
        {
          name: 'AI-powered replies',
          description:
            'Even when you take over the conversation, our AI will help you draft the perfect answer.',
        },
      ],
    },
  },
];

export default items;
