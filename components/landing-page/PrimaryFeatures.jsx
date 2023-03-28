import { ArrowPathIcon, ChatBubbleOvalLeftIcon,CloudArrowUpIcon, ComputerDesktopIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Cute interface',
    description:
      'User-friendly interface to mangage your datastores',
    icon: ComputerDesktopIcon,
  },
  {
    name: 'Securized Api Endpoints',
    description:
      'We provide you with secured api endpoints to access your data.',
    icon: LockClosedIcon,
  },
  {
    name: 'Auto Synch',
    description:
      'We will automatically synch your data with your datastore. You can also manually synch your data at any time.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Auto ChatGPT Plugin',
    description:
      'ChatGPT Plugin files are automatically generated for each of your datastore',
    icon: ChatBubbleOvalLeftIcon,
  },
]

export function PrimaryFeatures() {
  return (
    <div
      id="features" 
      className="py-24 bg-black sm:py-32"
      >
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Semantic Search without code</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Everything you need to create a document retrieval system.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-400">
          Databerry provides a user-friendly solution to quickly setup a semantic search system over your personal data without any technical knowledge.
          </p>
        </div>
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-y-10 gap-x-8 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-100">
                  <div className="absolute top-0 left-0 flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg">
                    <feature.icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-400">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
