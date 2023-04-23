import {
  BoltIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CurrencyDollarIcon,
  HeartIcon,
  PencilSquareIcon,
  SparklesIcon,
  SwatchIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Efficiency',
    description:
      'Chatbots provide fast, efficient communication that can streamline workflows and reduce response times for customers.',
    icon: BoltIcon,
  },
  {
    name: 'Personalization',
    description:
      'With chatbots, you can create a personalized experience for your audience, allowing them to engage with your brand in a more meaningful way.',
    icon: SwatchIcon,
  },
  {
    name: 'Automation',
    description:
      'Chatbots can automate repetitive tasks, allowing your team to focus on higher-level work and increasing overall productivity.',
    icon: SparklesIcon,
  },
  {
    name: 'Cost Savings',
    description:
      'Chatbots can provide cost savings by reducing the need for large support or customer service teams, and are available 24/7 for customer inquiries.',
    icon: CurrencyDollarIcon,
  },
];

export default function Example() {
  return (
    <div className="py-24 bg-black sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="grid max-w-2xl grid-cols-1 mx-auto gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Why AI Chatbots Are the Future
          </h2>
          <dl className="grid grid-cols-1 col-span-2 gap-x-8 gap-y-16 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.name}>
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="flex items-center justify-center w-10 h-10 mb-6 bg-indigo-600 rounded-lg">
                    <feature.icon
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 text-base leading-7 text-gray-300">
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
