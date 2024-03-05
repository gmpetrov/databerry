import { Product } from '../types';

const items: Product[] = [
  // Channels
  {
    slug: 'website',
    name: 'Website',
    title: 'Add a Custom GPT Agent to Your Website in Minutes',
    description:
      'Deploy your AI Chatbot on your website. Customize to fit your brand. Copy/Paste your HTML snippet to go live! Your chatbot is automatically retrained when your data changes.',
    metadata: {
      title: 'Chat Bubble - Chaindesk: Train Your Chatbot in Minutes',
      description: '',
    },
    logo: 'https://www.svgrepo.com/show/197996/internet.svg',
    cta: {
      label: 'Start for free',
      url: 'https://app.chaindesk.ai/agents',
    },
    keywords: ['ChatGPT Chatbot For Your Website'],

    youtubeVideoId: '-NkVS2l66Zs',
    imageUrl: '',
    features: {
      items: [
        {
          name: 'Just paste your website url',
          description:
            'We automatically get your website pages.\nOther data sources are available too \n(e.g. PDF, Gdoc, Sheets, Notion, Airtable, etc...)',
        },
        {
          name: 'Training',
          description:
            'After collecting your data, we process it and train your bot. Don’t worry, it’s fast ⚡️',
        },
        {
          name: 'Customize to fit your brand',
          description:
            'The final step is to the widget on your website. \nJust add the generated HTML code to your website',
        },
        {
          name: 'Auto Sync',
          description:
            'We keep the bot up to date with your data. \nWe automatically synch your data when possible.\n You can also setup a webhook or manually trigger a synch.',
        },
      ],
    },
    isChannel: true,
  },
  {
    slug: 'whatsapp',
    name: 'WhatsApp',
    title: 'Add a Custom GPT Chatbot to WhatsApp in Minutes',
    description:
      'Deploy a custom AI Chatbot to your Slack workspace in minutes. Train with your company data, install the Slack plugin, and enjoy AI-driven interactions.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
    cta: {
      label: 'Create your WhatsApp AI Chatbot',
      url: 'https://app.chaindesk.ai/agents',
    },
    metadata: {
      title: 'ChatGPT Bot for Slack with Chaindesk: Elevate Your Workspace',
      description: ``,
    },
    youtubeVideoId: 'x8-poiGrBa8',
    isComingSoon: false,
    isDatasource: false,
    isChannel: true,
    features: {
      items: [
        {
          name: 'Just paste your website url',
          description:
            'We automatically get your website pages.\nOther data sources are available too \n(e.g. PDF, Gdoc, Sheets, Notion, Airtable, etc...)',
        },
        {
          name: 'Training',
          description:
            'After collecting your data, we process it and train your bot. Don’t worry, it’s fast ⚡️',
        },
        {
          name: 'Install Slack plugin',
          description:
            'The final step is to install Chaindesk Bot to your Slack workspace. \nNow your workspace is spiced up \nwith some AI magic ✨',
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
    slug: 'slack',
    name: 'Slack',
    title: 'Add a Custom GPT Chatbot to Your Slack Workspace in Minutes',
    description:
      'Deploy a custom AI Chatbot to your Slack workspace in minutes. Train with your company data, install the Slack plugin, and enjoy AI-driven interactions.',
    logo: '/shared/images/logos/slack.png',
    cta: {
      label: 'Create your Slack Bot',
      url: 'https://app.chaindesk.ai/agents',
    },
    metadata: {
      title: 'ChatGPT Bot for Slack with Chaindesk: Elevate Your Workspace',
      description: ``,
    },
    youtubeVideoId: 'x8-poiGrBa8',
    isComingSoon: false,
    isDatasource: false,
    isChannel: true,
    features: {
      items: [
        {
          name: 'Just paste your website url',
          description:
            'We automatically get your website pages.\nOther data sources are available too \n(e.g. PDF, Gdoc, Sheets, Notion, Airtable, etc...)',
        },
        {
          name: 'Training',
          description:
            'After collecting your data, we process it and train your bot. Don’t worry, it’s fast ⚡️',
        },
        {
          name: 'Install Slack plugin',
          description:
            'The final step is to install Chaindesk Bot to your Slack workspace. \nNow your workspace is spiced up \nwith some AI magic ✨',
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
    slug: 'crisp',
    name: 'Crisp',
    title: 'Automate Your Crisp Chat with a Custom ChatGPT Agent in Minutes',
    description:
      'Enhance your Crisp experience with a custom AI chatbot. Train on your data in minutes, install the Crisp plugin, and keep your bot synced for optimal performance.',
    cta: {
      label: 'Start for free',
      url: 'https://app.chaindesk.ai/datastores',
    },

    logo: '/shared/images/logos/crisp.svg',
    youtubeVideoId: 'rLgn1_MWGPM',
    isChannel: true,
    metadata: {
      title: 'ChatGPT bot for Crisp with Chaindesk: Supercharge Your Support',
    },
    features: {
      items: [
        {
          name: 'Just paste your website url',
          description:
            'We automatically get your website pages.\nOther data sources are available too \n(e.g. PDF, Gdoc, Sheets, Notion, Airtable, etc...)',
        },
        {
          name: 'Training',
          description:
            'After collecting your data, we process it and train your bot. Don’t worry, it’s fast ⚡️',
        },
        {
          name: 'Install Crisp plugin',
          description:
            'The final step is to install the Crisp. \nNow your website is spiced up \nwith some AI magic ✨',
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
    slug: 'zapier',
    name: 'Zapier',
    title: 'Connect Chaindesk with Anything via Zapier in Minutes',
    description:
      'Connect Chaindesk with over 5,000 apps via Zapier. Train your chatbot in minutes, integrate it seamlessly on your site, and keep your data always in sync.',
    logo: '/shared/images/logos/zapier.png',
    cta: {
      label: 'Start for free',
      url: 'https://app.chaindesk.ai/datastores',
    },
    youtubeVideoId: '-NkVS2l66Zs',
    isChannel: true,
    metadata: {
      title: 'Chaindesk & Zapier: Seamless Integration with 5,000+ Apps',
    },
    features: {
      items: [
        {
          name: 'Just paste your website url',
          description:
            'We automatically get your website pages.\nOther data sources are available too \n(e.g. PDF, Gdoc, Sheets, Notion, Airtable, etc...)',
        },
        {
          name: 'Training',
          description:
            'After collecting your data, we process it and train your bot. Don’t worry, it’s fast ⚡️',
        },
        {
          name: 'Copy/Paste the HTML snippet',
          description:
            'The final step is to the widget on your website. \nJust add the generated HTML code to your website',
        },
        {
          name: 'Auto Sync',
          description:
            'We keep the bot up to date with your data. \nWe automatically synch your data when possible.\n You can also setup a webhook or manually trigger a synch.',
        },
      ],
    },
  },
  // {
  //   slug: 'zendesk',
  //   name: 'Resolve your Zendesk support tickets instantly',
  //   description:
  //     'With our Zendesk integration you can automatically resolve tickets and provide instant support to your customers.',
  //   logo: '/integrations/zendesk/icon.svg',
  //   CTA: 'Connect to Zendesk',
  //   disabledFromMenu: false,
  //   features: [
  //     {
  //       name: 'AI Agent trained on your data',
  //       description:
  //         'Train your Agent with custom data with our easy to use interface. Get started in minutes!',
  //     },
  //     {
  //       name: 'Smart Human Handoff',
  //       description:
  //         'When a human operator is requested, the AI will create a new ticket in Zendesk containing the email of the visitor.',
  //     },
  //     {
  //       name: 'Resolve Tickets instantly',
  //       description:
  //         'When the conversation is marked as resolved, the AI will close the ticket in Zendesk automatically!',
  //     },
  //   ],
  // },
  {
    slug: 'wordpress',
    name: 'Wordpress',
    title: 'Add a Custom GPT Chatbot to Your Wordpress Site in Minutes',
    description:
      'Train a chatbot with your data on Chaindesk platform. Install the Wordpress plugin! Stay updated with auto-sync.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Wordpress-Logo.svg',
    cta: {
      label: 'Start for free',
      url: 'https://app.chaindesk.ai/datastores',
    },

    isChannel: true,
    metadata: {
      title:
        'ChatGPT Chat Bot for Wordpress with Chaindesk: Supercharge Your Site',
    },
    features: {
      items: [
        {
          name: 'Just paste your website url',
          description:
            'We automatically get your website pages.\nOther data sources are available too \n(e.g. PDF, Gdoc, Sheets, Notion, Airtable, etc...)',
        },
        {
          name: 'Training',
          description:
            'After collecting your data, we process it and train your bot. Don’t worry, it’s fast ⚡️',
        },
        {
          name: 'Install Wordpress plugin',
          description:
            'The final step is to link your Wordpress website to your Chaindesk Agent via our plugin. Just install the plugin and follow the instructions.',
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
    slug: 'telegram',
    name: 'Telegram',
    title: 'Add a Custom GPT Chatbot to Telegram in Minutes',
    description:
      'Deploy a custom AI Chatbot to your Telegram in minutes. Train with your company data, install the Telegram plugin, and enjoy AI-driven interactions.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
    cta: {
      label: 'Create your WhatsApp AI Chatbot',
      url: 'https://app.chaindesk.ai/agents',
    },
    metadata: {
      title: 'ChatGPT Bot for Telegram with Chaindesk: Elevate Your Workspace',
      description: ``,
    },
    youtubeVideoId: 'x8-poiGrBa8',
    isComingSoon: true,
    isDatasource: false,
    isChannel: true,
    features: {
      items: [
        {
          name: 'Just paste your website url',
          description:
            'We automatically get your website pages.\nOther data sources are available too \n(e.g. PDF, Gdoc, Sheets, Notion, Airtable, etc...)',
        },
        {
          name: 'Training',
          description:
            'After collecting your data, we process it and train your bot. Don’t worry, it’s fast ⚡️',
        },
        {
          name: 'Install Telegram plugin',
          description:
            'The final step is to install Chaindesk Bot to your Telegram. \nNow your workspace is spiced up \nwith some AI magic ✨',
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
    slug: 'shopify',
    name: 'Shopify',
    title: 'Add a Custom GPT Chatbot to Shopify in Minutes',
    description:
      'Deploy a custom AI Chatbot to your Shopify store in minutes. Train with your company data, install the Telegram plugin, and enjoy AI-driven interactions.',
    logo: 'https://www.svgrepo.com/show/303503/shopify-logo.svg',
    cta: {
      label: 'Create your WhatsApp AI Chatbot',
      url: 'https://app.chaindesk.ai/agents',
    },
    metadata: {
      title: 'ChatGPT Bot for Telegram with Chaindesk: Elevate Your Workspace',
      description: ``,
    },
    youtubeVideoId: '-NkVS2l66Zs',
    isComingSoon: true,
    isDatasource: false,
    isChannel: true,
    features: {
      items: [
        {
          name: 'Just paste your website url',
          description:
            'We automatically get your website pages.\nOther data sources are available too \n(e.g. PDF, Gdoc, Sheets, Notion, Airtable, etc...)',
        },
        {
          name: 'Training',
          description:
            'After collecting your data, we process it and train your bot. Don’t worry, it’s fast ⚡️',
        },
        {
          name: 'Install Telegram plugin',
          description:
            'The final step is to install Chaindesk Bot to your Telegram. \nNow your workspace is spiced up \nwith some AI magic ✨',
        },
        {
          name: 'Auto Sync',
          description:
            'We keep the bot up to date with your data. \nWe automatically synch your data when possible.\n You can also setup a webhook or manually trigger a synch.',
        },
      ],
    },
  },
  // Datasources
  {
    slug: 'train-ai-from-website',
    name: 'Website',
    title: 'Train your AI with data from your website',
    description:
      'Easily train your AI with data from your website. Just paste your website URL and we will automatically get your website pages.',
    logo: 'https://www.svgrepo.com/show/197996/internet.svg',
    cta: {
      label: 'Start for free',
      url: 'https://app.chaindesk.ai/datastores',
    },
    isDatasource: true,
    features: {
      items: [
        {
          name: 'Add a Website URL',
          description:
            'Train your Agent with data from your website. Just paste your website or sitemap URL. It takes just a few seconds.',
        },
        {
          name: 'Chat',
          description:
            'You can ask questions, get summaries, find information, and more!',
        },
      ],
    },
  },
  {
    slug: 'notion',
    name: 'Notion',
    title: 'Chat with Your Notion Notebooks',
    description:
      'Chat with any Notion notebook using Chaindesk. Easily add a Notion notebook and start getting summaries or finding information.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg',
    cta: {
      label: 'Add a Notion notebook',
      url: 'https://app.chaindesk.ai/datastores',
    },
    isDatasource: true,
    features: {
      items: [
        {
          name: 'Add a YouTube video',
          description:
            'Add a YouTube video, playlist or channel to your Datastore. It takes just a few seconds.',
        },
        {
          name: 'Chat',
          description:
            'You can ask questions, get summaries, find information, and more!',
        },
      ],
    },
  },
  {
    slug: 'google-drive',
    name: 'Google Drive',
    title: 'Train your AI with data from Google Drive',
    description:
      'Chat with any Notion notebook using Chaindesk. Easily add a Notion notebook and start getting summaries or finding information.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
    cta: {
      label: 'Connect your Google Drive account',
      url: 'https://app.chaindesk.ai/datastores',
    },

    isDatasource: true,
    features: {
      items: [
        {
          name: 'Connect your Google Drive account',
          description:
            'Link your Google account and select the file or folders your want to use for training your AI Agent. It takes just a few seconds.',
        },
        {
          name: 'Chat',
          description:
            'You can ask questions, get summaries, find information, and more!',
        },
        {
          name: 'Auto Sync',
          description:
            'Your data is synched automatically. \nWe keep your Agent up to date with your data.',
        },
      ],
    },
  },
  {
    slug: 'youtube',
    name: 'YouTube',
    title: 'Chat with YouTube videos',
    description:
      'Chat with any YouTube videos using Chaindesk. Easily add a YouTube video, playlist or channek, and start getting summaries or finding information.',
    logo: 'https://www.svgrepo.com/show/13671/youtube.svg',
    cta: {
      label: 'Add a YouTube video',
      url: 'https://app.chaindesk.ai/datastores',
    },
    isDatasource: true,
    features: {
      items: [
        {
          name: 'Add a YouTube video',
          description:
            'Add a YouTube video, playlist or channel to your Datastore. It takes just a few seconds.',
        },
        {
          name: 'Chat',
          description:
            'You can ask questions, get summaries, find information, and more!',
        },
      ],
    },
  },
  {
    slug: 'chat-powerpoint',
    name: 'Microsoft Powerpoint',
    title: 'Chat with Powerpoint Documents',
    description:
      'Chat with any Powerpoint document, ask questions, get summaries, find information, and more.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg',
    cta: {
      label: 'Upload a Powerpoint',
      url: 'https://app.chaindesk.ai/datastores',
    },
    youtubeVideoId: '_n3VQM9N3-Q',
    isDatasource: true,
    features: {
      items: [
        {
          name: 'Create a Datastore',
          description:
            'A Datastore is a kind of database that can hold any type of data (PDFs, Gdocs, Sheets, Notion, Airtable, etc...)',
        },
        {
          name: 'Add your data',
          description:
            'Upload documents, link your Google Drive, connect to Notion and more!',
        },
        {
          name: 'Chat',
          description:
            'You can ask questions, get summaries, find information, and more.',
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
    slug: 'chat-word',
    name: 'Microsoft Word',
    title: 'Chat with Word Documents',
    description:
      'Chat with any Word document, ask questions, get summaries, find information, and more.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg',
    cta: {
      label: 'Upload a Document',
      url: 'https://app.chaindesk.ai/datastores',
    },

    youtubeVideoId: '_n3VQM9N3-Q',
    isDatasource: true,
    features: {
      items: [
        {
          name: 'Create a Datastore',
          description:
            'A Datastore is a kind of database that can hold any type of data (PDFs, Gdocs, Sheets, Notion, Airtable, etc...)',
        },
        {
          name: 'Add your data',
          description:
            'Upload documents, link your Google Drive, connect to Notion and more!',
        },
        {
          name: 'Chat',
          description:
            'You can ask questions, get summaries, find information, and more.',
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
    slug: 'excel',
    name: 'Microsoft Excel',
    title: 'Chat with Excel Documents',
    description:
      'Chat with any Word document, ask questions, get summaries, find information, and more.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg',
    cta: {
      label: 'Upload a Document',
      url: 'https://app.chaindesk.ai/datastores',
    },
    youtubeVideoId: '_n3VQM9N3-Q',
    isDatasource: true,
    features: {
      items: [
        {
          name: 'Create a Datastore',
          description:
            'A Datastore is a kind of database that can hold any type of data (PDFs, Gdocs, Sheets, Notion, Airtable, etc...)',
        },
        {
          name: 'Add your data',
          description:
            'Upload documents, link your Google Drive, connect to Notion and more!',
        },
        {
          name: 'Chat',
          description:
            'You can ask questions, get summaries, find information, and more.',
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
    slug: 'pdf',
    name: 'PDF Documents',
    title: 'Train your AI with PDF Documents',
    description:
      'Chat with any Word document, ask questions, get summaries, find information, and more.',
    logo: 'https://www.svgrepo.com/show/144578/pdf.svg',
    youtubeVideoId: '_n3VQM9N3-Q',
    isDatasource: true,
    features: {
      items: [
        {
          name: 'Create a Datastore',
          description:
            'A Datastore is a kind of database that can hold any type of data (PDFs, Gdocs, Sheets, Notion, Airtable, etc...)',
        },
        {
          name: 'Add your data',
          description:
            'Upload documents, link your Google Drive, connect to Notion and more!',
        },
        {
          name: 'Chat',
          description:
            'You can ask questions, get summaries, find information, and more.',
        },
        {
          name: 'Auto Sync',
          description:
            'We keep the bot up to date with your data. \nWe automatically synch your data when possible.\n You can also setup a webhook or manually trigger a synch.',
        },
      ],
    },
  },
];

export default items;
