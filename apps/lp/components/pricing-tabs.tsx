'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import config from '@chaindesk/lib/account-config';

import TestimonialBadge from './testimonial-badge';

import Accordion from '@/components/accordion';
import Tooltip from '@/components/tooltip';
import { cn } from '@/lib/utils';
import PricingDecoration from '@/public/images/pricing-decoration.png';

let formatter = Intl.NumberFormat('en');

const Features = function (props: {
  plan: keyof typeof config;
  highlighted?: boolean;
}) {
  return (
    <>
      <ul
        className={cn(
          'space-y-3 text-sm text-zinc-600 dark:text-zinc-400 grow cols-span-10',
          {
            'grid grid-cols-1 lg:grid-cols-2 space-y-0 gap-3': [
              'level_3',
            ].includes(props.plan),
          }
        )}
      >
        <li className="flex items-center">
          <svg
            className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
          </svg>
          <Tooltip
            id="03"
            content="Each time a user sends a message to the bot, it consumes one credit. This limit is shared across all agents."
            dark={props.highlighted}
          >
            {config[props.plan].limits.maxAgentsQueries} message credits/month
          </Tooltip>
        </li>
        <li className="flex items-center">
          <svg
            className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
          </svg>
          <Tooltip
            id="01"
            content="Agents are next-generation chatbots that can have human-like conversations. They can be used to automate customer support, lead generation, and more."
            dark={props.highlighted}
          >
            {config[props.plan].limits.maxAgents} Agent(s)
          </Tooltip>
        </li>
        <li className="flex items-center">
          <svg
            className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
          </svg>
          <Tooltip
            id="02"
            content="Datastores are used to store the Agent knowledge. A Datastore can contain an many data sources like Notion, GDrive, and more."
            dark={props.highlighted}
          >
            {config[props.plan].limits.maxDatastores} Datastores(s)
          </Tooltip>
        </li>

        <li className="flex items-center">
          <svg
            className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
          </svg>
          <Tooltip
            id="04"
            content="The max number of words/tokens that can be stored in across all datastores."
            dark={props.highlighted}
          >
            {formatter.format(config[props.plan].limits.maxStoredTokens)} words
            storage
          </Tooltip>
        </li>
        <li className="flex items-center">
          <svg
            className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
          </svg>
          <Tooltip
            id="05"
            content="File upload limit can be increased by upgrading to a higher plan."
            dark={props.highlighted}
          >
            File upload limited to{' '}
            {config[props.plan].limits.maxFileSize / 1000000}MB / file
          </Tooltip>
        </li>
        <li className="flex items-center">
          <svg
            className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
          </svg>
          <Tooltip
            id="05"
            content="File upload limit can be increased by upgrading to a higher plan."
            dark={props.highlighted}
          >
            Website loader limited to {config[props.plan].limits.maxWebsiteURL}{' '}
            Pages
          </Tooltip>
        </li>

        <li className="flex items-center">
          {props.plan === 'level_0' && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="mr-2 -ml-1 w-5 h-5 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          )}

          {props.plan !== 'level_0' && (
            <svg
              className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
              viewBox="0 0 12 12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
            </svg>
          )}

          <Tooltip
            id="06"
            content="GPT-4-turbo is recommended to get the best performances."
            dark={props.highlighted}
          >
            Access to GPT-4
          </Tooltip>
        </li>
        <li className="flex items-center">
          {props.plan === 'level_0' && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="mr-2 -ml-1 w-5 h-5 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          )}

          {props.plan !== 'level_0' && (
            <svg
              className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
              viewBox="0 0 12 12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
            </svg>
          )}

          <Tooltip
            id="06"
            content="Auto-Sync keeps your data sources up to date with the latest data, automatically re-training your agents"
            dark={props.highlighted}
          >
            Auto-Sync data sources
          </Tooltip>
        </li>

        {props.plan === 'level_0' && (
          <li className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="mr-2 -ml-1 w-5 h-5 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>

            <Tooltip
              id="06"
              content="Team seats are used to give access to your team members to your Chaindesk account"
              dark={props.highlighted}
            >
              No team seats included
            </Tooltip>
          </li>
        )}
        {props.plan !== 'level_0' && (
          <li className="flex items-center">
            <svg
              className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
              viewBox="0 0 12 12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
            </svg>

            <Tooltip
              id="06"
              content="Team seats are used to give access to your team members to your Chaindesk account"
              dark={props.highlighted}
            >
              {config[props.plan].limits.maxSeats} Team seats included
            </Tooltip>
          </li>
        )}
        <li className="flex items-center">
          {['level_0', 'level_1'].includes(props.plan) && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="mr-2 -ml-1 w-5 h-5 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          )}

          {!['level_0', 'level_1'].includes(props.plan) && (
            <svg
              className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
              viewBox="0 0 12 12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
            </svg>
          )}

          <Tooltip
            id="06"
            content="Remove 'Powered by Chaindesk' from all widgets"
            dark={props.highlighted}
          >
            Remove Chaindesk branding
          </Tooltip>
        </li>

        {['level_0'].includes(props.plan) && (
          <>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="mr-2 -ml-1 w-5 h-5 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>

              {!['level_0', 'level_1'].includes(props.plan) && (
                <svg
                  className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
              )}

              <Tooltip
                id="06"
                content="Acess to the WhatsApp Integration"
                dark={props.highlighted}
              >
                WhatsApp Integration
              </Tooltip>
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="mr-2 -ml-1 w-5 h-5 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>

              {!['level_0', 'level_1'].includes(props.plan) && (
                <svg
                  className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
              )}

              <Tooltip
                id="06"
                content="Acess to the Slack Integration"
                dark={props.highlighted}
              >
                Slack Integration
              </Tooltip>
            </li>

            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="mr-2 -ml-1 w-5 h-5 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>

              {!['level_0', 'level_1'].includes(props.plan) && (
                <svg
                  className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
              )}

              <Tooltip
                id="06"
                content="Acess to the Crisp Integration"
                dark={props.highlighted}
              >
                Crisp Integration
              </Tooltip>
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="mr-2 -ml-1 w-5 h-5 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>

              {!['level_0', 'level_1'].includes(props.plan) && (
                <svg
                  className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
              )}

              <Tooltip
                id="06"
                content="Acess to the Notion Integration"
                dark={props.highlighted}
              >
                Notion Integration
              </Tooltip>
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="mr-2 -ml-1 w-5 h-5 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>

              {!['level_0', 'level_1'].includes(props.plan) && (
                <svg
                  className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
              )}

              <Tooltip
                id="06"
                content="Acess to the Google Drive Integration"
                dark={props.highlighted}
              >
                Google Drive Integration
              </Tooltip>
            </li>
          </>
        )}

        {['level_1', 'level_2', 'level_3'].includes(props.plan) && (
          <li className="flex items-center">
            {['level_1', 'level_2'].includes(props.plan) && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="mr-2 -ml-1 w-5 h-5 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            )}

            {['level_3'].includes(props.plan) && (
              <svg
                className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
                viewBox="0 0 12 12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
              </svg>
            )}

            <Tooltip
              id="06"
              content="Get priority support from our team"
              dark={props.highlighted}
            >
              Dedicated support
            </Tooltip>
          </li>
        )}
      </ul>
    </>
  );
};

export default function PricingTabs() {
  const prices = [
    {
      contacts: '1K',
      plans: {
        free: '0',
        discover: '25',
        premium: '99',
        enterprise: '499',
      },
    },
    {
      contacts: '5K',
      plans: {
        free: '19',
        discover: '19',
        premium: '29',
        enterprise: '59',
      },
    },
    {
      contacts: '10K',
      plans: {
        free: '0',
        discover: '25',
        premium: '99',
        enterprise: '499',
      },
    },
    {
      contacts: '15K',
      plans: {
        free: '39',
        discover: '39',
        premium: '59',
        enterprise: '119',
      },
    },
    {
      contacts: '1M',
      plans: {
        free: '1,490',
        discover: '1,490',
        premium: '2,490',
        enterprise: '4,999',
      },
    },
  ];

  const [tier, setTier] = useState<number>(0);
  const [segmentsWidth, setSegmentsWidth] = useState<string>('100%');
  const [progress, setProgress] = useState<string>('0%');
  const segments = prices.length - 1;

  const calculateProgress = () => {
    setSegmentsWidth(`${100 / segments}%`);
    setProgress(`${(100 / segments) * tier}%`);
  };

  useEffect(() => {
    calculateProgress();
  }, [tier]);

  const faqs = [
    {
      title: 'Can I use the product for free?',
      text: 'Absolutely! Chaindesk allows offers a free with limited features to get started quickly.',
      active: false,
    },
    {
      title: 'Can I change from monthly to yearly billing?',
      text: 'Absolutely! You can update your billing preferences or change your plan at any time from your account settings. With yearly billing, you save 20% on your subscription.',
      active: false,
    },
    {
      title: 'Can you embed a chatbot on multiple websites?',
      text: `Yes, you're able to add any chatbot to any number of sites that you want visitors to interact with.`,
      active: false,
    },

    {
      title: 'Does it work on websites in languages other than English?',
      text: 'Yes, your website can be in any language, not just English. Chatbot can also answer questions in a different language. You can also ask questions in a different language and the chatbot will be able to answer them.',
      active: true,
    },
    {
      title:
        'I need a custom integration or feature that is not supported by Chaindesk. Can you help?',
      text: 'Absolutely! If you need us to build a custom integration for your company, you can join as an enterprise customer and we can figure out a custom pricing plan for you, based on your needs',
      active: false,
    },
    {
      title:
        'Do you retrain the chatbot automatically when the data source content changes?',
      text: 'Absolutely! Starting with first paid plan, the chatbot is automatically retrained (currently every week). You can also manually trigger a retraining.',
      active: false,
    },
    {
      title: 'How to improve my agent anwsers?',
      text: 'If you observe that youro Agent is not following your instructions properly, consider setting your Agent model to GPT-4-turbo to get the best possible experience.',
      active: false,
    },
    {
      title: 'How to contact the support team?',
      text: 'You can send us an email at support@chaindesk.ai or use the chat widget on the bottom right of the page.',
      active: false,
    },
  ];

  return (
    <section id="pricing">
      <div
      //  className="py-12 md:py-20"
      >
        <div className="px-4 mx-auto max-w-6xl sm:px-6">
          <div className="relative pb-12 mx-auto max-w-3xl text-center">
            <span className="text-3xl font-bold text-pink-400 font-label">
              Predictable Pricing
            </span>
            <h2 className="mb-4 text-3xl font-bold font-bricolage-grotesque md:text-7xl text-zinc-900">
              Saves on Support Costs Over Time
            </h2>
            <p className="text-lg text-zinc-500">
              Start creating your custom AI chatbot for free. Upgrade to unlock
              GPT-4 and other features.
            </p>
          </div>

          {/* Pricing tabs component */}
          <div className="pb-12 md:pb-20">
            {/* Pricing toggle */}
            {/* <div className="mx-auto mb-12 space-y-3 max-w-sm lg:max-w-3xl lg:mb-16">
              <div
                className="text-sm font-medium text-center text-zinc-700"
                x-text="`${prices[value].contacts} contacts/month`"
              ></div>
              <div
                className="flex relative items-center"
                style={
                  {
                    '--progress': `${progress}`,
                    '--segments-width': `${segmentsWidth}`,
                  } as React.CSSProperties
                }
              >
                <div
                  className="absolute left-2.5 right-2.5 h-1.5 bg-zinc-200 rounded-full overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-zinc-400 before:to-zinc-800 before:[mask-image:_linear-gradient(to_right,theme(colors.white),theme(colors.white)_var(--progress),transparent_var(--progress))] after:absolute after:inset-0 after:bg-[repeating-linear-gradient(to_right,transparent,transparent_calc(var(--segments-width)-1px),theme(colors.white/.7)_calc(var(--segments-width)-1px),theme(colors.white/.7)_calc(var(--segments-width)+1px))]"
                  aria-hidden="true"
                ></div>
                <input
                  className="relative appearance-none cursor-pointer w-full bg-transparent focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:focus-visible:ring [&::-webkit-slider-thumb]:focus-visible:ring-zinc-300 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:focus-visible:ring [&::-moz-range-thumb]:focus-visible:ring-zinc-300"
                  type="range"
                  min="0"
                  max={prices.length - 1}
                  aria-valuetext={`${prices[tier].contacts} contacts/month`}
                  aria-label="Pricing Slider"
                  onChange={(e) => setTier(parseInt(e.target.value))}
                />
              </div>
              <div>
                <ul className="flex justify-between text-xs font-medium text-zinc-500 px-2.5">
                  {prices.map((price, index) => (
                    <li key={index} className="relative">
                      <span className="absolute -translate-x-1/2">
                        {price.contacts}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div> */}

            <div className="grid gap-6 items-start mx-auto max-w-sm lg:grid-cols-3 lg:max-w-none">
              {/* Pricing tab 1 */}
              <div className="h-full">
                <div className="relative flex flex-col h-full p-6 rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                  <div className="mb-4">
                    <div className="mb-1 text-lg font-semibold text-zinc-900">
                      {config['level_0'].label}
                    </div>
                    <div className="inline-flex items-baseline mb-2 font-bricolage-grotesque">
                      <span className="text-2xl font-bold text-zinc-900">
                        {config['level_0'].price.usd.symbol}
                      </span>
                      <span className="text-3xl font-bold text-zinc-900">
                        {config['level_0'].price.usd.monthly}
                      </span>
                      <span className="font-medium text-zinc-500">/mo</span>
                    </div>
                    <div className="text-zinc-500">
                      {config['level_0'].description}
                    </div>
                  </div>
                  <div className="grow">
                    <div className="mb-4 text-sm font-medium text-zinc-900">
                      Includes:
                    </div>
                    <Features plan={'level_0'} />
                  </div>

                  <span className="mt-4 text-xs text-zinc-500">
                    Agents and Datastores get deleted after 14 days of
                    inactivity on the free plan.
                  </span>

                  <div className="mt-8">
                    <a
                      className="w-full bg-gradient-to-r shadow btn text-zinc-100 from-zinc-700 to-zinc-900 hover:from-zinc-900 hover:to-zinc-900"
                      href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL}/settings/billing`}
                    >
                      Get Started for Free
                    </a>
                  </div>
                </div>
              </div>
              <div className="h-full">
                <div className="relative flex flex-col h-full p-6 rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                  <div className="mb-4">
                    <div className="mb-1 text-lg font-semibold text-zinc-900">
                      {config['level_1'].label}
                    </div>
                    <div className="inline-flex items-baseline mb-2 font-bricolage-grotesque">
                      <span className="text-2xl font-bold text-zinc-900">
                        {config['level_1'].price.usd.symbol}
                      </span>
                      <span className="text-3xl font-bold text-zinc-900">
                        {config['level_1'].price.usd.monthly}
                      </span>
                      <span className="font-medium text-zinc-500">/mo</span>
                    </div>
                    <div className="text-zinc-500">
                      {config['level_1'].description}
                    </div>
                  </div>
                  <div className="grow">
                    <div className="mb-4 text-sm font-medium text-zinc-900">
                      Includes:
                    </div>
                    <Features plan={'level_1'} />
                  </div>
                  <div className="mt-8">
                    <a
                      className="w-full bg-gradient-to-r shadow btn text-zinc-100 from-zinc-700 to-zinc-900 hover:from-zinc-900 hover:to-zinc-900"
                      href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL}/settings/billing`}
                    >
                      Subscribe
                    </a>
                  </div>
                </div>
              </div>

              {/* Pricing tab 2 */}
              <div className="h-full">
                <div className="flex relative flex-col p-6 h-full rounded-lg bg-zinc-800">
                  <Image
                    className="absolute -top-5 right-6 mix-blend-exclusion"
                    src={PricingDecoration}
                    alt="Pricing decoration"
                    width={76}
                    height={74}
                    aria-hidden="true"
                  />
                  <div className="mb-4">
                    <div className="mb-1 text-lg font-semibold text-zinc-100">
                      {config['level_2'].label}
                    </div>
                    <div className="inline-flex items-baseline mb-2 font-bricolage-grotesque">
                      <span className="text-2xl font-bold text-zinc-200">
                        {config['level_2'].price.usd.symbol}
                      </span>
                      <span className="text-3xl font-bold text-zinc-200">
                        {config['level_2'].price.usd.monthly}
                      </span>
                      <span className="font-medium text-zinc-500">/mo</span>
                    </div>
                    <div className="text-zinc-400">
                      {config['level_2'].description}
                    </div>
                  </div>
                  <div className="grow">
                    <div className="mb-4 text-sm font-medium text-zinc-200">
                      Includes:
                    </div>
                    <Features plan={'level_2'} highlighted />
                  </div>
                  <div className="mt-8">
                    <a
                      className="w-full bg-white shadow btn text-zinc-600 hover:text-zinc-900"
                      href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL}/settings/billing`}
                    >
                      Subscribe
                    </a>
                  </div>
                </div>
              </div>

              {/* Pricing tab 3 */}
              <div className="col-span-1 h-full lg:col-span-3">
                <div className="relative flex flex-col lg:flex-row lg:space-x-8 h-full p-6 rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                  <div className="mb-4">
                    <div className="mb-1 text-lg font-semibold text-zinc-900">
                      {config['level_3'].label}
                    </div>
                    <div className="inline-flex items-baseline mb-2 font-bricolage-grotesque">
                      <span className="text-2xl font-bold text-zinc-900">
                        {config['level_3'].price.usd.symbol}
                      </span>
                      <span className="text-3xl font-bold text-zinc-900">
                        {config['level_3'].price.usd.monthly}
                      </span>
                      <span className="font-medium text-zinc-500">/mo</span>
                    </div>
                    <div className="text-zinc-500">
                      {config['level_3'].description}
                    </div>
                    <div className="mt-4">
                      <a
                        className="w-full bg-gradient-to-r shadow btn text-zinc-100 from-zinc-700 to-zinc-900 hover:from-zinc-900 hover:to-zinc-900"
                        href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL}/settings/billing`}
                      >
                        Subscribe
                      </a>
                    </div>
                  </div>
                  <div className="grow">
                    <div className="mb-4 text-sm font-medium text-zinc-900">
                      Includes:
                    </div>
                    {/* <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"> */}
                    <Features plan={'level_3'} />
                    {/* </div> */}
                  </div>
                </div>
              </div>
              <div className="col-span-1 h-full lg:col-span-3">
                <div className="justify-center relative flex flex-col lg:flex-row lg:space-x-8 h-full p-6 rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex flex-col space-y-0 text-center">
                      <span className="text-2xl text-pink-400 font-label">
                        To the moon
                      </span>

                      <div className="text-2xl font-semibold text-center text-zinc-900 font-title">
                        Need a custom plan?
                      </div>
                    </div>

                    <div className="">
                      <a
                        className="w-full bg-gradient-to-r shadow btn text-zinc-100 from-zinc-700 to-zinc-900 hover:from-zinc-900 hover:to-zinc-900"
                        href="mailto:support@chaindesk.ai"
                      >
                        Contact Us
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="mx-auto max-w-2xl">
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <Accordion
                  key={index}
                  title={faq.title}
                  id={`faqs-${index}`}
                  active={faq.active}
                >
                  {faq.text}
                </Accordion>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
