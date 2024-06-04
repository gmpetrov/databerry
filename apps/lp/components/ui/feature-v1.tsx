import {
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
} from '@heroicons/react/20/solid';

// const features = [
//   {
//     name: 'Push to deploy.',
//     description:
//       'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.',
//     icon: CloudArrowUpIcon,
//   },
//   {
//     name: 'SSL certificates.',
//     description:
//       'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.',
//     icon: LockClosedIcon,
//   },
//   {
//     name: 'Database backups.',
//     description:
//       'Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.',
//     icon: ServerIcon,
//   },
// ];

export default function FeatureV1(props: {
  label: string;
  title: string;
  description: string;
  features: {
    name?: string;
    description?: string;
    icon: any;
  }[];
}) {
  return (
    <div className="py-24 overflow-hidden bg-white sm:py-32">
      <div className="max-w-4xl mx-auto md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:items-start">
          <div className="px-6 md:px-0 lg:pr-4 lg:pt-4">
            <div className="mx-auto lg:mx-0">
              <p className="text-2xl font-bold leading-7 text-pink-400 font-caveat">
                {props.label}
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-bricolage-grotesque">
                {props.title}
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {props.description}
              </p>
              <dl className="max-w-xl mt-10 space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                {(props.features || []).map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900 font-bricolage-grotesque">
                      {feature?.icon && (
                        <feature.icon
                          className="absolute w-5 h-5 text-indigo-600 top-1 left-1"
                          aria-hidden="true"
                        />
                      )}
                      <h3>{feature.name}</h3>
                    </dt>{' '}
                    {feature?.description}
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
