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
        viewport={{ once: true, margin: '-300px' }}
      >
        {/* Carousel */}
        <div className="px-4 mx-auto max-w-xl lg:max-w-6xl sm:px-6">
          <div className="space-y-12 lg:flex lg:space-y-0 lg:space-x-12 xl:space-x-24">
            {/* Content */}
            <div className="lg:max-w-none lg:min-w-[524px]">
              <div className="mb-8">
                <motion.div
                  className="inline-flex text-sm font-medium text-zinc-400 px-4 py-0.5 border border-transparent [background:linear-gradient(theme(colors.zinc.800),theme(colors.zinc.800))_padding-box,linear-gradient(120deg,theme(colors.zinc.700),theme(colors.zinc.700/0),theme(colors.zinc.700))_border-box] rounded-full mb-4"
                  variants={childTextVariants}
                >
                  Scale Your Team
                </motion.div>
                <motion.h3
                  className="mb-4 text-3xl font-bold font-bricolage-grotesque text-zinc-200"
                  variants={defaultChildVariants}
                >
                  Design-powered workflows for teams of any size
                </motion.h3>
                <motion.p
                  className="text-lg text-zinc-500"
                  variants={defaultChildVariants}
                >
                  Gray can understand what you are designing, learn from your
                  feedback to take your creativity further, and turn it
                  instantly into beautiful images.
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
                      Make designs feel real
                    </div>
                    <div className="text-zinc-500">
                      Save time and keep things consistent with reusable images,
                      and 3D assets in shared libraries.
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
                      Bring creatives closer
                    </div>
                    <div className="text-zinc-500">
                      Save time and keep things consistent with reusable images,
                      and 3D assets in shared libraries.
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
                      Scale and align your design team
                    </div>
                    <div className="text-zinc-500">
                      Save time and keep things consistent with reusable images,
                      and 3D assets in shared libraries.
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
              <div className="flex relative flex-col" ref={tabs}>
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
                  <div>
                    <Image
                      className="mx-auto rounded-lg shadow-2xl lg:max-w-none"
                      src={CarouselIllustration}
                      width={800}
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
                  <div>
                    <Image
                      className="mx-auto rounded-lg shadow-2xl lg:max-w-none"
                      src={CarouselIllustration}
                      width={800}
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
                  <div>
                    <Image
                      className="mx-auto rounded-lg shadow-2xl lg:max-w-none"
                      src={CarouselIllustration}
                      width={800}
                      height={620}
                      alt="Carousel 03"
                    />
                  </div>
                </Transition>
              </div>
              {/* Gear illustration */}
              <Image
                className="absolute bottom-0 left-0 mix-blend-exclusion -translate-x-1/2 translate-y-1/3 max-lg:w-32"
                src={FeatureIllustration}
                alt="Features 02 illustration"
                width={173}
                height={167}
                aria-hidden="true"
              />
            </motion.div>
          </div>
        </div>

        {/* Features blocks */}
        <motion.div
          className="px-4 mx-auto mt-24 max-w-6xl sm:px-6 lg:mt-32"
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
                >
                  <path d="M15 9a1 1 0 0 1 0 2c-.441 0-1.243.92-1.89 1.716.319 1.005.529 1.284.89 1.284a1 1 0 0 1 0 2 2.524 2.524 0 0 1-2.339-1.545A3.841 3.841 0 0 1 9 16a1 1 0 0 1 0-2c.441 0 1.243-.92 1.89-1.716C10.57 11.279 10.361 11 10 11a1 1 0 0 1 0-2 2.524 2.524 0 0 1 2.339 1.545A3.841 3.841 0 0 1 15 9Zm-5-1H7.51l-.02.142C6.964 11.825 6.367 16 3 16a3 3 0 0 1-3-3 1 1 0 0 1 2 0 1 1 0 0 0 1 1c1.49 0 1.984-2.48 2.49-6H3a1 1 0 1 1 0-2h2.793c.52-3.1 1.4-6 4.207-6a3 3 0 0 1 3 3 1 1 0 0 1-2 0 1 1 0 0 0-1-1C8.808 2 8.257 3.579 7.825 6H10a1 1 0 0 1 0 2Z" />
                </svg>
                <h3 className="font-semibold font-bricolage-grotesque text-zinc-200">
                  Discussions
                </h3>
              </div>
              <p className="text-sm text-zinc-500">
                Keep workflows efficient with tools that give teams visibility
                throughout the process.
              </p>
            </div>
            {/* Block #2 */}
            <div>
              <div className="flex items-center mb-1">
                <svg
                  className="mr-2 fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                >
                  <path d="M13 16c-.153 0-.306-.035-.447-.105l-3.851-1.926c-.231.02-.465.031-.702.031-4.411 0-8-3.14-8-7s3.589-7 8-7 8 3.14 8 7c0 1.723-.707 3.351-2 4.63V15a1.003 1.003 0 0 1-1 1Zm-4.108-4.054c.155 0 .308.036.447.105L12 13.382v-2.187c0-.288.125-.562.341-.752C13.411 9.506 14 8.284 14 7c0-2.757-2.691-5-6-5S2 4.243 2 7s2.691 5 6 5c.266 0 .526-.02.783-.048a1.01 1.01 0 0 1 .109-.006Z" />
                </svg>
                <h3 className="font-semibold font-bricolage-grotesque text-zinc-200">
                  Team views
                </h3>
              </div>
              <p className="text-sm text-zinc-500">
                Keep workflows efficient with tools that give teams visibility
                throughout the process.
              </p>
            </div>
            {/* Block #3 */}
            <div>
              <div className="flex items-center mb-1">
                <svg
                  className="mr-2 fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="16"
                >
                  <path d="M13 0H1C.4 0 0 .4 0 1v14c0 .6.4 1 1 1h8l5-5V1c0-.6-.4-1-1-1ZM2 2h10v8H8v4H2V2Z" />
                </svg>
                <h3 className="font-semibold font-bricolage-grotesque text-zinc-200">
                  Powerful search
                </h3>
              </div>
              <p className="text-sm text-zinc-500">
                Keep workflows efficient with tools that give teams visibility
                throughout the process.
              </p>
            </div>
            {/* Block #4 */}
            <div>
              <div className="flex items-center mb-1">
                <svg
                  className="mr-2 fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                >
                  <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Zm8.707 12.293a.999.999 0 1 1-1.414 1.414L11.9 13.314a8.019 8.019 0 0 0 1.414-1.414l2.393 2.393Z" />
                </svg>
                <h3 className="font-semibold font-bricolage-grotesque text-zinc-200">
                  Enhancing
                </h3>
              </div>
              <p className="text-sm text-zinc-500">
                Keep workflows efficient with tools that give teams visibility
                throughout the process.
              </p>
            </div>
            {/* Block #5 */}
            <div>
              <div className="flex items-center mb-1">
                <svg
                  className="mr-2 fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                >
                  <path d="M14.6.085 8 2.885 1.4.085c-.5-.2-1.4-.1-1.4.9v11c0 .4.2.8.6.9l7 3c.3.1.5.1.8 0l7-3c.4-.2.6-.5.6-.9v-11c0-1-.9-1.1-1.4-.9ZM2 2.485l5 2.1v8.8l-5-2.1v-8.8Zm12 8.8-5 2.1v-8.7l5-2.1v8.7Z" />
                </svg>
                <h3 className="font-semibold font-bricolage-grotesque text-zinc-200">
                  Powerful search
                </h3>
              </div>
              <p className="text-sm text-zinc-500">
                Keep workflows efficient with tools that give teams visibility
                throughout the process.
              </p>
            </div>
            {/* Block #6 */}
            <div>
              <div className="flex items-center mb-1">
                <svg
                  className="mr-2 fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="16"
                >
                  <path d="M13 14a1 1 0 0 1 0 2H1a1 1 0 0 1 0-2h12Zm-6.707-2.293-5-5a1 1 0 0 1 1.414-1.414L6 8.586V1a1 1 0 1 1 2 0v7.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-5 5a1 1 0 0 1-1.414 0Z" />
                </svg>
                <h3 className="font-semibold font-bricolage-grotesque text-zinc-200">
                  Team views
                </h3>
              </div>
              <p className="text-sm text-zinc-500">
                Keep workflows efficient with tools that give teams visibility
                throughout the process.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
