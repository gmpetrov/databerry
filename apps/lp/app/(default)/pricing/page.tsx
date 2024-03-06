import React from 'react';

import Cta from '@/components/cta';
import PricingTabs from '@/components/pricing-tabs';
import Testimonials from '@/components/testimonials';
import Section from '@/components/ui/section';

type Props = {};

function PricingPage({}: Props) {
  return (
    <>
      <Section>
        <PricingTabs />
      </Section>
      <Testimonials />
      <Cta />
    </>
  );
}

export default PricingPage;
