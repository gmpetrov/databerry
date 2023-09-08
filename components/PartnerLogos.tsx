import Image from 'next/image'
import React from 'react';

const companies =  [
  { name: 'bellman', logoUrl: '/landing-page/company-logos/bellman.jfif' },
  { name: 'klarna', logoUrl: '/landing-page/company-logos/klarna.jfif' },
  { name: 'pacificlake', logoUrl: '/landing-page/company-logos/pacificlake.jfif' },
  { name: 'patreon', logoUrl: '/landing-page/company-logos/patreon.jfif' },
  { name: 'maskex', logoUrl: '/landing-page/company-logos/maskex.jfif' },
  { name: 'bnp-paribas', logoUrl: '/landing-page/company-logos/bnp-paribas.jfif' },
  { name: 'ebc', logoUrl: '/landing-page/company-logos/ebc.png' },
  { name: 'pmu', logoUrl: '/landing-page/company-logos/pmu.jfif' },
  { name: 'bcg', logoUrl: '/landing-page/company-logos/bcg.jfif' },
  { name: 'advicci', logoUrl: '/landing-page/company-logos/abu-dhabi-chamber.jfif' },
  { name: 'everbreed', logoUrl: '/landing-page/company-logos/everbreed.webp' },
  { name: 'my-operator', logoUrl: '/landing-page/company-logos/my-operator.jfif' },
]

export default function PartnerLogos() {
    return (
      <div className="bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-lg font-semibold leading-8 text-white">
            Trusted by the world’s most innovative teams
          </h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            {companies.map((company)=>(
              <div className="relative flex justify-center"  key={company.name}>
              <Image
                 loading="lazy"
                 className="object-contain lg:col-span-1"
                 src={company.logoUrl}
                 alt={company.name}
                 width={90}
                 height={40}
               />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  