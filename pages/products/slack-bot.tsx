import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Looks3RoundedIcon from '@mui/icons-material/Looks3Rounded';
import Looks4RoundedIcon from '@mui/icons-material/Looks4Rounded';
import LooksOneRoundedIcon from '@mui/icons-material/LooksOneRounded';
import LooksTwoRoundedIcon from '@mui/icons-material/LooksTwoRounded';
import { Box, Button, Stack, Typography } from '@mui/joy';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import { Footer } from '@app/components/landing-page/Footer';
import { Header } from '@app/components/landing-page/Header';
import { RouteNames } from '@app/types';

export default function Home() {
  return (
    <>
      <Head>
        <title>Databerry - Slack Bot</title>

        <meta
          name="title"
          content="Slack Bot by Databerry - Train a Chatbot on Your Company Data"
        />
        <meta
          name="description"
          content="Databerry's Slack Bot makes it easy to train a chatbot on your company data. Just paste your website URL, we process your data and train your bot quickly. The bot is kept up-to-date with your data automatically. Other data sources like PDF, Gdoc, Sheets, Notion, Airtable, and more are also supported."
        />
        <meta
          name="keywords"
          content="Databerry, Slack Bot, AI chatbot, company data, chatbot training, automatic data sync, Slack plugin"
        />
      </Head>
      <Header />
      <main className="flex flex-col min-h-full mb-auto bg-black">
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
          <Stack gap={2}>
            <Typography
              level="h2"
              fontWeight={'bold'}
              className="relative z-10 block"
              sx={(theme) => theme.typography.display1}
            >
              Slack Bot
            </Typography>

            <Typography level={'h6'}>
              Slack Bot trained on your company data
            </Typography>
          </Stack>

          <Stack direction={'column'} gap={1} mt={4}>
            <Link target="_blank" href={'https://crisp.chat/'}>
              <Image
                className="w-20 mx-auto "
                src="/slack-logo.png"
                width={300}
                height={20}
                alt="slack logo"
              ></Image>
            </Link>
          </Stack>

          <Link href={RouteNames.SIGN_IN} className="w-full">
            <Button
              variant="solid"
              size="lg"
              sx={{ mt: 5, width: 1, maxWidth: 350 }}
              endDecorator={<ArrowForwardRoundedIcon />}
            >
              Create your Slack Bot
            </Button>
          </Link>

          <Box sx={{ width: 1, maxWidth: 800, mt: 8 }}>
            <iframe
              //   className="w-full h-[300px] rounded-2xl"
              //   width="560"
              className="w-full aspect-video rounded-3xl"
              src="https://www.youtube.com/embed/x8-poiGrBa8"
              title="YouTube video player"
              frameBorder="0"
              allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            ></iframe>
          </Box>
        </Box>

        <PrimaryFeatures />

        {/* <Hero /> */}
        {/* <Image
          src="/features.png"
          alt="features"
          width="800"
          height="200"
          className="mx-auto"
        /> */}
        {/* <PrimaryFeatures /> */}
        {/* 
        <SecondaryFeatures />
        <CallToAction />
        <Testimonials />
        <Pricing />
        <Faqs /> */}
      </main>
      <Footer />
    </>
  );
}

const features = [
  {
    name: 'Just paste your website url',
    description:
      'We automatically get your website pages.\nOther data sources are available too \n(e.g. PDF, Gdoc, Sheets, Notion, Airtable, etc...)',
    icon: <LooksOneRoundedIcon className="w-6 h-6" />,
  },
  {
    name: 'Training',
    description:
      'After collecting your data, we process it and train your bot. Don’t worry, it’s fast ⚡️',
    icon: <LooksTwoRoundedIcon className="w-6 h-6" />,
  },
  {
    name: 'Install Slack plugin',
    description:
      'The final step is to install Databerry Bot to your Slack workspace. \nNow your workspace is spiced up \nwith some AI magic ✨',
    icon: <Looks3RoundedIcon className="w-6 h-6" />,
  },
  {
    name: 'Auto Synch',
    description:
      'We keep the bot up to date with your data. \nWe automatically synch your data when possible.\n You can also setup a webhook or manually trigger a synch.',
    icon: <Looks4RoundedIcon className="w-6 h-6" />,
  },
];

export function PrimaryFeatures() {
  return (
    <div id="features" className="py-24 bg-black sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto lg:text-center">
          <Typography className="font-bold" level="body1" color="primary">
            Make LLMs aware of your custom data
          </Typography>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A chatbot train on your data in minutes
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            SlackBot by Databerry, make it very easy to train a chatbot on your
            company data.
          </p>
        </div>
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-y-10 gap-x-8 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-100">
                  <Box
                    className="absolute top-0 left-0 flex items-center justify-center w-10 h-10 rounded-lg"
                    sx={{ backgroundColor: 'primary.600' }}
                  >
                    {/* <feature.icon
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    /> */}
                    {feature.icon}
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
