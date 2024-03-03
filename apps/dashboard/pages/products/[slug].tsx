import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Button, Stack, Typography, useColorScheme } from '@mui/joy';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Footer } from '@app/components/landing-page/Footer';
import { Header } from '@app/components/landing-page/Header';
import SEO from '@app/components/SEO';

import { appUrl } from '@chaindesk/lib/config';
import products from '@chaindesk/lib/data/products';
import { RouteNames } from '@chaindesk/lib/types';

type PageProps = {
  product: (typeof products)[0];
};

export default function ProductPage({ product }: PageProps) {
  const { mode, setMode } = useColorScheme();
  React.useEffect(() => {
    setMode('dark');
  }, []);

  return (
    <>
      <SEO
        title={`${product.name} | Chaindesk`}
        description={product.description}
        uri={`/products/${product.slug}`}
      />

      <Header />
      <main className="flex flex-col mb-auto min-h-full bg-black">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            textAlign: 'center',
            p: {
              xs: 2,
              md: 4,
              lg: 8,
            },
          }}
        >
          <Stack gap={2} sx={{ maxWidth: 'sm' }}>
            <Typography
              level="h2"
              fontWeight={'bold'}
              className="block relative z-10"
              sx={(theme) => ({
                ...theme.typography.display1,
              })}
            >
              {product.name}
            </Typography>

            <Typography level={'title-md'}>{product.description}</Typography>
          </Stack>

          {product.logo && (
            <Stack direction={'column'} gap={1} mt={4}>
              {/* <Link target="_blank" href={'https://crisp.chat/'}> */}
              {product?.logo?.startsWith('/') ? (
                <Image
                  className="mx-auto w-20"
                  src={product.logo!}
                  width={300}
                  height={20}
                  alt="product logo"
                ></Image>
              ) : (
                <img
                  className="mx-auto w-20"
                  src={product.logo!}
                  width={300}
                  height={20}
                  alt="product logo"
                ></img>
              )}

              {/* </Link> */}
            </Stack>
          )}

          <Link href={`${appUrl}/signin`} className="w-full">
            <Button
              variant="solid"
              size="lg"
              sx={{ mt: 5, width: 1, maxWidth: 350 }}
              endDecorator={<ArrowForwardRoundedIcon />}
            >
              {product.CTA}
            </Button>
          </Link>

          {product?.demoUrl && (
            <Link href={product.demoUrl} className="w-full" target="_blank">
              <Button
                variant="outlined"
                size="lg"
                sx={{ mt: 1, width: 1, maxWidth: 350 }}
                endDecorator={<ArrowForwardRoundedIcon />}
              >
                Demo
              </Button>
            </Link>
          )}

          {product.youtubeVideoId && (
            <Box sx={{ width: 1, maxWidth: 800, mt: 8 }}>
              <iframe
                //   className="w-full h-[300px] rounded-2xl"
                //   width="560"
                className="w-full rounded-3xl aspect-video"
                src={`https://www.youtube.com/embed/${product.youtubeVideoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              ></iframe>
            </Box>
          )}
        </Box>

        <PrimaryFeatures features={product.features} />
      </main>
      <Footer />
    </>
  );
}

export function PrimaryFeatures(props: {
  features: (typeof products)[0]['features'];
}) {
  return (
    <div id="features" className="py-24 bg-black sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <Typography className="font-bold" level="body-md" color="primary">
            Make LLMs aware of your custom data
          </Typography>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A chatbot train on your data in minutes
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            Chaindesk makes it very easy to train a chatbot on your company
            data.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 max-w-xl lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {props.features.map((feature, idx) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-100">
                  <Box
                    className="flex absolute top-0 left-0 justify-center items-center w-10 h-10 rounded-lg"
                    sx={{ backgroundColor: 'primary.600' }}
                  >
                    {/* <feature.icon
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    /> */}
                    {/* {feature.icon} */}
                    {idx + 1}
                  </Box>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-400 whitespace-pre-wrap">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export async function getStaticPaths() {
  // Get the paths we want to pre-render based on posts
  const paths = products.map((product) => ({
    params: { slug: product.slug },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: 'blocking' } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths, fallback: 'blocking' };
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps({ params }: any) {
  const slug = params.slug as string;

  const product = products.find((product) => product.slug === slug);

  if (!product) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }

  return {
    props: {
      product,
    },
    // revalidate: 10, // In seconds
  };
}
