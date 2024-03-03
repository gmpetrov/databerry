import { Metadata } from 'next';

import Clients from '@/components/clients';
import Cta from '@/components/cta';
import Features01 from '@/components/features-01';
import Features02 from '@/components/features-02';
import Features03 from '@/components/features-03';
import Hero from '@/components/hero';
import PricingTabs from '@/components/pricing-tabs';
import Testimonials from '@/components/testimonials';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_LANDING_PAGE_URL!),
  title: 'Chaindesk - ChatGPT AI Chat Bot for your business',
  description:
    'Chaindesk brings a no-code platform to create custom AI chatbots trained on your data. Our solution makes customer support easy and simplifies team workflows.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    images: ['/api/og'],
  },
  icons: {
    icon: '/images/logo.png',
  },
  keywords: [
    'AI Agent',
    'AI Chatbot',
    'Custom ChatGPT',
    'AI Customer Support Chatbot',
  ],
};

export default function Home() {
  return (
    <>
      <Hero />
      <Clients />
      <Features01 />
      <Features02 />
      <Features03 />
      <PricingTabs />
      <Testimonials />
      <Cta />
    </>
  );
}
