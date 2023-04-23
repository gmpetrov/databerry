import {
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
} from '@heroicons/react/20/solid';

const features = [
  {
    name: 'Efficient',
    description: `Your AI chatbot can answer frequently asked questions and handle simple support requests, allowing your team to focus on providing more personalized assistance to
      customers.`,
    icon: CloudArrowUpIcon,
  },
  {
    name: '24/7 Support',
    description:
      'Your AI chatbot can handle customer inquiries around the clock, providing efficient support even when your team is unavailable.',
    icon: LockClosedIcon,
  },
  {
    name: 'Easy to Implement',
    description:
      'Integrating your AI chatbot onto your website is a breeze - simply copy and paste our code onto your site and start providing instant support to your visitors.',
    icon: ServerIcon,
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
          <div className="px-6 md:px-0 lg:pr-4 lg:pt-4">
            <div className="max-w-2xl mx-auto lg:mx-0 lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-indigo-500">
                For Customer Support
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Customer Support Made Easy
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
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="sm:px-6 lg:px-0">
            <div className="relative px-6 pt-8 overflow-hidden bg-indigo-500 isolate sm:mx-auto sm:max-w-2xl sm:rounded-3xl sm:pl-16 sm:pr-0 sm:pt-16 lg:mx-0 lg:max-w-none">
              <div
                className="absolute -inset-y-px -left-3 -z-10 w-full origin-bottom-left skew-x-[-30deg] bg-indigo-100 opacity-20 ring-1 ring-inset ring-white"
                aria-hidden="true"
              />
              <img
                src="/landing-page/screenshot-chat-bubble-3.png"
                alt="Product screenshot"
                className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                width={2432}
                height={1442}
              />
              <div
                className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/10 sm:rounded-3xl"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
