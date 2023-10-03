import {
  CloudArrowUpIcon,
  HeartIcon,
  LockClosedIcon,
  ServerIcon,
} from '@heroicons/react/20/solid';

const features = [
  {
    name: 'Easy to Use',
    description:
      'Our no-code platform allows you to create and manage your AI chatbots with ease, even with no technical knowledge.',
    icon: HeartIcon,
  },
  {
    name: 'Data, APIs integrations',
    description:
      'Build highly integrated LLM agents that connect to data and APIs, opening up a world of possibilities for limitless applications.',
    icon: ServerIcon,
  },
  {
    name: 'Seamless Integrations',
    description:
      'Integrate your AI chatbot onto Slack, Whatsapp and other platforms with ease, and start engaging with your audience on the channels they prefer.',
    icon: CloudArrowUpIcon,
  },
];

export default function Example() {
  return (
    <div className="py-24 overflow-hidden bg-black sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="grid max-w-2xl grid-cols-1 mx-auto gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-bold leading-7 text-indigo-400">
                For Makers
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Experience Our No-Code Platform
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                With our no-code platform, you can create a custom AI chatbot
                trained on your data in seconds. Use Chaindesk API to query your
                agent or to perform document retrievial
              </p>
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
          <img
            src="/landing-page/screenshot.png"
            alt="Product screenshot"
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
            width={2432}
            height={1442}
          />
        </div>
      </div>
    </div>
  );
}
