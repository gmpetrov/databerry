import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Looks3RoundedIcon from "@mui/icons-material/Looks3Rounded";
import Looks4RoundedIcon from "@mui/icons-material/Looks4Rounded";
import LooksOneRoundedIcon from "@mui/icons-material/LooksOneRounded";
import LooksTwoRoundedIcon from "@mui/icons-material/LooksTwoRounded";
import { Box, Button, Stack, Typography } from "@mui/joy";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { Footer } from "@app/components/landing-page/Footer";
import { Header } from "@app/components/landing-page/Header";
import { Hero } from "@app/components/landing-page/Hero";
import { RouteNames } from "@app/types";

import OpenGraph from "../../components/OpenGraph";
import { absUrl } from "../../core/helpers";
import useOpenGraph from "../../hooks/useOpenGraph";

export default function Home() {
  const t = useTranslations("crisp");
  const ogProperties = useOpenGraph({
    url: absUrl("/"),
    title: "GriotAI - Crisp Plugin", // Add you homepage title
    image: {
      // some default image preview for your website
      type: "image/png",
      url: " https://griotai.kasetolabs.xyz/og-image.png",
      alt: "GriotAI Logo",
    },
    description:
      "GriotAI is a no-code document retrievial platform that connects your data to ChatGPT and other Language Models.",
    type: "website",
  });
  return (
    <>
      <Head>
        <meta
          name="description"
          content="ChatGPT Bot trained on your company data. Integrates with existing customer support tools."
        />
        <meta
          name="keywords"
          content="GriotAI, Crisp Plugin, AI chatbot, automatic data synchronization, custom data training, fast chatbot training, easy chatbot setup"
        />
        <OpenGraph properties={ogProperties} />
      </Head>
      <Header />
      <main className="flex flex-col min-h-full mb-auto bg-black">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            textAlign: "center",
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
              fontWeight={"bold"}
              className="relative z-10 block"
              sx={(theme) => theme.typography.display1}
            >
             {t(`name`)}
            </Typography>

            <Typography level={"h6"}>
              {t(`description`)}
            </Typography>
          </Stack>

          <Stack direction={"column"} gap={1} mt={4}>
            <Typography level={"body2"}>Integrated via</Typography>
            <Link target="_blank" href={"https://crisp.chat/"}>
              <Image
                className="w-32 mx-auto "
                src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Logo_de_Crisp.svg"
                width={20}
                height={20}
                alt="crisp logo"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                }}
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
              {t(`create_bot`)}
            </Button>
          </Link>

          <Box sx={{ width: 1, maxWidth: 800, mt: 8 }}>
            <iframe
              //   className="w-full h-[300px] rounded-2xl"
              //   width="560"
              className="w-full aspect-video rounded-3xl"
              src="https://www.youtube.com/embed/LPISZdaiDBM"
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
    name: "feature_0_title",
    description: "feature_0_description",
    icon: <LooksOneRoundedIcon className="w-6 h-6" />,
  },
  {
    name: "feature_1_title",
    description: "feature_1_description",
    icon: <LooksTwoRoundedIcon className="w-6 h-6" />,
  },
  {
    name: "feature_2_title",
    description: "feature_2_description",
    icon: <Looks3RoundedIcon className="w-6 h-6" />,
  },
  {
    name: "feature_3_title",
    description: "feature_3_description",
    icon: <Looks4RoundedIcon className="w-6 h-6" />,
  },
];

export function PrimaryFeatures() {
  const t = useTranslations("crisp");

  return (
    <div id="features" className="py-24 bg-black sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto lg:text-center">
          <Typography className="font-bold" level="body1" color="primary">
            {t(`primary_feature_0`)}
          </Typography>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t(`primary_feature_1`)}
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            {t(`primary_feature_2`)}
          </p>
        </div>
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-y-10 gap-x-8 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-100">
                  <Box
                    className="absolute top-0 left-0 flex items-center justify-center w-10 h-10 rounded-lg"
                    sx={{ backgroundColor: "primary.600" }}
                  >
                    {/* <feature.icon
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    /> */}
                    {feature.icon}
                  </Box>
                  {t(feature.name)}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-400 whitespace-pre-wrap">
                  {t(feature.description)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
