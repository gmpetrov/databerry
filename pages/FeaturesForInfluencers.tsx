import { ShareIcon, StarIcon, SwatchIcon } from '@heroicons/react/20/solid';

const features = [
  {
    name: 'Personalized Engagement',
    description:
      'Clones of yourself in the form of AI chatbots can help to engage with your followers on Watsapp or messenger with your knowledge and personality',
    href: '#',
    icon: SwatchIcon,
  },
  {
    name: 'Become an Advisor or Influencer',
    description:
      'Your personal Watsapp AI chatbot can act as a digital mentor or influencer, guiding your followers and sharing your expertise.',
    href: '#',
    icon: StarIcon,
  },
  {
    name: 'Share Your Knowledge',
    description:
      'Train your AI chatbot to share your digital knowledge and insights, such as investment advice, content creation, or even cooking recipes.',
    href: '#',
    icon: ShareIcon,
  },
];

export default function Example() {
  return (
    <div className="py-24 bg-black sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">
            AI Agent trained on yourself
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Clone Yourself for Star Status
          </p>
          {/* <p className="mt-6 text-lg leading-8 text-gray-300">
            Quis tellus eget adipiscing convallis sit sit eget aliquet quis.
            Suspendisse eget egestas a elementum pulvinar et feugiat blandit at.
            In mi viverra elit nunc.
          </p> */}
        </div>
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center text-base font-semibold leading-7 text-white gap-x-3">
                  <feature.icon
                    className="flex-none w-5 h-5 text-indigo-400"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="flex flex-col flex-auto mt-4 text-base leading-7 text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                  {/* <p className="mt-6">
                    <a
                      href={feature.href}
                      className="text-sm font-semibold leading-6 text-indigo-400"
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p> */}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
