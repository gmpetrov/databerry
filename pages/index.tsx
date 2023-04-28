import {GetStaticPropsContext} from 'next';
import Head from 'next/head';
// import { SecondaryFeatures } from '@app/landing-page/components/SecondaryFeatures';
// import { Testimonials } from '@app/landing-page/components/Testimonials';
import Script from 'next/script';
import {useTranslations} from 'next-intl';

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
  const t = useTranslations('common');

  return (
    <>
      <Head>
        <title>
          {t('title')}
        </title>
        <meta
          name="description"
          content="Databerry is a no-code document retrievial platform that connects your data to ChatGPT and other Language Models."
        />
      </Head>
      <Header />

      <script
        defer
        src="https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@1.0.7"
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

export async function getStaticProps({locale}: GetStaticPropsContext) {
  return {
    props: {
      // You can get the messages from anywhere you like. The recommended pattern
      // is to put them in JSON files separated by locale (e.g. `en.json`).
      messages: (await import(`../public/locales/${locale}.json`)).default
    }
  };
}