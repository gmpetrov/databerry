import { useColorScheme } from '@mui/joy/styles';
import clsx from 'clsx';
import Head from 'next/head';
import { useRouter } from 'next/router';
// import { SecondaryFeatures } from '@app/landing-page/components/SecondaryFeatures';
// import { Testimonials } from '@app/landing-page/components/Testimonials';
import Script from 'next/script';
import { useEffect, useState } from 'react';

import Body from '@app/components/cs-landing-page/Body';
import ChatBotBenefits from '@app/components/landing-page/ChatBotBenefits';
import CompanyLogos from '@app/components/landing-page/CompanyLogos';
import FAQ from '@app/components/landing-page/FAQ';
import FeaturesForChatGPTPlugin from '@app/components/landing-page/FeaturesForChatGPTPlugin';
import FeaturesForChatWithData from '@app/components/landing-page/FeaturesForChatWithData';
import FeaturesForCustomerSupport from '@app/components/landing-page/FeaturesForCustomerSupport';
import FeaturesForDevs from '@app/components/landing-page/FeaturesForDevs';
import FeaturesForInfluencers from '@app/components/landing-page/FeaturesForInfluencers';
import FeaturesForSlack from '@app/components/landing-page/FeaturesForSlack';
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

import Cta from '../components/landing-page/Cta';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const { mode, setMode } = useColorScheme();

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
        title="Chaindesk - ChatGPT AI Chat Bot for your business"
        description="Chaindesk brings a no-code platform to create custom AI chatbots trained on your data. Our solution makes customer support easy and simplifies team workflow."
        uri="/"
        ogImage="https://www.chaindesk.ai/og-image.jpg"
      />

      {/* <div className="p-2 w-full text-center bg-indigo-500">
        <h2>
          🔔 Rebranding Alert - Databerry.ai is now ⛓️{' '}
          <strong>Chaindesk</strong>
        </h2>
      </div> */}
      <Header />

      {/* <script
        defer
        src="https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@latest"
        id="clq6g5cuv000wpv8iddswwvnd"
        data-name="databerry-chat-bubble"
      ></script> */}

      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `import Chatbox from 'https://cdn.jsdelivr.net/npm/@chaindesk/embeds@latest/dist/chatbox/index.js';

  Chatbox.initBubble({
    agentId: 'clq6g5cuv000wpv8iddswwvnd',
  });`,
        }}
      />

      {/* <Script id="chaindesk" strategy="afterInteractive">
        {`(function() {
      d = document;
      s = d.createElement('script');
      s.id = 'clq6g5cuv000wpv8iddswwvnd';
      s.setAttribute('data-name', 'databerry-chat-bubble');
      s.src = 'https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@latest';
      s.async = 1;
      d.getElementsByTagName('head')[0].appendChild(s);
    })();`}
      </Script> */}

      <main className={clsx('bg-black min-heigh-full', mounted ? mode : '')}>
        {/* <HeroChatGPTPlugin />
        <PartnerLogos />
        
        <FeaturesForChatWithData />
        <FeaturesForCustomerSupport />
        <FeaturesForDevs />
        <Languages />
        <FAQ />
        <Cta /> */}

        <Body hero2 />
      </main>
      <Footer />
    </>
  );
}
