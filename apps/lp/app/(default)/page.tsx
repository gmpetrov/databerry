import Script from 'next/script';

import Cta from '@chaindesk/ui/lp/cta';

import Clients from '@/components/clients';
import Features01 from '@/components/features-01';
import Features02 from '@/components/features-02';
import Features03 from '@/components/features-03';
import Hero from '@/components/hero';
import PricingTabs from '@/components/pricing-tabs';
import Testimonials from '@/components/testimonials';

export default function Home() {
  return (
    <>
      <Script
        id="chaindesk-agent"
        type="module"
        dangerouslySetInnerHTML={{
          __html: `import Chatbox from 'https://cdn.jsdelivr.net/npm/@chaindesk/embeds@latest/dist/chatbox/index.js';
          
          Chatbox.initBubble({
            agentId: 'clq6g5cuv000wpv8iddswwvnd',
          });`,
        }}
      />
      <Hero />
      <Clients />
      <Features01 />
      <Features02 />
      <Features03 />
      {/* <PricingTabs /> */}
      <Testimonials />
      <Cta />
    </>
  );
}
