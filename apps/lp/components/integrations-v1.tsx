'use client';
import Card from '@mui/joy/Card';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

import { cn } from '@chaindesk/ui/utils/cn';

import { defaultChildVariants, defaultContainerVariants } from '@/utils/motion';

type Props = {
  containerClassName?: string;
};

const integrations = [
  {
    name: 'Wordpress',
    icon: (
      <Image
        className="w-14"
        src="https://upload.wikimedia.org/wikipedia/commons/0/09/Wordpress-Logo.svg"
        width={100}
        height={100}
        alt="Wordpress Logo"
      />
    ),
  },
  {
    name: 'Notion',
    icon: (
      <Image
        className="w-14"
        src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg"
        width={100}
        height={100}
        alt="Wordpress Logo"
      />
    ),
  },
  {
    name: 'YouTube™',
    icon: (
      <Image
        className="w-14"
        src="https://www.svgrepo.com/show/13671/youtube.svg"
        width={100}
        height={100}
        alt="Wordpress Logo"
      />
    ),
  },
  {
    name: 'Google Drive™',
    icon: (
      <img
        className="w-14"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Drive_icon_%282020%29.svg/1024px-Google_Drive_icon_%282020%29.svg.png"
        width={100}
        height={100}
        alt="Google Drive Logo"
      />
    ),
  },
  {
    name: 'Slack',
    icon: (
      <Image
        className="w-14"
        src="/shared/images/logos/slack.png"
        width={100}
        height={100}
        alt="Slack Logo"
      />
    ),
  },
  {
    name: 'Zendesk',
    icon: (
      <Image
        className="w-14"
        src="/integrations/zendesk/icon.svg"
        width={100}
        height={100}
        alt="Zendesk Logo"
      />
    ),
  },
  {
    name: 'Crisp',
    icon: (
      <img
        className="w-32"
        src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Logo_de_Crisp.svg"
        width={100}
        height={100}
        alt="Zapier Logo"
      />
    ),
  },
  {
    name: 'Zapier',
    icon: (
      <img
        className="w-14"
        src="https://images.ctfassets.net/lzny33ho1g45/6YoKV9RS3goEx54iFv96n9/78100cf9cba971d04ac52d927489809a/logo-symbol.png"
        width={100}
        height={100}
        alt="Zapier Logo"
      />
    ),
  },
  {
    name: 'WhatsApp',
    icon: (
      <img
        className="w-14"
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        width={100}
        height={100}
        alt="Zapier Logo"
      />
    ),
  },
  {
    name: 'Messenger',
    icon: (
      <img
        className="w-14"
        src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg"
        width={100}
        height={100}
        alt="Zapier Logo"
      />
    ),
  },
  {
    name: 'Shopify',
    icon: (
      <img
        className="w-14"
        src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/shopify-icon.png"
        width={100}
        height={100}
        alt="Shopify Logo"
      />
    ),
  },
];

function IntegrationBox(props: { icon: any; name: string }) {
  return (
    <Card
      size="lg"
      sx={(t) => ({
        justifyContent: 'center',
        [t.breakpoints.down('sm')]: {
          p: 1,
        },
      })}
    >
      <Stack
        direction="row"
        alignItems={'center'}
        sx={(t) => ({
          gap: 2,
          [t.breakpoints.down('sm')]: {
            gap: 1,
            ['& > svg,img']: {
              width: 32,
              height: 'auto',
            },
            h3: {
              fontSize: '1rem',
            },
          },
        })}
      >
        {props.icon}
        <Typography
          level="title-lg"
          sx={(t) => ({ fontWeight: 'bold', fontSize: 'xl2' })}
        >
          {props.name}
        </Typography>
      </Stack>
    </Card>
  );
}

function Integrations({ containerClassName }: Props) {
  return (
    <Stack id="integrations" sx={{ maxWidth: 'lg', mx: 'auto' }} gap={4} px={2}>
      {/* <h2 className="text-3xl font-bold tracking-tight text-center text-white sm:text-4xl">
        Integrate with any platform
      </h2> */}
      <motion.div
        variants={{
          ...defaultContainerVariants,
          visible: {
            ...defaultContainerVariants,
            transition: {
              staggerChildren: 0.07,
              delayChildren: 2.2,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        whileInView={'visible'}
        viewport={{ once: true }}
      >
        <Stack
          direction={'row'}
          sx={(t) => ({
            flexWrap: 'wrap',
            justifyContent: 'center',
            position: 'relative',
            gap: 5,
            [t.breakpoints.down('sm')]: {
              gap: 2,
            },
          })}
          className={cn(
            'before:absolute before:inset-0 before:w-32 sm:before:w-72 before:z-10 before:pointer-events-none after:absolute after:inset-0 after:left-auto after:w-32 sm:after:w-72 after:z-10 after:pointer-events-none before:bg-gradient-to-r before:from-white after:bg-gradient-to-l after:from-white',
            containerClassName
          )}
        >
          {/* <div
          className={clsx(
            'absolute left-0 z-10 w-14 h-full bg-gradient-to-r pointer-events-none sm:w-32',
            'from-black via-black'
          )}
        />
        <div
          className={clsx(
            'absolute right-0 z-10 w-14 h-full bg-gradient-to-l pointer-events-none sm:w-32',
            'from-black via-black'
          )}
        /> */}
          {integrations.map((integration) => (
            <motion.div key={integration.name} variants={defaultChildVariants}>
              <IntegrationBox
                name={integration.name}
                icon={integration.icon}
              ></IntegrationBox>
            </motion.div>
          ))}
        </Stack>
      </motion.div>
    </Stack>
  );
}

export default Integrations;
