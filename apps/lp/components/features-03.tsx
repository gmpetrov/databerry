'use client';

import { Transition } from '@headlessui/react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import CarouselIllustration from '@/public/images/carousel-illustration-01.jpg';
import FeatureIllustration from '@/public/images/features-illustration.png';
import {
  defaultChildVariants,
  defaultContainerVariants,
  makeVariants,
} from '@/utils/motion';
export default function Features03() {
  const [tab, setTab] = useState<number>(1);

  const tabs = useRef<HTMLDivElement>(null);

  const heightFix = () => {
    if (tabs.current && tabs.current.parentElement)
      tabs.current.parentElement.style.height = `${tabs.current.clientHeight}px`;
  };

  useEffect(() => {
    heightFix();
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.5, // Adjust as needed for the delay between each App component
      },
    },
  } as Variants;

  const childTextVariants = {
    hidden: { opacity: 0 }, // Start slightly down and faded out
    visible: {
      opacity: 1,
      y: 0,
    },
  } as Variants;

  const childVariants = {
    hidden: { opacity: 0, y: 20 }, // Start slightly down and faded out
    visible: {
      opacity: 1,
      y: 0,
      // transition: { duration: 0 }, // Control how each App component animates into view
    },
  } as Variants;

  return (
    <section className="relative bg-zinc-800 after:absolute after:top-0 after:right-0 after:h-full after:w-96 after:pointer-events-none after:bg-gradient-to-l after:from-zinc-800 max-lg:after:hidden">
      <motion.div
        className="py-12 md:py-20"
        variants={makeVariants({
          ...defaultContainerVariants,
          visible: {
            ...defaultContainerVariants.visible,
            transition: {
              staggerChildren: 0.1,
            },
          },
        })}
        initial="hidden"
        whileInView={'visible'}
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Carousel */}
        <div className="max-w-xl px-4 mx-auto lg:max-w-6xl sm:px-6">
          <div className="space-y-12 lg:flex lg:space-y-0 lg:space-x-12 xl:space-x-24">
            {/* Content */}
            <div className="lg:max-w-none lg:min-w-[524px]">
              <div className="mb-8">
                <motion.div
                  className="inline-flex text-sm font-medium text-zinc-400 px-4 py-0.5 border border-transparent [background:linear-gradient(theme(colors.zinc.800),theme(colors.zinc.800))_padding-box,linear-gradient(120deg,theme(colors.zinc.700),theme(colors.zinc.700/0),theme(colors.zinc.700))_border-box] rounded-full mb-4"
                  variants={childTextVariants}
                >
                  Scale Your Team Without Hiring More
                </motion.div>
                <motion.h2
                  className="mb-4 text-3xl font-bold font-bricolage-grotesque text-zinc-200"
                  variants={defaultChildVariants}
                >
                  The only AI customer service solution you need
                </motion.h2>
                <motion.p
                  className="text-lg text-zinc-500"
                  variants={defaultChildVariants}
                >
                  With Chaindesk you have all the tools you need to engage with
                  your customers in one place.
                </motion.p>
              </div>
              {/* Tabs buttons */}
              <div className="mb-8 space-y-2 md:mb-0">
                <motion.button
                  variants={defaultChildVariants}
                  className={`text-left flex items-center px-6 py-4 rounded border border-transparent ${
                    tab !== 1
                      ? ''
                      : '[background:linear-gradient(#2E2E32,#2E2E32)_padding-box,linear-gradient(120deg,theme(colors.zinc.700),theme(colors.zinc.700/0),theme(colors.zinc.700))_border-box]'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(1);
                  }}
                >
                  <svg
                    className="mr-3 shrink-0 fill-zinc-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                  >
                    <path d="m7.951 14.537 6.296-7.196 1.506 1.318-7.704 8.804-3.756-3.756 1.414-1.414 2.244 2.244Zm11.296-7.196 1.506 1.318-7.704 8.804-1.756-1.756 1.414-1.414.244.244 6.296-7.196Z" />
                  </svg>
                  <div>
                    <div className="mb-1 text-lg font-semibold font-bricolage-grotesque text-zinc-200">
                      Shared Inbox
                    </div>
                    <div className="text-zinc-500">
                      Manage all your customer conversations in one place. Take
                      over your AI chatbot when needed. Assign conversations to
                      your team members. Automate your workflows.
                    </div>
                  </div>
                </motion.button>
                <motion.button
                  variants={defaultChildVariants}
                  className={`text-left flex items-center px-6 py-4 rounded border border-transparent ${
                    tab !== 2
                      ? ''
                      : '[background:linear-gradient(#2E2E32,#2E2E32)_padding-box,linear-gradient(120deg,theme(colors.zinc.700),theme(colors.zinc.700/0),theme(colors.zinc.700))_border-box]'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(2);
                  }}
                >
                  <svg
                    className="mr-3 shrink-0 fill-zinc-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                  >
                    <path d="m16.997 19.056-1.78-.912A13.91 13.91 0 0 0 16.75 11.8c0-2.206-.526-4.38-1.533-6.344l1.78-.912A15.91 15.91 0 0 1 18.75 11.8c0 2.524-.602 5.01-1.753 7.256Zm-3.616-1.701-1.77-.93A9.944 9.944 0 0 0 12.75 11.8c0-1.611-.39-3.199-1.14-4.625l1.771-.93c.9 1.714 1.37 3.62 1.369 5.555 0 1.935-.47 3.841-1.369 5.555Zm-3.626-1.693-1.75-.968c.49-.885.746-1.881.745-2.895a5.97 5.97 0 0 0-.745-2.893l1.75-.968a7.968 7.968 0 0 1 .995 3.861 7.97 7.97 0 0 1-.995 3.863Zm-3.673-1.65-1.664-1.11c.217-.325.333-.709.332-1.103 0-.392-.115-.776-.332-1.102L6.082 9.59c.437.655.67 1.425.668 2.21a3.981 3.981 0 0 1-.668 2.212Z" />
                  </svg>
                  <div>
                    <div className="mb-1 text-lg font-semibold font-bricolage-grotesque text-zinc-200">
                      AI-Powered email support
                    </div>
                    <div className="text-zinc-500">
                      {`Handle all your emails through Chaindesk's convenient dashboard. The Email Inbox uses AI too - it will assist you in resolving the issue faster.`}
                    </div>
                  </div>
                </motion.button>
                <motion.button
                  variants={defaultChildVariants}
                  className={`text-left flex items-center px-6 py-4 rounded border border-transparent ${
                    tab !== 3
                      ? ''
                      : '[background:linear-gradient(#2E2E32,#2E2E32)_padding-box,linear-gradient(120deg,theme(colors.zinc.700),theme(colors.zinc.700/0),theme(colors.zinc.700))_border-box]'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(3);
                  }}
                >
                  <svg
                    className="mr-3 shrink-0 fill-zinc-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                  >
                    <path d="m11.293 5.293 1.414 1.414-8 8-1.414-1.414 8-8Zm7-1 1.414 1.414-8 8-1.414-1.414 8-8Zm0 6 1.414 1.414-8 8-1.414-1.414 8-8Z" />
                  </svg>
                  <div>
                    <div className="mb-1 text-lg font-semibold font-bricolage-grotesque text-zinc-200">
                      Conversational Forms
                    </div>
                    <div className="text-zinc-500">
                      Build forms to collect user informations in a
                      conversational way that feels like human.
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Tabs items */}
            <motion.div
              className="relative lg:max-w-none"
              variants={defaultChildVariants}
            >
              <div className="relative flex flex-col" ref={tabs}>
                {/* Item 1 */}
                <Transition
                  show={tab === 1}
                  className="w-full"
                  enter="transition ease-in-out duration-700 transform order-first"
                  enterFrom="opacity-0 -translate-y-4"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in-out duration-300 transform absolute"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-4"
                  beforeEnter={() => heightFix()}
                  unmount={false}
                >
                  <div className="before:absolute before:bottom-0 before:w-full before:z-10 before:pointer-events-none before:bg-gradient-to-t before:from-zinc-800 after:bg-gradient-to-l before:h-[50%]">
                    <Image
                      className="mx-auto rounded-lg lg:max-w-none"
                      src={'/images/feature-shared-inbox.jpg'}
                      width={1100}
                      height={620}
                      alt="Carousel 01"
                    />
                  </div>
                </Transition>
                {/* Item 2 */}
                <Transition
                  show={tab === 2}
                  className="w-full"
                  enter="transition ease-in-out duration-700 transform order-first"
                  enterFrom="opacity-0 -translate-y-4"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in-out duration-300 transform absolute"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-4"
                  beforeEnter={() => heightFix()}
                  unmount={false}
                >
                  <div className="before:absolute before:bottom-0 before:w-full before:z-10 before:pointer-events-none before:bg-gradient-to-t before:from-zinc-800 after:bg-gradient-to-l before:h-[50%]">
                    <Image
                      className="mx-auto rounded-lg lg:max-w-none"
                      src={'/images/feature-email-inbox.jpg'}
                      width={1100}
                      height={620}
                      alt="Carousel 02"
                    />
                  </div>
                </Transition>
                {/* Item 3 */}
                <Transition
                  show={tab === 3}
                  className="w-full"
                  enter="transition ease-in-out duration-700 transform order-first"
                  enterFrom="opacity-0 -translate-y-4"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in-out duration-300 transform absolute"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-4"
                  beforeEnter={() => heightFix()}
                  unmount={false}
                >
                  <div className="before:absolute before:bottom-0 before:w-full before:z-10 before:pointer-events-none before:bg-gradient-to-t before:from-zinc-800 after:bg-gradient-to-l before:h-[0%]">
                    {/* <Image
                      className="mx-auto rounded-lg shadow-2xl lg:max-w-none"
                      src={CarouselIllustration}
                      width={800}
                      height={620}
                      alt="Carousel 03"
                    /> */}
                    <video
                      className="w-auto h-full mx-auto rounded-lg max-w-none"
                      src={'/videos/demo-form.mp4'}
                      controls
                      autoPlay={tab === 3}
                      muted
                      loop
                    />
                  </div>
                </Transition>
              </div>
              {/* Gear illustration */}
              {/* {tab !== 3 && (
                <Image
                  className="absolute bottom-0 left-0 -translate-x-1/2 mix-blend-exclusion translate-y-1/3 max-lg:w-32"
                  src={FeatureIllustration}
                  alt="Features 02 illustration"
                  width={173}
                  height={167}
                  aria-hidden="true"
                />
              )} */}
            </motion.div>
          </div>
        </div>

        {/* Features blocks */}
        <motion.div
          className="max-w-6xl px-4 mx-auto mt-24 sm:px-6 lg:mt-32"
          variants={defaultChildVariants}
        >
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
            {/* Block #1 */}
            <div>
              <div className="flex items-center mb-1">
                <svg
                  className="mr-2 fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 512 512"
                >
                  <path d="M184 0c30.9 0 56 25.1 56 56V456c0 30.9-25.1 56-56 56c-28.9 0-52.7-21.9-55.7-50.1c-5.2 1.4-10.7 2.1-16.3 2.1c-35.3 0-64-28.7-64-64c0-7.4 1.3-14.6 3.6-21.2C21.4 367.4 0 338.2 0 304c0-31.9 18.7-59.5 45.8-72.3C37.1 220.8 32 207 32 192c0-30.7 21.6-56.3 50.4-62.6C80.8 123.9 80 118 80 112c0-29.9 20.6-55.1 48.3-62.1C131.3 21.9 155.1 0 184 0zM328 0c28.9 0 52.6 21.9 55.7 49.9c27.8 7 48.3 32.1 48.3 62.1c0 6-.8 11.9-2.4 17.4c28.8 6.2 50.4 31.9 50.4 62.6c0 15-5.1 28.8-13.8 39.7C493.3 244.5 512 272.1 512 304c0 34.2-21.4 63.4-51.6 74.8c2.3 6.6 3.6 13.8 3.6 21.2c0 35.3-28.7 64-64 64c-5.6 0-11.1-.7-16.3-2.1c-3 28.2-26.8 50.1-55.7 50.1c-30.9 0-56-25.1-56-56V56c0-30.9 25.1-56 56-56z" />
                </svg>
                <h3 className="font-semibold font-bricolage-grotesque text-zinc-200">
                  Custom Data
                </h3>
              </div>
              <p className="text-sm text-zinc-500">
                Import your custom data to extend your AI chatbot knowledge.
              </p>
            </div>
            {/* Block #2 */}
            <div>
              <div className="flex items-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mr-2 fill-zinc-400"
                  width="16"
                  height="16"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                    clipRule="evenodd"
                  />
                </svg>

                <h3 className="font-semibold font-bricolage-grotesque text-zinc-200">
                  Auto-Sync Datasources
                </h3>
              </div>
              <p className="text-sm text-zinc-500">
                Chaindesk retrains your AI chatbot automatically when your data
                is updated.
              </p>
            </div>
            {/* Block #3 */}
            <div>
              <div className="flex items-center mb-1">
                {/* <svg
                  className="mr-2 fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                >
                  <path d="M15 9a1 1 0 0 1 0 2c-.441 0-1.243.92-1.89 1.716.319 1.005.529 1.284.89 1.284a1 1 0 0 1 0 2 2.524 2.524 0 0 1-2.339-1.545A3.841 3.841 0 0 1 9 16a1 1 0 0 1 0-2c.441 0 1.243-.92 1.89-1.716C10.57 11.279 10.361 11 10 11a1 1 0 0 1 0-2 2.524 2.524 0 0 1 2.339 1.545A3.841 3.841 0 0 1 15 9Zm-5-1H7.51l-.02.142C6.964 11.825 6.367 16 3 16a3 3 0 0 1-3-3 1 1 0 0 1 2 0 1 1 0 0 0 1 1c1.49 0 1.984-2.48 2.49-6H3a1 1 0 1 1 0-2h2.793c.52-3.1 1.4-6 4.207-6a3 3 0 0 1 3 3 1 1 0 0 1-2 0 1 1 0 0 0-1-1C8.808 2 8.257 3.579 7.825 6H10a1 1 0 0 1 0 2Z" />
                </svg> */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="mr-2 fill-zinc-400"
                  width="16"
                  height="16"
                >
                  <path d="M176 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64c-35.3 0-64 28.7-64 64H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H64v56H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H64v56H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H64c0 35.3 28.7 64 64 64v40c0 13.3 10.7 24 24 24s24-10.7 24-24V448h56v40c0 13.3 10.7 24 24 24s24-10.7 24-24V448h56v40c0 13.3 10.7 24 24 24s24-10.7 24-24V448c35.3 0 64-28.7 64-64h40c13.3 0 24-10.7 24-24s-10.7-24-24-24H448V280h40c13.3 0 24-10.7 24-24s-10.7-24-24-24H448V176h40c13.3 0 24-10.7 24-24s-10.7-24-24-24H448c0-35.3-28.7-64-64-64V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H280V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H176V24zM160 128H352c17.7 0 32 14.3 32 32V352c0 17.7-14.3 32-32 32H160c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32zm192 32H160V352H352V160z" />
                </svg>
                <h3 className="font-semibold font-bricolage-grotesque text-zinc-200">
                  Function Calling
                </h3>
              </div>
              <p className="text-sm text-zinc-500">
                Extend your Agent capabilities with function calling, allowing
                them to call custom API endpoints when needed.
              </p>
            </div>
            {/* Block #4 */}
            <div>
              <div className="flex items-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="mr-2 fill-zinc-400"
                  width="16"
                  height="16"
                >
                  <path d="M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                </svg>
                <h3 className="font-semibold font-bricolage-grotesque text-zinc-200">
                  Lead Generation
                </h3>
              </div>
              <p className="text-sm text-zinc-500">
                {`Collect leads and gather your customer's data, all while providing a personalized experience.`}
              </p>
            </div>
            {/* Block #5 */}
            <div>
              <div className="flex items-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                  className="mr-2 fill-zinc-400"
                  width="16"
                  height="16"
                >
                  <path d="M544 248v3.3l69.7-69.7c21.9-21.9 21.9-57.3 0-79.2L535.6 24.4c-21.9-21.9-57.3-21.9-79.2 0L416.3 64.5c-2.7-.3-5.5-.5-8.3-.5H296c-37.1 0-67.6 28-71.6 64H224V248c0 22.1 17.9 40 40 40s40-17.9 40-40V176c0 0 0-.1 0-.1V160l16 0 136 0c0 0 0 0 .1 0H464c44.2 0 80 35.8 80 80v8zM336 192v56c0 39.8-32.2 72-72 72s-72-32.2-72-72V129.4c-35.9 6.2-65.8 32.3-76 68.2L99.5 255.2 26.3 328.4c-21.9 21.9-21.9 57.3 0 79.2l78.1 78.1c21.9 21.9 57.3 21.9 79.2 0l37.7-37.7c.9 0 1.8 .1 2.7 .1H384c26.5 0 48-21.5 48-48c0-5.6-1-11-2.7-16H432c26.5 0 48-21.5 48-48c0-12.8-5-24.4-13.2-33c25.7-5 45.1-27.6 45.2-54.8v-.4c-.1-30.8-25.1-55.8-56-55.8c0 0 0 0 0 0l-120 0z" />
                </svg>
                <h3 className="font-semibold font-bricolage-grotesque text-zinc-200">
                  Human Handoff
                </h3>
              </div>
              <p className="text-sm text-zinc-500">
                With Chaindesk you can take over the conversation at any time,
                ensuring that your customers are always getting the best
                possible support.
              </p>
            </div>
            {/* Block #6 */}
            <div>
              <div className="flex items-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mr-2 fill-zinc-400"
                  width="16"
                  height="16"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                    clipRule="evenodd"
                  />
                </svg>

                <h3 className="font-semibold font-bricolage-grotesque text-zinc-200">
                  Privacy & Security
                </h3>
              </div>
              <p className="text-sm text-zinc-500">
                Founded in France, we respect your privacy. Your data is
                encrypted in transit and at rest on secure servers.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
