import React from 'react';

type Props = {};

const CompanyLogos = (props: Props) => {
  return (
    <div className="pb-24 bg-black sm:pb-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <h2 className="text-lg font-semibold leading-8 text-center text-white">
          Trusted by the world’s most innovative teams
        </h2>
        <div className="grid items-center max-w-lg grid-cols-4 mx-auto mt-10 gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <img
            className="object-contain w-full col-span-2 max-h-12 lg:col-span-1"
            src="https://tailwindui.com/img/logos/158x48/transistor-logo-white.svg"
            alt="Transistor"
            width={158}
            height={48}
          />
          <img
            className="object-contain w-full col-span-2 max-h-12 lg:col-span-1"
            src="https://tailwindui.com/img/logos/158x48/reform-logo-white.svg"
            alt="Reform"
            width={158}
            height={48}
          />
          <img
            className="object-contain w-full col-span-2 max-h-12 lg:col-span-1"
            src="https://www.1min30.com/wp-content/uploads/2018/03/Couleur-logo-BNP-Paribas.jpg"
            alt="BNP Paribas"
            width={158}
            height={48}
          />
          <img
            className="object-contain w-full col-span-2 max-h-12 sm:col-start-2 lg:col-span-1"
            src="https://tailwindui.com/img/logos/158x48/savvycal-logo-white.svg"
            alt="SavvyCal"
            width={158}
            height={48}
          />
          <img
            className="object-contain w-full col-span-2 col-start-2 max-h-12 sm:col-start-auto lg:col-span-1"
            src="https://tailwindui.com/img/logos/158x48/statamic-logo-white.svg"
            alt="Statamic"
            width={158}
            height={48}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyLogos;
