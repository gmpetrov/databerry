import { useColorScheme } from '@mui/joy/styles';
import { GetStaticPropsContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
// import { SecondaryFeatures } from '@app/landing-page/components/SecondaryFeatures';
// import { Testimonials } from '@app/landing-page/components/Testimonials';
import { useEffect } from 'react';

// import { CallToAction } from '@app/landing-page/components/CallToAction';
// import { Faqs } from '@app/landing-page/components/Faqs';
import { Footer } from '@app/components/landing-page/Footer';
import { Header } from '@app/components/landing-page/Header';
import { HeroChatGPTPlugin } from '@app/components/landing-page/HeroChatGPTPlugin';

// import { Pricing } from '@app/landing-page/components/Pricing';
import OpenGraph from "../components/OpenGraph";
import { absUrl } from '../core/helpers';
import useOpenGraph from '../hooks/useOpenGraph';

import ChatBotBenefits from './ChatBotBenefits';
import Cta from './Cta';
import FAQ from "./FAQ";
import FeaturesForChatGPTPlugin from './FeaturesForChatGPTPlugin';
import FeaturesForCustomerSupport from "./FeaturesForCustomerSupport";
import FeaturesForDevs from './FeaturesForDevs';
import FeaturesForSlack from './FeaturesForSlack';

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
  const router = useRouter();
  const { setMode } = useColorScheme();

  useEffect(() => {
    // Force dark mode on the landing page
    const handleRouteChange = (newPath: string) => {
      window.location.href = router.basePath + newPath;
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    setMode('dark');
  }, []);
  const ogProperties = useOpenGraph({
    url: absUrl("/home"),
    title: "GriotAI Pricing - Plans for Teams of All Sizes", // Add you homepage title
    image: {
      // some default image preview for your website
      type: "image/png",
      url: "/og-image.png",
      alt: "GriotAI Logo",
    },
    description:
      "GriotAI is a no-code document retrievial platform that connects your data to ChatGPT and other Language Models.",
    type: "website",
  });
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
        src="https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@1.0.16"
        id="clgtujkqh022j0u0zw3ut8vk3"
        data-name="databerry-chat-bubble"
      ></script>

      <main className="bg-black min-heigh-full">
        {/* <Hero /> */}
        <HeroChatGPTPlugin />
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
        <FeaturesForDevs />
        <FeaturesForChatGPTPlugin />
        <FeaturesForCustomerSupport />
        <FeaturesForSlack />
        {/* <FeaturesForInfluencers /> */}
        <ChatBotBenefits />
        <FAQ />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

