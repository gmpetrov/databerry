import Head from 'next/head';
// import { SecondaryFeatures } from '@app/landing-page/components/SecondaryFeatures';
// import { Testimonials } from '@app/landing-page/components/Testimonials';
import Script from 'next/script';

// import { CallToAction } from '@app/landing-page/components/CallToAction';
// import { Faqs } from '@app/landing-page/components/Faqs';
import { Footer } from '@app/components/landing-page/Footer';
import { Header } from '@app/components/landing-page/Header';
import { Hero } from '@app/components/landing-page/Hero';
// import { Pricing } from '@app/landing-page/components/Pricing';
import { PrimaryFeatures } from '@app/components/landing-page/PrimaryFeatures';

import ChatBotBenefits from './ChatBotBenefits';
import Cta from './Cta';
import FAQ from './FAQ';
import FeaturesForCustomerSupport from './FeaturesForCustomerSupport';
import FeaturesForDevs from './FeaturesForDevs';
import FeaturesForInfluencers from './FeaturesForInfluencers';
import FeaturesForSlack from './FeaturesForSlack';

export default function Home() {
  return (
    <>
      <Head>
        <title>
          Databerry - Build ChatGPT Agents trained on your custom data
        </title>
        <meta
          name="description"
          content="Databerry is a no-code document retrievial platform that connects your data to ChatGPT and other Language Models."
        />
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
