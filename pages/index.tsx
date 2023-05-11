import { useColorScheme } from '@mui/joy/styles';
import Head from 'next/head';
// import { SecondaryFeatures } from '@app/landing-page/components/SecondaryFeatures';
// import { Testimonials } from '@app/landing-page/components/Testimonials';
import Script from 'next/script';
import { useEffect } from 'react';

// import { CallToAction } from '@app/landing-page/components/CallToAction';
// import { Faqs } from '@app/landing-page/components/Faqs';
import { Footer } from "@app/components/landing-page/Footer";
import { Header } from "@app/components/landing-page/Header";
import { Hero } from "@app/components/landing-page/Hero";
// import { Pricing } from '@app/landing-page/components/Pricing';
import { PrimaryFeatures } from "@app/components/landing-page/PrimaryFeatures";

import OpenGraph from "../components/OpenGraph";
import { absUrl } from "../core/helpers";
import useOpenGraph from "../hooks/useOpenGraph";

import ChatBotBenefits from "./ChatBotBenefits";
import Cta from "./Cta";
import FAQ from "./FAQ";
import FeaturesForCustomerSupport from "./FeaturesForCustomerSupport";
import FeaturesForDevs from "./FeaturesForDevs";
import FeaturesForSlack from "./FeaturesForSlack";

export default function Home() {
  const ogProperties = useOpenGraph({
    url: absUrl("/"),
    title: "GriotAI - Build your ChatGPT Agent Trained on your own data", // Add you homepage title
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
  // Force dark mode on the landing page
  const { setMode } = useColorScheme();

  useEffect(() => {
    setMode('dark');
  }, []);

  return (
    <>
      <Head>
        <title>GriotAI - Build your ChatGPT Agent Trained on your own data</title>
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
        src="https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@1.0.15"
        id="clgtujkqh022j0u0zw3ut8vk3"
        data-name="databerry-chat-bubble"
      ></script>

      <main className="bg-black min-heigh-full">
        <Hero />
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
        <FeaturesForCustomerSupport />
        <FeaturesForSlack />
        {/* <FeaturesForInfluencers /> */}
        <FeaturesForDevs />
        <ChatBotBenefits />
        <FAQ />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

