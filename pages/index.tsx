import { useColorScheme } from '@mui/joy/styles';
import clsx from 'clsx';
import Head from 'next/head';
import { useRouter } from 'next/router';
// import { SecondaryFeatures } from '@app/landing-page/components/SecondaryFeatures';
// import { Testimonials } from '@app/landing-page/components/Testimonials';
import Script from 'next/script';
import { useEffect, useState } from 'react';

import CompanyLogos from '@app/components/landing-page/CompanyLogos';
// import { CallToAction } from '@app/landing-page/components/CallToAction';
// import { Faqs } from '@app/landing-page/components/Faqs';
import { Footer } from '@app/components/landing-page/Footer';
import { Header } from '@app/components/landing-page/Header';
import { Hero } from '@app/components/landing-page/Hero';
import { HeroChatGPTPlugin } from '@app/components/landing-page/HeroChatGPTPlugin';
import Languages from '@app/components/landing-page/Languages';
// import { Pricing } from '@app/landing-page/components/Pricing';
import { PrimaryFeatures } from '@app/components/landing-page/PrimaryFeatures';
import PartnerLogos from '@app/components/PartnerLogos';
import SEO from '@app/components/SEO';

import ChatBotBenefits from './ChatBotBenefits';
import Cta from './Cta';
import FAQ from './FAQ';
import FeaturesForChatGPTPlugin from './FeaturesForChatGPTPlugin';
import FeaturesForChatWithData from './FeaturesForChatWithData';
import FeaturesForCustomerSupport from './FeaturesForCustomerSupport';
import FeaturesForDevs from './FeaturesForDevs';
import FeaturesForInfluencers from './FeaturesForInfluencers';
import FeaturesForSlack from './FeaturesForSlack';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const { mode, setMode } = useColorScheme();
  const url = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${process.env.NOTION_CLIENT_ID}&response_type=code`
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
    setMounted(true);
    setMode('dark');
  }, []);

  return (
    <>
      <SEO
        title="ChatbotGPT - ChatGPT AI Chat Bot for your business"
        description="ChatbotGPT offers a no-code platform to create custom AI chatbots trained on your data. Our solution streamlines customer support, onboards new team members, and simplifies your team's workflow."
      />

      <Head>
        <meta property="og:url" content="https://www.chatbotgpt.ai/" />
        <meta property="og:site_name" content="ChatbotGPT" />
        <meta property="og:type" content="website" />
      </Head>
      {/* <div className="w-full p-2 text-center bg-indigo-500">
        <h2>
          🔔 Rebranding Alert - Databerry.ai is now ⛓️{' '}
          <strong>ChatbotGPT.ai</strong>
        </h2>
      </div> */}
      <Header />

      <script
        defer
        src="https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@latest"
        id="clgtujkqh022j0u0zw3ut8vk3"
        data-name="databerry-chat-bubble"
      ></script>

      <main className={clsx('bg-black min-heigh-full', mounted ? mode : '')}>
        {/* <Hero /> */}
        <HeroChatGPTPlugin />
        <PartnerLogos />
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
      <a href={`https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${process.env.NOTION_CLIENT_ID}&response_type=code`}>
        wtf
      </a>
       <button onClick={()=>window.open(`https://api.notion.com/v1/oauth/authorize?owner=user&client_id=8f56c7ea-0f01-415e-9998-b8854067ff60&response_type=code`, 'authModal', 'width=800,height=800')}> 

      Notion
        </button>
        <FeaturesForChatWithData />
        <FeaturesForCustomerSupport />
        <FeaturesForDevs />
        <Languages />
        {/* <FeaturesForChatGPTPlugin /> */}
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
