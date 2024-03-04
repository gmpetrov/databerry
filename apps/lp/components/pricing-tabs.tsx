'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import Accordion from '@/components/accordion';
import Tooltip from '@/components/tooltip';
import PricingDecoration from '@/public/images/pricing-decoration.png';

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
      text: 'Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.',
      active: false,
    },
    {
      title: 'What payment methods can I use?',
      text: 'Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.',
      active: false,
    },
    {
      title: 'Can I change from monthly to yearly billing?',
      text: 'Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.',
      active: false,
    },
    {
      title:
        'Can I use the tool for personal, client, and commercial projects?',
      text: 'Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.',
      active: true,
    },
    {
      title: 'How can I ask other questions about pricing?',
      text: 'Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.',
      active: false,
    },
    {
      title: 'Do you offer discount for students and no-profit companies?',
      text: 'Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.',
      active: false,
    },
  ];

  return (
    <section id="pricing">
      <div className="py-12 md:py-20">
        <div className="px-4 mx-auto max-w-6xl sm:px-6">
          <div className="relative pb-12 mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold font-bricolage-grotesque md:text-4xl text-zinc-900">
              Pricing plans for teams of all sizes
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
                      Discover
                    </div>
                    <div className="inline-flex items-baseline mb-2 font-bricolage-grotesque">
                      <span className="text-2xl font-bold text-zinc-900">
                        $
                      </span>
                      <span className="text-3xl font-bold text-zinc-900">
                        {prices[tier].plans.free}
                      </span>
                      <span className="font-medium text-zinc-500">/mo</span>
                    </div>
                    <div className="text-zinc-500">
                      The essentials to get started quickly.
                    </div>
                  </div>
                  <div className="grow">
                    <div className="mb-4 text-sm font-medium text-zinc-900">
                      Includes:
                    </div>
                    <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 grow">
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
                          content="Lorem Ipsum is simply dummy text of the printing."
                        >
                          Unlimited workspace boards
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
                          content="Lorem Ipsum is simply dummy text of the printing."
                        >
                          Unlimited viewers
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
                          id="03"
                          content="Lorem Ipsum is simply dummy text of the printing."
                        >
                          Unlimited project templates
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
                          content="Lorem Ipsum is simply dummy text of the printing."
                        >
                          Change management
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
                          content="Lorem Ipsum is simply dummy text of the printing."
                        >
                          Taxonomy development
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
                          id="06"
                          content="Lorem Ipsum is simply dummy text of the printing."
                        >
                          Customer success manager
                        </Tooltip>
                      </li>
                    </ul>
                  </div>
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
                      Growth
                    </div>
                    <div className="inline-flex items-baseline mb-2 font-bricolage-grotesque">
                      <span className="text-2xl font-bold text-zinc-900">
                        $
                      </span>
                      <span className="text-3xl font-bold text-zinc-900">
                        {prices[tier].plans.discover}
                      </span>
                      <span className="font-medium text-zinc-500">/mo</span>
                    </div>
                    <div className="text-zinc-500">
                      A plan that scales with your rapidly growing business.
                    </div>
                  </div>
                  <div className="grow">
                    <div className="mb-4 text-sm font-medium text-zinc-900">
                      Includes:
                    </div>
                    <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 grow">
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
                          content="Lorem Ipsum is simply dummy text of the printing."
                        >
                          Unlimited workspace boards
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
                          content="Lorem Ipsum is simply dummy text of the printing."
                        >
                          Unlimited viewers
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
                          id="03"
                          content="Lorem Ipsum is simply dummy text of the printing."
                        >
                          Unlimited project templates
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
                          content="Lorem Ipsum is simply dummy text of the printing."
                        >
                          Change management
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
                          content="Lorem Ipsum is simply dummy text of the printing."
                        >
                          Taxonomy development
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
                          id="06"
                          content="Lorem Ipsum is simply dummy text of the printing."
                        >
                          Customer success manager
                        </Tooltip>
                      </li>
                    </ul>
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
                      Pro
                    </div>
                    <div className="inline-flex items-baseline mb-2 font-bricolage-grotesque">
                      <span className="text-2xl font-bold text-zinc-200">
                        $
                      </span>
                      <span className="text-3xl font-bold text-zinc-200">
                        {prices[tier].plans.premium}
                      </span>
                      <span className="font-medium text-zinc-500">/mo</span>
                    </div>
                    <div className="text-zinc-400">
                      For power users who want access more powerful features.
                    </div>
                  </div>
                  <div className="grow">
                    <div className="mb-4 text-sm font-medium text-zinc-200">
                      Includes:
                    </div>
                    <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 grow">
                      <li className="flex items-center">
                        <svg
                          className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
                          viewBox="0 0 12 12"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                        <Tooltip
                          id="07"
                          content="Lorem Ipsum is simply dummy text of the printing."
                          dark
                        >
                          Unlimited workspace boards
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
                          id="08"
                          content="Lorem Ipsum is simply dummy text of the printing."
                          dark
                        >
                          Unlimited viewers
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
                          id="09"
                          content="Lorem Ipsum is simply dummy text of the printing."
                          dark
                        >
                          Unlimited project templates
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
                          id="10"
                          content="Lorem Ipsum is simply dummy text of the printing."
                          dark
                        >
                          Change management
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
                          id="11"
                          content="Lorem Ipsum is simply dummy text of the printing."
                          dark
                        >
                          Taxonomy development
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
                          id="12"
                          content="Lorem Ipsum is simply dummy text of the printing."
                          dark
                        >
                          Customer success manager
                        </Tooltip>
                      </li>
                    </ul>
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
                      Enterprise
                    </div>
                    <div className="inline-flex items-baseline mb-2 font-bricolage-grotesque">
                      <span className="text-2xl font-bold text-zinc-900">
                        $
                      </span>
                      <span className="text-3xl font-bold text-zinc-900">
                        {prices[tier].plans.enterprise}
                      </span>
                      <span className="font-medium text-zinc-500">/mo</span>
                    </div>
                    <div className="text-zinc-500">
                      Dedicated support and for your team.
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
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 grow">
                        <li className="flex items-center">
                          <svg
                            className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
                            viewBox="0 0 12 12"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                          </svg>
                          <Tooltip
                            id="13"
                            content="Lorem Ipsum is simply dummy text of the printing."
                          >
                            Unlimited workspace boards
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
                            id="14"
                            content="Lorem Ipsum is simply dummy text of the printing."
                          >
                            Unlimited viewers
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
                            id="15"
                            content="Lorem Ipsum is simply dummy text of the printing."
                          >
                            Unlimited project templates
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
                            id="16"
                            content="Lorem Ipsum is simply dummy text of the printing."
                          >
                            Change management
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
                            id="17"
                            content="Lorem Ipsum is simply dummy text of the printing."
                          >
                            Taxonomy development
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
                            id="18"
                            content="Lorem Ipsum is simply dummy text of the printing."
                          >
                            Customer success manager
                          </Tooltip>
                        </li>
                      </ul>
                      <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 grow">
                        <li className="flex items-center">
                          <svg
                            className="mr-3 w-3 h-3 fill-emerald-500 shrink-0"
                            viewBox="0 0 12 12"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                          </svg>
                          <Tooltip
                            id="13"
                            content="Lorem Ipsum is simply dummy text of the printing."
                          >
                            Unlimited workspace boards
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
                            id="14"
                            content="Lorem Ipsum is simply dummy text of the printing."
                          >
                            Unlimited viewers
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
                            id="15"
                            content="Lorem Ipsum is simply dummy text of the printing."
                          >
                            Unlimited project templates
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
                            id="16"
                            content="Lorem Ipsum is simply dummy text of the printing."
                          >
                            Change management
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
                            id="17"
                            content="Lorem Ipsum is simply dummy text of the printing."
                          >
                            Taxonomy development
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
                            id="18"
                            content="Lorem Ipsum is simply dummy text of the printing."
                          >
                            Customer success manager
                          </Tooltip>
                        </li>
                      </ul>
                    </div>
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
