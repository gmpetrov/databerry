import {
  BoltIcon,
  CurrencyDollarIcon,
  SwatchIcon,
} from '@heroicons/react/20/solid';
import { Metadata, ResolvingMetadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react';

import competitors from '@chaindesk/lib/data/competitors';
import products from '@chaindesk/lib/data/products';
import slugify from '@chaindesk/lib/slugify';

import Clients from '@/components/clients';
import Cta from '@/components/cta';
import HeroProduct from '@/components/hero-product';
import FeatureV1 from '@/components/ui/feature-v1';
import FeatureV2 from '@/components/ui/feature-v2';
import { cn } from '@/lib/utils';

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const getProduct = (slug: string) => {
  const product = products.find((p) => p.slug === slug) as (typeof products)[0];

  return product;
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params?.slug?.replace(/-alternative$/, '');
  const name = competitors.find((one) => slug === slugify(one));

  // const prev = await parent;

  if (!name) {
    return {};
  }

  // const previousImages = prev?.openGraph?.images || [];

  return {
    title: `${name} alternative - Chaindesk`,
    description: `Chaindesk is the #1 ${name} alternative that helps you create a custom ChatGPT AI chatbot without code in minutes. `,
    alternates: {
      canonical: `/compare/${slugify(name)}-alternative`,
    },
  };
}
type PageProps = {
  product: (typeof products)[0];
};

const CheckIcon = (props: any) => (
  <svg
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    className={cn(props.className, ' !fill-emerald-500')}
  >
    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
  </svg>
);

export default function ProductPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug?.replace(/-alternative$/, '');
  const name = competitors.find((one) => slug === slugify(one));

  if (!name) {
    redirect('/');
  }

  return (
    <>
      <HeroProduct
        labelClassName="text-left"
        titleClassName="text-4xl md:text-5xl text-left"
        descriptionClassName="md:text-xl max-w-full text-left"
        ctaClassName="justify-center sm:justify-start"
        name={`${name} Alternative`}
        title={`Your search for an alternative to ${name} ends here`}
        description={`Looking for a ${name} alternative? People switch from ${name} to Chaindesk because it looks better, comes with more widgets and customization and is much easier to use. Here’s why we think you should make the switch too ✨`}
        cta={{
          label: 'Start for free',
          url: 'https://app.chaindesk.ai/agents',
        }}
        withTestimonialBadge
        // youtubeVideoId={product?.youtubeVideoId}
        // imageUrl={product?.imageUrl}
      />

      <div className="-mt-20">
        <Clients />
      </div>

      <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-zinc-100 before:-z-10">
        <FeatureV2
          title={`The AI-powered support ecosystem you've been looking for`}
          description={`There are 100s of chatbot tools out there but we’ve worked hard to balance price with function, while making it a joy to setup and use. So if you’re reviewing your options and looking for an alternative to ${name} keep reading…`}
          features={[
            {
              name: 'Value for money:',
              description: `Better priced and more value for money than ${name}`,
              icon: CurrencyDollarIcon,
            },
            {
              name: 'Customization:',
              description:
                'More ways to customize and share your AI chatbot than anywhere else',
              icon: SwatchIcon,
            },
            {
              name: 'Stronger:',
              description: 'Faster, better designed and more powerful',
              icon: BoltIcon,
            },
          ]}
        />
      </section>

      <FeatureV1
        label="Why Chaindesk?"
        title={`Chaindesk VS ${name}`}
        description="Chaindesk is an AI-powered ecosystem that helps you automate support and more. Here’s why you should make the switch to Chaindesk:"
        features={[
          {
            name: 'Native Integrations:',
            description:
              'Chaindesk allows you to import data from a wide range of sources, Notion, Google Drive, and more...',
            icon: CheckIcon,
          },
          {
            name: 'Auto-Sync Datasources:',
            description:
              'Chaindesk retrains your AI chatbot automatically when your data is updated.',
            icon: CheckIcon,
          },
          {
            name: 'Trustworthy, Secure and Focused:',
            description:
              'With built-in safeguards, Chaindesk strictly uses your support content to answer questions, eliminating off-topic conversations and misleading responses.',
            icon: CheckIcon,
          },
          {
            name: 'Knowledge Restriction:',
            description:
              'Enable toggle restriction to ensure that your AI chatbot only provides answers to questions that are within your knowledge base.',
            icon: CheckIcon,
          },
          {
            name: 'Human Handoff:',
            description:
              'With Chaindesk you can take over the conversation at any time, ensuring that your customers are always getting the best possible support.',
            icon: CheckIcon,
          },
          {
            name: 'Shared Inbox:',
            description:
              'Monitor and manage all your customer conversations in one place. Invite your team members and assign conversations to them. Automate your workflows.',
            icon: CheckIcon,
          },
          {
            name: 'Automatic Ticket Resolution:',
            description:
              'Chaindesk AI Agents are able to resolve tickets automatically, when the user is satisfied with the answer. This reduces the workload of your support team.',
            icon: CheckIcon,
          },
          {
            name: 'Lead Generation:',
            description:
              'Chaindesk AI Agents are able to collect user information (email, phone number) in a conversational way.',
            icon: CheckIcon,
          },
          {
            name: 'Multilingual:',
            description:
              'With support for over 120 languages, Chaindesk chatbots can serve a global customer base, breaking down language barriers and facilitating seamless international customer service.',
            icon: CheckIcon,
          },
          {
            name: 'Near-zero learning curve:',
            description:
              'Chaindesk is designed to be easy to use, with a simple and intuitive interface that requires no technical knowledge to operate.',
            icon: CheckIcon,
          },
        ]}
      />

      <Cta />
    </>
  );
}
