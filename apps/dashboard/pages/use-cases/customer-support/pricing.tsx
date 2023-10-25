import { Header } from '@app/components/cs-landing-page/Header';
import { Footer } from '@app/components/landing-page/Footer';
import PricingSection from '@app/components/landing-page/PricingSection';
import PartnerLogos from '@app/components/PartnerLogos';
import SEO from '@app/components/SEO';

export default function CSPricingPage() {
  return (
    <>
      <SEO
        title="Plans for Teams of All Sizes"
        description="Choose an affordable plan with Chaindesk. Our offerings include Discover, Startup, Pro, and Enterprise levels, each packed with features for engaging your audience, creating customer loyalty, and driving sales. Free plan included!"
        uri={'/pricing'}
      />
      <Header />
      <main className="flex flex-col min-h-full mb-auto bg-black">
        <PricingSection />

        <PartnerLogos />
      </main>
      <Footer disableProductColumn />
    </>
  );
}
