import Head from 'next/head';
// import { SecondaryFeatures } from '@app/landing-page/components/SecondaryFeatures';
// import { Testimonials } from '@app/landing-page/components/Testimonials';
import Image from 'next/image';

// import { CallToAction } from '@app/landing-page/components/CallToAction';
// import { Faqs } from '@app/landing-page/components/Faqs';
import { Footer } from '@app/components/landing-page/Footer';
import { Header } from '@app/components/landing-page/Header';
import { Hero } from '@app/components/landing-page/Hero';
// import { Pricing } from '@app/landing-page/components/Pricing';
import { PrimaryFeatures } from '@app/components/landing-page/PrimaryFeatures';

export default function Home() {
  return (
    <>
      <Head>
        <title>
          Databerry - Connect your data to ChatGPT and other Language Models
        </title>
        <meta
          name="description"
          content="Databerry is a no-code document retrievial platform"
        />
      </Head>
      <Header />
      <main className="bg-black min-heigh-full">
        <Hero />
        <Image
          src="/features.png"
          alt="features"
          width="800"
          height="200"
          className="mx-auto"
        />
        <PrimaryFeatures />
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
