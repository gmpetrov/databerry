import { Metadata, ResolvingMetadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react';

import competitors from '@chaindesk/lib/data/competitors';
import products from '@chaindesk/lib/data/products';
import slugify from '@chaindesk/lib/slugify';

import Clients from '@/components/clients';
import Cta from '@/components/cta';
import HeroProduct from '@/components/hero-product';

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
  const prev = await parent;
  const product = getProduct(params.slug);

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
      canonical: `/products/${product?.slug}`,
    },
  };
}
type PageProps = {
  product: (typeof products)[0];
};

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
        // youtubeVideoId={product?.youtubeVideoId}
        // imageUrl={product?.imageUrl}
      />
      <Clients />

      <Cta />
    </>
  );
}
