import { Metadata, ResolvingMetadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react';

import integrations from '@chaindesk/lib/data/integrations';

import Clients from '@/components/clients';
import Cta from '@/components/cta';
import HeroProduct from '@/components/hero-product';

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const getIntegration = (slug: string) => {
  const product = integrations.find(
    (p) => p.slug === slug
  ) as (typeof integrations)[0];

  return product;
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const prev = await parent;
  const product = getIntegration(params.slug);

  if (!product) {
    return {};
  }

  const previousImages = prev?.openGraph?.images || [];

  return {
    title: product?.metadata?.title || product?.title,
    description: product?.metadata?.description || product?.description,
    openGraph: {
      images: [...previousImages],
    },
    keywords: `${
      [...(product?.keywords || []), prev?.keywords]?.join(', ') || ''
    }`,
    alternates: {
      canonical: `/integrations/${product?.slug}`,
    },
  };
}
type PageProps = {
  product: (typeof integrations)[0];
};

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getIntegration(params.slug);

  if (!product) {
    redirect('/');
  }

  return (
    <>
      <HeroProduct
        name={product?.name}
        title={product?.title!}
        description={product?.description}
        cta={product?.cta}
        cta2={product?.cta2}
        youtubeVideoId={product?.youtubeVideoId}
        imageUrl={product?.imageUrl}
      />
      <Clients />

      {product?.features && (
        <div id="features" className="py-24">
          <div className="px-6 mx-auto max-w-7xl lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h3
                className="text-2xl font-bold text-pink-400 font-caveat"
                color="primary"
              >
                {product?.features?.label || `No-Code Required`}
              </h3>
              <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl font-bricolage-grotesque">
                {product.features.title ||
                  `Training a Custom ChatGPT Chatbot made easy`}
              </p>
              <p className="mt-6 text-lg leading-8 text-zinc-500">
                {product.features.description ||
                  `Chaindesk makes it very easy to train a chatbot on your company
                data.`}
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-10 max-w-xl lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {product.features?.items?.map((feature, idx) => (
                  <div key={feature.name} className="relative pl-16">
                    <dt className="text-base font-bold leading-7 text-zinc-800 font-bricolage-grotesque">
                      <div
                        className="flex absolute top-0 left-0 justify-center items-center w-10 h-10 text-2xl font-extrabold bg-pink-100 rounded-lg text-zinc-800 font-caveat"
                        // sx={{ backgroundColor: 'primary.600' }}
                      >
                        {/* <feature.icon
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    /> */}
                        {/* {feature.icon} */}
                        {idx + 1}
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 whitespace-pre-wrap text-zinc-500">
                      {feature.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      )}

      <Cta />
    </>
  );
}
