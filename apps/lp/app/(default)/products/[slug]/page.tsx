// import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
// import { Box, Button, Stack, Typography, useColorScheme } from '@mui/joy';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';

// import { Footer } from '@app/components/landing-page/Footer';
// import { Header } from '@app/components/landing-page/Header';
// import SEO from '@app/components/SEO';
import { appUrl } from '@chaindesk/lib/config';
import products from '@chaindesk/lib/data/products';
import { RouteNames } from '@chaindesk/lib/types';

import Clients from '@/components/clients';
import Cta from '@/components/cta';
import HeroProduct from '@/components/hero-product';

type PageProps = {
  product: (typeof products)[0];
};

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find(
    (p) => p.slug === params.slug
  ) as (typeof products)[0];

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
        youtubeVideoId={product?.youtubeVideoId}
      />
      <Clients />

      <div id="features" className="py-24">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h3
              className="text-2xl font-bold text-pink-400 font-caveat"
              color="primary"
            >
              No-Code Required
            </h3>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl font-bricolage-grotesque">
              Training a Custom ChatGPT Chatbot made easy
            </p>
            <p className="mt-6 text-lg leading-8 text-zinc-500">
              Chaindesk makes it very easy to train a chatbot on your company
              data.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-10 max-w-xl lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {product.features.map((feature, idx) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-bold leading-7 text-zinc-800 font-bricolage-grotesque">
                    <div
                      className="flex absolute top-0 left-0 justify-center items-center w-10 h-10 bg-pink-100 rounded-lg text-zinc-800"
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

      <Cta />
    </>
  );
}

// export function PrimaryFeatures(props: {
//   features: (typeof products)[0]['features'];
// }) {
//   return (
//     <div id="features" className="py-24 bg-black sm:py-32">
//       <div className="px-6 mx-auto max-w-7xl lg:px-8">
//         <div className="mx-auto max-w-2xl lg:text-center">
//           <Typography className="font-bold" level="body-md" color="primary">
//             Make LLMs aware of your custom data
//           </Typography>
//           <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
//             A chatbot train on your data in minutes
//           </p>
//           <p className="mt-6 text-lg leading-8 text-gray-400">
//             Chaindesk makes it very easy to train a chatbot on your company
//             data.
//           </p>
//         </div>
//         <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
//           <dl className="grid grid-cols-1 gap-x-8 gap-y-10 max-w-xl lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
//             {props.features.map((feature, idx) => (
//               <div key={feature.name} className="relative pl-16">
//                 <dt className="text-base font-semibold leading-7 text-gray-100">
//                   <Box
//                     className="flex absolute top-0 left-0 justify-center items-center w-10 h-10 rounded-lg"
//                     sx={{ backgroundColor: 'primary.600' }}
//                   >
//                     {/* <feature.icon
//                       className="w-6 h-6 text-white"
//                       aria-hidden="true"
//                     /> */}
//                     {/* {feature.icon} */}
//                     {idx + 1}
//                   </Box>
//                   {feature.name}
//                 </dt>
//                 <dd className="mt-2 text-base leading-7 text-gray-400 whitespace-pre-wrap">
//                   {feature.description}
//                 </dd>
//               </div>
//             ))}
//           </dl>
//         </div>
//       </div>
//     </div>
//   );
// }
