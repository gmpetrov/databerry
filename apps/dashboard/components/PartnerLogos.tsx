import Image from 'next/image';
import React from 'react';

export default function PartnerLogos() {
  return (
    <div className="py-24 bg-black">
      <div className="flex flex-col justify-center px-6 mx-auto max-w-7xl lg:px-8">
        <h2 className="text-xl text-center text-white font-display leading-12 pb-9">
          Trusted by the world&apos;s most innovative teams
        </h2>
        <div className="grid items-center grid-cols-2 mx-auto mt-10 place-items-center xs:grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          <Image
            loading="lazy"
            className="object-contain lg:col-span-1"
            src="/landing-page/company-logos/klarna.png"
            alt="Klarna Logo"
            width={130}
            height={30}
          />
          <Image
            loading="lazy"
            className="object-contain lg:col-span-1"
            src="/landing-page/company-logos/bcg.png"
            alt="BCG Logo"
            width={80}
            height={60}
          />
          <Image
            loading="lazy"
            className="object-contain lg:col-span-1"
            src="/landing-page/company-logos/bnp-paribas.png"
            alt="BNP Paribas Logo"
            width={200}
            height={150}
          />
          <Image
            loading="lazy"
            className="object-contain lg:col-span-1"
            src="/landing-page/company-logos/bellman.svg"
            alt="Bellman Logo"
            width={180}
            height={90}
          />
          <Image
            loading="lazy"
            className="object-contain lg:col-span-1"
            src="/landing-page/company-logos/patreon.png"
            alt="Patreon Logo"
            width={155}
            height={70}
          />
          <Image
            loading="lazy"
            className="object-contain lg:col-span-1"
            src="/landing-page/company-logos/maskex.png"
            alt="Maskex Logo"
            width={140}
            height={60}
          />
          <Image
            loading="lazy"
            className="object-contain lg:col-span-1"
            src="/landing-page/company-logos/pmu.jpg"
            alt="PMU Logo"
            width={130}
            height={40}
          />
          <Image
            loading="lazy"
            className="object-contain lg:col-span-1"
            src="/landing-page/company-logos/abu-dhabi-chamber.png"
            alt="Abu Dhabi Chamber Logo"
            width={180}
            height={90}
          />
        </div>
      </div>
    </div>
  );
}
