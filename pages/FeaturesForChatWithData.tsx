import {
  BoltIcon,
  CloudArrowUpIcon,
  LinkIcon,
} from '@heroicons/react/20/solid';

const features = [
  {
    name: 'Load data from any source',
    description: `Easily upload documents you'd like to chat with.`,
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Instant answers',
    description:
      'Ask questions, extract information, and summarize documents with AI.',
    icon: BoltIcon,
  },
  {
    name: 'Sources included',
    description:
      'Every response is backed by sources extracted from the uploaded document.',
    icon: LinkIcon,
  },
];

export default function Example() {
  return (
    <div
      id="for-customer-support"
      className="py-24 overflow-hidden bg-black sm:py-32"
    >
      <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:grid-cols-2 lg:items-start">
          <div className="order-first px-6 md:px-0 lg:pl-4 lg:pt-4 lg:order-last">
            <div className="max-w-2xl mx-auto lg:mx-0 lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-indigo-500">
                Your second brain
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Talk with your Data
              </p>
              {/* <p className="mt-6 text-lg leading-8 text-gray-300">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Maiores impedit perferendis suscipit eaque, iste dolor
                cupiditate blanditiis ratione.
              </p> */}
              <dl className="max-w-xl mt-10 space-y-8 text-base leading-7 text-gray-300 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-white">
                      <feature.icon
                        className="absolute w-5 h-5 text-indigo-500 left-1 top-1"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>{' '}
                    <br />
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="">
            {/* <div className="relative px-6 pt-8 overflow-hidden bg-indigo-500 isolate sm:mx-auto sm:max-w-2xl sm:rounded-3xl sm:pl-16 sm:pr-0 sm:pt-16 lg:mx-0 lg:max-w-none"> */}
            {/* <div
                className="absolute -inset-y-px -left-3 -z-10 w-full origin-bottom-left skew-x-[-30deg] bg-indigo-100 opacity-20 ring-1 ring-inset ring-white"
                aria-hidden="true"
              /> */}
            <img
              src="/landing-page/datasources.png"
              alt="Product screenshot"
              className="w-full max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-[37rem] "
              width={2432}
              height={1442}
            />
            {/* <div
                className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/10 sm:rounded-3xl"
                aria-hidden="true"
              /> */}
          </div>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
