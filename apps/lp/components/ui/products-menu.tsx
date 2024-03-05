import { Popover, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  PhoneIcon,
  PlayCircleIcon,
} from '@heroicons/react/20/solid';
import {
  ArrowPathIcon,
  ChartPieIcon,
  ChatBubbleLeftEllipsisIcon,
  CpuChipIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  ServerIcon,
  SquaresPlusIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { Fragment } from 'react';

import products from '@chaindesk/lib/data/products';

const solutions = [
  ...products
    // .filter((each) => !each.disabledFromMenu)
    .map((product) => ({
      name: product.name,
      description: product.description,
      href: `/products/${product.slug}`,
      icon: product.icon
        ? product.icon
        : (props: any) => {
            return (
              <img
                {...props}
                src={product.logo}
                alt={`${product.name} Logo}`}
              />
            );
          },
    })),
  // {
  //   name: 'Embed Agent on your website',
  //   description:
  //     'Automate customer support with a ChatGPT Bot trained on your data',
  //   href: '/#for-customer-support',
  //   icon: ChatBubbleLeftEllipsisIcon,
  // },
  // {
  //   name: 'Crisp Plugin',
  //   description:
  //     'Connect your agent to Crisp. Summarize conversations and more!',
  //   href: 'https://www.chaindesk.ai/products/crisp-plugin',
  //   icon: (props: any) => (
  //     <img
  //       {...props}
  //       src="https://www.freelance-stack.io/wp-content/uploads/2022/07/crispchat-logo.png"
  //       alt="Crisp Logo"
  //     />
  //   ),
  // },
  // {
  //   name: 'Slack',
  //   description: 'Deploy an Agent trained on your data to Slack',
  //   href: 'https://www.chaindesk.ai/products/slack-bot',
  //   icon: (props: any) => (
  //     <img
  //       {...props}
  //       src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg"
  //       alt="Slack Logo"
  //     />
  //   ),
  // },
  // {
  //   name: 'ChatGPT Plugin',
  //   description:
  //     'Build your own ChatGPT Plugin to connect custom data to your ChatGPT',
  //   href: '/#chatgpt-plugin',
  //   icon: (props: any) => (
  //     <img
  //       {...props}
  //       src="https://static.vecteezy.com/system/resources/previews/021/495/996/original/chatgpt-openai-logo-icon-free-png.png"
  //       alt="OpenAI Logo"
  //     />
  //   ),
  // },
  // {
  //   name: 'Create your digital self chatbot',
  //   description:
  //     'Automate customer support with a ChatGPT Bot trained on your data',
  //   href: '/products/clone',
  //   icon: UserPlusIcon,
  // },
  // {
  //   name: 'ChatGPT Plugin',
  //   description:
  //     'Build your own ChatGPT Plugin to connect custom data to your ChatGPT',
  //   href: '/#chatgpt-plugin',
  //   icon: (props: any) => (
  //     <img
  //       {...props}
  //       src="https://static.vecteezy.com/system/resources/previews/021/495/996/original/chatgpt-openai-logo-icon-free-png.png"
  //       alt="OpenAI Logo"
  //     />
  //   ),
  // },
  {
    name: 'Chaindesk API',
    description: 'Acess the Chaindesk API to build your own workflows',
    href: 'https://docs.chaindesk.ai/introduction',
    icon: ServerIcon,
  },
  // {
  //   name: 'On Premise',
  //   description: 'Install Chaindesk on your own infrastructure',
  //   href: 'https://github.com/gmpetrov/chaindesk',
  //   icon: CpuChipIcon,
  // },
];
const callsToAction = [
  {
    name: 'Watch demo',
    href: 'https://www.youtube.com/watch?v=-NkVS2l66Zs',
    icon: PlayCircleIcon,
  },
  {
    name: 'Book a Demo',
    href: 'https://calendar.app.google/C65KZcdgA9SBYQfBA',
    icon: PhoneIcon,
  },
];

export default function Example() {
  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center py-2 text-sm font-medium transition text-zinc-500 hover:text-zinc-900 focus:outline-none">
        <span>Products</span>
        <ChevronDownIcon className="w-5 h-5" aria-hidden="true" />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="flex absolute left-1/2 z-10 px-4 mt-5 w-screen max-w-max -translate-x-1/2">
          <div className="overflow-hidden flex-auto w-screen max-w-md text-sm leading-6 bg-white rounded-3xl ring-1 shadow-lg ring-gray-900/5">
            <div className="p-4">
              {solutions.map((item) => (
                <div
                  key={item.name}
                  className="flex relative gap-x-6 p-4 rounded-lg group hover:bg-gray-50"
                >
                  <div className="flex flex-none justify-center items-center mt-1 w-11 h-11 bg-gray-50 rounded-lg group-hover:bg-white">
                    <item.icon
                      className="w-6 h-6 text-gray-600 group-hover:text-pink-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <a href={item.href} className="font-semibold text-gray-900">
                      {item.name}
                      <span className="absolute inset-0" />
                    </a>
                    <p className="mt-1 text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 bg-gray-50 divide-x divide-gray-900/5">
              {callsToAction.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-gray-900 hover:bg-gray-100"
                >
                  <item.icon
                    className="flex-none w-5 h-5 text-gray-400"
                    aria-hidden="true"
                  />
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
