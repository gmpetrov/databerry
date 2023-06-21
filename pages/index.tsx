import { useColorScheme } from "@mui/joy/styles";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { Footer } from '@app/components/landing-page/Footer';
import { Header } from '@app/components/landing-page/Header';
import { HeroChatGPTPlugin } from '@app/components/landing-page/HeroChatGPTPlugin';

import OpenGraph from "../components/OpenGraph";
import { absUrl } from "../core/helpers";
import useOpenGraph from "../hooks/useOpenGraph";

import Cta from "./Cta";
import FAQ from "./FAQ";
import FeaturesForChatGPTPlugin from './FeaturesForChatGPTPlugin';
import FeaturesForChatWithData from './FeaturesForChatWithData';
import FeaturesForCustomerSupport from './FeaturesForCustomerSupport';
import FeaturesForDevs from './FeaturesForDevs';
import FeaturesForSlack from './FeaturesForSlack';

export default function Home() {
  const ogProperties = useOpenGraph({
    url: absUrl("/"),
    title: "GriotAI - Construisez votre agent ChatGPT formé sur vos propres données", // Add you homepage title
    image: {
      // some default image preview for your website
      type: "image/png",
      url: "./databerry-logo-icon.png",
      alt: "GriotAI Logo",
    },
    description:
      "With our no-code platform, you can create a custom AI chatbot trained on your data in seconds. Use GriotAI API to query your agent or to perform document retrievial",
    type: "website",
  });
  const router = useRouter();
  const { setMode } = useColorScheme();

  useEffect(() => {
    // Force dark mode on the landing page
    const handleRouteChange = (newPath: string) => {
      window.location.href = router.basePath + newPath;
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    setMode("dark");
  }, [setMode]);
  return (
    <>
      <Head>
      <title>
        GriotAI - Build ChatGPT Agents trained on your custom data
        </title>

        <meta
          name="description"
          content="GriotAI offers a no-code platform to create custom AI chatbots trained on your data. Our solution streamlines customer support, onboards new team members, and simplifies your team's workflow."
        />
        <meta
          name="keywords"
          content="AI chatbot, No-code platform, Customer support, Onboarding, Slack AI chatbot, Automation, GriotAI"
        />
        <OpenGraph properties={ogProperties} />
      </Head>
      <Header />

      <script
        defer
        src="https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@1.0.20"
        id="clgtujkqh022j0u0zw3ut8vk3"
        data-name="databerry-chat-bubble"
      ></script>

      <main className="bg-black min-heigh-full">
        {/* <Hero /> */}
        <HeroChatGPTPlugin />
        {/* <CompanyLogos /> */}
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
        <FeaturesForChatWithData />
        <FeaturesForCustomerSupport />
        <FeaturesForDevs />
        <FeaturesForChatGPTPlugin />
        {/* <FeaturesForSlack /> */}
        {/* <FeaturesForInfluencers /> */}
        {/* <ChatBotBenefits /> */}
        <FAQ />
        <Cta />
      </main>
      <Footer />
    </>
  );
}


