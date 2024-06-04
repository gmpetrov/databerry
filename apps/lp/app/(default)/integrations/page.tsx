import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';

import integrations from '@chaindesk/lib/data/integrations';
import Cta from '@chaindesk/ui/lp/cta';
import { Spotlight } from '@chaindesk/ui/Spotlight';

import Clients from '@/components/clients';
import HeroProduct from '@/components/hero-product';
// import Integrations from '@/components/integrations';
import Integrations from '@/components/integrations-v1';
import Highlighter, { HighlighterItem } from '@/components/ui/highlighter';
import Particles from '@/components/ui/particles';
import Section from '@/components/ui/section';

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// export async function generateMetadata(
//   { params, searchParams }: Props,
//   parent: ResolvingMetadata
// ): Promise<Metadata> {
//   const prev = await parent;
//   const product = getIntegration(params.slug);

//   if (!product) {
//     return {};
//   }

//   const previousImages = prev?.openGraph?.images || [];

//   return {
//     title: product?.metadata?.title || product?.title,
//     description: product?.metadata?.description || product?.description,
//     openGraph: {
//       images: [...previousImages],
//     },
//     keywords: `${
//       [...(product?.keywords || []), prev?.keywords]?.join(', ') || ''
//     }`,
//     alternates: {
//       canonical: `/integrations/${product?.slug}`,
//     },
//   };
// }
type PageProps = {
  product: (typeof integrations)[0];
};

export default function IntegrationsPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <>
      <HeroProduct
        name={'Integrations'}
        title={'Native integrations with your favorite tools and platforms'}
        description={`Train and Integrate your AI Agent with your favorite tools and platforms: WhatsApp, Shopify, WordPress, and more.`}
        cta={{
          label: 'Get Started for Free',
          url: 'https://app.chaindesk.ai/agents',
        }}
        // youtubeVideoId={product?.youtubeVideoId}
        // imageUrl={product?.imageUrl}
      />

      <div className="pb-12 sm:pb-24">
        <Integrations />
      </div>

      <div></div>

      <Section>
        <span className="text-2xl font-bold text-center text-pink-400 font-caveat">
          {'Datasources Integrations'}
        </span>
        <h2 className="pb-4 text-3xl font-extrabold text-transparent font-bricolage-grotesque md:text-5xl text-zinc-800">
          {`Train your AI with data from anywhere`}
        </h2>
        <p className="max-w-lg mx-auto mb-8 text-lg text-zinc-500 md:text-xl">
          {`Chaindesk makes it very easy to train your AI Agent with custom data from your existing tools and platforms.`}
        </p>

        <Highlighter className="grid grid-cols-1 gap-4 py-12 cursor-pointer sm:grid-cols-2 lg:grid-cols-3">
          {integrations
            .filter((each) => each.isDatasource)
            .map((integration) => (
              <Link
                href={`/integrations/${integration.slug}`}
                key={integration?.slug}
                className="group"
              >
                <HighlighterItem>
                  <div
                    className={clsx(
                      'flex relative z-20 justify-center items-center p-4 h-52 rounded-3xl border border-zinc-200',
                      'rounded-3xl border transition-colors'
                    )}
                  >
                    {integration.isComingSoon && (
                      <div className="absolute text-2xl font-bold text-pink-400 rounded-full top-1 right-4 font-caveat">
                        coming soon
                      </div>
                    )}
                    <div
                      className="absolute bottom-0 flex items-center justify-center h-full -translate-x-1/2 translate-y-1/2 pointer-events-none left-1/2 -z-10 aspect-square"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 translate-z-0 bg-pink-100 rounded-full blur-[120px] opacity-70" />
                    </div>
                    <div className="flex flex-col items-start justify-start w-full space-x-4 space-y-2 text-left">
                      <div className="flex items-center w-full max-w-full space-x-2">
                        <div className="flex items-center p-2 bg-white rounded-full shadow-sm max-h-10 min-w-10 min-h-10 max-w-10">
                          <img
                            className="w-full h-full"
                            src={integration?.logo}
                            alt={`${integration.name} Logo`}
                          />
                        </div>

                        <h3 className="text-xl font-semibold truncate font-bricolage-grotesque">
                          {integration?.name}
                        </h3>
                      </div>
                      <p className="text-md text-zinc-500 group-hover:text-zinc-700">
                        {integration?.description}
                      </p>
                    </div>
                  </div>
                </HighlighterItem>
              </Link>
            ))}
        </Highlighter>
      </Section>
      <Section>
        <span className="text-2xl font-bold text-center text-pink-400 font-caveat">
          {'Deploy Integrations'}
        </span>
        <h2 className="pb-4 text-3xl font-extrabold text-transparent font-bricolage-grotesque md:text-5xl text-zinc-800">
          {`Deploy your AI Agent anywhere on the web`}
        </h2>
        <p className="max-w-lg mx-auto mb-8 text-lg text-zinc-500 md:text-xl">
          {`Deploy your AI Agent on your existing platforms in minutes.`}
        </p>

        <Highlighter className="grid grid-cols-1 gap-4 py-12 cursor-pointer sm:grid-cols-2 lg:grid-cols-3">
          {integrations
            .filter((each) => each.isChannel)
            .map((integration) => (
              <Link
                href={`/integrations/${integration.slug}`}
                key={integration?.slug}
                className="group"
              >
                <HighlighterItem>
                  <div
                    className={clsx(
                      'flex relative z-20 justify-center items-center p-4 h-52 rounded-3xl border border-zinc-200',
                      'rounded-3xl border transition-colors'
                    )}
                  >
                    {integration.isComingSoon && (
                      <div className="absolute text-2xl font-bold text-pink-400 rounded-full top-1 right-4 font-caveat">
                        coming soon
                      </div>
                    )}
                    <div
                      className="absolute bottom-0 flex items-center justify-center h-full -translate-x-1/2 translate-y-1/2 pointer-events-none left-1/2 -z-10 aspect-square"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 translate-z-0 bg-pink-100 rounded-full blur-[120px] opacity-70" />
                    </div>
                    <div className="flex flex-col items-start justify-start w-full space-x-4 space-y-2 text-left">
                      <div className="flex items-center w-full max-w-full space-x-2">
                        <div className="flex items-center p-2 bg-white rounded-full shadow-sm max-h-10 min-w-10 min-h-10 max-w-10">
                          <img
                            className="w-full h-full"
                            src={integration?.logo}
                            alt={`${integration.name} Logo`}
                          />
                        </div>

                        <h3 className="text-xl font-semibold truncate font-bricolage-grotesque">
                          {integration?.name}
                        </h3>
                      </div>
                      <p className="text-md text-zinc-500 group-hover:text-zinc-700">
                        {integration?.description}
                      </p>
                    </div>
                  </div>
                </HighlighterItem>
              </Link>
            ))}
        </Highlighter>
      </Section>

      <Cta />
    </>
  );
}
