import {
  ArrowPathIcon,
  ChatBubbleOvalLeftIcon,
  CubeTransparentIcon,
  CursorArrowRaysIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Load data from anywhere',
    description:
      'WebPage, PDF, Gdoc, Sheets, Notion, Airtable, ... More to come!',
    icon: CubeTransparentIcon,
  },
  {
    name: 'No-code',
    description:
      'User-friendly interface to create agents and manage your data',
    icon: CursorArrowRaysIcon,
  },
  {
    name: 'Securized API Endpoints',
    description:
      'We provide you with secured api endpoints to query your agents or your datastores from anywhere via a simple HTTP POST request. Useful for integrating custom data into language models',
    icon: LockClosedIcon,
  },

  // {
  //   name: 'Auto Synch',
  //   description:
  //     'We will automatically synch your data with your datastore. You can also manually synch your data at any time.',
  //   icon: ArrowPathIcon,
  // },
  {
    name: 'ChatGPT Plugin',
    description:
      'A ChatGPT Plugin is automatically generated for each of your datastore. This way you can chat with your data via ChatGPT!',
    icon: ChatBubbleOvalLeftIcon,
  },
];

export function PrimaryFeatures() {
  return (
    <div id="features" className="py-24 bg-black sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            ChatGPT Agents Trained On Your Custom Data
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Prepare your data for the new AI era
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            Chaindesk provides a user-friendly solution to quickly setup a
            semantic search system over your custom data without any technical
            knowledge
          </p>
        </div>
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-y-10 gap-x-8 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-100">
                  <div className="absolute top-0 left-0 flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg">
                    <feature.icon
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-400">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
